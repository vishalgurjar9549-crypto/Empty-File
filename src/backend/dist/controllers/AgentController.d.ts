import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
/**
 * AgentController - READ-ONLY Controller for Agent Role
 *
 * CRITICAL SAFETY RULES:
 * ❌ NO POST/PUT/PATCH/DELETE endpoints
 * ❌ NO mutation methods
 * ❌ NO access to bookings
 * ❌ NO access to payments
 * ✅ GET endpoints only
 * ✅ Returns empty arrays on no data (no errors)
 *
 * All endpoints require:
 * 1. Authentication (authMiddleware)
 * 2. Agent role (requireAgent middleware)
 */
export declare class AgentController {
    constructor();
    /**
     * GET /api/agent/properties
     *
     * Fetch all properties assigned to the authenticated agent.
     *
     * Response:
     * - 200: { success: true, data: AgentPropertyView[], meta: { total, agentId } }
     * - 401: Authentication required
     * - 403: Agent access required
     * - 500: Server error
     *
     * SECURITY:
     * - Agent ID is extracted from JWT token (cannot be spoofed)
     * - Returns empty array if no assignments (not an error)
     * - No booking or payment data included
     */
    getAssignedProperties(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/agent/tenants
     *
     * Fetch all tenants assigned to the authenticated agent.
     *
     * Response:
     * - 200: { success: true, data: AgentTenantView[], meta: { total, agentId } }
     * - 401: Authentication required
     * - 403: Agent access required
     * - 500: Server error
     *
     * SECURITY:
     * - Agent ID is extracted from JWT token (cannot be spoofed)
     * - Returns empty array if no assignments (not an error)
     * - No booking, payment, or subscription data included
     */
    getAssignedTenants(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const agentController: AgentController;
//# sourceMappingURL=AgentController.d.ts.map