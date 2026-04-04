import { Request, Response } from 'express';
import { RoomService } from '../services/RoomService';
import { AuthRequest } from '../middleware/auth.middleware';
import { RoomFilters } from '../models/Room';
import { logger } from '../utils/logger';
import { normalizeCity } from '../utils/normalize';

const ROOM_TYPE_MAP: Record<string, "Single" | "Shared" | "PG" | "1BHK" | "2BHK"> = {
  single: "Single",
  shared: "Shared",
  pg: "PG",
  "1bhk": "1BHK",
  "2bhk": "2BHK",
};
export class RoomController {
  constructor(private roomService: RoomService) {
    // Bind all methods to preserve 'this' context
    this.createRoom = this.createRoom.bind(this);
    this.getAllRooms = this.getAllRooms.bind(this);
    this.getRoomById = this.getRoomById.bind(this);
    this.getDemandStats = this.getDemandStats.bind(this);
    this.updateRoom = this.updateRoom.bind(this);
    this.deleteRoom = this.deleteRoom.bind(this);
    this.getOwnerRooms = this.getOwnerRooms.bind(this);
    this.toggleRoomStatus = this.toggleRoomStatus.bind(this);
  }
  async createRoom(req: AuthRequest, res: Response): Promise<void> {
    try {
      logger.info('Creating room for owner', {
        ownerId: req.user?.userId
      });
      const room = await this.roomService.createRoom({
        ...req.body,
        ownerId: req.user!.userId
      });
      logger.info('Room created successfully', {
        roomId: room.id
      });
      res.status(201).json({
        success: true,
        data: room,
        message: 'Room created successfully'
      });
    } catch (error) {
      logger.error('Error creating room', {
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
        if ((error as any).code === 'EMAIL_VERIFICATION_REQUIRED' || error.message.includes('Email verification required')) {
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
  async getAllRooms(req: Request, res: Response) {
    try {
      const cityParam = typeof req.query.city === 'string' ? req.query.city : undefined;
      const normalizedCity = cityParam ? normalizeCity(cityParam) : undefined;
      const roomTypeParam =
        typeof req.query.roomType === 'string' && req.query.roomType.trim().length > 0
          ? req.query.roomType.trim()
          : undefined;
      const normalizedRoomType = roomTypeParam
        ? ROOM_TYPE_MAP[roomTypeParam.toLowerCase()]
        : undefined;
      if (roomTypeParam && !normalizedRoomType) {
        return res.status(400).json({
          success: false,
          message: 'Invalid room type'
        });
      }
      const sortParam =
        typeof req.query.sort === 'string' && req.query.sort.trim().length > 0
          ? req.query.sort.trim()
          : 'latest';
      const filters: RoomFilters = {
        page: Number(req.query.page ?? 1),
        limit: Number(req.query.limit ?? 20),
        city: normalizedCity,
        roomType: normalizedRoomType,
        sort: sortParam as RoomFilters["sort"],
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined
      };

      // ✅ FIX 2: Pass requester role so service can apply role-aware visibility.
      // req.user is populated by authMiddleware if a token is present; undefined for public requests.
      const requesterRole = (req as AuthRequest).user?.role;
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  async getRoomById(req: Request, res: Response) {
    try {
      const {
        id
      } = req.params;

      // ✅ Pass requester role so service enforces visibility for TENANT/public.
      // req.user is set by authMiddleware if a valid token is present; undefined otherwise.
      const requesterRole = (req as AuthRequest).user?.role;
      const room = await this.roomService.getRoomById(id, requesterRole);
      void this.roomService.recordPropertyView(room, (req as AuthRequest).user?.userId).catch((error: any) => {
        logger.warn('Failed to record property view event', {
          roomId: id,
          error: error?.message || 'Unknown error'
        });
      });
      res.json({
        success: true,
        data: room
      });
    } catch (error: any) {
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
  async getDemandStats(req: Request, res: Response) {
    try {
      const {
        id
      } = req.params;
      const stats = await this.roomService.getDemandStats(id);
      return res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      if (error.message === 'Room not found') {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  async updateRoom(req: AuthRequest, res: Response) {
    try {
      const {
        id
      } = req.params;
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
    } catch (error: any) {
      res.status(400).json({
        message: error.message
      });
    }
  }
  async deleteRoom(req: AuthRequest, res: Response) {
    try {
      const {
        id
      } = req.params;
      const ownerId = req.user?.userId;
      if (!ownerId) {
        return res.status(401).json({
          message: 'User not authenticated'
        });
      }
      const requesterRole = req.user?.role;
      await this.roomService.deleteRoom(id, ownerId, requesterRole);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({
        message: error.message
      });
    }
  }
  async getOwnerRooms(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user?.userId;
      if (!ownerId) {
        return res.status(401).json({
          message: 'User not authenticated'
        });
      }
      const rooms = await this.roomService.getOwnerRooms(ownerId);
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({
        message: error.message
      });
    }
  }
  async toggleRoomStatus(req: AuthRequest, res: Response) {
    try {
      const {
        id
      } = req.params;
      const ownerId = req.user?.userId;
      if (!ownerId) {
        return res.status(401).json({
          message: 'User not authenticated'
        });
      }
      const requesterRole = req.user?.role;
      const room = await this.roomService.toggleRoomStatus(id, ownerId, requesterRole);
      res.json({
        success: true,
        data: room,
        message: 'Room status updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}
