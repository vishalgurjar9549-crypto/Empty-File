"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const RazorpayService_1 = require("../services/RazorpayService");
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
const prisma_1 = require("../utils/prisma");
const normalize_1 = require("../utils/normalize");
/**
 * PaymentController — MULTI-CITY ARCHITECTURE
 *
 * Payment verification uses composite upsert: tenantId_city.
 * Each payment activates a subscription for its specific city only.
 * Paying for Kota never overwrites Bangalore subscription.
 */
class PaymentController {
    constructor(subscriptionService, paymentRepository) {
        this.subscriptionService = subscriptionService;
        this.paymentRepository = paymentRepository;
        this.razorpayService = new RazorpayService_1.RazorpayService();
        // Bind all methods
        this.createOrder = this.createOrder.bind(this);
        this.verifyPayment = this.verifyPayment.bind(this);
        this.getPaymentHistory = this.getPaymentHistory.bind(this);
    }
    /**
     * POST /api/payments/initiate
     * Create Razorpay order + DB payment record
     */
    async createOrder(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const { plan, city, amount } = req.body;
            if (!plan || !city) {
                return res.status(400).json({
                    success: false,
                    message: 'Plan and city are required'
                });
            }
            // Use subscription service to create order (handles pricing lookup + Razorpay)
            const orderData = await this.subscriptionService.createOrder({
                plan,
                city,
                amount: amount || 0
            });
            // Save payment record in DB
            const payment = await this.paymentRepository.create({
                tenantId: userId,
                orderId: orderData.orderId,
                amount: typeof orderData.amount === 'number' ? orderData.amount : parseInt(orderData.amount, 10),
                plan,
                city,
                status: client_1.PaymentStatus.CREATED
            });
            logger_1.logger.info('Payment order created', {
                paymentId: payment.id,
                orderId: orderData.orderId
            });
            return res.status(201).json({
                success: true,
                data: {
                    orderId: orderData.orderId,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    paymentId: payment.id
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating payment order', {
                error: error.message
            });
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to create payment order'
            });
        }
    }
    /**
     * POST /api/payments/verify
     * Verify Razorpay signature + activate subscription
     *
     * MULTI-CITY FIX: Uses composite upsert tenantId_city.
     * Payment for Kota creates/updates Kota subscription only.
     * Bangalore subscription remains untouched.
     */
    async verifyPayment(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing payment verification parameters'
                });
            }
            // Step 1: Find payment record
            const payment = await this.paymentRepository.findByOrderId(razorpay_order_id);
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }
            // FIX 4: Verify authenticated user owns this payment
            if (payment.tenantId !== userId) {
                logger_1.logger.warn('Payment ownership mismatch', {
                    paymentId: payment.id,
                    paymentTenantId: payment.tenantId,
                    requestUserId: userId
                });
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: you do not own this payment'
                });
            }
            // Step 2: Already verified — idempotent response
            if (payment.status === client_1.PaymentStatus.VERIFIED) {
                logger_1.logger.warn('Payment already verified', {
                    paymentId: payment.id
                });
                return res.json({
                    success: true,
                    message: 'Payment already verified',
                    data: {
                        payment
                    }
                });
            }
            // Step 3: Verify Razorpay signature
            const isValid = this.razorpayService.verifyPayment({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });
            if (!isValid) {
                await this.paymentRepository.update(payment.id, {
                    status: client_1.PaymentStatus.FAILED
                });
                logger_1.logger.error('Payment signature verification failed', {
                    paymentId: payment.id
                });
                return res.status(400).json({
                    success: false,
                    message: 'Payment verification failed'
                });
            }
            // Step 4: Mark as VERIFIED + upgrade subscription ATOMICALLY
            const prisma = (0, prisma_1.getPrismaClient)();
            const result = await prisma.$transaction(async (tx) => {
                // Re-read payment inside transaction with lock
                const lockedPayment = await tx.payment.findUnique({
                    where: {
                        id: payment.id
                    }
                });
                if (!lockedPayment || lockedPayment.status === 'VERIFIED') {
                    return {
                        alreadyProcessed: true,
                        payment: lockedPayment,
                        subscription: null
                    };
                }
                // Mark payment as VERIFIED
                const updatedPayment = await tx.payment.update({
                    where: {
                        id: payment.id
                    },
                    data: {
                        status: client_1.PaymentStatus.VERIFIED,
                        razorpayPaymentId: razorpay_payment_id,
                        utr: razorpay_payment_id,
                        verifiedAt: new Date()
                    }
                });
                // Upgrade subscription INSIDE transaction — COMPOSITE UPSERT
                const PLAN_DURATION_DAYS = {
                    FREE: 0,
                    GOLD: 30,
                    PLATINUM: 30
                };
                const normalizedPlan = payment.plan.toUpperCase();
                const normalizedCity = (0, normalize_1.normalizeCity)(payment.city);
                const durationDays = PLAN_DURATION_DAYS[normalizedPlan] || 30;
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + durationDays);
                // MULTI-CITY: Upsert by tenantId + city composite key
                // This creates a NEW subscription row for this city if none exists,
                // or updates the existing one for this city.
                // Subscriptions for OTHER cities are never touched.
                const subscription = await tx.tenantSubscription.upsert({
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
                return {
                    alreadyProcessed: false,
                    payment: updatedPayment,
                    subscription
                };
            }, {
                isolationLevel: 'Serializable',
                timeout: 10000
            });
            if (result.alreadyProcessed) {
                return res.json({
                    success: true,
                    message: 'Payment already verified',
                    data: {
                        payment: result.payment
                    }
                });
            }
            logger_1.logger.info('Payment verified + subscription upgraded atomically', {
                paymentId: payment.id,
                subscriptionId: result.subscription?.id
            });
            return res.json({
                success: true,
                message: 'Payment verified successfully',
                data: {
                    payment: result.payment,
                    subscription: result.subscription
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error verifying payment', {
                error: error.message
            });
            return res.status(500).json({
                success: false,
                message: 'Failed to verify payment'
            });
        }
    }
    /**
     * GET /api/payments/history
     */
    async getPaymentHistory(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const payments = await this.paymentRepository.findByTenantId(userId);
            return res.json({
                success: true,
                data: payments
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching payment history', {
                error: error.message
            });
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch payment history'
            });
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=PaymentController.js.map