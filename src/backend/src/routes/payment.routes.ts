import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { TenantSubscriptionService } from '../services/TenantSubscriptionService';
import { authMiddleware } from '../middleware/auth.middleware';
import { paymentVerifyLimiter } from '../middleware/productionSafety.middleware';
import { tenantSubscriptionRepository, propertyViewRepository, paymentRepository, roomRepository } from '../repositories';
const router = Router();

/**
 * FIXED: Pass roomRepository to TenantSubscriptionService to eliminate runtime require()
 */
const subscriptionService = new TenantSubscriptionService(tenantSubscriptionRepository, propertyViewRepository, roomRepository);
const paymentController = new PaymentController(subscriptionService, paymentRepository);

// Create Razorpay order
router.post('/initiate', authMiddleware, (req, res, next) => paymentController.createOrder(req as any, res, next));

// Verify payment + activate subscription (🔒 Rate limited: 2 attempts/minute per user)
router.post('/verify', authMiddleware, paymentVerifyLimiter, (req, res, next) => paymentController.verifyPayment(req as any, res, next));

// Payment history
router.get('/history', authMiddleware, (req, res, next) => paymentController.getPaymentHistory(req as any, res, next));
export default router;