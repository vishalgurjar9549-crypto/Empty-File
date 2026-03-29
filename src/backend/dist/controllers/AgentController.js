"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentController = exports.AgentController = void 0;
const AgentService_1 = require("../services/AgentService");
const logger_1 = require("../utils/logger");
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
class AgentController {
    constructor() {
        // Bind methods to preserve 'this' context
        this.getAssignedProperties = this.getAssignedProperties.bind(this);
        this.getAssignedTenants = this.getAssignedTenants.bind(this);
    }
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
    async getAssignedProperties(req, res) {
        try {
            // Extract agent ID from authenticated user (from JWT)
            const agentId = req.user?.userId;
            if (!agentId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            logger_1.logger.info(`[AgentController] GET /properties - Agent: ${agentId}`);
            // Fetch assigned properties (READ-ONLY)
            const properties = await AgentService_1.agentService.getAssignedProperties(agentId);
            // Return success response with data
            return res.status(200).json({
                success: true,
                data: properties,
                meta: {
                    total: properties.length,
                    agentId: agentId
                }
            });
        }
        catch (error) {
            logger_1.logger.error('[AgentController] Error in getAssignedProperties:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch assigned properties'
            });
        }
    }
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
    async getAssignedTenants(req, res) {
        try {
            // Extract agent ID from authenticated user (from JWT)
            const agentId = req.user?.userId;
            if (!agentId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            logger_1.logger.info(`[AgentController] GET /tenants - Agent: ${agentId}`);
            // Fetch assigned tenants (READ-ONLY)
            const tenants = await AgentService_1.agentService.getAssignedTenants(agentId);
            // Return success response with data
            return res.status(200).json({
                success: true,
                data: tenants,
                meta: {
                    total: tenants.length,
                    agentId: agentId
                }
            });
        }
        catch (error) {
            logger_1.logger.error('[AgentController] Error in getAssignedTenants:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch assigned tenants'
            });
        }
    }
}
exports.AgentController = AgentController;
// Export singleton instance
exports.agentController = new AgentController();
//# sourceMappingURL=AgentController.js.map