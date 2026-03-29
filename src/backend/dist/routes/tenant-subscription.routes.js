"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TenantSubscriptionController_1 = require("../controllers/TenantSubscriptionController");
const TenantSubscriptionService_1 = require("../services/TenantSubscriptionService");
const PlanLimitService_1 = require("../services/PlanLimitService");
const repositories_1 = require("../repositories");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Initialize services with singleton repository instances
const subscriptionService = new TenantSubscriptionService_1.TenantSubscriptionService(repositories_1.tenantSubscriptionRepository, repositories_1.propertyViewRepository, repositories_1.roomRepository);
const planLimitService = new PlanLimitService_1.PlanLimitService();
// Initialize controller with both services
const controller = new TenantSubscriptionController_1.TenantSubscriptionController(subscriptionService, planLimitService);
/**
 * ROUTES
 */
// GET /current - Get current subscription status
router.get('/current', auth_middleware_1.authMiddleware, (req, res, next) => controller.getCurrent(req, res, next));
// GET /pricing?city=Jaipur - Get pricing for city
router.get('/pricing', (req, res, next) => controller.getPricing(req, res, next));
// POST /create-order - Create payment order
router.post('/create-order', auth_middleware_1.authMiddleware, (req, res, next) => controller.createOrder(req, res, next));
// POST /upgrade - Upgrade subscription (after payment)
router.post('/upgrade', auth_middleware_1.authMiddleware, (req, res, next) => controller.upgrade(req, res, next));
// POST /verify-payment - Verify payment
router.post('/verify-payment', auth_middleware_1.authMiddleware, (req, res, next) => controller.verifyPayment(req, res, next));
// POST /track-view - Track property view (for FREE tier)
router.post('/track-view', auth_middleware_1.authMiddleware, (req, res, next) => controller.trackView(req, res, next));
// GET /visibility?city=Jaipur&roomId=123 - Check access permissions
router.get('/visibility', auth_middleware_1.authMiddleware, (req, res, next) => controller.getVisibility(req, res, next));
exports.default = router;
//# sourceMappingURL=tenant-subscription.routes.js.map