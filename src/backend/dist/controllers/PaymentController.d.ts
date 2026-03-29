import { Response, NextFunction } from 'express';
import { TenantSubscriptionService } from '../services/TenantSubscriptionService';
import { PrismaPaymentRepository } from '../repositories/PrismaPaymentRepository';
import { AuthRequest } from '../middleware/auth.middleware';
/**
 * PaymentController — MULTI-CITY ARCHITECTURE
 *
 * Payment verification uses composite upsert: tenantId_city.
 * Each payment activates a subscription for its specific city only.
 * Paying for Kota never overwrites Bangalore subscription.
 */
export declare class PaymentController {
    private subscriptionService;
    private paymentRepository;
    private razorpayService;
    constructor(subscriptionService: TenantSubscriptionService, paymentRepository: PrismaPaymentRepository);
    /**
     * POST /api/payments/initiate
     * Create Razorpay order + DB payment record
     */
    createOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/payments/verify
     * Verify Razorpay signature + activate subscription
     *
     * MULTI-CITY FIX: Uses composite upsert tenantId_city.
     * Payment for Kota creates/updates Kota subscription only.
     * Bangalore subscription remains untouched.
     */
    verifyPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/payments/history
     */
    getPaymentHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=PaymentController.d.ts.map