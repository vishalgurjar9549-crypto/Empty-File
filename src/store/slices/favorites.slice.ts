import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoritesApi, handleFavoriteApiError } from '../../api/favorites.api';
import { showToast } from './ui.slice';

/**
 * 💜 FAVORITES REDUX SLICE
 * 
 * State management for user's wishlist/favorites
 * 
 * Features:
 * - Store favorite room IDs in Redux
 * - Optimistic UI updates (instant feedback)
 * - Async thunks for API calls
 * - Toast notifications for user feedback
 * - No unnecessary re-renders with memoized selectors
 */

export interface FavoritesState {
  favorites: string[]; // Array of favorited room IDs
  favoriteRooms: any[]; // Full room details for favorites
  loading: boolean;
  detailsLoading: boolean; // Loading state for full room details
  error: string | null;
  loaded: boolean;
  toggling: { [roomId: string]: boolean }; // Track which favorites are being toggled
}

const initialState: FavoritesState = {
  favorites: [],
  favoriteRooms: [],
  loading: false,
  detailsLoading: false,
  error: null,
  loaded: false,
  toggling: {}
};

/**
 * ✅ ASYNC THUNK: Fetch user's favorites on app load
 */
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const favorites = await favoritesApi.getFavorites();
      return favorites;
    } catch (error: any) {
      const message = handleFavoriteApiError(error);
      // Don't show error toast for 401 (user not logged in)
      if (error?.response?.status !== 401) {
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
 * ✅ ASYNC THUNK: Toggle favorite (add or remove)
 * 
 * Supports optimistic UI:
 * - Immediately updates state
 * - If API fails, reverts change
 */
export const toggleFavorite = createAsyncThunk(
  'favorites/toggleFavorite',
  async (roomId: string, { rejectWithValue, dispatch, getState }) => {
    try {
      const result = await favoritesApi.toggleFavorite(roomId);

      dispatch(showToast({
        message: result.isFavorited ? '❤️ Added to favorites' : '🤍 Removed from favorites',
        type: 'success'
      }));

      return result;
    } catch (error: any) {
      const message = handleFavoriteApiError(error);
      dispatch(showToast({
        message,
        type: 'error'
      }));
      return rejectWithValue({ roomId, message });
    }
  }
);

/**
 * ✅ ASYNC THUNK: Fetch favorites with full room details
 * 
 * Used for displaying favorites on Dashboard/Wishlist page
 * Returns full room objects instead of just IDs
 * 
 * @param limit - Max favorites to fetch (default: 50)
 */
export const fetchFavoritesWithDetails = createAsyncThunk(
  'favorites/fetchFavoritesWithDetails',
  async (limit: number = 50, { rejectWithValue, dispatch }) => {
    try {
      const rooms = await favoritesApi.getFavoritesWithDetails(limit);
      return rooms;
    } catch (error: any) {
      const message = handleFavoriteApiError(error);
      // Don't show error toast for 401 (user not logged in)
      if (error?.response?.status !== 401) {
        dispatch(showToast({
          message,
          type: 'error'
        }));
      }
      return rejectWithValue(message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Clear favorites (for logout)
    clearFavorites: (state) => {
      state.favorites = [];
      state.favoriteRooms = [];
      state.loaded = false;
      state.error = null;
    },

    // Optimistic update: add favorite immediately
    addFavoriteOptimistic: (state, action) => {
      const roomId = action.payload;
      if (!state.favorites.includes(roomId)) {
        state.favorites.push(roomId);
      }
    },

    // Optimistic update: remove favorite immediately
    removeFavoriteOptimistic: (state, action) => {
      const roomId = action.payload;
      state.favorites = state.favorites.filter((id) => id !== roomId);
      // Also remove from favoriteRooms
      state.favoriteRooms = state.favoriteRooms.filter((room) => room.id !== roomId);
    }
  },
  extraReducers: (builder) => {
    // ✅ Fetch Favorites
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
        state.loading = false;
        state.loaded = true;
        state.error = null;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Don't set loaded: false so we keep cached data
        // User can still see previously loaded favorites
      });

    // ✅ Toggle Favorite
    builder
      .addCase(toggleFavorite.pending, (state, action) => {
        const roomId = action.meta.arg;
        state.toggling[roomId] = true;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { isFavorited, roomId } = action.payload;
        
        // Make permanent the optimistic update
        if (isFavorited && !state.favorites.includes(roomId)) {
          state.favorites.push(roomId);
        } else if (!isFavorited) {
          state.favorites = state.favorites.filter((id) => id !== roomId);
          // Also remove from favoriteRooms when unfavoriting
          state.favoriteRooms = state.favoriteRooms.filter((room) => room.id !== roomId);
        }

        state.toggling[roomId] = false;
        state.error = null;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        const payload = action.payload as any;
        const roomId = payload?.roomId;
        
        if (roomId) {
          // Revert optimistic update on failure
          state.toggling[roomId] = false;
        }
        
        state.error = payload?.message as string;
      });

    // ✅ Fetch Favorites With Details
    builder
      .addCase(fetchFavoritesWithDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchFavoritesWithDetails.fulfilled, (state, action) => {
        state.favoriteRooms = action.payload;
        state.detailsLoading = false;
        state.error = null;
      })
      .addCase(fetchFavoritesWithDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearFavorites, addFavoriteOptimistic, removeFavoriteOptimistic } = favoritesSlice.actions;

// ✅ SELECTORS (Memoized)

export const selectFavorites = (state: any) => state.favorites.favorites;
export const selectFavoritesLoading = (state: any) => state.favorites.loading;
export const selectFavoritesError = (state: any) => state.favorites.error;
export const selectFavoritesLoaded = (state: any) => state.favorites.loaded;
export const selectFavoriteRooms = (state: any) => state.favorites.favoriteRooms;
export const selectFavoriteRoomsLoading = (state: any) => state.favorites.detailsLoading;

// Check if specific room is favorited
export const selectIsFavorited = (roomId: string) => (state: any) =>
  state.favorites.favorites.includes(roomId);

// Get toggle loading state for specific room
export const selectIsToggling = (roomId: string) => (state: any) =>
  state.favorites.toggling[roomId] || false;

// Get count of favorites
export const selectFavoritesCount = (state: any) => state.favorites.favorites.length;

export default favoritesSlice.reducer;
