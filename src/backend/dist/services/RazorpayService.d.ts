interface RazorpayOrderInput {
    amount: number;
    currency: string;
    receipt: string;
}
interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
}
interface RazorpayVerificationInput {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}
/**
 * RazorpayService - Handles Razorpay order creation and signature verification
 *
 * PHASE-2: Minimal Razorpay integration for subscription upgrades
 * - Creates Razorpay orders
 * - Verifies payment signatures
 * - NO webhooks (future phase)
 * - NO complex payment state machines
 */
export declare class RazorpayService {
    private razorpay;
    private keyId;
    private keySecret;
    constructor();
    /**
     * Check if Razorpay is enabled and configured
     */
    isEnabled(): boolean;
    /**
     * Create a Razorpay order for subscription payment
     *
     * FIXED: Updated signature to match PaymentService usage
     */
    createOrder(orderInput: RazorpayOrderInput): Promise<RazorpayOrder>;
    /**
     * Verify Razorpay payment signature
     *
     * CRITICAL: This is the ONLY way to verify payment authenticity
     * Never trust payment success without signature verification
     *
     * @param input - Razorpay verification input (order_id, payment_id, signature)
     * @returns true if signature is valid, false otherwise
     */
    verifySignature(input: RazorpayVerificationInput): boolean;
    /**
     * Verify Razorpay payment (alias for verifySignature)
     * FIXED: Added this method to match PaymentService usage
     */
    verifyPayment(input: RazorpayVerificationInput): boolean;
    /**
     * Get Razorpay key ID for frontend
     */
    getKeyId(): string;
}
export {};
//# sourceMappingURL=RazorpayService.d.ts.map