import { PropertyView } from '@prisma/client';
/**
 * PrismaPropertyViewRepository — FIXED
 *
 * Changes:
 * 1. Uses getPrismaClient() singleton instead of broken named import
 * 2. Uses `propertyId` (actual schema field) instead of `roomId`
 * 3. Removed `city` field references (not on PropertyView schema)
 * 4. Uses unique constraint (tenantId, propertyId) for dedup
 */
export declare class PrismaPropertyViewRepository {
    private prisma;
    constructor(prismaClient?: any);
    create(data: {
        tenantId: string;
        propertyId: string;
        city: string;
    }): Promise<PropertyView>;
    countByTenantId(tenantId: string): Promise<number>;
    /**
     * Count unique properties viewed by a user IN A SPECIFIC CITY
     * FIXED: Now actually filters by city via Room relation join
     */
    countUniquePropertiesByUserAndCity(userId: string, city: string): Promise<number>;
    countByUserAndCity(userId: string, city: string): Promise<number>;
    hasUserViewedProperty(userId: string, propertyId: string): Promise<boolean>;
    findByTenantId(tenantId: string): Promise<PropertyView[]>;
    findByPropertyId(propertyId: string): Promise<PropertyView[]>;
    getUniqueViewCount(propertyId: string): Promise<number>;
}
//# sourceMappingURL=PrismaPropertyViewRepository.d.ts.map