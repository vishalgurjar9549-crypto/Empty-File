import { PrismaClient } from "@prisma/client";
import { Room as DomainRoom } from "../models/Room";
import { IRoomRepository } from "./interfaces";
export declare class PrismaRoomRepository implements IRoomRepository {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    /**
     * Map Prisma Room to domain Room type
     */
    private toDomain;
    /**
     * PRODUCTION-SAFE: Validate and normalize room data
     */
    private normalizeAndValidateRoomData;
    create(data: any): Promise<DomainRoom>;
    findById(id: string): Promise<DomainRoom | null>;
    /**
     * PRODUCTION-SAFE findAll with type-safe where clause
     * ✅ Uses Prisma.RoomWhereInput for compile-time validation
     * ✅ Removed isVerified (does not exist in schema)
     * ✅ Uses reviewStatus enum for verification filtering
     * ✅ Maps Prisma types to domain Room via toDomain()
     */
    findAll(filters?: any): Promise<{
        rooms: DomainRoom[];
        total: number;
        hasNextPage: boolean;
        nextCursor?: string;
    }>;
    findByOwnerId(ownerId: string): Promise<DomainRoom[]>;
    findByCity(city: string): Promise<DomainRoom[]>;
    update(id: string, data: Partial<DomainRoom>): Promise<DomainRoom | null>;
    delete(id: string): Promise<boolean>;
    search(filters: any): Promise<DomainRoom[]>;
    toggleRoomStatus(id: string): Promise<DomainRoom | null>;
}
//# sourceMappingURL=PrismaRoomRepository.d.ts.map