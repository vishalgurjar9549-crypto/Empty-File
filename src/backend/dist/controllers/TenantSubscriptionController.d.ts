import { Response } from 'express';
import { TenantSubscriptionService } from '../services/TenantSubscriptionService';
import { PlanLimitService } from '../services/PlanLimitService';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class TenantSubscriptionController {
    private subscriptionService;
    private planLimitService;
    constructor(subscriptionService: TenantSubscriptionService, planLimitService?: PlanLimitService);
    /**
     * GET /current - Get current user subscriptions (all cities)
     */
    getCurrent(req: AuthRequest, res: Response, next: any): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /pricing?city=bangalore - Get pricing for city
     * ✅ PART 3: Implement getPricing method
     */
    getPricing(req: AuthRequest, res: Response, next: any): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /create-order - Create payment order
     * ✅ PART 3: Implement createOrder method
     */
    createOrder(req: AuthRequest, res: Response, next: any): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /upgrade - Upgrade subscription after payment
     * ✅ PART 3: Implement upgrade method
     */
    upgrade(req: AuthRequest, res: Response, next: any): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /verify-payment - Verify Razorpay payment
     * ✅ PART 3: Implement verifyPayment method
     */
    verifyPayment(req: AuthRequest, res: Response, next: any): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /track-view - Track property view (for FREE tier)
     * ✅ PART 3: Implement trackView method
     */
    trackView(req: AuthRequest, res: Response, next: any): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /visibility?city=bangalore&roomId=123 - Check access permissions
     * ✅ FIXED: Uses database-driven PlanLimitService instead of hardcoded 10
     * ✅ FIXED: Enforces subscription expiry (expired → FREE)
     * ✅ FIXED: Now returns per-property isUnlocked flag via hasUserViewedProperty
     */
    getVisibility(req: AuthRequest, res: Response, next: any): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=TenantSubscriptionController.d.ts.map