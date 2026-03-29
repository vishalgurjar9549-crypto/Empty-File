import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
/**
 * AdminAssignmentController - ADMIN-ONLY Assignment Management
 *
 * CRITICAL SAFETY RULES:
 * ✅ All routes require ADMIN role (enforced at route level)
 * ✅ Soft delete only (no hard deletes)
 * ✅ Full audit trail via assignedBy
 * ❌ NO booking access
 * ❌ NO payment access
 *
 * ENDPOINTS:
 * - POST   /api/admin/agents/:agentId/properties/:propertyId  (assign property)
 * - DELETE /api/admin/agents/:agentId/properties/:propertyId  (unassign property)
 * - POST   /api/admin/agents/:agentId/tenants/:tenantId       (assign tenant)
 * - DELETE /api/admin/agents/:agentId/tenants/:tenantId       (unassign tenant)
 * - GET    /api/admin/assignments/properties                   (list property assignments)
 * - GET    /api/admin/assignments/tenants                      (list tenant assignments)
 */
export declare class AdminAssignmentController {
    constructor();
    /**
     * POST /api/admin/agents/:agentId/properties/:propertyId
     *
     * Assign a property to an agent.
     *
     * Path Params:
     * - agentId: User ID (must be AGENT role)
     * - propertyId: Room ID
     *
     * Body (optional):
     * - notes: Assignment notes
     *
     * Response:
     * - 200/201: Assignment created/reactivated
     * - 400: Validation error (wrong role)
     * - 404: Agent or property not found
     * - 500: Server error
     */
    assignPropertyToAgent(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE /api/admin/agents/:agentId/properties/:propertyId
     *
     * Unassign a property from an agent (soft delete).
     *
     * Path Params:
     * - agentId: User ID
     * - propertyId: Room ID
     *
     * Response:
     * - 200: Assignment deactivated
     * - 404: Assignment not found
     * - 500: Server error
     */
    unassignPropertyFromAgent(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/admin/agents/:agentId/tenants/:tenantId
     *
     * Assign a tenant to an agent.
     *
     * Path Params:
     * - agentId: User ID (must be AGENT role)
     * - tenantId: User ID (must be TENANT role)
     *
     * Body (optional):
     * - reason: Reason for assignment
     *
     * Response:
     * - 200/201: Assignment created/reactivated
     * - 400: Validation error (wrong role)
     * - 404: Agent or tenant not found
     * - 500: Server error
     */
    assignTenantToAgent(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE /api/admin/agents/:agentId/tenants/:tenantId
     *
     * Unassign a tenant from an agent (soft delete).
     *
     * Path Params:
     * - agentId: User ID
     * - tenantId: User ID
     *
     * Response:
     * - 200: Assignment deactivated
     * - 404: Assignment not found
     * - 500: Server error
     */
    unassignTenantFromAgent(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/admin/assignments/properties
     *
     * List all property assignments with optional filters.
     *
     * Query Params:
     * - agentId: Filter by agent
     * - propertyId: Filter by property
     * - isActive: Filter by active status (true/false)
     */
    getPropertyAssignments(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/admin/assignments/tenants
     *
     * List all tenant assignments with optional filters.
     *
     * Query Params:
     * - agentId: Filter by agent
     * - tenantId: Filter by tenant
     * - isActive: Filter by active status (true/false)
     */
    getTenantAssignments(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    private handleError;
}
export declare const adminAssignmentController: AdminAssignmentController;
//# sourceMappingURL=AdminAssignmentController.d.ts.map