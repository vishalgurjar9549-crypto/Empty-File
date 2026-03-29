"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AgentController_1 = require("../controllers/AgentController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const agent_middleware_1 = require("../middleware/agent.middleware");
/**
 * Agent Routes - READ-ONLY API Endpoints
 *
 * Base path: /api/agent
 *
 * SECURITY:
 * - All routes require authentication (JWT)
 * - All routes require AGENT role
 * - All routes are GET-only (READ-ONLY)
 *
 * AVAILABLE ENDPOINTS:
 * - GET /api/agent/properties - Fetch assigned properties
 * - GET /api/agent/tenants    - Fetch assigned tenants
 *
 * BLOCKED (NOT IMPLEMENTED):
 * - POST, PUT, PATCH, DELETE methods
 * - Booking access
 * - Payment access
 * - Review status mutations
 */
const router = (0, express_1.Router)();
// ============================================================================
// MIDDLEWARE CHAIN
// ============================================================================
// 1. authMiddleware - Validates JWT, extracts user info
// 2. requireAgent   - Ensures user.role === AGENT
router.use(auth_middleware_1.authMiddleware);
router.use(agent_middleware_1.requireAgent);
// ============================================================================
// READ-ONLY ENDPOINTS
// ============================================================================
/**
 * GET /api/agent/properties
 *
 * Returns properties assigned to the authenticated agent.
 *
 * Response: {
 *   success: boolean,
 *   data: AgentPropertyView[],
 *   meta: { total: number, agentId: string }
 * }
 *
 * Empty array returned if no assignments (not an error).
 */
router.get('/properties', (req, res, next) => AgentController_1.agentController.getAssignedProperties(req, res));
/**
 * GET /api/agent/tenants
 *
 * Returns tenants assigned to the authenticated agent.
 *
 * Response: {
 *   success: boolean,
 *   data: AgentTenantView[],
 *   meta: { total: number, agentId: string }
 * }
 *
 * Empty array returned if no assignments (not an error).
 */
router.get('/tenants', (req, res, next) => AgentController_1.agentController.getAssignedTenants(req, res));
// ============================================================================
// SAFETY: NO MUTATION ROUTES
// ============================================================================
// The following are intentionally NOT implemented:
// - POST   /api/agent/*  (no create)
// - PUT    /api/agent/*  (no update)
// - PATCH  /api/agent/*  (no partial update)
// - DELETE /api/agent/*  (no delete)
//
// Agents are READ-ONLY in this phase.
// Admin mutation logic is OUT OF SCOPE.
// ============================================================================
exports.default = router;
//# sourceMappingURL=agent.routes.js.map