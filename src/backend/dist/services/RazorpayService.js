"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../utils/logger");
/**
 * RazorpayService - Handles Razorpay order creation and signature verification
 *
 * PHASE-2: Minimal Razorpay integration for subscription upgrades
 * - Creates Razorpay orders
 * - Verifies payment signatures
 * - NO webhooks (future phase)
 * - NO complex payment state machines
 */
class RazorpayService {
    constructor() {
        this.keyId = process.env.RAZORPAY_KEY_ID || '';
        this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
        // Only initialize Razorpay if keys are provided
        if (this.keyId && this.keySecret) {
            try {
                // Lazy load Razorpay SDK
                const Razorpay = require('razorpay');
                this.razorpay = new Razorpay({
                    key_id: this.keyId,
                    key_secret: this.keySecret
                });
                logger_1.logger.info('Razorpay service initialized');
            }
            catch (error) {
                logger_1.logger.warn('Razorpay SDK not available, payment verification will be disabled');
            }
        }
        else {
            logger_1.logger.warn('Razorpay keys not configured, payment verification will be disabled');
        }
    }
    /**
     * Check if Razorpay is enabled and configured
     */
    isEnabled() {
        return !!(this.razorpay && this.keyId && this.keySecret);
    }
    /**
     * Create a Razorpay order for subscription payment
     *
     * FIXED: Updated signature to match PaymentService usage
     */
    async createOrder(orderInput) {
        if (!this.isEnabled()) {
            throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
        }
        try {
            const order = await this.razorpay.orders.create(orderInput);
            logger_1.logger.info('Razorpay order created', {
                orderId: order.id,
                amount: orderInput.amount
            });
            return order;
        }
        catch (error) {
            logger_1.logger.error('Failed to create Razorpay order', {
                error: error.message,
                amount: orderInput.amount
            });
            throw new Error('Failed to create payment order. Please try again.');
        }
    }
    /**
     * Verify Razorpay payment signature
     *
     * CRITICAL: This is the ONLY way to verify payment authenticity
     * Never trust payment success without signature verification
     *
     * @param input - Razorpay verification input (order_id, payment_id, signature)
     * @returns true if signature is valid, false otherwise
     */
    verifySignature(input) {
        // Hard check: never silently fail if secret is missing
        if (!process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay is not configured: missing RAZORPAY_KEY_SECRET');
        }
        if (!this.isEnabled()) {
            logger_1.logger.error('Razorpay signature verification attempted but Razorpay is not configured');
            throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment.');
        }
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;
        // Generate expected signature
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto_1.default.createHmac('sha256', this.keySecret).update(text).digest('hex');
        const isValid = expectedSignature === razorpay_signature;
        if (isValid) {
            logger_1.logger.info('Razorpay signature verified successfully', {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id
            });
        }
        else {
            logger_1.logger.warn('Razorpay signature verification failed', {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id
            });
        }
        return isValid;
    }
    /**
     * Verify Razorpay payment (alias for verifySignature)
     * FIXED: Added this method to match PaymentService usage
     */
    verifyPayment(input) {
        return this.verifySignature(input);
    }
    /**
     * Get Razorpay key ID for frontend
     */
    getKeyId() {
        return this.keyId;
    }
}
exports.RazorpayService = RazorpayService;
//# sourceMappingURL=RazorpayService.js.map