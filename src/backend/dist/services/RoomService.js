"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const CloudinaryService_1 = require("./CloudinaryService");
const logger_1 = require("../utils/logger");
const normalize_1 = require("../utils/normalize");
const client_1 = require("@prisma/client");
const prisma_1 = require("../utils/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class RoomService {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
        this.cloudinaryService = new CloudinaryService_1.CloudinaryService();
    }
    async getAllRooms(filters, requesterRole) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        // ✅ FIX 2: Role-aware visibility enforcement.
        // TENANT or unauthenticated (PUBLIC) → enforce APPROVED + isActive only.
        // OWNER / ADMIN / AGENT → no forced reviewStatus filter (they use their own
        // dedicated endpoints, but if they ever hit this route they see everything).
        const isTenantOrPublic = !requesterRole || requesterRole === 'TENANT' || requesterRole === 'tenant';
        const result = await this.roomRepository.findAll({
            city: filters.city,
            roomType: filters.roomType,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            isPopular: filters.isPopular,
            onlyActive: filters.onlyActive ?? true,
            idealFor: filters.idealFor,
            amenities: filters.amenities,
            // Only enforce APPROVED for tenant/public requests
            ...(isTenantOrPublic ? {
                reviewStatus: client_1.ReviewStatus.APPROVED
            } : {}),
            sort: filters.sort,
            cursor: filters.cursor,
            page,
            limit
        });
        return {
            ...result,
            page,
            limit
        };
    }
    async getRoomById(id, requesterRole) {
        const room = await this.roomRepository.findById(id);
        if (!room) {
            throw new Error('Room not found');
        }
        // ✅ Tenant/public visibility enforcement for single-room fetch.
        // If requester is TENANT or unauthenticated, the room MUST be APPROVED + active.
        // We throw the same 'Room not found' error — never reveal a hidden room exists.
        const isTenantOrPublic = !requesterRole || requesterRole === 'TENANT' || requesterRole === 'tenant';
        if (isTenantOrPublic) {
            if (room.reviewStatus !== client_1.ReviewStatus.APPROVED || !room.isActive) {
                logger_1.logger.info('Tenant/public blocked from non-approved room', {
                    roomId: id,
                    reviewStatus: room.reviewStatus,
                    isActive: room.isActive,
                    requesterRole
                });
                throw new Error('Room not found');
            }
        }
        return room;
    }
    /**
     * Create room - accepts single object with ownerId included
     * This matches the RoomController's call signature
     */
    async createRoom(roomData) {
        logger_1.logger.info('Creating room', {
            ownerId: roomData.ownerId,
            hasPhone: !!roomData.ownerPhone
        });
        let ownerId = roomData.ownerId;
        // ── PHONE-BASED OWNER RESOLUTION (NEW) ───────────────────────────
        // If ownerPhone is provided (e.g. during bulk import):
        // 1. Try to find existing user by phone
        // 2. If not found, create a TEMP user
        // 3. Use the resolved ID as ownerId
        // This allows pre-imported properties to have associated temp accounts
        // that can later be claimed by phone.
        if (roomData.ownerPhone && !ownerId) {
            try {
                ownerId = await this.resolveOrCreateOwnerByPhone(roomData.ownerPhone, roomData.ownerName);
                logger_1.logger.info('Resolved owner by phone', {
                    phone: roomData.ownerPhone,
                    ownerId,
                    created: !roomData.existingOwnerId
                });
            }
            catch (error) {
                logger_1.logger.error('Failed to resolve/create owner by phone', {
                    phone: roomData.ownerPhone,
                    error: error.message
                });
                // Non-fatal: if phone resolution fails, fall through to require ownerId
            }
        }
        // ────────────────────────────────────────────────────────────────
        // Validate ownerId is present
        if (!ownerId) {
            throw new Error('ownerId is required');
        }
        // ── EMAIL VERIFICATION CHECK (CRITICAL) ─────────────────────────
        // Before allowing property creation, verify the owner has verified their email.
        // This prevents unverified accounts (especially temp accounts) from creating properties.
        // If email not verified → frontend will show modal to capture and verify email.
        const prisma = (0, prisma_1.getPrismaClient)();
        const ownerUser = await prisma.user.findUnique({
            where: { id: ownerId },
            select: { id: true, emailVerified: true, email: true }
        });
        if (!ownerUser) {
            throw new Error('Owner user not found');
        }
        if (!ownerUser.emailVerified) {
            const error = new Error('Email verification required before creating properties');
            error.code = 'EMAIL_VERIFICATION_REQUIRED';
            throw error;
        }
        // ────────────────────────────────────────────────────────────────
        // ── Auto-upgrade TENANT → OWNER on first property creation ──────
        // If the user creating a property is still a TENANT, silently upgrade
        // their role to OWNER so they gain access to owner features.
        // This does NOT block the request or change the response shape.
        try {
            const creator = await prisma.user.findUnique({
                where: {
                    id: ownerId
                }
            });
            if (creator && creator.role === client_1.Role.TENANT) {
                await prisma.user.update({
                    where: {
                        id: ownerId
                    },
                    data: {
                        role: client_1.Role.OWNER
                    }
                });
                logger_1.logger.info('Auto-upgraded TENANT to OWNER on property creation', {
                    userId: ownerId
                });
            }
        }
        catch (upgradeError) {
            // Non-fatal: log and continue. Property creation must not fail due to role upgrade issues.
            logger_1.logger.error('Failed to auto-upgrade user role', {
                userId: ownerId,
                error: upgradeError instanceof Error ? upgradeError.message : 'Unknown error'
            });
        }
        // ────────────────────────────────────────────────────────────────
        // ✅ CRITICAL FIX: Normalize city to lowercase before saving
        // Prevents "Jaipur" vs "jaipur" mismatch in subscription checks
        if (roomData.city) {
            roomData.city = (0, normalize_1.normalizeCity)(roomData.city);
        }
        // Update ownerId in roomData
        roomData.ownerId = ownerId;
        // Pass data directly to repository
        return await this.roomRepository.create(roomData);
    }
    // ── PHONE-BASED OWNER RESOLUTION HELPER (NEW) ─────────────────────
    /**
     * Resolve or create owner by phone number.
     * Used during property import/creation when ownerPhone is provided.
     *
     * Flow:
     * 1. If user exists by phone → return their ID
     * 2. If not → create TEMP user:
     *    - email: temp_{phone}@app.com
     *    - password: hashed dummy password (user must claim account)
     *    - role: OWNER
     *    - emailVerified: false
     * 3. Return the resolved user ID
     */
    async resolveOrCreateOwnerByPhone(phone, ownerName) {
        const prisma = (0, prisma_1.getPrismaClient)();
        const normalizedPhone = String(phone).trim();
        if (!normalizedPhone) {
            throw new Error('Phone number is required');
        }
        // Step 1: Try to find existing user by phone
        try {
            const existingUser = await prisma.user.findUnique({
                where: {
                    phone: normalizedPhone
                }
            });
            if (existingUser) {
                logger_1.logger.info('Found existing user by phone', {
                    phone: normalizedPhone,
                    userId: existingUser.id,
                    role: existingUser.role
                });
                return existingUser.id;
            }
        }
        catch (error) {
            logger_1.logger.error('Error searching for user by phone', {
                phone: normalizedPhone,
                error: error.message
            });
            // Continue to create temp user
        }
        // Step 2: User doesn't exist → create TEMP user
        try {
            const tempEmail = `temp_${normalizedPhone}@app.com`;
            const dummyPassword = await bcryptjs_1.default.hash(`temp_${normalizedPhone}`, 10);
            const tempUser = await prisma.user.create({
                data: {
                    phone: normalizedPhone,
                    email: tempEmail,
                    password: dummyPassword,
                    name: ownerName || `Owner (${normalizedPhone})`,
                    role: client_1.Role.OWNER,
                    emailVerified: false,
                    phoneVerified: false,
                    isActive: true
                }
            });
            logger_1.logger.info('Created temp user for property import', {
                phone: normalizedPhone,
                userId: tempUser.id,
                tempEmail
            });
            return tempUser.id;
        }
        catch (error) {
            logger_1.logger.error('Error creating temp user', {
                phone: normalizedPhone,
                error: error.message,
                code: error.code
            });
            throw new Error(`Failed to create owner account for phone ${normalizedPhone}`);
        }
    }
    // ────────────────────────────────────────────────────────────────
    async updateRoom(id, ownerId, input, requesterRole) {
        const room = await this.roomRepository.findById(id);
        if (!room) {
            throw new Error('Room not found');
        }
        if (room.ownerId !== ownerId) {
            throw new Error('You can only update your own properties');
        }
        // ✅ CRITICAL FIX: Normalize city to lowercase if present in update
        if (input.city) {
            input.city = (0, normalize_1.normalizeCity)(input.city);
        }
        // ✅ FIX 1: Role-aware reviewStatus reset.
        // OWNER or AGENT edit → reset to PENDING (enforces moderation lifecycle).
        // ADMIN edit → keep existing reviewStatus unchanged.
        const isOwnerOrAgent = !requesterRole || requesterRole === 'OWNER' || requesterRole === 'owner' || requesterRole === 'AGENT' || requesterRole === 'agent';
        const updateData = {
            ...input
        };
        if (isOwnerOrAgent) {
            updateData.reviewStatus = client_1.ReviewStatus.PENDING;
            logger_1.logger.info('Owner/Agent edit: resetting reviewStatus to PENDING', {
                roomId: id,
                ownerId,
                requesterRole
            });
        }
        else {
            logger_1.logger.info('Admin edit: preserving existing reviewStatus', {
                roomId: id,
                ownerId,
                requesterRole,
                currentStatus: room.reviewStatus
            });
        }
        const updatedRoom = await this.roomRepository.update(id, updateData);
        if (!updatedRoom) {
            throw new Error('Failed to update room');
        }
        return updatedRoom;
    }
    async deleteRoom(roomId, userId) {
        const room = await this.roomRepository.findById(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        if (room.ownerId !== userId) {
            throw new Error('Unauthorized to delete this room');
        }
        // Delete Cloudinary images before deleting room
        if (room.images && room.images.length > 0) {
            try {
                await this.cloudinaryService.deleteImages(room.images);
            }
            catch (error) {
                logger_1.logger.error('Error deleting Cloudinary images', {
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                // Continue with room deletion even if image cleanup fails
            }
        }
        await this.roomRepository.delete(roomId);
    }
    async toggleRoomStatus(id, ownerId) {
        // console.log('[RoomService] Toggling room status for room:', id);
        const room = await this.roomRepository.findById(id);
        if (!room) {
            throw new Error('Room not found');
        }
        if (room.ownerId !== ownerId) {
            throw new Error('You can only update your own properties');
        }
        // console.log('[RoomService] Toggling room status for room: from RoomService', id); // working
        const updatedRoom = await this.roomRepository.toggleRoomStatus(id);
        if (!updatedRoom) {
            throw new Error('Failed to update room status');
        }
        return updatedRoom;
    }
    //   async toggleRoomStatus(id: string, ownerId: string): Promise<Room> {
    //   const room = await this.roomRepository.findById(id);
    //   if (!room) throw new Error('Room not found');
    //   if (room.ownerId !== ownerId) {
    //     throw new Error('You can only update your own properties');
    //   }
    //   return this.roomRepository.update(id, {
    //     isActive: !room.isActive
    //   });
    // }
    async getOwnerRooms(ownerId) {
        return this.roomRepository.findByOwnerId(ownerId);
    }
    /**
     * Search rooms with role-aware visibility enforcement.
     * TENANT/public → only APPROVED + isActive rooms returned.
     * OWNER/ADMIN/AGENT → unrestricted search.
     */
    async search(filters, requesterRole) {
        const isTenantOrPublic = !requesterRole || requesterRole === 'TENANT' || requesterRole === 'tenant';
        // ✅ Inject reviewStatus filter at service layer for tenant/public.
        // Repository receives it as a plain filter — no visibility logic in repository.
        const searchFilters = {
            ...filters,
            ...(isTenantOrPublic ? {
                reviewStatus: client_1.ReviewStatus.APPROVED
            } : {})
        };
        logger_1.logger.info('RoomService.search called', {
            requesterRole,
            isTenantOrPublic,
            enforcingApproved: isTenantOrPublic
        });
        return this.roomRepository.search(searchFilters);
    }
}
exports.RoomService = RoomService;
//# sourceMappingURL=RoomService.js.map