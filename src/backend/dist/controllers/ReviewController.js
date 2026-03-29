"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const AppErrors_1 = require("../errors/AppErrors");
const logger_1 = require("../utils/logger");
/**
 * Review Controller — Handles HTTP requests for review operations
 *
 * Public Endpoints:
 * - POST /reviews — Create review (requires auth)
 * - GET /reviews/:roomId — Get reviews for room
 * - GET /reviews/:roomId/user — Get user's review for room (auth required)
 * - GET /reviews/:roomId/stats — Get rating stats
 *
 * All responses follow standard format: { success, data, message }
 */
class ReviewController {
    constructor(reviewService) {
        this.reviewService = reviewService;
        /**
         * ✅ CREATE REVIEW
         * POST /reviews
         *
         * Request body:
         * {
         *   roomId: string,
         *   rating: number (1-5),
         *   comment?: string (max 500 chars)
         * }
         *
         * Response: { success: true, data: ReviewResponseDTO, message: string }
         */
        this.createReview = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: "Authentication required",
                    });
                }
                const { roomId, rating, comment } = req.body;
                // ✅ REQUEST VALIDATION
                if (!roomId || !rating) {
                    return res.status(400).json({
                        success: false,
                        message: "roomId and rating are required",
                    });
                }
                // Create review
                const review = await this.reviewService.createReview({
                    roomId,
                    userId,
                    rating,
                    comment: comment?.trim() || undefined,
                });
                logger_1.logger.info("Review created via API", {
                    reviewId: review.id,
                    roomId,
                    userId,
                });
                res.status(201).json({
                    success: true,
                    data: review,
                    message: "Review created successfully",
                });
            }
            catch (error) {
                this.handleError(res, error);
            }
        };
        /**
         * ✅ GET REVIEWS FOR ROOM (Paginated + Sortable)
         * GET /reviews/:roomId?page=1&limit=10&sort=latest|highest|lowest
         *
         * Query params:
         * - page: number (default: 1)
         * - limit: number (default: 10, max: 100)
         * - sort: 'latest' | 'highest' | 'lowest' (default: 'latest')
         *
         * Response: { success: true, data: { reviews, total, page, pages }, message: string }
         */
        this.getReviewsForRoom = async (req, res, next) => {
            try {
                const { roomId } = req.params;
                const page = Math.max(1, parseInt(req.query.page) || 1);
                const limit = Math.min(100, parseInt(req.query.limit) || 10);
                const sort = (req.query.sort || "latest");
                // ✅ Validate sort parameter
                if (!["latest", "highest", "lowest"].includes(sort)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid sort parameter. Must be: latest, highest, or lowest",
                    });
                }
                if (!roomId) {
                    return res.status(400).json({
                        success: false,
                        message: "roomId is required",
                    });
                }
                const result = await this.reviewService.getReviewsForRoom(roomId, page, limit, sort);
                res.status(200).json({
                    success: true,
                    data: result,
                    message: "Reviews retrieved successfully",
                });
            }
            catch (error) {
                this.handleError(res, error);
            }
        };
        /**
         * ✅ GET USER'S REVIEW FOR SPECIFIC ROOM
         * GET /reviews/:roomId/user
         *
         * Returns user's review if they've already reviewed, or null
         * Requires authentication
         *
         * Response: { success: true, data: ReviewResponseDTO | null, message: string }
         */
        this.getUserReviewForRoom = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: "Authentication required",
                    });
                }
                const { roomId } = req.params;
                if (!roomId) {
                    return res.status(400).json({
                        success: false,
                        message: "roomId is required",
                    });
                }
                const review = await this.reviewService.getUserReviewForRoom(userId, roomId);
                res.status(200).json({
                    success: true,
                    data: review,
                    message: review ? "Review found" : "No review found",
                });
            }
            catch (error) {
                this.handleError(res, error);
            }
        };
        /**
         * ✅ GET RATING STATS FOR ROOM
         * GET /reviews/:roomId/stats
         *
         * Returns:
         * - averageRating (float)
         * - totalReviews (int)
         * - ratingDistribution (object with 1-5 star counts)
         *
         * Response: { success: true, data: RoomRatingStats, message: string }
         */
        this.getRatingStatsForRoom = async (req, res, next) => {
            try {
                const { roomId } = req.params;
                if (!roomId) {
                    return res.status(400).json({
                        success: false,
                        message: "roomId is required",
                    });
                }
                const stats = await this.reviewService.getRatingStatsForRoom(roomId);
                res.status(200).json({
                    success: true,
                    data: stats,
                    message: "Rating stats retrieved successfully",
                });
            }
            catch (error) {
                this.handleError(res, error);
            }
        };
        this.createReview = this.createReview.bind(this);
        this.getReviewsForRoom = this.getReviewsForRoom.bind(this);
        this.getUserReviewForRoom = this.getUserReviewForRoom.bind(this);
        this.getRatingStatsForRoom = this.getRatingStatsForRoom.bind(this);
    }
    /**
     * ✅ ERROR HANDLING
     * Converts service errors to appropriate HTTP responses
     */
    handleError(res, error) {
        if (error instanceof AppErrors_1.AppError) {
            logger_1.logger.warn("Expected application error", {
                name: error.name,
                message: error.message,
                statusCode: error.statusCode,
            });
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
            return;
        }
        logger_1.logger.error("Unexpected error in ReviewController", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
        });
    }
}
exports.ReviewController = ReviewController;
//# sourceMappingURL=ReviewController.js.map