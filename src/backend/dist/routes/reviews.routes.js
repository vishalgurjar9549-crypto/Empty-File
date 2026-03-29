"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReviewController_1 = require("../controllers/ReviewController");
const ReviewService_1 = require("../services/ReviewService");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const reviewService = new ReviewService_1.ReviewService();
const reviewController = new ReviewController_1.ReviewController(reviewService);
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
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_2.authorizeRoles)(client_1.Role.TENANT), (req, res, next) => reviewController.createReview(req, res, next));
// ✅ GET /reviews/:roomId — Get all reviews for a room (paginated)
router.get('/:roomId', (req, res, next) => reviewController.getReviewsForRoom(req, res, next));
// ✅ GET /reviews/:roomId/user — Get user's review for a room (auth required)
router.get('/:roomId/user', auth_middleware_1.authMiddleware, (req, res, next) => reviewController.getUserReviewForRoom(req, res, next));
// ✅ GET /reviews/:roomId/stats — Get rating stats for a room
router.get('/:roomId/stats', (req, res, next) => reviewController.getRatingStatsForRoom(req, res, next));
exports.default = router;
//# sourceMappingURL=reviews.routes.js.map