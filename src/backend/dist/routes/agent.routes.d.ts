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
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=agent.routes.d.ts.map