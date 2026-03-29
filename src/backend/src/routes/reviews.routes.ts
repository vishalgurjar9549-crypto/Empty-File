import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { ReviewService } from '../services/ReviewService';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const reviewService = new ReviewService();
const reviewController = new ReviewController(reviewService);

/**
 * REVIEW ROUTES
 *
 * 📋 Endpoints:
 * POST   /reviews                 — Create review (auth required)
 * GET    /reviews/:roomId         — Get reviews for room (public)
 * GET    /reviews/:roomId/user    — Get user's review (auth required)
 * GET    /reviews/:roomId/stats   — Get rating stats (public)
 *
 * 🔐 Authorization:
 * - Create review: TENANT only (could be extended to OWNER/AGENT)
 * - Get reviews: Public (any user can view)
 * - Get user review: Auth required (own review only)
 * - Get stats: Public (everyone can see aggregate stats)
 */

// ✅ POST /reviews — Create a new review
router.post(
  '/',
  authMiddleware,
  authorizeRoles(Role.TENANT),
  (req, res, next) => reviewController.createReview(req as any, res, next)
);

// ✅ GET /reviews/:roomId — Get all reviews for a room (paginated)
router.get(
  '/:roomId',
  (req, res, next) => reviewController.getReviewsForRoom(req as any, res, next)
);

// ✅ GET /reviews/:roomId/user — Get user's review for a room (auth required)
router.get(
  '/:roomId/user',
  authMiddleware,
  (req, res, next) => reviewController.getUserReviewForRoom(req as any, res, next)
);

// ✅ GET /reviews/:roomId/stats — Get rating stats for a room
router.get(
  '/:roomId/stats',
  (req, res, next) => reviewController.getRatingStatsForRoom(req as any, res, next)
);

export default router;
