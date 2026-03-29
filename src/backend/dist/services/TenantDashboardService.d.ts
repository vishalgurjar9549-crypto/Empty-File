/**
 * TenantDashboardService — MULTI-CITY ARCHITECTURE
 *
 * Returns all city subscriptions for the tenant.
 * Phone masking uses ANY active subscription (not city-specific for dashboard).
 */
export interface TenantDashboardBooking {
    id: string;
    roomId: string;
    moveInDate: string;
    message: string | null;
    status: string;
    createdAt: string;
    room: {
        id: string;
        title: string;
        city: string;
        pricePerMonth: number;
        images: string[];
    };
    owner: {
        name: string;
        phone: string | null;
    };
}
export interface TenantDashboardSubscription {
    id: string;
    plan: string;
    city: string;
    startedAt: string;
    expiresAt: string | null;
    isActive: boolean;
}
export interface TenantDashboardRecentView {
    id: string;
    title: string;
    city: string;
    pricePerMonth: number;
    images: string[];
    roomType: string;
    viewedAt: string;
}
export interface TenantDashboardData {
    bookings: TenantDashboardBooking[];
    subscriptions: TenantDashboardSubscription[];
    recentlyViewed: TenantDashboardRecentView[];
}
export declare class TenantDashboardService {
    private prisma;
    constructor(prismaClient?: any);
    /**
     * GET DASHBOARD — Aggregated endpoint
     *
     * MULTI-CITY: Returns ALL subscriptions (one per city).
     * Phone masking: visible if tenant has ANY active subscription or booking is APPROVED.
     */
    getDashboard(tenantId: string): Promise<TenantDashboardData>;
    /**
     * FETCH BOOKINGS
     */
    private fetchBookings;
    /**
     * FETCH SUBSCRIPTIONS — ALL CITIES
     *
     * Uses findMany to return every subscription row for this tenant.
     * One row per city.
     */
    private fetchSubscriptions;
    /**
     * FETCH RECENTLY VIEWED
     */
    private fetchRecentlyViewed;
}
//# sourceMappingURL=TenantDashboardService.d.ts.map