import { RazorpayService } from './RazorpayService';
import { TenantSubscriptionService } from './TenantSubscriptionService';
import { PrismaPaymentRepository } from '../repositories/PrismaPaymentRepository';
/**
 * Input DTOs
 */
interface CreateOrderInput {
    userId: string;
    amount: number;
    plan: string;
    city: string;
}
interface VerifyPaymentInput {
    userId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}
/**
 * Payment Service
 */
export declare class PaymentService {
    private razorpayService;
    private subscriptionService;
    private paymentRepository;
    /**
     * 🔑 Dependency Injection Constructor
     * (this is IMPORTANT to avoid runtime bugs)
     */
    constructor(razorpayService: RazorpayService, subscriptionService: TenantSubscriptionService, paymentRepository: PrismaPaymentRepository);
    /**
     * Create Razorpay order + DB payment record
     */
    createOrder(input: CreateOrderInput): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        paymentId: string;
    }>;
    /**
     * Verify Razorpay payment + upgrade subscription
     */
    verifyAndProcessPayment(input: VerifyPaymentInput): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            payment: {
                city: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
                status: import(".prisma/client").$Enums.PaymentStatus;
                plan: string;
                amount: number;
                orderId: string;
                utr: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                tenantId: string;
                verifiedAt: Date | null;
                subscriptionId: string | null;
                razorpayPaymentId: string | null;
            };
            subscription: {
                city: string;
                id: string;
                expiresAt: Date | null;
                plan: string;
                tenantId: string;
                startedAt: Date;
            };
        };
    }>;
    /**
     * Get payment history for tenant
     */
    getPaymentHistory(userId: string): Promise<{
        city: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        status: import(".prisma/client").$Enums.PaymentStatus;
        plan: string;
        amount: number;
        orderId: string;
        utr: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        verifiedAt: Date | null;
        subscriptionId: string | null;
        razorpayPaymentId: string | null;
    }[]>;
    /**
     * Admin: get all payments
     */
    getAllPayments(): Promise<{
        city: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        status: import(".prisma/client").$Enums.PaymentStatus;
        plan: string;
        amount: number;
        orderId: string;
        utr: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        verifiedAt: Date | null;
        subscriptionId: string | null;
        razorpayPaymentId: string | null;
    }[]>;
    /**
     * Admin: payment stats
     */
    getPaymentStats(): Promise<any>;
}
export {};
//# sourceMappingURL=PaymentService.d.ts.map