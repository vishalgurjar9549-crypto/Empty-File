"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantSubscriptionService = void 0;
const logger_1 = require("../utils/logger");
const prisma_1 = require("../utils/prisma");
const normalize_1 = require("../utils/normalize");
const crypto_1 = __importDefault(require("crypto"));
/**
 * TenantSubscriptionService — MULTI-CITY ARCHITECTURE
 *
 * Schema: @@unique([tenantId, city]) — one subscription per tenant per city.
 * All queries use composite key tenantId_city for city-scoped lookups.
 * All tenant-only lookups use findMany (returns all city subscriptions).
 */
// Default plan durations (days)
const PLAN_DURATION_DAYS = {
    FREE: 0,
    GOLD: 30,
    PLATINUM: 30
};
class TenantSubscriptionService {
    constructor(subscriptionRepository, propertyViewRepository, roomRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.propertyViewRepository = propertyViewRepository;
        this.roomRepository = roomRepository || null;
        this.prisma = (0, prisma_1.getPrismaClient)();
    }
    /**
     * CREATE ORDER (for payment flow)
     */
    async createOrder(data) {
        try {
            const { plan, city } = data;
            const normalizedPlan = plan.toUpperCase();
            const normalizedCity = (0, normalize_1.normalizeCity)(city);
            const validPlans = ['FREE', 'GOLD', 'PLATINUM'];
            if (!validPlans.includes(normalizedPlan)) {
                throw new Error('Invalid plan. Must be FREE, GOLD, or PLATINUM');
            }
            // 1. Try city-specific pricing
            let pricing = await this.prisma.cityPricing.findUnique({
                where: {
                    city_plan: {
                        city: normalizedCity,
                        plan: normalizedPlan
                    }
                }
            });
            // 2. Fallback to 'default' pricing if city-specific row is missing
            if (!pricing && normalizedCity !== 'default') {
                logger_1.logger.info(`No pricing for "${normalizedCity}/${normalizedPlan}", falling back to default`);
                pricing = await this.prisma.cityPricing.findUnique({
                    where: {
                        city_plan: {
                            city: 'default',
                            plan: normalizedPlan
                        }
                    }
                });
            }
            // 3. Only throw if BOTH are missing
            if (!pricing) {
                throw new Error(`Pricing not found for ${normalizedCity} - ${normalizedPlan} and no default pricing exists`);
            }
            // Lazy-load Razorpay only when needed
            let razorpay;
            try {
                const Razorpay = require('razorpay');
                razorpay = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID || '',
                    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
                });
            }
            catch {
                throw new Error('Razorpay SDK not available');
            }
            const order = await razorpay.orders.create({
                amount: pricing.price * 100,
                // paise
                currency: 'INR',
                receipt: `sub_${Date.now()}`
            });
            logger_1.logger.info('Razorpay order created', {
                orderId: order.id,
                plan: normalizedPlan,
                city: normalizedCity
            });
            return {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating order', {
                error: error.message
            });
            throw error;
        }
    }
    /**
     * VERIFY PAYMENT
     */
    async verifyPayment(data) {
        const body = data.razorpay_order_id + '|' + data.razorpay_payment_id;
        const expectedSignature = crypto_1.default.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(body).digest('hex');
        if (expectedSignature !== data.razorpay_signature) {
            logger_1.logger.error('Razorpay signature mismatch');
            throw new Error('Payment verification failed');
        }
        logger_1.logger.info('Payment verified successfully', {
            paymentId: data.razorpay_payment_id
        });
        return {
            success: true
        };
    }
    /**
     * UPGRADE SUBSCRIPTION — MULTI-CITY
     *
     * Uses composite upsert: tenantId_city.
     * Buying Kota GOLD does NOT overwrite Bangalore GOLD.
     * Each city gets its own independent subscription row.
     */
    async upgradeSubscription(input) {
        try {
            const { userId, plan, city, paymentId } = input;
            const normalizedPlan = plan.toUpperCase();
            const normalizedCity = (0, normalize_1.normalizeCity)(city);
            const validPlans = ['FREE', 'GOLD', 'PLATINUM'];
            if (!validPlans.includes(normalizedPlan)) {
                throw new Error('Invalid plan. Must be FREE, GOLD, or PLATINUM');
            }
            // Calculate expiry
            const durationDays = PLAN_DURATION_DAYS[normalizedPlan] || 30;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + durationDays);
            // Composite upsert: tenantId + city
            // Creates new row if tenant has no subscription for this city.
            // Updates existing row if tenant already has a subscription for this city.
            // Never touches subscriptions for other cities.
            const subscription = await this.prisma.tenantSubscription.upsert({
                where: {
                    tenantId_city: {
                        tenantId: userId,
                        city: normalizedCity
                    }
                },
                create: {
                    tenantId: userId,
                    plan: normalizedPlan,
                    city: normalizedCity,
                    expiresAt
                },
                update: {
                    plan: normalizedPlan,
                    expiresAt
                }
            });
            logger_1.logger.info('Subscription upgraded successfully', {
                userId,
                subscriptionId: subscription.id,
                plan: normalizedPlan,
                city: normalizedCity
            });
            return subscription;
        }
        catch (error) {
            logger_1.logger.error('Error upgrading subscription', {
                error: error.message
            });
            throw error;
        }
    }
    /**
     * GET USER SUBSCRIPTIONS — ALL CITIES
     *
     * Returns every subscription row for this tenant (one per city).
     * Uses findMany since tenantId is no longer unique.
     */
    async getUserSubscriptions(userId) {
        try {
            const subscriptions = await this.prisma.tenantSubscription.findMany({
                where: {
                    tenantId: userId
                },
                orderBy: [{ startedAt: 'desc' }, { id: 'asc' }]
            });
            return subscriptions;
        }
        catch (error) {
            logger_1.logger.error('Error fetching user subscriptions', {
                error: error.message
            });
            throw new Error('Failed to fetch subscriptions');
        }
    }
    /**
     * GET SUBSCRIPTION BY CITY — COMPOSITE LOOKUP
     *
     * Direct database-level lookup using @@unique([tenantId, city]).
     * No app-level filtering. No fetching wrong city's data.
     */
    async getSubscriptionByCity(userId, city) {
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
            return subscription;
        }
        catch (error) {
            logger_1.logger.error('Error fetching subscription by city', {
                error: error.message
            });
            throw new Error('Failed to fetch subscription');
        }
    }
    /**
     * GET PRICING FOR CITY
     * Falls back to 'default' pricing if city-specific rows are missing.
     * Only throws if BOTH city and default are missing.
     */
    async getPricing(city) {
        try {
            const normalizedCity = (0, normalize_1.normalizeCity)(city);
            // 1. Try city-specific pricing first
            let pricingRecords = await this.prisma.cityPricing.findMany({
                where: {
                    city: normalizedCity
                },
                orderBy: [{ price: 'asc' }, { id: 'asc' }]
            });
            // 2. Fallback to 'default' pricing if city has no rows
            if (pricingRecords.length === 0 && normalizedCity !== 'default') {
                logger_1.logger.info(`No pricing for city "${normalizedCity}", falling back to default pricing`);
                pricingRecords = await this.prisma.cityPricing.findMany({
                    where: {
                        city: 'default'
                    },
                    orderBy: [{ price: 'asc' }, { id: 'asc' }]
                });
            }
            // 3. Only throw if BOTH city and default are missing
            if (pricingRecords.length === 0) {
                throw new Error(`City pricing not configured for ${normalizedCity} and no default pricing exists`);
            }
            return pricingRecords.map((p) => ({
                plan: p.plan,
                price: p.price,
                features: p.plan === 'PLATINUM' ? ['Unlimited views', 'Contact info', 'Call support'] : p.plan === 'GOLD' ? ['Unlimited views', 'Contact info'] : ['Unlimited property views']
            }));
        }
        catch (error) {
            logger_1.logger.error('Error fetching pricing', {
                error: error.message
            });
            throw error;
        }
    }
    /**
     * GET VIEW COUNT BY CITY
     */
    async getViewCountByCity(userId, city) {
        try {
            const normalizedCity = (0, normalize_1.normalizeCity)(city);
            const count = await this.prisma.propertyView.count({
                where: {
                    tenantId: userId,
                    city: normalizedCity
                }
            });
            return count;
        }
        catch (error) {
            logger_1.logger.error('Error fetching view count', {
                error: error.message
            });
            return 0;
        }
    }
    /**
     * GET UNIQUE PROPERTY COUNT BY CITY
     */
    async getUniquePropertyCountByCity(userId, city) {
        try {
            const normalizedCity = (0, normalize_1.normalizeCity)(city);
            const count = await this.prisma.propertyView.count({
                where: {
                    tenantId: userId,
                    city: normalizedCity
                }
            });
            return count;
        }
        catch (error) {
            logger_1.logger.error('Error fetching unique property count', {
                error: error.message
            });
            return 0;
        }
    }
    /**
     * CHECK IF USER HAS VIEWED PROPERTY
     */
    async hasUserViewedProperty(userId, roomId) {
        try {
            const view = await this.prisma.propertyView.findUnique({
                where: {
                    tenantId_propertyId: {
                        tenantId: userId,
                        propertyId: roomId
                    }
                }
            });
            return !!view;
        }
        catch (error) {
            logger_1.logger.error('Error checking property view', {
                error: error.message
            });
            return false;
        }
    }
    /**
     * RECORD PROPERTY VIEW
     */
    async recordPropertyView(userId, roomId, city) {
        try {
            const normalizedCity = (0, normalize_1.normalizeCity)(city);
            await this.prisma.propertyView.upsert({
                where: {
                    tenantId_propertyId: {
                        tenantId: userId,
                        propertyId: roomId
                    }
                },
                create: {
                    tenantId: userId,
                    propertyId: roomId,
                    city: normalizedCity
                },
                update: {} // No-op on duplicate
            });
            logger_1.logger.info('Property view recorded', {
                userId,
                roomId,
                city: normalizedCity
            });
        }
        catch (error) {
            logger_1.logger.error('Error recording property view', {
                error: error.message
            });
            // Non-critical — don't throw
        }
    }
    /**
     * TRACK PROPERTY VIEW
     */
    async trackPropertyView(userId, propertyId) {
        try {
            let city = 'unknown';
            if (this.roomRepository) {
                const room = await this.roomRepository.findById(propertyId);
                if (room)
                    city = room.city || 'unknown';
            }
            else {
                const room = await this.prisma.room.findUnique({
                    where: {
                        id: propertyId
                    },
                    select: {
                        city: true
                    }
                });
                if (room)
                    city = room.city;
            }
            await this.recordPropertyView(userId, propertyId, city);
            return {
                success: true
            };
        }
        catch (error) {
            logger_1.logger.error('Error tracking property view', {
                error: error.message
            });
            return {
                success: false
            };
        }
    }
    /**
     * GET ALL SUBSCRIPTIONS (admin)
     */
    async getAllSubscriptions() {
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
                    }
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching all subscriptions', {
                error: error.message
            });
            throw new Error('Failed to fetch subscriptions');
        }
    }
    /**
     * ENSURE CITY PRICING EXISTS
     * If a city has no pricing rows, copies from 'default' and inserts them.
     * Safe to call multiple times (upsert-based, idempotent).
     * Call this when a new city is added or pricing is requested for an unknown city.
     */
    async ensureCityPricingExists(city) {
        try {
            const normalizedCity = (0, normalize_1.normalizeCity)(city);
            if (normalizedCity === 'default')
                return; // Never copy default → default
            const existing = await this.prisma.cityPricing.findMany({
                where: {
                    city: normalizedCity
                }
            });
            if (existing.length > 0)
                return; // Already configured
            // Copy from default
            const defaultPricing = await this.prisma.cityPricing.findMany({
                where: {
                    city: 'default'
                }
            });
            if (defaultPricing.length === 0) {
                logger_1.logger.warn(`ensureCityPricingExists: no default pricing to copy for city "${normalizedCity}"`);
                return;
            }
            await this.prisma.cityPricing.createMany({
                data: defaultPricing.map((p) => ({
                    city: normalizedCity,
                    plan: p.plan,
                    price: p.price
                })),
                skipDuplicates: true
            });
            logger_1.logger.info(`Auto-seeded pricing for city "${normalizedCity}" from default`);
        }
        catch (error) {
            logger_1.logger.error('Error in ensureCityPricingExists', {
                error: error.message
            });
            // Non-critical — don't throw, fallback logic in getPricing handles it
        }
    }
}
exports.TenantSubscriptionService = TenantSubscriptionService;
//# sourceMappingURL=TenantSubscriptionService.js.map