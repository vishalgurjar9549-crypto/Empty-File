import {
  PrismaClient,
  Room as PrismaRoom,
  Prisma,
  ReviewStatus,
  EventType,
} from "@prisma/client";
import { Room as DomainRoom } from "../models/Room";
import { IRoomRepository } from "./interfaces";
import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";
import { DemandService } from "../services/DemandService";
export class PrismaRoomRepository implements IRoomRepository {
  private prisma: PrismaClient;
  private demandService: DemandService;
  constructor(prismaClient?: PrismaClient) {
    // Use provided client or get singleton
    this.prisma = prismaClient || getPrismaClient();
    this.demandService = new DemandService(this.prisma);
  }

  /**
   * Map Prisma Room to domain Room type
   */
  private toDomain(r: PrismaRoom): DomainRoom {
    // Parse adminFeedback from Json? Prisma type
    const rawFeedback = r.adminFeedback as any;
    const adminFeedback =
      rawFeedback &&
      typeof rawFeedback === "object" &&
      !Array.isArray(rawFeedback)
        ? rawFeedback
        : undefined;
    return {
      id: r.id,
      title: r.title,
      description: r.description || "",
      city: r.city || "",
      location: r.location,
      landmark: r.landmark || "",
      latitude: r.latitude ?? undefined, // Include latitude, undefined if null
      longitude: r.longitude ?? undefined, // Include longitude, undefined if null
      pricePerMonth: r.pricePerMonth,
      roomType: r.roomType as DomainRoom["roomType"],
      idealFor: (r.idealFor || []) as DomainRoom["idealFor"],
      amenities: r.amenities || [],
      images: r.images || [],
      rating: r.rating || 0,
      reviewsCount: r.reviewsCount || 0,
      isPopular: r.isPopular || false,
      isActive: r.isActive,
      reviewStatus: r.reviewStatus,
      // ✅ FIX: map adminFeedback so owner dashboard can display correction details
      adminFeedback,
      // feedbackHistory is not a separate DB column — derive from adminFeedback if present
      feedbackHistory: adminFeedback ? [adminFeedback] : undefined,
      ownerId: r.ownerId,
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : String(r.createdAt),
      updatedAt:
        r.updatedAt instanceof Date
          ? r.updatedAt.toISOString()
          : String(r.updatedAt),
    };
  }

  private async attachDemand(rooms: DomainRoom[]): Promise<DomainRoom[]> {
    if (rooms.length === 0) {
      return rooms;
    }

    const demandMap = await this.demandService.getDemandMap(
      rooms.map((room) => room.id),
    );

    return rooms.map((room) => ({
      ...room,
      demand: demandMap.get(room.id) || {
        weeklyViews: 0,
        weeklyContacts: 0,
      },
    }));
  }

