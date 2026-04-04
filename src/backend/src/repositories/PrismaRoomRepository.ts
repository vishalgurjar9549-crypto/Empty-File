import {
  PrismaClient,
  Room as PrismaRoom,
  Prisma,
  ReviewStatus,
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
      const page = Math.max(parseInt(String(filters?.page)) || 1, 1);
      const limit = Math.min(
        Math.max(parseInt(String(filters?.limit)) || 20, 1),
        100,
      );
      const skip = (page - 1) * limit;
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
      if (
        filters?.roomType &&
        typeof filters.roomType === "string" &&
        filters.roomType.trim()
      ) {
        where.roomType = filters.roomType.trim() as any;
      }
      if (
        filters?.minPrice !== undefined &&
        filters?.minPrice !== "" &&
        filters?.minPrice !== null
      ) {
        const minPrice = parseFloat(String(filters.minPrice));
        if (!isNaN(minPrice)) {
          where.pricePerMonth = {
            ...((where.pricePerMonth as object) || {}),
            gte: minPrice,
          };
        }
      }
      if (
        filters?.maxPrice !== undefined &&
        filters?.maxPrice !== "" &&
        filters?.maxPrice !== null
      ) {
        const maxPrice = parseFloat(String(filters.maxPrice));
        if (!isNaN(maxPrice)) {
          where.pricePerMonth = {
            ...((where.pricePerMonth as object) || {}),
            lte: maxPrice,
          };
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

      const sortNorm =
        typeof filters?.sort === "string"
          ? filters.sort.trim().toLowerCase().replace(/-/g, "_")
          : "latest";
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

      if (sortNorm === "most_viewed" || sortNorm === "most_contacted") {
        const candidateRows = await this.prisma.room.findMany({
          where,
          select: {
            id: true,
            createdAt: true,
          },
        });

        const demandMap = await this.demandService.getDemandMap(
          candidateRows.map((room) => room.id),
        );

        const rankedIds = candidateRows
          .sort((a, b) => {
            const aDemand = demandMap.get(a.id) || { weeklyViews: 0, weeklyContacts: 0 };
            const bDemand = demandMap.get(b.id) || { weeklyViews: 0, weeklyContacts: 0 };
            const aMetric =
              sortNorm === "most_contacted"
                ? aDemand.weeklyContacts
                : aDemand.weeklyViews;
            const bMetric =
              sortNorm === "most_contacted"
                ? bDemand.weeklyContacts
                : bDemand.weeklyViews;

            if (bMetric !== aMetric) {
              return bMetric - aMetric;
            }

            return b.createdAt.getTime() - a.createdAt.getTime();
          })
          .map((room) => room.id);

        const pagedIds = rankedIds.slice(skip, skip + limit);
        const hasNextPage = skip + limit < rankedIds.length;

        if (pagedIds.length === 0) {
          return {
            rooms: [],
            total,
            hasNextPage,
            nextCursor: undefined,
          };
        }

        const raw = await this.prisma.room.findMany({
          where: {
            id: { in: pagedIds },
          },
          include,
        });

        const orderedRows = pagedIds
          .map((id) => raw.find((room) => room.id === id))
          .filter(Boolean) as typeof raw;
        const rooms = await this.attachDemand(
          orderedRows.map((room) => this.toDomain(room)),
        );

        return {
          rooms,
          total,
          hasNextPage,
          nextCursor: undefined,
        };
      }

      const rawOffset = await this.prisma.room.findMany({
        where,
        skip,
        take: limit + 1,
        orderBy,
        include,
      });
      const hasNextPage = rawOffset.length > limit;
      const pageRows = hasNextPage ? rawOffset.slice(0, limit) : rawOffset;
      const rooms = await this.attachDemand(pageRows.map((r) => this.toDomain(r)));
      const nextCursor =
        hasNextPage && rooms.length > 0
          ? rooms[rooms.length - 1].id
          : undefined;

      return {
        rooms,
        total,
        hasNextPage,
        nextCursor,
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
