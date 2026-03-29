"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = void 0;
const logger_1 = require("../utils/logger");
const normalize_1 = require("../utils/normalize");
class RoomController {
    constructor(roomService) {
        this.roomService = roomService;
        // Bind all methods to preserve 'this' context
        this.createRoom = this.createRoom.bind(this);
        this.getAllRooms = this.getAllRooms.bind(this);
        this.getRoomById = this.getRoomById.bind(this);
        this.updateRoom = this.updateRoom.bind(this);
        this.deleteRoom = this.deleteRoom.bind(this);
        this.getOwnerRooms = this.getOwnerRooms.bind(this);
        this.toggleRoomStatus = this.toggleRoomStatus.bind(this);
    }
    async createRoom(req, res) {
        try {
            logger_1.logger.info('Creating room for owner', {
                ownerId: req.user?.userId
            });
            const room = await this.roomService.createRoom({
                ...req.body,
                ownerId: req.user.userId
            });
            logger_1.logger.info('Room created successfully', {
                roomId: room.id
            });
            res.status(201).json({
                success: true,
                data: room,
                message: 'Room created successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating room', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            if (error instanceof Error) {
                // Provide specific error messages
                if (error.message.includes('City not found')) {
                    res.status(400).json({
                        success: false,
                        message: error.message
                    });
                    return;
                }
                // Email verification required
                if (error.code === 'EMAIL_VERIFICATION_REQUIRED' || error.message.includes('Email verification required')) {
                    res.status(403).json({
                        success: false,
                        code: 'EMAIL_VERIFICATION_REQUIRED',
                        message: 'Email verification required before creating properties. Please verify your email first.'
                    });
                    return;
                }
            }
            res.status(400).json({
                success: false,
                message: 'Failed to create room',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getAllRooms(req, res) {
        try {
            // ✅ CRITICAL FIX: Normalize city query parameter before database lookup
            const cityParam = typeof req.query.city === 'string' ? req.query.city : undefined;
            const normalizedCity = cityParam ? (0, normalize_1.normalizeCity)(cityParam) : undefined;
            const amenitiesParam = typeof req.query.amenities === 'string' ? req.query.amenities : undefined;
            const amenitiesList = amenitiesParam && amenitiesParam.trim().length > 0
                ? amenitiesParam.split(',').map((s) => s.trim()).filter(Boolean)
                : undefined;
            const roomTypeParam = typeof req.query.roomType === 'string' ? req.query.roomType : undefined;
            const roomTypeList = roomTypeParam && roomTypeParam.trim().length > 0
                ? roomTypeParam.split(',').map((s) => s.trim()).filter(Boolean)
                : undefined;
            const sortParam = typeof req.query.sort === 'string' ? req.query.sort.trim() : undefined;
            const cursorParam = typeof req.query.cursor === 'string' && req.query.cursor.trim().length > 0
                ? req.query.cursor.trim()
                : undefined;
            const filters = {
                page: Number(req.query.page ?? 1),
                limit: Number(req.query.limit ?? 20),
                onlyActive: req.query.onlyActive !== 'false',
                city: normalizedCity,
                roomType: roomTypeList,
                idealFor: typeof req.query.idealFor === 'string' ? req.query.idealFor : undefined,
                amenities: amenitiesList,
                sort: sortParam,
                cursor: cursorParam,
                isVerified: req.query.isVerified === 'true',
                isPopular: req.query.isPopular === 'true' ? true : undefined,
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined
            };
            // ✅ FIX 2: Pass requester role so service can apply role-aware visibility.
            // req.user is populated by authMiddleware if a token is present; undefined for public requests.
            const requesterRole = req.user?.role;
            const result = await this.roomService.getAllRooms(filters, requesterRole);
            res.json({
                success: true,
                data: result.rooms,
                meta: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    hasNextPage: result.hasNextPage,
                    ...(result.nextCursor ? { nextCursor: result.nextCursor } : {})
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getRoomById(req, res) {
        try {
            const { id } = req.params;
            // ✅ Pass requester role so service enforces visibility for TENANT/public.
            // req.user is set by authMiddleware if a valid token is present; undefined otherwise.
            const requesterRole = req.user?.role;
            const room = await this.roomService.getRoomById(id, requesterRole);
            res.json({
                success: true,
                data: room
            });
        }
        catch (error) {
            // ✅ 'Room not found' must return 404, not 500.
            // This covers both: room doesn't exist AND tenant trying to access hidden room.
            if (error.message === 'Room not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Room not found'
                });
            }
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async updateRoom(req, res) {
        try {
            const { id } = req.params;
            const ownerId = req.user?.userId;
            if (!ownerId) {
                return res.status(401).json({
                    message: 'User not authenticated'
                });
            }
            // ✅ FIX 1: Pass requester role so service can decide whether to reset reviewStatus.
            const requesterRole = req.user?.role;
            const room = await this.roomService.updateRoom(id, ownerId, req.body, requesterRole);
            res.json(room);
        }
        catch (error) {
            res.status(400).json({
                message: error.message
            });
        }
    }
    async deleteRoom(req, res) {
        try {
            const { id } = req.params;
            const ownerId = req.user?.userId;
            if (!ownerId) {
                return res.status(401).json({
                    message: 'User not authenticated'
                });
            }
            await this.roomService.deleteRoom(id, ownerId);
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({
                message: error.message
            });
        }
    }
    async getOwnerRooms(req, res) {
        try {
            const ownerId = req.user?.userId;
            if (!ownerId) {
                return res.status(401).json({
                    message: 'User not authenticated'
                });
            }
            const rooms = await this.roomService.getOwnerRooms(ownerId);
            res.json(rooms);
        }
        catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
    async toggleRoomStatus(req, res) {
        try {
            const { id } = req.params;
            const ownerId = req.user?.userId;
            if (!ownerId) {
                return res.status(401).json({
                    message: 'User not authenticated'
                });
            }
            const room = await this.roomService.toggleRoomStatus(id, ownerId);
            res.json({
                success: true,
                data: room,
                message: 'Room status updated successfully'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}
exports.RoomController = RoomController;
//# sourceMappingURL=RoomController.js.map