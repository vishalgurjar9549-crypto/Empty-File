import { TenantSubscription } from '@prisma/client';
/**
 * PrismaTenantSubscriptionRepository — MULTI-CITY ARCHITECTURE
 *
 * Schema: @@unique([tenantId, city])
 *
 * Rules:
 * - tenant only → findMany (returns all city subscriptions)
 * - tenant + city → findUnique with composite key tenantId_city
 * - ZERO findUnique({ where: { tenantId } }) calls
 */
export declare class PrismaTenantSubscriptionRepository {
    private prisma;
    constructor(prismaClient?: any);
    create(data: {
        tenantId: string;
        plan: string;
        city: string;
        expiresAt?: Date;
    }): Promise<TenantSubscription>;
    findById(id: string): Promise<TenantSubscription | null>;
    /**
     * Find ALL subscriptions for a tenant (all cities).
     * Returns array — one entry per city.
     */
    findByTenantId(tenantId: string): Promise<TenantSubscription[]>;
    /**
     * Find subscription for a specific tenant + city.
     * Uses composite unique key tenantId_city.
     */
    findByTenantIdAndCity(tenantId: string, city: string): Promise<TenantSubscription | null>;
    /**
     * Find all ACTIVE subscriptions for a user (all cities).
     * "Active" = expiresAt is null or in the future.
     */
    findActiveByUserId(userId: string): Promise<TenantSubscription[]>;
    /**
     * Find active subscription for a specific user + city.
     * Uses composite unique key — direct DB lookup, no app-level filtering.
     */
    findActiveByUserIdAndCity(userId: string, city: string): Promise<TenantSubscription | null>;
    findAll(): Promise<TenantSubscription[]>;
    update(id: string, data: Partial<TenantSubscription>): Promise<TenantSubscription>;
}
//# sourceMappingURL=PrismaTenantSubscriptionRepository.d.ts.map