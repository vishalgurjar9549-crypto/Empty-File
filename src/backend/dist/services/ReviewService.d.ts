import { PrismaClient } from '@prisma/client';
/**
 * Review Service — Handles review creation, retrieval, and rating calculations
 *
 * Key Design Decisions:
 * 1. One review per user per room (enforced by unique constraint)
 * 2. Rating is recalculated on each new review (no cache inconsistency)
 * 3. Only users who unlocked contact can review (business rule)
 * 4. Reviews are paginated to prevent N+1 queries
 * 5. All validation happens server-side (no client-side trust)
 */
export interface CreateReviewInput {
    roomId: string;
    userId: string;
    rating: number;
    comment?: string;
}
export interface ReviewResponseDTO {
    id: string;
    roomId: string;
    userId: string;
    rating: number;
    comment: string | null;
    userMeta?: {
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}
export interface RoomRatingStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        [key: number]: number;
    };
}
export declare class ReviewService {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    /**
     * ✅ BUSINESS RULE: Check if user can review this property
     *
     * User can review if:
     * 1. User has UNLOCKED the contact (PropertyView exists), OR
     * 2. User has viewed the property (PropertyView interaction tracking)
     *
     * This prevents spam reviews from non-interested users.
     */
    private checkUserCanReview;
    /**
     * ✅ CREATE REVIEW
     *
     * Validations:
     * - Room exists and is active
     * - User exists
     * - Rating is 1-5 only
     * - Comment max 500 chars
     * - User hasn't already reviewed this room
     * - USER HAS UNLOCKED CONTACT (CRITICAL BUSINESS RULE)
     *
     * Side Effects:
     * - Inserts review record
     * - Recalculates room's average rating
     * - Updates reviewsCount on room
     */
    createReview(input: CreateReviewInput): Promise<ReviewResponseDTO>;
    /**
     * ✅ GET REVIEWS FOR ROOM (Paginated + Sortable)
     *
     * Supports sorting:
     * - latest (default): newest reviews first
     * - highest: highest rated reviews first
     * - lowest: lowest rated reviews first
     *
     * Returns reviews with pagination
     * Includes user metadata (name only - no email)
     * For performance, doesn't load entire user object
     */
    getReviewsForRoom(roomId: string, page?: number, limit?: number, sort?: 'latest' | 'highest' | 'lowest'): Promise<{
        reviews: ReviewResponseDTO[];
        total: number;
        page: number;
        pages: number;
    }>;
    /**
     * ✅ GET USER'S REVIEW FOR A ROOM
     *
     * Returns the user's review if it exists, null otherwise
     */
    getUserReviewForRoom(userId: string, roomId: string): Promise<ReviewResponseDTO | null>;
    /**
     * ✅ GET RATING STATS FOR ROOM (Optimized with Aggregates)
     *
     * PERFORMANCE: Uses Prisma aggregate() for O(1) calculation
     * instead of fetching all reviews and calculating in-memory (O(n))
     *
     * Returns:
     * - Average rating
     * - Total reviews
     * - Distribution of ratings (1*, 2*, 3*, 4*, 5*)
     */
    getRatingStatsForRoom(roomId: string): Promise<RoomRatingStats>;
    /**
     * ✅ CHECK IF USER ALREADY REVIEWED
     *
     * Quick boolean check - used by UI to determine if form should be shown
     */
    hasUserReviewedRoom(userId: string, roomId: string): Promise<boolean>;
    /**
     * ✅ DELETE REVIEW (Admin/Owner only)
     *
     * Note: Not exposed in standard API - admin feature
     * Updates room rating after deletion
     */
    deleteReview(reviewId: string): Promise<void>;
    /**
     * ✅ FORMAT REVIEW RESPONSE
     * Converts Prisma model to API response format
     */
    private formatReviewResponse;
    /**
     * ✅ FORMAT REVIEW RESPONSE WITH USER
     * Used when user object is already loaded
     */
    private formatReviewResponseWithUser;
}
//# sourceMappingURL=ReviewService.d.ts.map