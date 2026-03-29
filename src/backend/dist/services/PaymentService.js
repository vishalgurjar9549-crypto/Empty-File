"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
/**
 * Payment Service
 */
class PaymentService {
    /**
     * 🔑 Dependency Injection Constructor
     * (this is IMPORTANT to avoid runtime bugs)
     */
    constructor(razorpayService, subscriptionService, paymentRepository) {
        this.razorpayService = razorpayService;
        this.subscriptionService = subscriptionService;
        this.paymentRepository = paymentRepository;
    }
    /**
     * Create Razorpay order + DB payment record
     */
    async createOrder(input) {
        try {
            const { userId, amount, plan, city } = input;
            // Create Razorpay order
            const razorpayOrder = await this.razorpayService.createOrder({
                amount,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            });
            // Save payment in DB
            const payment = await this.paymentRepository.create({
                tenantId: userId,
                orderId: razorpayOrder.id,
                amount,
                plan,
                city,
                status: client_1.PaymentStatus.CREATED
            });
            logger_1.logger.info('Payment order created', {
                paymentId: payment.id,
                orderId: razorpayOrder.id
            });
            return {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                paymentId: payment.id
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating payment order', {
                error: error.message,
                stack: error.stack
            });
            throw new Error('Failed to create payment order');
        }
    }
    /**
     * Verify Razorpay payment + upgrade subscription
     */
    async verifyAndProcessPayment(input) {
        try {
            const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;
            // Find payment record
            const payment = await this.paymentRepository.findByOrderId(razorpay_order_id);
            if (!payment) {
                logger_1.logger.error('Payment not found', {
                    orderId: razorpay_order_id
                });
                return {
                    success: false,
                    message: 'Payment not found'
                };
            }
            // Already processed
            if (payment.status === client_1.PaymentStatus.VERIFIED) {
                logger_1.logger.warn('Payment already processed', {
                    paymentId: payment.id
                });
                return {
                    success: false,
                    message: 'Payment already processed'
                };
            }
            // Verify Razorpay signature
            const isValid = this.razorpayService.verifyPayment({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });
            if (!isValid) {
                await this.paymentRepository.update(payment.id, {
                    status: client_1.PaymentStatus.FAILED,
                    razorpayPaymentId: razorpay_payment_id
                });
                logger_1.logger.error('Payment signature verification failed', {
                    paymentId: payment.id
                });
                return {
                    success: false,
                    message: 'Payment verification failed'
                };
            }
            // Mark payment as VERIFIED
            await this.paymentRepository.update(payment.id, {
                status: client_1.PaymentStatus.VERIFIED,
                razorpayPaymentId: razorpay_payment_id
            });
            // Upgrade subscription
            const subscription = await this.subscriptionService.upgradeSubscription({
                userId,
                plan: payment.plan,
                city: payment.city,
                paymentId: payment.id
            });
            logger_1.logger.info('Payment verified & subscription upgraded', {
                paymentId: payment.id,
                subscriptionId: subscription.id
            });
            return {
                success: true,
                message: 'Payment verified successfully',
                data: {
                    payment,
                    subscription
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error verifying payment', {
                error: error.message,
                stack: error.stack
            });
            throw new Error('Failed to verify payment');
        }
    }
    /**
     * Get payment history for tenant
     */
    async getPaymentHistory(userId) {
        try {
            return await this.paymentRepository.findByTenantId(userId);
        }
        catch (error) {
            logger_1.logger.error('Error fetching payment history', {
                error: error.message,
                stack: error.stack
            });
            throw new Error('Failed to fetch payment history');
        }
    }
    /**
     * Admin: get all payments
     */
    async getAllPayments() {
        try {
            return await this.paymentRepository.findAll();
        }
        catch (error) {
            logger_1.logger.error('Error fetching all payments', {
                error: error.message,
                stack: error.stack
            });
            throw new Error('Failed to fetch payments');
        }
    }
    /**
     * Admin: payment stats
     */
    async getPaymentStats() {
        try {
            return await this.paymentRepository.getStats();
        }
        catch (error) {
            logger_1.logger.error('Error fetching payment stats', {
                error: error.message,
                stack: error.stack
            });
            throw new Error('Failed to fetch payment stats');
        }
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=PaymentService.js.map