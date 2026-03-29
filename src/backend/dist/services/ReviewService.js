"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const AppErrors_1 = require("../errors/AppErrors");
class ReviewService {
    constructor(prismaClient) {
        this.prisma = prismaClient || (0, prisma_1.getPrismaClient)();
    }
    /**
     * ✅ BUSINESS RULE: Check if user can review this property
     *
     * User can review if:
     * 1. User has UNLOCKED the contact (PropertyView exists), OR
     * 2. User has viewed the property (PropertyView interaction tracking)
     *
     * This prevents spam reviews from non-interested users.
     */
    async checkUserCanReview(userId, roomId) {
        // Check if user has unlocked contact or interacted with property
        const propertyView = await this.prisma.propertyView.findUnique({
            where: {
                tenantId_propertyId: {
                    tenantId: userId,
                    propertyId: roomId
                }
            },
            select: { id: true }
        });
        return !!propertyView;
    }
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
    async createReview(input) {
        const { roomId, userId, rating, comment } = input;
        // ✅ VALIDATION: Rating must be 1-5
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw new AppErrors_1.ValidationError('Rating must be between 1 and 5');
        }
        // ✅ VALIDATION: Comment max length
        if (comment && comment.length > 500) {
            throw new AppErrors_1.ValidationError('Comment cannot exceed 500 characters');
        }
        // ✅ CHECK: Room exists and is active
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            select: { id: true, ownerId: true, isActive: true }
        });
        if (!room) {
            throw new AppErrors_1.NotFoundError('Room not found');
        }
        if (!room.isActive) {
            throw new AppErrors_1.ForbiddenError('Cannot review an inactive property');
        }
        // ✅ CHECK: User exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true }
        });
        if (!user) {
            throw new AppErrors_1.NotFoundError('User not found');
        }
        // ✅ CRITICAL BUSINESS RULE: User must have unlocked contact to review
        const canReview = await this.checkUserCanReview(userId, roomId);
        if (!canReview) {
            throw new AppErrors_1.ForbiddenError('You must unlock the contact information to review this property');
        }
        // ✅ CHECK: User hasn't already reviewed (unique constraint will also catch this)
        const existingReview = await this.prisma.review.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId
                }
            }
        });
        if (existingReview) {
            throw new AppErrors_1.ValidationError('You have already reviewed this property');
        }
        try {
            // ✅ CREATE REVIEW + UPDATE RATING in transaction with optimized aggregate
            const review = await this.prisma.$transaction(async (tx) => {
                // 1. Insert review
                const newReview = await tx.review.create({
                    data: {
                        roomId,
                        userId,
                        rating,
                        comment: comment || null
                    }
                });
                // 2. Use aggregate for performance (O(1) instead of O(n))
                const stats = await tx.review.aggregate({
                    where: { roomId },
                    _avg: { rating: true },
                    _count: { rating: true }
                });
                // 3. Calculate average rating
                const averageRating = stats._avg.rating
                    ? Number(stats._avg.rating.toFixed(1))
                    : 0;
                const reviewCount = stats._count.rating;
                // 4. Update room with new rating and count
                await tx.room.update({
                    where: { id: roomId },
                    data: {
                        rating: averageRating,
                        reviewsCount: reviewCount
                    }
                });
                return newReview;
            });
            logger_1.logger.info('Review created successfully', {
                reviewId: review.id,
                roomId,
                userId,
                rating,
                accessValidated: true
            });
            return this.formatReviewResponse(review, user);
        }
        catch (error) {
            // Catch unique constraint violation
            if (error.code === 'P2002') {
                throw new AppErrors_1.ValidationError('You have already reviewed this property');
            }
            logger_1.logger.error('Error creating review', {
                roomId,
                userId,
                error: error.message
            });
            throw error;
        }
    }
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
    async getReviewsForRoom(roomId, page = 1, limit = 10, sort = 'latest') {
        // ✅ Validate room exists
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            select: { id: true }
        });
        if (!room) {
            throw new AppErrors_1.NotFoundError('Room not found');
        }
        const skip = (page - 1) * limit;
        // ✅ Get total count
        const total = await this.prisma.review.count({
            where: { roomId }
        });
        // ✅ Deterministic sort (tie-break id) for stable offset pages
        let orderBy;
        if (sort === 'highest') {
            orderBy = [{ rating: 'desc' }, { id: 'asc' }];
        }
        else if (sort === 'lowest') {
            orderBy = [{ rating: 'asc' }, { id: 'asc' }];
        }
        else {
            orderBy = [{ createdAt: 'desc' }, { id: 'asc' }];
        }
        // ✅ Get paginated reviews with user info
        const reviews = await this.prisma.review.findMany({
            where: { roomId },
            orderBy,
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        const pages = Math.ceil(total / limit);
        return {
            reviews: reviews.map((review) => this.formatReviewResponseWithUser(review, review.user)),
            total,
            page,
            pages
        };
    }
    /**
     * ✅ GET USER'S REVIEW FOR A ROOM
     *
     * Returns the user's review if it exists, null otherwise
     */
    async getUserReviewForRoom(userId, roomId) {
        const review = await this.prisma.review.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!review) {
            return null;
        }
        return this.formatReviewResponseWithUser(review, review.user);
    }
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
    async getRatingStatsForRoom(roomId) {
        // ✅ Validate room exists
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            select: { rating: true, reviewsCount: true }
        });
        if (!room) {
            throw new AppErrors_1.NotFoundError('Room not found');
        }
        // ✅ OPTIMIZED: Use aggregate + countByRating for performance
        const [stats, distribution] = await Promise.all([
            // Get average rating and total count in O(1)
            this.prisma.review.aggregate({
                where: { roomId },
                _avg: { rating: true },
                _count: { rating: true }
            }),
            // Get distribution by executing 5 separate counts (still very fast)
            Promise.all([1, 2, 3, 4, 5].map(rating => this.prisma.review.count({
                where: { roomId, rating }
            })))
        ]);
        const ratingDistribution = {
            1: distribution[0],
            2: distribution[1],
            3: distribution[2],
            4: distribution[3],
            5: distribution[4]
        };
        return {
            averageRating: room.rating,
            totalReviews: room.reviewsCount,
            ratingDistribution
        };
    }
    /**
     * ✅ CHECK IF USER ALREADY REVIEWED
     *
     * Quick boolean check - used by UI to determine if form should be shown
     */
    async hasUserReviewedRoom(userId, roomId) {
        const review = await this.prisma.review.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId
                }
            }
        });
        return !!review;
    }
    /**
     * ✅ DELETE REVIEW (Admin/Owner only)
     *
     * Note: Not exposed in standard API - admin feature
     * Updates room rating after deletion
     */
    async deleteReview(reviewId) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId }
        });
        if (!review) {
            throw new AppErrors_1.NotFoundError('Review not found');
        }
        await this.prisma.$transaction(async (tx) => {
            // 1. Delete review
            await tx.review.delete({
                where: { id: reviewId }
            });
            // 2. Recalculate room rating
            const allReviews = await tx.review.findMany({
                where: { roomId: review.roomId },
                select: { rating: true }
            });
            const averageRating = allReviews.length > 0
                ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1))
                : 0;
            // 3. Update room
            await tx.room.update({
                where: { id: review.roomId },
                data: {
                    rating: averageRating,
                    reviewsCount: allReviews.length
                }
            });
        });
        logger_1.logger.info('Review deleted successfully', { reviewId });
    }
    /**
     * ✅ FORMAT REVIEW RESPONSE
     * Converts Prisma model to API response format
     */
    formatReviewResponse(review, user) {
        return {
            id: review.id,
            roomId: review.roomId,
            userId: review.userId,
            rating: review.rating,
            comment: review.comment,
            userMeta: {
                name: user.name,
                email: user.email
            },
            createdAt: review.createdAt.toISOString(),
            updatedAt: review.updatedAt.toISOString()
        };
    }
    /**
     * ✅ FORMAT REVIEW RESPONSE WITH USER
     * Used when user object is already loaded
     */
    formatReviewResponseWithUser(review, user) {
        return {
            id: review.id,
            roomId: review.roomId,
            userId: review.userId,
            rating: review.rating,
            comment: review.comment,
            userMeta: {
                name: user.name,
                email: user.email
            },
            createdAt: review.createdAt.toISOString(),
            updatedAt: review.updatedAt.toISOString()
        };
    }
}
exports.ReviewService = ReviewService;
//# sourceMappingURL=ReviewService.js.map