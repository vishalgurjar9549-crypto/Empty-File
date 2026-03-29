"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantDashboardController = void 0;
const logger_1 = require("../utils/logger");
/**
 * TenantDashboardController — Thin controller
 *
 * Single endpoint: GET /tenant/dashboard
 * All business logic lives in TenantDashboardService.
 */
class TenantDashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
        this.getDashboard = this.getDashboard.bind(this);
    }
    /**
     * GET /tenant/dashboard
     * Returns aggregated tenant dashboard data
     */
    async getDashboard(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const data = await this.dashboardService.getDashboard(userId);
            return res.json({
                success: true,
                data
            });
        }
        catch (error) {
            // DIAGNOSTIC: Log the FULL error — not just message
            logger_1.logger.error('TENANT DASHBOARD CRASH — FULL ERROR:', {
                name: error?.name,
                message: error?.message,
                code: error?.code,
                meta: error?.meta,
                stack: error?.stack,
                userId: req.user?.userId
            });
            // Return detailed error in non-production for debugging
            const isDev = process.env.NODE_ENV !== 'production';
            return res.status(500).json({
                success: false,
                message: isDev ? error?.message : 'Failed to fetch dashboard data',
                ...(isDev && {
                    errorName: error?.name,
                    errorCode: error?.code,
                    errorMeta: error?.meta
                })
            });
        }
    }
}
exports.TenantDashboardController = TenantDashboardController;
//# sourceMappingURL=TenantDashboardController.js.map