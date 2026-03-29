import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsApi, ReviewDTO, RoomRatingStats, ReviewApiError, handleReviewApiError } from '../../api/reviews.api';
import { showToast } from './ui.slice';

/**
 * Review Redux Slice
 *
 * State management for reviews:
 * - fetchReviewsForRoom: Get paginated reviews for a room
 * - getReviewStats: Get rating statistics
 * - getUserReview: Fetch user's review for a room
 * - createReview: Submit a new review
 *
 * ✅ Optimizations:
 * - Only fetch reviews once per room
 * - Cache reviews and stats in Redux
 * - Prevent N+1 API calls
 * - Memoize selectors
 * - No unnecessary re-renders
 */

export interface ReviewsState {
  // Reviews storage: roomId -> reviews data
  reviewsByRoom: {
    [roomId: string]: {
      reviews: ReviewDTO[];
      total: number;
      page: number;
      pages: number;
      loading: boolean;
      error: string | null;
      loaded: boolean;
    };
  };

  // Rating stats: roomId -> stats
  statsByRoom: {
    [roomId: string]: {
      stats: RoomRatingStats | null;
      loading: boolean;
      error: string | null;
      loaded: boolean;
    };
  };

  // User's reviews: roomId -> review
  userReviewsByRoom: {
    [roomId: string]: {
      review: ReviewDTO | null;
      loading: boolean;
      error: string | null;
    };
  };

  // Creating review state
  creating: boolean;
  createError: string | null;

  // Overall loading states
  globalLoading: boolean;
}

const initialState: ReviewsState = {
  reviewsByRoom: {},
  statsByRoom: {},
  userReviewsByRoom: {},
  creating: false,
  createError: null,
  globalLoading: false
};

/**
 * ✅ ASYNC THUNK: Fetch reviews for room (paginated + sortable)
 */
export const fetchReviewsForRoom = createAsyncThunk(
  'reviews/fetchReviewsForRoom',
  async (
    { roomId, page = 1, limit = 10, sort = 'latest' }: { roomId: string; page?: number; limit?: number; sort?: 'latest' | 'highest' | 'lowest' },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const data = await reviewsApi.getReviewsForRoom(roomId, page, limit, sort);
      return { roomId, ...data };
    } catch (error: any) {
      const message = handleReviewApiError(error);
      dispatch(showToast({
        message,
        type: 'error'
      }));
      return rejectWithValue(message);
    }
  }
);

/**
 * ✅ ASYNC THUNK: Get rating stats for room
 */
export const fetchRatingStats = createAsyncThunk(
  'reviews/fetchRatingStats',
  async (roomId: string, { rejectWithValue, dispatch }) => {
    try {
      const stats = await reviewsApi.getRatingStatsForRoom(roomId);
      return { roomId, stats };
    } catch (error: any) {
      const message = handleReviewApiError(error);
      return rejectWithValue(message);
    }
  }
);

/**
 * ✅ ASYNC THUNK: Get user's review for room
 */
export const fetchUserReview = createAsyncThunk(
  'reviews/fetchUserReview',
  async (roomId: string, { rejectWithValue, dispatch }) => {
    try {
      const review = await reviewsApi.getUserReviewForRoom(roomId);
      return { roomId, review };
    } catch (error: any) {
      const message = handleReviewApiError(error);
      // Don't show error toast for 404 (no review found)
      if (!message.includes('not found')) {
        dispatch(showToast({
          message,
          type: 'error'
        }));
      }
      return rejectWithValue(message);
    }
  }
);

/**
 * ✅ ASYNC THUNK: Create review
 */
