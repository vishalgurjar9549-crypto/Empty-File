"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantDashboardService = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
class TenantDashboardService {
    constructor(prismaClient) {
        this.prisma = prismaClient || (0, prisma_1.getPrismaClient)();
    }
    /**
     * GET DASHBOARD — Aggregated endpoint
     *
     * MULTI-CITY: Returns ALL subscriptions (one per city).
     * Phone masking: visible if tenant has ANY active subscription or booking is APPROVED.
     */
    async getDashboard(tenantId) {
        let bookingsRaw = [];
        let subscriptionsRaw = [];
        let viewsRaw = [];
        try {
            logger_1.logger.info('[DASHBOARD DIAG] Fetching bookings...', {
                tenantId
            });
            bookingsRaw = await this.fetchBookings(tenantId);
            logger_1.logger.info('[DASHBOARD DIAG] Bookings OK', {
                count: bookingsRaw.length
            });
        }
        catch (err) {
            logger_1.logger.error('[DASHBOARD DIAG] BOOKINGS QUERY FAILED:', {
                name: err?.name,
                message: err?.message,
                code: err?.code,
                meta: err?.meta
            });
            throw err;
        }
        try {
            logger_1.logger.info('[DASHBOARD DIAG] Fetching subscriptions...', {
                tenantId
            });
            subscriptionsRaw = await this.fetchSubscriptions(tenantId);
            logger_1.logger.info('[DASHBOARD DIAG] Subscriptions OK', {
                count: subscriptionsRaw.length
            });
        }
        catch (err) {
            logger_1.logger.error('[DASHBOARD DIAG] SUBSCRIPTION QUERY FAILED:', {
                name: err?.name,
                message: err?.message,
                code: err?.code,
                meta: err?.meta
            });
            throw err;
        }
        try {
            logger_1.logger.info('[DASHBOARD DIAG] Fetching recently viewed...', {
                tenantId
            });
            viewsRaw = await this.fetchRecentlyViewed(tenantId);
            logger_1.logger.info('[DASHBOARD DIAG] Recently viewed OK', {
                count: viewsRaw.length
            });
        }
        catch (err) {
            logger_1.logger.error('[DASHBOARD DIAG] RECENTLY VIEWED QUERY FAILED:', {
                name: err?.name,
                message: err?.message,
                code: err?.code,
                meta: err?.meta
            });
            throw err;
        }
        // Compute isActive for each subscription
        const now = new Date();
        const subscriptions = subscriptionsRaw.map((s) => ({
            id: s.id,
            plan: s.plan,
            city: s.city,
            startedAt: s.startedAt instanceof Date ? s.startedAt.toISOString() : s.startedAt,
            expiresAt: s.expiresAt ? s.expiresAt instanceof Date ? s.expiresAt.toISOString() : s.expiresAt : null,
            isActive: !s.expiresAt || (s.expiresAt instanceof Date ? s.expiresAt > now : new Date(s.expiresAt) > now)
        }));
        // Phone masking: visible if tenant has ANY active subscription
        const hasAnyActiveSubscription = subscriptions.some((s) => s.isActive);
        // Map bookings with owner phone masking
        const bookings = bookingsRaw.map((b) => {
            const canSeePhone = hasAnyActiveSubscription || b.status === 'APPROVED';
            return {
                id: b.id,
                roomId: b.roomId,
                moveInDate: b.moveInDate instanceof Date ? b.moveInDate.toISOString() : b.moveInDate,
                message: b.message || null,
                status: b.status,
                createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
                room: {
                    id: b.room.id,
                    title: b.room.title,
                    city: b.room.city,
                    pricePerMonth: b.room.pricePerMonth,
                    images: b.room.images || []
                },
                owner: {
                    name: b.owner.name,
                    phone: canSeePhone ? b.owner.phone || null : null
                }
            };
        });
        // Map recently viewed
        const recentlyViewed = viewsRaw.filter((v) => v.property !== null).map((v) => ({
            id: v.property.id,
            title: v.property.title,
            city: v.property.city,
            pricePerMonth: v.property.pricePerMonth,
            images: v.property.images || [],
            roomType: v.property.roomType,
            viewedAt: v.viewedAt instanceof Date ? v.viewedAt.toISOString() : v.viewedAt
        }));
        logger_1.logger.info('Tenant dashboard fetched', {
            tenantId,
            bookingCount: bookings.length,
            subscriptionCount: subscriptions.length,
            recentViewCount: recentlyViewed.length
        });
        return {
            bookings,
            subscriptions,
            recentlyViewed
        };
    }
    /**
     * FETCH BOOKINGS
     */
    async fetchBookings(tenantId) {
        return this.prisma.booking.findMany({
            where: {
                tenantId
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
            include: {
                room: {
                    select: {
                        id: true,
                        title: true,
                        city: true,
                        pricePerMonth: true,
                        images: true
                    }
                },
                owner: {
                    select: {
                        name: true,
                        phone: true
                    }
                }
            }
        });
    }
    /**
     * FETCH SUBSCRIPTIONS — ALL CITIES
     *
     * Uses findMany to return every subscription row for this tenant.
     * One row per city.
     */
    async fetchSubscriptions(tenantId) {
        return this.prisma.tenantSubscription.findMany({
            where: {
                tenantId
            },
            orderBy: [{ startedAt: 'desc' }, { id: 'asc' }]
        });
    }
    /**
     * FETCH RECENTLY VIEWED
     */
    async fetchRecentlyViewed(tenantId) {
        return this.prisma.propertyView.findMany({
            where: {
                tenantId,
                property: {
                    isActive: true,
                    reviewStatus: 'APPROVED'
                }
            },
            orderBy: [{ viewedAt: 'desc' }, { id: 'asc' }],
            take: 5,
            select: {
                viewedAt: true,
                property: {
                    select: {
                        id: true,
                        title: true,
                        city: true,
                        pricePerMonth: true,
                        images: true,
                        roomType: true
                    }
                }
            }
        });
    }
}
exports.TenantDashboardService = TenantDashboardService;
//# sourceMappingURL=TenantDashboardService.js.map