  /**
   * PRODUCTION-SAFE: Validate and normalize room data
   */
  private async normalizeAndValidateRoomData(data: any): Promise<any> {
    // 1. VALIDATE REQUIRED FIELDS
    const requiredFields = [
      "title",
      "city",
      "location",
      "pricePerMonth",
      "roomType",
      "ownerId",
    ];
    for (const field of requiredFields) {
      if (
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ""
      ) {
        throw new Error(`${field} is required`);
      }
    }

    // 2. VALIDATE COORDINATES IF PROVIDED
    // - Both latitude and longitude must be provided together (all-or-nothing)
    // - If one is provided without the other, validation should fail
    const hasLatitude = data.latitude !== undefined && data.latitude !== null;
    const hasLongitude =
      data.longitude !== undefined && data.longitude !== null;

    if (hasLatitude !== hasLongitude) {
      throw new Error(
        "Both latitude and longitude must be provided together, or neither",
      );
    }

    if (hasLatitude && hasLongitude) {
      const lat = Number(data.latitude);
      const lng = Number(data.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Latitude and longitude must be valid numbers");
      }

      if (lat < -90 || lat > 90) {
        throw new Error("Latitude must be between -90 and 90");
      }

      if (lng < -180 || lng > 180) {
        throw new Error("Longitude must be between -180 and 180");
      }
    }

    // 3. NORMALIZE STRING FIELDS (trim whitespace)
    const normalizedData = {
      title: String(data.title).trim(),
      description: data.description ? String(data.description).trim() : "",
      city: data.city ? String(data.city).trim() : "",
      location: String(data.location).trim(),
      landmark: data.landmark ? String(data.landmark).trim() : "",
      latitude: hasLatitude ? Number(data.latitude) : null,
      longitude: hasLongitude ? Number(data.longitude) : null,
      pricePerMonth: Number(data.pricePerMonth),
      roomType: data.roomType ? String(data.roomType).trim() : "",
      idealFor: Array.isArray(data.idealFor)
        ? data.idealFor
        : data.idealFor
        ? [String(data.idealFor).trim()]
        : [],
      amenities: Array.isArray(data.amenities) ? data.amenities : [],
      images: Array.isArray(data.images) ? data.images : [],
      rating: 0,
      reviewsCount: 0,
      isPopular: false,
      reviewStatus: ReviewStatus.PENDING,
      isActive: true,
      ownerId: data.ownerId,
    };
    return normalizedData;
  }
  async create(data: any): Promise<DomainRoom> {
    try {
      logger.info("Creating room", {
        ownerId: data.ownerId,
      });

      // Normalize and validate data
      const normalizedData = await this.normalizeAndValidateRoomData(data);

      // Create room in database
      const room = await this.prisma.room.create({
        data: normalizedData,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      logger.info("Room created successfully", {
        roomId: room.id,
      });
      return this.toDomain(room);
    } catch (error: any) {
      logger.error("Error creating room", {
        error: error.message,
        code: error.code,
        meta: error.meta,
      });

      // Re-throw validation errors as-is
      if (error.message && error.message.includes("is required")) {
        throw error;
      }

      // Handle Prisma-specific errors with detailed messages
      if (error.code === "P2002") {
        throw new Error("A property with this information already exists");
      }
      if (error.code === "P2003") {
        throw new Error(
          `Invalid reference: ${
            error.meta?.field_name || "foreign key constraint failed"
          }`,
        );
      }
      if (error.code === "P2025") {
        throw new Error("Record not found");
      }

      // If it's a Prisma error, include more details
      if (error.code && error.code.startsWith("P")) {
        throw new Error(`Database error (${error.code}): ${error.message}`);
      }

      // Generic fallback with original error message for debugging
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }
  async findById(id: string): Promise<DomainRoom | null> {
    try {
      const room = await this.prisma.room.findUnique({
        where: {
          id,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return room ? this.toDomain(room) : null;
    } catch (error: any) {
      logger.error("Error finding room by id", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to find room");
    }
  }

  /**
   * PRODUCTION-SAFE findAll with CURSOR-BASED PAGINATION for 20,000+ users
   * ✅ Uses cursor-based pagination to avoid offset issues
   * ✅ Eliminates stable sorting problems at scale
   * ✅ Efficient composite indexes support
   * ✅ Maps Prisma types to domain Room via toDomain()
   */
  async findAll(filters?: any): Promise<{
    rooms: DomainRoom[];
    total: number;
    hasNextPage: boolean;
    nextCursor?: string;
  }> {
    try {
      // ✅ DEBUG: Log all incoming filters
      logger.info('🔍 REPOSITORY: findAll() called with filters', {
        filters: {
          city: filters?.city,
          roomType: filters?.roomType,
          roomTypes: filters?.roomTypes,
          minPrice: filters?.minPrice,
          maxPrice: filters?.maxPrice,
          sort: filters?.sort,
          page: filters?.page,
          limit: filters?.limit,
          cursor: filters?.cursor,
          genderPreference: filters?.genderPreference,
          idealFor: filters?.idealFor,
          reviewStatus: filters?.reviewStatus,
          onlyActive: filters?.onlyActive
        }
      });

      // ✅ PAGE-BASED PAGINATION: Use skip and take
      const page = Math.max(parseInt(String(filters?.page)) || 1, 1);
      const limit = Math.min(
        Math.max(parseInt(String(filters?.limit)) || 20, 1),
        100
      );
      const skip = (page - 1) * limit;
      
      // ✅ DEBUG LOGS
      console.log("PAGE:", page, "SKIP:", skip);
      
      const where: Prisma.RoomWhereInput = {};

      if (
        filters?.city &&
        typeof filters.city === "string" &&
        filters.city.trim()
      ) {
        where.city = {
          equals: filters.city.trim(),
          mode: "insensitive",
        };
      }
      
      // ✅ NEW: Support multi-select room types
      // Priority: roomTypes array > roomType single > nothing
      if (filters?.roomTypes) {
        // Handle both array and comma-separated string formats
        let roomTypeArray: string[] = [];
        
        if (Array.isArray(filters.roomTypes)) {
          roomTypeArray = filters.roomTypes
            .map((rt: any) => String(rt).trim())
            .filter((rt: string) => rt.length > 0);
        } else if (typeof filters.roomTypes === "string") {
          roomTypeArray = filters.roomTypes
            .split(",")
            .map((rt: string) => rt.trim())
            .filter((rt: string) => rt.length > 0);
        }
        
        if (roomTypeArray.length > 0) {
          where.roomType = {
            in: roomTypeArray,
          };
          // ✅ DEBUG: Log roomTypes filter applied
          logger.info('🔍 REPOSITORY: roomTypes filter APPLIED', {
            received: filters.roomTypes,
            normalized: roomTypeArray,
            dbCondition: `WHERE roomType IN (${roomTypeArray.map(t => `'${t}'`).join(',')})`
          });
        }
      } else if (
        filters?.roomType &&
        typeof filters.roomType === "string" &&
        filters.roomType.trim()
      ) {
        // Fallback to single roomType (backward compatibility)
        where.roomType = filters.roomType.trim() as any;
        // ✅ DEBUG: Log single roomType filter
        logger.info('🔍 REPOSITORY: roomType filter APPLIED (LEGACY)', {
          value: filters.roomType,
          dbCondition: `WHERE roomType = '${filters.roomType}'`
        });
      }

      // ✅ NEW: Gender preference filtering
      if (
        filters?.genderPreference &&
        typeof filters.genderPreference === "string"
      ) {
        const validGenders = ["ANY", "MALE_ONLY", "FEMALE_ONLY"];
        const genderPref = filters.genderPreference.trim().toUpperCase();
        if (validGenders.includes(genderPref)) {
          where.genderPreference = genderPref;
        }
      }

      // ✅ CRITICAL FIX #6: Handle idealFor empty array safely
      // Support both array and comma-separated string formats
      if (filters?.idealFor) {
        let idealForArray: string[] = [];
        const validIdealFor = ["Students", "Working Professionals", "Family"];
        
        if (Array.isArray(filters.idealFor)) {
          idealForArray = filters.idealFor
            .map((inf: any) => String(inf).trim())
            .filter((inf: string) => inf.length > 0 && validIdealFor.includes(inf));
        } else if (typeof filters.idealFor === "string" && filters.idealFor.trim().length > 0) {
          idealForArray = filters.idealFor
            .split(",")
            .map((inf: string) => inf.trim())
            .filter((inf: string) => inf.length > 0 && validIdealFor.includes(inf));
        }
        
        // ✅ Only apply filter if we have valid values after sanitization
        if (idealForArray.length > 0) {
          where.idealFor = {
            hasSome: idealForArray,
          };
        }
      }

      // ✅ CRITICAL FIX #5: Validate minPrice <= maxPrice
      let minPrice = 0;
      let maxPrice = Infinity;
      
      if (
        filters?.minPrice !== undefined &&
        filters?.minPrice !== "" &&
        filters?.minPrice !== null
      ) {
        const parsed = parseFloat(String(filters.minPrice));
        if (!isNaN(parsed) && parsed >= 0) {
          minPrice = parsed;
        }
      }
      if (
        filters?.maxPrice !== undefined &&
        filters?.maxPrice !== "" &&
        filters?.maxPrice !== null
      ) {
        const parsed = parseFloat(String(filters.maxPrice));
        if (!isNaN(parsed) && parsed >= 0) {
          maxPrice = parsed;
        }
      }
      
      // Validate minPrice <= maxPrice
      if (minPrice > maxPrice) {
        // Swap them to provide better UX instead of returning empty
        [minPrice, maxPrice] = [maxPrice, minPrice];
      }
      
      if (minPrice > 0 || maxPrice < Infinity) {
        where.pricePerMonth = {};
        if (minPrice > 0) {
          (where.pricePerMonth as any).gte = minPrice;
        }
        if (maxPrice < Infinity) {
          (where.pricePerMonth as any).lte = maxPrice;
        }
      }

      // Boolean filters
      if (filters?.isPopular !== undefined && filters?.isPopular !== "") {
        where.isPopular =
          filters.isPopular === true || filters.isPopular === "true";
      }
      if (filters?.onlyActive !== undefined && filters?.onlyActive !== "") {
        where.isActive =
          filters.onlyActive === true || filters.onlyActive === "true";
      }

      // ✅ FIX 2: Direct reviewStatus filter takes priority over legacy isVerified flag
      // Service layer always passes reviewStatus directly for public queries
      if (filters?.reviewStatus && typeof filters.reviewStatus === "string") {
        where.reviewStatus = filters.reviewStatus as ReviewStatus;
      }

      // ✅ CRITICAL FIX #7: Validate sort parameter to prevent injection
      const VALID_SORTS = ['latest', 'price_low', 'price_high', 'most_viewed', 'most_contacted'];
      let sortNorm =
        typeof filters?.sort === 'string'
          ? filters.sort.trim().toLowerCase().replace(/-/g, "_")
          : "latest";
      
      // Ensure sort is valid
      if (!VALID_SORTS.includes(sortNorm)) {
        sortNorm = "latest";
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Invalid sort parameter received: ${filters?.sort}. Defaulting to 'latest'`);
        }
      }
      
      let orderBy:
        | Prisma.RoomOrderByWithRelationInput
        | Prisma.RoomOrderByWithRelationInput[];
      if (sortNorm === "price_low") {
        orderBy = [{ pricePerMonth: "asc" }, { id: "asc" }];
      } else if (sortNorm === "price_high") {
        orderBy = [{ pricePerMonth: "desc" }, { id: "asc" }];
      } else {
        orderBy = [{ createdAt: "desc" }, { id: "asc" }];
      }

      const include = {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      };

      const total = await this.prisma.room.count({
        where,
      });
      
      // ✅ DEBUG: Log complete WHERE clause and query count
      logger.info('🔍 REPOSITORY: DB Query executed', {
        whereClause: JSON.stringify(where, null, 2),
        totalMatchingRecords: total,
        limit,
        
      });

      // ✅ CURSOR PAGINATION FOR MOST_VIEWED/MOST_CONTACTED
      if (sortNorm === "most_viewed" || sortNorm === "most_contacted") {
        // ✅ SAFE OPTIMIZATION: Fetch ranked IDs via Prisma groupBy with in-memory sorting
        // This avoids complex raw SQL while maintaining good performance
        try {
          const isViewMetric = sortNorm === "most_viewed";
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

          // STEP 1: Get event aggregation for ranking
          const eventAggregation = await this.prisma.event.groupBy({
            by: ['propertyId'],
            where: {
              type: isViewMetric
                ? EventType.PROPERTY_VIEW
                : {
                    in: [EventType.CONTACT_UNLOCK, EventType.CONTACT_ACCESS],
                  },
              createdAt: { gte: sevenDaysAgo },
              propertyId: { not: null }, // ✅ Filter out null propertyId entries
            },
            _count: {
              _all: true,
            },
          });

          // STEP 2: Sort by count in memory (since Prisma groupBy doesn't support count orderBy)
          const sortedByDemand = eventAggregation
            .sort((a, b) => b._count._all - a._count._all);

          // STEP 3: Apply skip/take pagination to ranked IDs
          const rankedRoomIds = sortedByDemand
            .slice(skip, skip + limit + 1) // Get limit + 1 to detect next page
            .map(agg => agg.propertyId)
            .filter(Boolean) as string[];

          if (rankedRoomIds.length === 0) {
            return { rooms: [], total, hasNextPage: false };
          }

          // STEP 4: Detect if there's a next page
          const hasNextPage = rankedRoomIds.length > limit;
          const pageRoomIds = hasNextPage ? rankedRoomIds.slice(0, limit) : rankedRoomIds;

          // STEP 5: Fetch full room data for ranked IDs only
          const raw = await this.prisma.room.findMany({
            where: { id: { in: pageRoomIds }, ...where },
            include,
          });

          // STEP 6: Reorder by rank (maintain the event-based ranking order)
          const orderedRows = pageRoomIds
            .map(id => raw.find(room => room.id === id))
            .filter(Boolean) as typeof raw;

          const rooms = await this.attachDemand(
            orderedRows.map(r => this.toDomain(r))
          );

          return { rooms, total, hasNextPage };
        } catch (error) {
          logger.warn('Most viewed/contacted sorting failed, falling back to standard sorting', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            sortNorm,
          });

          // Safe fallback: Use standard skip/take pagination
          const rawFallback = await this.prisma.room.findMany({
            where,
            skip,
            take: limit + 1, // Get limit + 1 to detect next page
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
            include,
          });
          const hasNextPage = rawFallback.length > limit;
          const pageRows = hasNextPage ? rawFallback.slice(0, limit) : rawFallback;
          const rooms = await this.attachDemand(
            pageRows.map(r => this.toDomain(r))
          );

          return { rooms, total, hasNextPage };
        }
      }

      // ✅ SKIP/TAKE PAGINATION: Main query with stable ordering
      const rawResults = await this.prisma.room.findMany({
        where,
        skip,
        take: limit + 1, // Get limit + 1 to detect if there's a next page
        orderBy,
        include,
      });

      // ✅ Check if there are more pages
      const hasNextPage = rawResults.length > limit;
      const pageRows = hasNextPage ? rawResults.slice(0, limit) : rawResults;

      const rooms = await this.attachDemand(pageRows.map((r) => this.toDomain(r)));

      return {
        rooms,
        total,
        hasNextPage,
      };
    } catch (error: any) {
      logger.error("Error finding all rooms", {
        error: error.message,
        code: error.code,
        meta: error.meta,
      });
      throw new Error(`Failed to find rooms: ${error.message}`);
    }
  }
  async findByOwnerId(ownerId: string): Promise<DomainRoom[]> {
    try {
      const rooms = await this.prisma.room.findMany({
        where: {
          ownerId,
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      });
      return await this.attachDemand(rooms.map((r) => this.toDomain(r)));
    } catch (error: any) {
      logger.error("Error finding rooms by owner", {
        error: error.message,
        stack: error.stack,
        ownerId,
      });
      throw new Error("Failed to find rooms");
    }
  }
  async findByCity(city: string): Promise<DomainRoom[]> {
    try {
      const rooms = await this.prisma.room.findMany({
        where: {
          city,
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return rooms.map((r) => this.toDomain(r));
    } catch (error: any) {
      logger.error("Error finding rooms by city", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to find rooms");
    }
  }
  async update(
    id: string,
    data: Partial<DomainRoom>,
  ): Promise<DomainRoom | null> {
    try {
      const {
        id: _id,
        ownerId,
        createdAt,
        updatedAt,
        reviewStatus,
        latitude,
        longitude,
        ...rest
      } = data;

      // Validate coordinates if provided
      // - Both latitude and longitude must be provided together (all-or-nothing)
      const hasLatitude = latitude !== undefined && latitude !== null;
      const hasLongitude = longitude !== undefined && longitude !== null;

      if (hasLatitude !== hasLongitude) {
        throw new Error(
          "Both latitude and longitude must be provided together, or neither",
        );
      }

      if (hasLatitude && hasLongitude) {
        if (isNaN(latitude as number) || isNaN(longitude as number)) {
          throw new Error("Latitude and longitude must be valid numbers");
        }

        if ((latitude as number) < -90 || (latitude as number) > 90) {
          throw new Error("Latitude must be between -90 and 90");
        }

        if ((longitude as number) < -180 || (longitude as number) > 180) {
          throw new Error("Longitude must be between -180 and 180");
        }
      }

      const safeUpdate: Prisma.RoomUpdateInput = {
        ...rest,
        // Include coordinates if provided
        ...(hasLatitude && { latitude: latitude as number }),
        ...(hasLongitude && { longitude: longitude as number }),
        // ✅ explicitly map enum safely
        ...(reviewStatus !== undefined && {
          reviewStatus: reviewStatus as ReviewStatus,
        }),
      };
      const room = await this.prisma.room.update({
        where: {
          id,
        },
        data: safeUpdate,
      });
      logger.info("Room updated", {
        roomId: id,
      });
      return this.toDomain(room);
    } catch (error: any) {
      logger.error("Error updating room", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to update room");
    }
  }
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.room.delete({
        where: {
          id,
        },
      });
      return true;
    } catch (error: any) {
      logger.error("Error deleting room", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to delete room");
    }
  }
  async search(filters: any): Promise<DomainRoom[]> {
    try {
      const where: Prisma.RoomWhereInput = {
        isActive: true,
      };

      // ✅ reviewStatus filter — passed by RoomService for tenant/public queries.
      // Service layer is responsible for deciding WHEN to enforce this.
      // Repository just applies it if provided.
      if (filters?.reviewStatus && typeof filters.reviewStatus === "string") {
        where.reviewStatus = filters.reviewStatus as ReviewStatus;
      }
      if (filters.city) {
        where.city = filters.city;
      }
      if (filters.minPrice || filters.maxPrice) {
        where.pricePerMonth = {};
        if (filters.minPrice)
          (where.pricePerMonth as any).gte = Number(filters.minPrice);
        if (filters.maxPrice)
          (where.pricePerMonth as any).lte = Number(filters.maxPrice);
      }
      // 🔥 MULTI-SELECT FIX: Handle both single value and array of values
      // Input can be: "1BHK" (single), ["Single", "PG", "1BHK"] (multiple), or undefined
      if (filters?.roomType) {
        let roomTypes: string[] = [];

        if (Array.isArray(filters.roomType)) {
          roomTypes = filters.roomType;
        } else if (typeof filters.roomType === "string") {
          // 🔥 FIX: split comma string
          roomTypes = filters.roomType.split(",");
        }

        roomTypes = roomTypes.map((rt) => rt.trim()).filter(Boolean);

        if (roomTypes.length === 1) {
          where.roomType = roomTypes[0] as any;
        } else if (roomTypes.length > 1) {
          where.roomType = {
            in: roomTypes as any,
          };
        }
      }
      const rooms = await this.prisma.room.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return rooms.map((r) => this.toDomain(r));
    } catch (error: any) {
      logger.error("Error searching rooms", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to search rooms");
    }
  }
  async toggleRoomStatus(id: string): Promise<DomainRoom | null> {
    const room = await this.prisma.room.findUnique({
      where: {
        id,
      },
      select: {
        isActive: true,
      },
    });
    if (!room) return null;
    const updatedRoom = await this.prisma.room.update({
      where: {
        id,
      },
      data: {
        isActive: !room.isActive,
      },
    });
    return updatedRoom ? this.toDomain(updatedRoom) : null;
  }
}