export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (
    { roomId, rating, comment }: { roomId: string; rating: number; comment?: string },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const review = await reviewsApi.createReview({ roomId, rating, comment });

      dispatch(showToast({
        message: '✅ Thanks for your review!',
        type: 'success'
      }));

      return { review, roomId };
    } catch (error: any) {
      const message = handleReviewApiError(error);
      dispatch(showToast({
        message,
        type: 'error'
      }));
      return rejectWithValue(message);
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    // Clear reviews for a specific room
    clearReviewsForRoom: (state, action) => {
      const roomId = action.payload;
      delete state.reviewsByRoom[roomId];
    },

    // Clear all reviews data
    clearAllReviews: (state) => {
      state.reviewsByRoom = {};
      state.statsByRoom = {};
      state.userReviewsByRoom = {};
      state.creating = false;
      state.createError = null;
    }
  },
  extraReducers: (builder) => {
    // ✅ Fetch Reviews For Room
    builder
      .addCase(fetchReviewsForRoom.pending, (state, action) => {
        const roomId = action.meta.arg.roomId;
        state.reviewsByRoom[roomId] = state.reviewsByRoom[roomId] || {
          reviews: [],
          total: 0,
          page: 1,
          pages: 0,
          loading: false,
          error: null,
          loaded: false
        };
        state.reviewsByRoom[roomId].loading = true;
        state.reviewsByRoom[roomId].error = null;
      })
      .addCase(fetchReviewsForRoom.fulfilled, (state, action) => {
        const { roomId, reviews, total, page, pages } = action.payload;
        state.reviewsByRoom[roomId] = {
          reviews,
          total,
          page,
          pages,
          loading: false,
          error: null,
          loaded: true
        };
      })
      .addCase(fetchReviewsForRoom.rejected, (state, action) => {
        const roomId = action.meta.arg.roomId;
        state.reviewsByRoom[roomId] = state.reviewsByRoom[roomId] || {
          reviews: [],
          total: 0,
          page: 1,
          pages: 0,
          loading: false,
          error: null,
          loaded: false
        };
        state.reviewsByRoom[roomId].loading = false;
        state.reviewsByRoom[roomId].error = action.payload as string;
      });

    // ✅ Fetch Rating Stats
    builder
      .addCase(fetchRatingStats.pending, (state, action) => {
        const roomId = action.meta.arg;
        state.statsByRoom[roomId] = state.statsByRoom[roomId] || {
          stats: null,
          loading: false,
          error: null,
          loaded: false
        };
        state.statsByRoom[roomId].loading = true;
        state.statsByRoom[roomId].error = null;
      })
      .addCase(fetchRatingStats.fulfilled, (state, action) => {
        const { roomId, stats } = action.payload;
        state.statsByRoom[roomId] = {
          stats,
          loading: false,
          error: null,
          loaded: true
        };
      })
      .addCase(fetchRatingStats.rejected, (state, action) => {
        const roomId = action.meta.arg;
        state.statsByRoom[roomId] = state.statsByRoom[roomId] || {
          stats: null,
          loading: false,
          error: null,
          loaded: false
        };
        state.statsByRoom[roomId].loading = false;
        state.statsByRoom[roomId].error = action.payload as string;
      });

    // ✅ Fetch User Review
    builder
      .addCase(fetchUserReview.pending, (state, action) => {
        const roomId = action.meta.arg;
        state.userReviewsByRoom[roomId] = state.userReviewsByRoom[roomId] || {
          review: null,
          loading: false,
          error: null
        };
        state.userReviewsByRoom[roomId].loading = true;
        state.userReviewsByRoom[roomId].error = null;
      })
      .addCase(fetchUserReview.fulfilled, (state, action) => {
        const { roomId, review } = action.payload;
        state.userReviewsByRoom[roomId] = {
          review,
          loading: false,
          error: null
        };
      })
      .addCase(fetchUserReview.rejected, (state, action) => {
        const roomId = action.meta.arg;
        state.userReviewsByRoom[roomId] = state.userReviewsByRoom[roomId] || {
          review: null,
          loading: false,
          error: null
        };
        state.userReviewsByRoom[roomId].loading = false;
        state.userReviewsByRoom[roomId].error = action.payload as string;
      });

    // ✅ Create Review
    builder
      .addCase(createReview.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        const { review, roomId } = action.payload;

        // Update user review
        state.userReviewsByRoom[roomId] = {
          review,
          loading: false,
          error: null
        };

        // Optimistically add review to list (if it exists)
        if (state.reviewsByRoom[roomId]) {
          state.reviewsByRoom[roomId].reviews.unshift(review);
          state.reviewsByRoom[roomId].total += 1;
        }

        state.creating = false;
        state.createError = null;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload as string;
      });
  }
});

export const { clearReviewsForRoom, clearAllReviews } = reviewsSlice.actions;

/**
 * ✅ SELECTORS (Memoized via Redux Toolkit)
 */
export const selectReviewsForRoom = (roomId: string) => (state: any) =>
  state.reviews.reviewsByRoom[roomId] || {
    reviews: [],
    total: 0,
    page: 1,
    pages: 0,
    loading: false,
    error: null,
    loaded: false
  };

export const selectRatingStatsForRoom = (roomId: string) => (state: any) =>
  state.reviews.statsByRoom[roomId] || {
    stats: null,
    loading: false,
    error: null,
    loaded: false
  };

export const selectUserReviewForRoom = (roomId: string) => (state: any) =>
  state.reviews.userReviewsByRoom[roomId] || {
    review: null,
    loading: false,
    error: null
  };

export const selectIsCreatingReview = (state: any) => state.reviews.creating;

export default reviewsSlice.reducer;
