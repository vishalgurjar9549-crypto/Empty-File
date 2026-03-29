"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentController_1 = require("../controllers/PaymentController");
const TenantSubscriptionService_1 = require("../services/TenantSubscriptionService");
const auth_middleware_1 = require("../middleware/auth.middleware");
const repositories_1 = require("../repositories");
const router = (0, express_1.Router)();
/**
 * FIXED: Pass roomRepository to TenantSubscriptionService to eliminate runtime require()
 */
const subscriptionService = new TenantSubscriptionService_1.TenantSubscriptionService(repositories_1.tenantSubscriptionRepository, repositories_1.propertyViewRepository, repositories_1.roomRepository);
const paymentController = new PaymentController_1.PaymentController(subscriptionService, repositories_1.paymentRepository);
// Create Razorpay order
router.post('/initiate', auth_middleware_1.authMiddleware, (req, res, next) => paymentController.createOrder(req, res, next));
// Verify payment + activate subscription
router.post('/verify', auth_middleware_1.authMiddleware, (req, res, next) => paymentController.verifyPayment(req, res, next));
// Payment history
router.get('/history', auth_middleware_1.authMiddleware, (req, res, next) => paymentController.getPaymentHistory(req, res, next));
exports.default = router;
//# sourceMappingURL=payment.routes.js.map