import { Router } from 'express';
import { AssistedRequestController } from '../controllers/AssistedRequestController';
import { PrismaAssistedRequestRepository } from '../repositories/PrismaAssistedRequestRepository';

const router = Router();

// Initialize repository and controller
const repository = new PrismaAssistedRequestRepository();
const controller = new AssistedRequestController(repository);

/**
 * Assisted Service Routes
 * 
 * POST /api/assisted/create-order
 * POST /api/assisted/verify-payment
 * POST /api/assisted/requests
 * 
 * ✅ KEY: No authentication required for order creation
 * (Payment is secure via Razorpay signature verification)
 */

// 1️⃣ Create Razorpay order for assisted service
// Amount is ALWAYS ₹500, never varies by city
router.post('/create-order', (req, res, next) => controller.createOrder(req, res, next));

// 2️⃣ Verify payment signature
// This MUST be called before creating the request
router.post('/verify-payment', (req, res, next) => controller.verifyPayment(req, res, next));

// 3️⃣ Create assisted request after payment verification
// Saves the request with actual payment details from Razorpay
router.post('/requests', (req, res, next) => controller.createRequest(req, res, next));

export default router;
