"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TenantDashboardController_1 = require("../controllers/TenantDashboardController");
const TenantDashboardService_1 = require("../services/TenantDashboardService");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Dependency injection
const dashboardService = new TenantDashboardService_1.TenantDashboardService();
const controller = new TenantDashboardController_1.TenantDashboardController(dashboardService);
/**
 * GET /tenant/dashboard
 *
 * SECURITY: authMiddleware + authorizeRoles(Role.TENANT)
 * Owners, agents, and admins CANNOT hit this endpoint.
 */
router.get('/dashboard', auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)(client_1.Role.TENANT), (req, res, next) => controller.getDashboard(req, res, next));
exports.default = router;
//# sourceMappingURL=tenant-dashboard.routes.js.map