import { Response, NextFunction } from "express";
import { ReviewService } from "../services/ReviewService";
import { AuthRequest } from "../middleware/auth.middleware";
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
export declare class ReviewController {
    private reviewService;
    constructor(reviewService: ReviewService);
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
    createReview: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
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
    getReviewsForRoom: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * ✅ GET USER'S REVIEW FOR SPECIFIC ROOM
     * GET /reviews/:roomId/user
     *
     * Returns user's review if they've already reviewed, or null
     * Requires authentication
     *
     * Response: { success: true, data: ReviewResponseDTO | null, message: string }
     */
    getUserReviewForRoom: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
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
    getRatingStatsForRoom: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * ✅ ERROR HANDLING
     * Converts service errors to appropriate HTTP responses
     */
    private handleError;
}
//# sourceMappingURL=ReviewController.d.ts.map