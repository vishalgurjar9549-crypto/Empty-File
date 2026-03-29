import { Request, Response } from "express";
export declare class AdminController {
    constructor();
    /**
     * GET /api/admin/stats
     * Get dashboard statistics
     */
    getStats(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/admin/users
     * Get all users with optional filters
     */
    getAllUsers(req: Request, res: Response): Promise<void>;
    /**
     * PATCH /api/admin/users/:userId/status
     * Update user status (enable/disable)
     */
    updateUserStatus(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/admin/properties
     * Get all properties with optional filters
     * CRITICAL: Works with existing properties (backward compatible)
     */
    getAllProperties(req: Request, res: Response): Promise<void>;
    /**
     * PATCH /api/admin/properties/:id/approve
     * Approve a property — clears adminFeedback, sets APPROVED + isActive
     */
    approveProperty(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/admin/properties/:id/reject
     * Reject a property
     */
    rejectProperty(req: Request, res: Response): Promise<void>;
    /**
     * PATCH /api/admin/properties/:id/needs-correction
     * Request corrections on a property
     */
    requestCorrection(req: Request, res: Response): Promise<void>;
    /**
     * PATCH /api/admin/properties/:id/suspend
     * Suspend a property
     */
    suspendProperty(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/admin/activity
     * Get recent activity log
     */
    getActivity(req: Request, res: Response): Promise<void>;
    getTenants(req: Request, res: Response): Promise<void>;
    getAgents(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AdminController.d.ts.map