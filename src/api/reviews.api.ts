import api from './axios';
import { ApiResponse, PaginationMeta } from '../types/api.types';
import { assertValidParam } from '../utils/apiGuard';

/**
 * Review API — Type-safe API calls for review operations
 *
 * Endpoints:
 * - POST /reviews — Create review
 * - GET /reviews/:roomId — Get reviews for room
 * - GET /reviews/:roomId/user — Get user's review
 * - GET /reviews/:roomId/stats — Get rating stats
 */

export interface ReviewDTO {
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

export interface CreateReviewInput {
  roomId: string;
  rating: number;
  comment?: string;
}

export interface ReviewsListResponse {
  reviews: ReviewDTO[];
  total: number;
  page: number;
  pages: number;
}

/**
 * API Error Response type
 */
export interface ReviewApiError {
  success: false;
  message: string;
}

/**
 * API Success Response type
 */
export interface ReviewApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

/**
 * Result type for error handling
 */
export type ReviewApiResult<T> = ReviewApiSuccess<T> | ReviewApiError;

export const reviewsApi = {
  /**
   * ✅ CREATE REVIEW
   * POST /reviews
   *
   * @param data - Review creation input
   * @returns Created review DTO
   *
   * Throws on:
   * - 400: Validation error (rating 1-5, comment length)
   * - 401: Not authenticated
   * - 409: Already reviewed this room
   * - 404: Room not found
   */
  createReview: async (data: CreateReviewInput): Promise<ReviewDTO> => {
    assertValidParam(data.roomId, 'roomId');

    // Validate rating
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Validate comment length
    if (data.comment && data.comment.length > 500) {
      throw new Error('Comment cannot exceed 500 characters');
    }

    const response = await api.post<ReviewApiSuccess<ReviewDTO>>('/reviews', {
      roomId: data.roomId,
      rating: data.rating,
      comment: data.comment?.trim() || undefined
    });

    return response.data.data;
  },

  /**
   * ✅ GET REVIEWS FOR ROOM (Paginated + Sortable)
   * GET /reviews/:roomId?page=1&limit=10&sort=latest|highest|lowest
   *
   * @param roomId - Room ID
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10, max: 100)
   * @param sort - Sort order: 'latest' (default) | 'highest' | 'lowest'
   * @returns List of reviews with pagination
   *
   * Throws on:
   * - 404: Room not found
   */
  getReviewsForRoom: async (
    roomId: string,
    page: number = 1,
    limit: number = 10,
    sort: 'latest' | 'highest' | 'lowest' = 'latest'
  ): Promise<ReviewsListResponse> => {
    assertValidParam(roomId, 'roomId');

    const response = await api.get<ReviewApiSuccess<ReviewsListResponse>>(
      `/reviews/${roomId}`,
      {
        params: {
          page: Math.max(1, page),
          limit: Math.min(100, limit),
          sort
        }
      }
    );

    return response.data.data;
  },

  /**
   * ✅ GET USER'S REVIEW FOR A SPECIFIC ROOM
   * GET /reviews/:roomId/user
   *
   * @param roomId - Room ID
   * @returns User's review or null if not reviewed
   *
   * Throws on:
   * - 401: Not authenticated
   * - 404: Room not found
   */
  getUserReviewForRoom: async (roomId: string): Promise<ReviewDTO | null> => {
    assertValidParam(roomId, 'roomId');

    const response = await api.get<ReviewApiSuccess<ReviewDTO | null>>(
      `/reviews/${roomId}/user`
    );

    return response.data.data;
  },

  /**
   * ✅ GET RATING STATS FOR ROOM
   * GET /reviews/:roomId/stats
   *
   * Returns aggregate statistics:
   * - Average rating (0-5)
   * - Total reviews count
   * - Distribution of ratings (1*, 2*, 3*, 4*, 5*)
   *
   * @param roomId - Room ID
   * @returns Rating statistics
   *
   * Throws on:
   * - 404: Room not found
   */
  getRatingStatsForRoom: async (roomId: string): Promise<RoomRatingStats> => {
    assertValidParam(roomId, 'roomId');

    const response = await api.get<ReviewApiSuccess<RoomRatingStats>>(
      `/reviews/${roomId}/stats`
    );

    return response.data.data;
  }
};

/**
 * Error handler for review API calls
 * Converts axios errors to friendly messages
 */
export function handleReviewApiError(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.status === 401) {
    return 'Please log in to review this property';
  }

  if (error?.response?.status === 409) {
    return 'You have already reviewed this property';
  }

  if (error?.response?.status === 400) {
    return 'Invalid review data. Check your input.';
  }

  if (error?.response?.status === 404) {
    return 'Property not found';
  }

  return error?.message || 'Failed to process review';
}
