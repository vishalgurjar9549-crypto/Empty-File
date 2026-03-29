interface UpgradeSubscriptionInput {
    userId: string;
    plan: 'FREE' | 'GOLD' | 'PLATINUM';
    city: string;
    paymentId: string;
}
export declare class TenantSubscriptionService {
    private subscriptionRepository;
    private propertyViewRepository;
    private roomRepository;
    private prisma;
    constructor(subscriptionRepository: any, propertyViewRepository: any, roomRepository?: any);
    /**
     * CREATE ORDER (for payment flow)
     */
    createOrder(data: {
        plan: string;
        city: string;
        amount: number;
    }): Promise<{
        orderId: any;
        amount: any;
        currency: any;
    }>;
    /**
     * VERIFY PAYMENT
     */
    verifyPayment(data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): Promise<{
        success: boolean;
    }>;
    /**
     * UPGRADE SUBSCRIPTION — MULTI-CITY
     *
     * Uses composite upsert: tenantId_city.
     * Buying Kota GOLD does NOT overwrite Bangalore GOLD.
     * Each city gets its own independent subscription row.
     */
    upgradeSubscription(input: UpgradeSubscriptionInput): Promise<{
        city: string;
        id: string;
        expiresAt: Date | null;
        plan: string;
        tenantId: string;
        startedAt: Date;
    }>;
    /**
     * GET USER SUBSCRIPTIONS — ALL CITIES
     *
     * Returns every subscription row for this tenant (one per city).
     * Uses findMany since tenantId is no longer unique.
     */
    getUserSubscriptions(userId: string): Promise<{
        city: string;
        id: string;
        expiresAt: Date | null;
        plan: string;
        tenantId: string;
        startedAt: Date;
    }[]>;
    /**
     * GET SUBSCRIPTION BY CITY — COMPOSITE LOOKUP
     *
     * Direct database-level lookup using @@unique([tenantId, city]).
     * No app-level filtering. No fetching wrong city's data.
     */
    getSubscriptionByCity(userId: string, city: string): Promise<{
        city: string;
        id: string;
        expiresAt: Date | null;
        plan: string;
        tenantId: string;
        startedAt: Date;
    } | null>;
    /**
     * GET PRICING FOR CITY
     * Falls back to 'default' pricing if city-specific rows are missing.
     * Only throws if BOTH city and default are missing.
     */
    getPricing(city: string): Promise<{
        plan: any;
        price: any;
        features: string[];
    }[]>;
    /**
     * GET VIEW COUNT BY CITY
     */
    getViewCountByCity(userId: string, city: string): Promise<number>;
    /**
     * GET UNIQUE PROPERTY COUNT BY CITY
     */
    getUniquePropertyCountByCity(userId: string, city: string): Promise<number>;
    /**
     * CHECK IF USER HAS VIEWED PROPERTY
     */
    hasUserViewedProperty(userId: string, roomId: string): Promise<boolean>;
    /**
     * RECORD PROPERTY VIEW
     */
    recordPropertyView(userId: string, roomId: string, city: string): Promise<void>;
    /**
     * TRACK PROPERTY VIEW
     */
    trackPropertyView(userId: string, propertyId: string): Promise<{
        success: boolean;
    }>;
    /**
     * GET ALL SUBSCRIPTIONS (admin)
     */
    getAllSubscriptions(): Promise<({
        tenant: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        city: string;
        id: string;
        expiresAt: Date | null;
        plan: string;
        tenantId: string;
        startedAt: Date;
    })[]>;
    /**
     * ENSURE CITY PRICING EXISTS
     * If a city has no pricing rows, copies from 'default' and inserts them.
     * Safe to call multiple times (upsert-based, idempotent).
     * Call this when a new city is added or pricing is requested for an unknown city.
     */
    ensureCityPricingExists(city: string): Promise<void>;
}
export {};
//# sourceMappingURL=TenantSubscriptionService.d.ts.map