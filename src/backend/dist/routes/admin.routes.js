"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const AdminAssignmentController_1 = require("../controllers/AdminAssignmentController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const adminController = new AdminController_1.AdminController();
// All admin routes require authentication and admin role
router.use(auth_middleware_1.authMiddleware);
router.use(auth_middleware_1.requireAdmin);
// ============================================================================
// DASHBOARD
// ============================================================================
// Dashboard Stats
router.get('/stats', (req, res, next) => adminController.getStats(req, res));
// Activity Log
router.get('/activity', (req, res, next) => adminController.getActivity(req, res));
// ============================================================================
// USER MANAGEMENT
// ============================================================================
// User Management
router.get('/users', (req, res, next) => adminController.getAllUsers(req, res));
router.patch('/users/:userId/status', (req, res, next) => adminController.updateUserStatus(req, res));
router.get('/tenants', (req, res, next) => adminController.getTenants(req, res));
router.get('/agents', (req, res, next) => adminController.getAgents(req, res));
// ============================================================================
// PROPERTY MANAGEMENT
// ============================================================================
// Property Management
router.get('/properties', (req, res, next) => adminController.getAllProperties(req, res));
router.patch('/properties/:id/approve', (req, res, next) => adminController.approveProperty(req, res));
router.patch('/properties/:id/reject', (req, res, next) => adminController.rejectProperty(req, res));
router.patch('/properties/:id/needs-correction', (req, res, next) => adminController.requestCorrection(req, res));
router.patch('/properties/:id/suspend', (req, res, next) => adminController.suspendProperty(req, res));
// ============================================================================
// AGENT ASSIGNMENT MANAGEMENT (NEW)
// ============================================================================
// Property Assignments
router.post('/agents/:agentId/properties/:propertyId', (req, res, next) => AdminAssignmentController_1.adminAssignmentController.assignPropertyToAgent(req, res));
router.delete('/agents/:agentId/properties/:propertyId', (req, res, next) => AdminAssignmentController_1.adminAssignmentController.unassignPropertyFromAgent(req, res));
// Tenant Assignments
router.post('/agents/:agentId/tenants/:tenantId', (req, res, next) => AdminAssignmentController_1.adminAssignmentController.assignTenantToAgent(req, res));
router.delete('/agents/:agentId/tenants/:tenantId', (req, res, next) => AdminAssignmentController_1.adminAssignmentController.unassignTenantFromAgent(req, res));
// Assignment Lists (for admin dashboard)
router.get('/assignments/properties', (req, res, next) => AdminAssignmentController_1.adminAssignmentController.getPropertyAssignments(req, res));
router.get('/assignments/tenants', (req, res, next) => AdminAssignmentController_1.adminAssignmentController.getTenantAssignments(req, res));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map