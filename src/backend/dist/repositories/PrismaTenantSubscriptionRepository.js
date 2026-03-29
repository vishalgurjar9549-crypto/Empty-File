"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTenantSubscriptionRepository = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const normalize_1 = require("../utils/normalize");
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
class PrismaTenantSubscriptionRepository {
    constructor(prismaClient) {
        this.prisma = prismaClient || (0, prisma_1.getPrismaClient)();
    }
    async create(data) {
        try {
            const normalizedCity = (0, normalize_1.normalizeCity)(data.city);
            return await this.prisma.tenantSubscription.create({
                data: {
                    tenantId: data.tenantId,
                    plan: data.plan,
                    city: normalizedCity,
                    expiresAt: data.expiresAt || null
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating subscription', {
                error: error.message
            });
            throw new Error('Failed to create subscription');
        }
    }
    async findById(id) {
        try {
            return await this.prisma.tenantSubscription.findUnique({
                where: {
                    id
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding subscription by id', {
                error: error.message
            });
            throw new Error('Failed to find subscription');
        }
    }
    /**
     * Find ALL subscriptions for a tenant (all cities).
     * Returns array — one entry per city.
     */
    async findByTenantId(tenantId) {
        try {
            return await this.prisma.tenantSubscription.findMany({
                where: {
                    tenantId
                },
                orderBy: [{ startedAt: 'desc' }, { id: 'asc' }]
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding subscriptions by tenant id', {
                error: error.message
            });
            throw new Error('Failed to find subscriptions');
        }
    }
    /**
     * Find subscription for a specific tenant + city.
     * Uses composite unique key tenantId_city.
     */
    async findByTenantIdAndCity(tenantId, city) {
        try {
            const normalizedCity = (0, normalize_1.normalizeCity)(city);
            return await this.prisma.tenantSubscription.findUnique({
                where: {
                    tenantId_city: {
                        tenantId,
                        city: normalizedCity
                    }
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding subscription by tenant+city', {
                error: error.message
            });
            throw new Error('Failed to find subscription');
        }
    }
    /**
     * Find all ACTIVE subscriptions for a user (all cities).
     * "Active" = expiresAt is null or in the future.
     */
    async findActiveByUserId(userId) {
        try {
            const now = new Date();
            const subscriptions = await this.prisma.tenantSubscription.findMany({
                where: {
                    tenantId: userId
                }
            });
            // Filter to active only
            return subscriptions.filter((s) => !s.expiresAt || s.expiresAt > now);
        }
        catch (error) {
            logger_1.logger.error('Error finding active subscriptions', {
                error: error.message
            });
            throw new Error('Failed to find subscriptions');
        }
    }
    /**
     * Find active subscription for a specific user + city.
     * Uses composite unique key — direct DB lookup, no app-level filtering.
     */
    async findActiveByUserIdAndCity(userId, city) {
        try {
            const normalizedCity = (0, normalize_1.normalizeCity)(city);
            const subscription = await this.prisma.tenantSubscription.findUnique({
                where: {
                    tenantId_city: {
                        tenantId: userId,
                        city: normalizedCity
                    }
                }
            });
            if (!subscription)
                return null;
            // Check expiry
            if (subscription.expiresAt && subscription.expiresAt < new Date())
                return null;
            return subscription;
        }
        catch (error) {
            logger_1.logger.error('Error finding active subscription by city', {
                error: error.message
            });
            throw new Error('Failed to find subscription');
        }
    }
    async findAll() {
        try {
            return await this.prisma.tenantSubscription.findMany({
                orderBy: [{ startedAt: 'desc' }, { id: 'asc' }],
                include: {
                    tenant: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    },
                    payment: {
                        select: {
                            id: true,
                            amount: true,
                            status: true
                        }
                    }
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding all subscriptions', {
                error: error.message
            });
            throw new Error('Failed to find subscriptions');
        }
    }
    async update(id, data) {
        try {
            return await this.prisma.tenantSubscription.update({
                where: {
                    id
                },
                data
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating subscription', {
                error: error.message
            });
            throw new Error('Failed to update subscription');
        }
    }
}
exports.PrismaTenantSubscriptionRepository = PrismaTenantSubscriptionRepository;
//# sourceMappingURL=PrismaTenantSubscriptionRepository.js.map