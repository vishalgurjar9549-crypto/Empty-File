import { IRoomRepository } from '../repositories/interfaces';
import { Room, CreateRoomInput, UpdateRoomInput, RoomFilters } from '../models/Room';
import { CloudinaryService } from './CloudinaryService';
import { logger } from '../utils/logger';
import { normalizeCity } from '../utils/normalize';
import { EventType, ReviewStatus, Role } from '@prisma/client';
import { getPrismaClient } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { DemandService, DemandStats } from './DemandService';
import { notificationService } from './NotificationService';
export class RoomService {
  private roomRepository: IRoomRepository;
  private cloudinaryService: CloudinaryService;
  private demandService: DemandService;
  constructor(roomRepository: IRoomRepository) {
    this.roomRepository = roomRepository;
    this.cloudinaryService = new CloudinaryService();
    this.demandService = new DemandService(getPrismaClient());
  }
  async getAllRooms(filters: RoomFilters, requesterRole?: string): Promise<{
    rooms: Room[];
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
    nextCursor?: string;
  }> {
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
      onlyActive: true,
      // Only enforce APPROVED for tenant/public requests
      ...(isTenantOrPublic ? {
        reviewStatus: ReviewStatus.APPROVED
      } : {}),
      sort: filters.sort,
      page,
      limit
    });
    return {
      ...result,
      page,
      limit
    };
  }
  async getRoomById(id: string, requesterRole?: string): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new Error('Room not found');
    }

    // ✅ Tenant/public visibility enforcement for single-room fetch.
    // If requester is TENANT or unauthenticated, the room MUST be APPROVED + active.
    // We throw the same 'Room not found' error — never reveal a hidden room exists.
    const isTenantOrPublic = !requesterRole || requesterRole === 'TENANT' || requesterRole === 'tenant';
    if (isTenantOrPublic) {
      if (room.reviewStatus !== ReviewStatus.APPROVED || !room.isActive) {
        logger.info('Tenant/public blocked from non-approved room', {
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

  async getDemandStats(id: string): Promise<DemandStats> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new Error('Room not found');
    }

    return this.demandService.getDemandStats(id);
  }

  async recordPropertyView(
    room: Pick<Room, 'id' | 'ownerId' | 'title'>,
    userId?: string,
  ): Promise<void> {
    await this.demandService.recordEvent({
      type: EventType.PROPERTY_VIEW,
      propertyId: room.id,
      userId: userId || null,
    });

    if (userId && userId === room.ownerId) {
      return;
    }

    await notificationService.onOwnerActivity({
      ownerId: room.ownerId,
      propertyId: room.id,
      propertyTitle: room.title,
      eventType: 'PROPERTY_VIEW',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Create room - accepts single object with ownerId included
   * This matches the RoomController's call signature
   */
  async createRoom(roomData: any): Promise<Room> {
    logger.info('Creating room', {
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
        logger.info('Resolved owner by phone', {
          phone: roomData.ownerPhone,
          ownerId,
          created: !roomData.existingOwnerId
        });
      } catch (error: any) {
        logger.error('Failed to resolve/create owner by phone', {
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
    const prisma = getPrismaClient();
    const ownerUser = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, emailVerified: true, email: true }
    });

    if (!ownerUser) {
      throw new Error('Owner user not found');
    }

    if (!ownerUser.emailVerified) {
      const error: any = new Error('Email verification required before creating properties');
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
      if (creator && creator.role === Role.TENANT) {
        await prisma.user.update({
          where: {
            id: ownerId
          },
          data: {
            role: Role.OWNER
          }
        });
        logger.info('Auto-upgraded TENANT to OWNER on property creation', {
          userId: ownerId
        });
      }
    } catch (upgradeError) {
      // Non-fatal: log and continue. Property creation must not fail due to role upgrade issues.
      logger.error('Failed to auto-upgrade user role', {
        userId: ownerId,
        error: upgradeError instanceof Error ? upgradeError.message : 'Unknown error'
      });
    }
    // ────────────────────────────────────────────────────────────────

    // ✅ CRITICAL FIX: Normalize city to lowercase before saving
    // Prevents "Jaipur" vs "jaipur" mismatch in subscription checks
    if (roomData.city) {
      roomData.city = normalizeCity(roomData.city);
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
  private async resolveOrCreateOwnerByPhone(phone: string, ownerName?: string): Promise<string> {
    const prisma = getPrismaClient();
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
        logger.info('Found existing user by phone', {
          phone: normalizedPhone,
          userId: existingUser.id,
          role: existingUser.role
        });
        return existingUser.id;
      }
    } catch (error: any) {
      logger.error('Error searching for user by phone', {
        phone: normalizedPhone,
        error: error.message
      });
      // Continue to create temp user
    }

    // Step 2: User doesn't exist → create TEMP user
    try {
      const tempEmail = `temp_${normalizedPhone}@app.com`;
      const dummyPassword = await bcrypt.hash(`temp_${normalizedPhone}`, 10);

      const tempUser = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          email: tempEmail,
          password: dummyPassword,
          name: ownerName || `Owner (${normalizedPhone})`,
          role: Role.OWNER,
          emailVerified: false,
          phoneVerified: false,
          isActive: true
        }
      });

      logger.info('Created temp user for property import', {
        phone: normalizedPhone,
        userId: tempUser.id,
        tempEmail
      });

      return tempUser.id;
    } catch (error: any) {
      logger.error('Error creating temp user', {
        phone: normalizedPhone,
        error: error.message,
        code: error.code
      });
      throw new Error(`Failed to create owner account for phone ${normalizedPhone}`);
    }
  }
  // ────────────────────────────────────────────────────────────────

  async updateRoom(id: string, ownerId: string, input: UpdateRoomInput, requesterRole?: string): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new Error('Room not found');
    }
    // Allow ADMIN to bypass ownership check
    const isAdmin = requesterRole === 'ADMIN' || requesterRole === 'admin';
    if (!isAdmin && room.ownerId !== ownerId) {
      throw new Error('You can only update your own properties');
    }

    // ✅ CRITICAL FIX: Normalize city to lowercase if present in update
    if (input.city) {
      input.city = normalizeCity(input.city);
    }

    // ✅ FIX 1: Role-aware reviewStatus reset.
    // OWNER or AGENT edit → reset to PENDING (enforces moderation lifecycle).
    // ADMIN edit → keep existing reviewStatus unchanged.
    const isOwnerOrAgent = !requesterRole || requesterRole === 'OWNER' || requesterRole === 'owner' || requesterRole === 'AGENT' || requesterRole === 'agent';
    const updateData: any = {
      ...input
    };
    if (isOwnerOrAgent) {
      updateData.reviewStatus = ReviewStatus.PENDING;
      logger.info('Owner/Agent edit: resetting reviewStatus to PENDING', {
        roomId: id,
        ownerId,
        requesterRole
      });
    } else {
      logger.info('Admin edit: preserving existing reviewStatus', {
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
  async deleteRoom(roomId: string, userId: string, requesterRole?: string): Promise<void> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    // Allow ADMIN to bypass ownership check
    const isAdmin = requesterRole === 'ADMIN' || requesterRole === 'admin';
    if (!isAdmin && room.ownerId !== userId) {
      throw new Error('Unauthorized to delete this room');
    }

    // Delete Cloudinary images before deleting room
    if (room.images && room.images.length > 0) {
      try {
        await this.cloudinaryService.deleteImages(room.images);
      } catch (error) {
        logger.error('Error deleting Cloudinary images', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Continue with room deletion even if image cleanup fails
      }
    }
    await this.roomRepository.delete(roomId);
  }
  async toggleRoomStatus(id: string, ownerId: string, requesterRole?: string): Promise<Room> {
    // console.log('[RoomService] Toggling room status for room:', id);
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new Error('Room not found');
    }
    // Allow ADMIN to bypass ownership check
    const isAdmin = requesterRole === 'ADMIN' || requesterRole === 'admin';
    if (!isAdmin && room.ownerId !== ownerId) {
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

  async getOwnerRooms(ownerId: string): Promise<Room[]> {
    return this.roomRepository.findByOwnerId(ownerId);
  }

  /**
   * Search rooms with role-aware visibility enforcement.
   * TENANT/public → only APPROVED + isActive rooms returned.
   * OWNER/ADMIN/AGENT → unrestricted search.
   */
  async search(filters: any, requesterRole?: string): Promise<Room[]> {
    const isTenantOrPublic = !requesterRole || requesterRole === 'TENANT' || requesterRole === 'tenant';

    // ✅ Inject reviewStatus filter at service layer for tenant/public.
    // Repository receives it as a plain filter — no visibility logic in repository.
    const searchFilters = {
      ...filters,
      ...(isTenantOrPublic ? {
        reviewStatus: ReviewStatus.APPROVED
      } : {})
    };
    logger.info('RoomService.search called', {
      requesterRole,
      isTenantOrPublic,
      enforcingApproved: isTenantOrPublic
    });
    return this.roomRepository.search(searchFilters);
  }
}
