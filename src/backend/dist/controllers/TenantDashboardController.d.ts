import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TenantDashboardService } from '../services/TenantDashboardService';
/**
 * TenantDashboardController — Thin controller
 *
 * Single endpoint: GET /tenant/dashboard
 * All business logic lives in TenantDashboardService.
 */
export declare class TenantDashboardController {
    private dashboardService;
    constructor(dashboardService: TenantDashboardService);
    /**
     * GET /tenant/dashboard
     * Returns aggregated tenant dashboard data
     */
    getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=TenantDashboardController.d.ts.map