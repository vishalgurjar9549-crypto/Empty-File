import { PrismaClient, Room as PrismaRoom, Prisma, ReviewStatus } from "@prisma/client";
import { Room as DomainRoom } from "../models/Room";
import { IRoomRepository } from "./interfaces";
import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";
export class PrismaRoomRepository implements IRoomRepository {
  private prisma: PrismaClient;
  constructor(prismaClient?: PrismaClient) {
    // Use provided client or get singleton
    this.prisma = prismaClient || getPrismaClient();
  }

  /**
   * Map Prisma Room to domain Room type
   */
  private toDomain(r: PrismaRoom): DomainRoom {
    // Parse adminFeedback from Json? Prisma type
    const rawFeedback = r.adminFeedback as any;
    const adminFeedback = rawFeedback && typeof rawFeedback === "object" && !Array.isArray(rawFeedback) ? rawFeedback : undefined;
    return {
      id: r.id,
      title: r.title,
      description: r.description || "",
      city: r.city || "",
      location: r.location,
      landmark: r.landmark || "",
      latitude: r.latitude ?? undefined,  // Include latitude, undefined if null
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
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt)
    };
  }

  /**
   * PRODUCTION-SAFE: Validate and normalize room data
   */
  private async normalizeAndValidateRoomData(data: any): Promise<any> {
    // 1. VALIDATE REQUIRED FIELDS
    const requiredFields = ["title", "city", "location", "pricePerMonth", "roomType", "ownerId"];
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        throw new Error(`${field} is required`);
      }
    }

    // 2. VALIDATE COORDINATES IF PROVIDED
    // - Both latitude and longitude must be provided together (all-or-nothing)
    // - If one is provided without the other, validation should fail
    const hasLatitude = data.latitude !== undefined && data.latitude !== null;
    const hasLongitude = data.longitude !== undefined && data.longitude !== null;
    
    if (hasLatitude !== hasLongitude) {
      throw new Error("Both latitude and longitude must be provided together, or neither");
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
      idealFor: Array.isArray(data.idealFor) ? data.idealFor : data.idealFor ? [String(data.idealFor).trim()] : [],
      amenities: Array.isArray(data.amenities) ? data.amenities : [],
      images: Array.isArray(data.images) ? data.images : [],
      rating: 0,
      reviewsCount: 0,
      isPopular: false,
      reviewStatus: ReviewStatus.PENDING,
      isActive: true,
      ownerId: data.ownerId
    };
    return normalizedData;
  }
  async create(data: any): Promise<DomainRoom> {
    try {
      logger.info("Creating room", {
        ownerId: data.ownerId
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
              name: true
            }
          }
        }
      });
      logger.info("Room created successfully", {
        roomId: room.id
      });
      return this.toDomain(room);
    } catch (error: any) {
      logger.error("Error creating room", {
        error: error.message,
        code: error.code,
        meta: error.meta
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
        throw new Error(`Invalid reference: ${error.meta?.field_name || "foreign key constraint failed"}`);
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
          id
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      return room ? this.toDomain(room) : null;
    } catch (error: any) {
      logger.error("Error finding room by id", {
        error: error.message,
        stack: error.stack
      });
      throw new Error("Failed to find room");
    }
  }

  /**
   * PRODUCTION-SAFE findAll with type-safe where clause
   * ✅ Uses Prisma.RoomWhereInput for compile-time validation
   * ✅ Removed isVerified (does not exist in schema)
   * ✅ Uses reviewStatus enum for verification filtering
   * ✅ Maps Prisma types to domain Room via toDomain()
   */
  async findAll(filters?: any): Promise<{
    rooms: DomainRoom[];
    total: number;
    hasNextPage: boolean;
    nextCursor?: string;
  }> {
    try {
      // ========== SAFE PAGINATION PARSING ==========
      const page = Math.max(parseInt(String(filters?.page)) || 1, 1);
      const limit = Math.min(Math.max(parseInt(String(filters?.limit)) || 20, 1), 100);
      const skip = (page - 1) * limit;

      const cursorId =
        typeof filters?.cursor === "string" && filters.cursor.trim().length > 0
          ? filters.cursor.trim()
          : undefined;

      // ========== TYPE-SAFE WHERE CLAUSE ==========
      const where: Prisma.RoomWhereInput = {};

      // String filters
      if (filters?.city && typeof filters.city === "string" && filters.city.trim()) {
        where.city = filters.city.trim();
      }
      // roomType: supports single value (string) or multiple values (array)
      // 🔥 MULTI-SELECT FIX: Handle both single value and array of values
      // Input can be: "1BHK" (single), ["Single", "PG", "1BHK"] (multiple), or undefined
      if (filters?.roomType) {
        if (Array.isArray(filters.roomType)) {
          // Multiple room types - use 'in' operator
          const roomTypes = filters.roomType
            .map((rt: string) => String(rt).trim())
            .filter(Boolean);
          if (roomTypes.length > 0) {
            where.roomType = {
              in: roomTypes as any
            };
          }
        } else if (typeof filters.roomType === "string" && filters.roomType.trim()) {
          // Single room type - direct match
          where.roomType = filters.roomType.trim();
        }
      }

      // idealFor: room's array must include the selected tenant type
      if (filters?.idealFor && typeof filters.idealFor === "string" && filters.idealFor.trim()) {
        where.idealFor = {
          has: filters.idealFor.trim()
        };
      }

      // amenities: room must include every selected amenity (AND)
      let amenityList: string[] = [];
      if (Array.isArray(filters?.amenities)) {
        amenityList = filters.amenities.map((a: string) => String(a).trim()).filter(Boolean);
      } else if (typeof filters?.amenities === "string" && filters.amenities.trim()) {
        amenityList = filters.amenities.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      if (amenityList.length > 0) {
        where.amenities = {
          hasEvery: amenityList
        };
      }

      // Numeric filters (price range)
      if (filters?.minPrice !== undefined && filters?.minPrice !== "" && filters?.minPrice !== null) {
        const minPrice = parseFloat(String(filters.minPrice));
        if (!isNaN(minPrice)) {
          where.pricePerMonth = {
            ...(where.pricePerMonth as object || {}),
            gte: minPrice
          };
        }
      }
      if (filters?.maxPrice !== undefined && filters?.maxPrice !== "" && filters?.maxPrice !== null) {
        const maxPrice = parseFloat(String(filters.maxPrice));
        if (!isNaN(maxPrice)) {
          where.pricePerMonth = {
            ...(where.pricePerMonth as object || {}),
            lte: maxPrice
          };
        }
      }

      // Boolean filters
      if (filters?.isPopular !== undefined && filters?.isPopular !== "") {
        where.isPopular = filters.isPopular === true || filters.isPopular === "true";
      }
      if (filters?.onlyActive !== undefined && filters?.onlyActive !== "") {
        where.isActive = filters.onlyActive === true || filters.onlyActive === "true";
      }

      // ✅ FIX 2: Direct reviewStatus filter takes priority over legacy isVerified flag
      // Service layer always passes reviewStatus directly for public queries
      if (filters?.reviewStatus && typeof filters.reviewStatus === "string") {
        where.reviewStatus = filters.reviewStatus as ReviewStatus;
      } else if (filters?.isVerified !== undefined && filters?.isVerified !== "") {
        // Legacy fallback: translate isVerified → reviewStatus
        const isVerified = filters.isVerified === true || filters.isVerified === "true";
        if (isVerified) {
          where.reviewStatus = ReviewStatus.APPROVED;
        }
      }

      // ========== DYNAMIC ORDER BY (stable: always end with id for deterministic pages) ==========
      const sortNorm =
        typeof filters?.sort === "string" ? filters.sort.trim().toLowerCase().replace(/-/g, "_") : "";
      let orderBy: Prisma.RoomOrderByWithRelationInput | Prisma.RoomOrderByWithRelationInput[];
      if (sortNorm === "recommended") {
        // 🔥 SMART SORT: Combine popularity (views + bookings) with rating (quality)
        // Order: views count (most visited) → bookings count (engagement) → rating → createdAt (recency)
        orderBy = [
          { propertyViews: { _count: "desc" } },
          { bookings: { _count: "desc" } },
          { rating: "desc" },
          { createdAt: "desc" },
          { id: "asc" }
        ];
      } else if (sortNorm === "popular") {
        // Popular: sort by views + bookings + rating
        orderBy = [
          { propertyViews: { _count: "desc" } },
          { bookings: { _count: "desc" } },
          { rating: "desc" },
          { createdAt: "desc" },
          { id: "asc" }
        ];
      } else if (sortNorm === "price_asc" || sortNorm === "price_low") {
        orderBy = [{ pricePerMonth: "asc" }, { id: "asc" }];
      } else if (sortNorm === "price_desc" || sortNorm === "price_high") {
        orderBy = [{ pricePerMonth: "desc" }, { id: "asc" }];
      } else if (sortNorm === "rating" || sortNorm === "rating_desc") {
        orderBy = [{ rating: "desc" }, { id: "asc" }];
      } else if (sortNorm === "rating_asc") {
        orderBy = [{ rating: "asc" }, { id: "asc" }];
      } else {
        // latest, newest, or default — sort by creation date (newest first)
        orderBy = [{ createdAt: "desc" }, { id: "asc" }];
      }

      const include = {
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      };

      // ========== EXECUTE QUERIES ==========
      const total = await this.prisma.room.count({
        where
      });

      if (cursorId) {
        const cursorMatchesFilter = await this.prisma.room.findFirst({
          where: {
            AND: [where, { id: cursorId }]
          },
          select: { id: true }
        });
        if (!cursorMatchesFilter) {
          return {
            rooms: [],
            total,
            hasNextPage: false,
            nextCursor: undefined
          };
        }

        const raw = await this.prisma.room.findMany({
          where,
          orderBy,
          cursor: { id: cursorId },
          skip: 1,
          take: limit + 1,
          include
        });

        const hasNextPage = raw.length > limit;
        const pageRows = hasNextPage ? raw.slice(0, limit) : raw;
        const rooms = pageRows.map((r) => this.toDomain(r));
        const nextCursor =
          hasNextPage && rooms.length > 0 ? rooms[rooms.length - 1].id : undefined;

        return {
          rooms,
          total,
          hasNextPage,
          nextCursor
        };
      }

      const rawOffset = await this.prisma.room.findMany({
        where,
        skip,
        take: limit + 1,
        orderBy,
        include
      });
      const hasNextPage = rawOffset.length > limit;
      const pageRows = hasNextPage ? rawOffset.slice(0, limit) : rawOffset;
      const rooms = pageRows.map((r) => this.toDomain(r));
      const nextCursor =
        hasNextPage && rooms.length > 0 ? rooms[rooms.length - 1].id : undefined;

      return {
        rooms,
        total,
        hasNextPage,
        nextCursor
      };
    } catch (error: any) {
      logger.error("Error finding all rooms", {
        error: error.message,
        code: error.code,
        meta: error.meta
      });
      throw new Error(`Failed to find rooms: ${error.message}`);
    }
  }
  async findByOwnerId(ownerId: string): Promise<DomainRoom[]> {
    try {
      const rooms = await this.prisma.room.findMany({
        where: {
          ownerId
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }]
      });
      return rooms.map((r) => this.toDomain(r));
    } catch (error: any) {
      logger.error("Error finding rooms by owner", {
        error: error.message,
        stack: error.stack,
        ownerId
      });
      throw new Error("Failed to find rooms");
    }
  }
  async findByCity(city: string): Promise<DomainRoom[]> {
    try {
      const rooms = await this.prisma.room.findMany({
        where: {
          city
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        include: {
          owner: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      return rooms.map((r) => this.toDomain(r));
    } catch (error: any) {
      logger.error("Error finding rooms by city", {
        error: error.message,
        stack: error.stack
      });
      throw new Error("Failed to find rooms");
    }
  }
  async update(id: string, data: Partial<DomainRoom>): Promise<DomainRoom | null> {
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
        throw new Error("Both latitude and longitude must be provided together, or neither");
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
          reviewStatus: reviewStatus as ReviewStatus
        })
      };
      const room = await this.prisma.room.update({
        where: {
          id
        },
        data: safeUpdate
      });
      logger.info("Room updated", {
        roomId: id
      });
      return this.toDomain(room);
    } catch (error: any) {
      logger.error("Error updating room", {
        error: error.message,
        stack: error.stack
      });
      throw new Error("Failed to update room");
    }
  }
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.room.delete({
        where: {
          id
        }
      });
      return true;
    } catch (error: any) {
      logger.error("Error deleting room", {
        error: error.message,
        stack: error.stack
      });
      throw new Error("Failed to delete room");
    }
  }
  async search(filters: any): Promise<DomainRoom[]> {
    try {
      const where: Prisma.RoomWhereInput = {
        isActive: true
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
        if (filters.minPrice) (where.pricePerMonth as any).gte = Number(filters.minPrice);
        if (filters.maxPrice) (where.pricePerMonth as any).lte = Number(filters.maxPrice);
      }
      // 🔥 MULTI-SELECT FIX: Handle both single value and array of values
      // Input can be: "1BHK" (single), ["Single", "PG", "1BHK"] (multiple), or undefined
      if (filters?.roomType) {
        if (Array.isArray(filters.roomType)) {
          // Multiple room types - use 'in' operator
          const roomTypes = filters.roomType
            .map((rt: string) => String(rt).trim())
            .filter(Boolean);
          if (roomTypes.length > 0) {
            where.roomType = {
              in: roomTypes as any
            };
          }
        } else if (typeof filters.roomType === "string") {
          // Single room type - direct match
          where.roomType = filters.roomType;
        }
      }
      const rooms = await this.prisma.room.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        include: {
          owner: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      return rooms.map((r) => this.toDomain(r));
    } catch (error: any) {
      logger.error("Error searching rooms", {
        error: error.message,
        stack: error.stack
      });
      throw new Error("Failed to search rooms");
    }
  }
  async toggleRoomStatus(id: string): Promise<DomainRoom | null> {
    const room = await this.prisma.room.findUnique({
      where: {
        id
      },
      select: {
        isActive: true
      }
    });
    if (!room) return null;
    const updatedRoom = await this.prisma.room.update({
      where: {
        id
      },
      data: {
        isActive: !room.isActive
      }
    });
    return updatedRoom ? this.toDomain(updatedRoom) : null;
  }
}
