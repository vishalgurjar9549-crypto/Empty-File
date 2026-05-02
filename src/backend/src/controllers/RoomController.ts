import { Request, Response } from 'express';
import { RoomService } from '../services/RoomService';
import { AuthRequest } from '../middleware/auth.middleware';
import { RoomFilters } from '../models/Room';
import { logger } from '../utils/logger';
import { normalizeCity } from '../utils/normalize';
import { getCacheService, CacheService } from '../services/CacheService';

const ROOM_TYPE_MAP: Record<string, "Single" | "Shared" | "PG" | "1RK" | "2RK" | "1BHK" | "2BHK" | "3BHK" | "4BHK" | "Independent House"> = {
  single: "Single",
  shared: "Shared",
  pg: "PG",
  "1rk": "1RK",
  "2rk": "2RK",
  "1bhk": "1BHK",
  "2bhk": "2BHK",
  "3bhk": "3BHK",
  "4bhk": "4BHK",
  "independent house": "Independent House",
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
    this.resubmitForReview = this.resubmitForReview.bind(this);
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
        roomId: room.id,
        city: room.city
      });
      
      // ✅ CACHE INVALIDATION: Clear cached listings for this city
      // New property should appear immediately in listings
      const cache = getCacheService();
      cache.clearCityCache(room.city);
      logger.info('Cache cleared for city after room creation', {
        city: room.city
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
      
      // ✅ FIX: Extract BOTH roomType (single) AND roomTypes (multiple)
      // Priority: roomTypes (multiple) > roomType (single)
      let normalizedRoomType: string | undefined = undefined;
      let normalizedRoomTypes: string[] | undefined = undefined;
      
      // Handle roomTypes (plural - multiple values, comma-separated)
      if (req.query.roomTypes) {
        const roomTypesParam =
          Array.isArray(req.query.roomTypes)
            ? req.query.roomTypes
            : typeof req.query.roomTypes === 'string'
              ? [req.query.roomTypes]
              : [];
        
        const rawTypes = roomTypesParam
          .flatMap((rt: any) => {
            // Support both ?roomTypes=4BHK,3BHK (CSV) and ?roomTypes=4BHK&roomTypes=3BHK
            return String(rt).split(',');
          })
          .map((rt: string) => rt.trim())
          .filter((rt: string) => rt.length > 0);
        
        // Normalize room types using ROOM_TYPE_MAP
        const mapped = rawTypes
          .map((rt: string) => ROOM_TYPE_MAP[rt.toLowerCase()])
          .filter((rt: any) => rt !== undefined);
        
        if (mapped.length > 0) {
          normalizedRoomTypes = mapped;
          // ✅ DEBUG: Log parsed room types
          logger.info('🔍 ROOMTYPES FILTER PARSED', {
            received: req.query.roomTypes,
            rawTypes,
            normalized: normalizedRoomTypes
          });
        }
        
        // Validate: at least one valid type must be provided
        if (rawTypes.length > 0 && mapped.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid room types provided',
            received: rawTypes
          });
        }
      } 
      // Fallback: Handle single roomType (for backward compatibility)
      else if (req.query.roomType) {
        const roomTypeParam =
          typeof req.query.roomType === 'string' && req.query.roomType.trim().length > 0
            ? req.query.roomType.trim()
            : undefined;
        
        normalizedRoomType = roomTypeParam
          ? ROOM_TYPE_MAP[roomTypeParam.toLowerCase()]
          : undefined;
        
        if (roomTypeParam && !normalizedRoomType) {
          return res.status(400).json({
            success: false,
            message: 'Invalid room type'
          });
        }
        
        // ✅ DEBUG: Log single room type
        if (normalizedRoomType) {
          logger.info('🔍 ROOMTYPE FILTER PARSED (LEGACY)', {
            received: req.query.roomType,
            normalized: normalizedRoomType
          });
        }
      }
      
      const sortParam =
        typeof req.query.sort === 'string' && req.query.sort.trim().length > 0
          ? req.query.sort.trim()
          : 'latest';
      
      // ✅ Extract gender preference parameter with validation
      let genderPrefParam: string | undefined = undefined;
      if (typeof req.query.genderPreference === 'string') {
        const validGenders = ['ANY', 'MALE_ONLY', 'FEMALE_ONLY'];
        const trimmed = req.query.genderPreference.trim().toUpperCase();
        if (validGenders.includes(trimmed)) {
          genderPrefParam = trimmed;
        }
      }
      
      // ✅ Extract ideal for multi-select parameter with validation
      let idealForParam: string[] | undefined = undefined;
      if (req.query.idealFor) {
        const VALID_IDEAL_FOR = ["Students", "Working Professionals", "Family"];
        if (Array.isArray(req.query.idealFor)) {
          // Multiple query params: ?idealFor=Students&idealFor=Family
          idealForParam = (req.query.idealFor as string[])
            .map(v => String(v).trim())
            .filter(v => v.length > 0 && VALID_IDEAL_FOR.includes(v));
        } else if (typeof req.query.idealFor === 'string') {
          // Single param or comma separated: ?idealFor=Students,Family
          idealForParam = req.query.idealFor
            .trim()
            .split(',')
            .map(v => v.trim())
            .filter(v => v.length > 0 && VALID_IDEAL_FOR.includes(v));
        }
      }
      
      // ✅ CURSOR PAGINATION: Use cursor instead of page
      const cursorParam = typeof req.query.cursor === 'string' 
        ? req.query.cursor.trim() 
        : undefined;
      
      // ✅ FIX: Include roomTypes in filters if present
      const filters: RoomFilters = {
        // Legacy page support (convert to cursor in repository)
        page: Number(req.query.page ?? 1),
        limit: Number(req.query.limit ?? 20),
        city: normalizedCity,
        roomType: normalizedRoomType,
        // ✅ NEW: Add roomTypes (multiple) to filters
        ...(normalizedRoomTypes ? { roomTypes: normalizedRoomTypes } : {}),
        sort: sortParam as RoomFilters["sort"],
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        // ✅ NEW: Add gender preference to filters
        genderPreference: genderPrefParam as any,
        // ✅ NEW: Add ideal for to filters (cast as IdealFor array)
        idealFor: (idealForParam as any) || undefined,
        // ✅ CURSOR PAGINATION: Add cursor to filters
        cursor: cursorParam
      };

      // ✅ CACHING: Check if response is cached
      const cache = getCacheService();
      const cacheKey = CacheService.generateKey(filters);
      const cachedResult = cache.get<any>(cacheKey);
      
      if (cachedResult) {
        logger.info('Cache HIT for getAllRooms');
        return res.json({
          success: true,
          data: cachedResult?.rooms || [],
          meta: {
            page: cachedResult?.page || filters.page,
            limit: cachedResult?.limit || filters.limit,
            total: cachedResult?.total || 0,
            hasNextPage: cachedResult?.hasNextPage || false,
            ...(cachedResult?.nextCursor ? { nextCursor: cachedResult.nextCursor } : {})
          }
        });
      }

      // ✅ FIX 2: Pass requester role so service can apply role-aware visibility.
      // req.user is populated by authMiddleware if a token is present; undefined for public requests.
      const requesterRole = (req as AuthRequest).user?.role;
      const result = await this.roomService.getAllRooms(filters, requesterRole);
      
      // ✅ CACHING: Store result in cache (30 second TTL)
      cache.set(cacheKey, result, 30000);
      
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
      
      // ✅ CACHE INVALIDATION: Clear cached listings for this city
      // Updated property should reflect immediately
      const cache = getCacheService();
      cache.clearCityCache(room.city);
      logger.info('Cache cleared for city after room update', {
        roomId: id,
        city: room.city
      });
      
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
      
      // ✅ CACHE INVALIDATION: Get room before deleting to know the city
      const room = await this.roomService.getRoomById(id, requesterRole);
      if (!room) {
        return res.status(404).json({
          message: 'Room not found'
        });
      }
      
      await this.roomService.deleteRoom(id, ownerId, requesterRole);
      
      // ✅ CACHE INVALIDATION: Clear cached listings for this city
      // Deleted property should disappear immediately from listings
      const cache = getCacheService();
      cache.clearCityCache(room.city);
      logger.info('Cache cleared for city after room deletion', {
        roomId: id,
        city: room.city
      });
      
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
      
      // ✅ CACHE INVALIDATION: Clear cached listings for this city
      // Room status change (active/inactive) affects visibility in listings
      const cache = getCacheService();
      cache.clearCityCache(room.city);
      logger.info('Cache cleared for city after room status toggle', {
        roomId: id,
        city: room.city,
        isActive: room.isActive
      });
      
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

  async resubmitForReview(req: AuthRequest, res: Response) {
    try {
      const {
        id
      } = req.params;
      const ownerId = req.user?.userId;
      if (!ownerId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }
      const requesterRole = req.user?.role;
      logger.info('Resubmitting property for review', {
        roomId: id,
        ownerId
      });
      const room = await this.roomService.resubmitForReview(id, ownerId, requesterRole);
      
      // ✅ CACHE INVALIDATION: Clear cached listings for this city
      // Property status/review changes affect visibility
      const cache = getCacheService();
      cache.clearCityCache(room.city);
      logger.info('Cache cleared for city after room resubmit', {
        roomId: id,
        city: room.city,
        reviewStatus: room.reviewStatus
      });
      
      res.json({
        success: true,
        data: room,
        message: 'Property resubmitted successfully for review'
      });
    } catch (error: any) {
      logger.error('Error resubmitting property', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}
