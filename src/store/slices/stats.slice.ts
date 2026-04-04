/**
 * Platform Stats Redux Slice
 * Manages global platform statistics (total properties, cities, etc.)
 * Ensures stats API is called only once
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { statsApi, PlatformStats } from '../../api/stats.api';

interface StatsState {
  platform: PlatformStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  platform: null,
  loading: false,
  error: null,
};

/**
 * Fetch platform stats
 * Only called once at app initialization
 */
export const fetchPlatformStats = createAsyncThunk(
  'stats/fetchPlatformStats',
  async (_, { rejectWithValue }) => {
    try {
      return await statsApi.getPlatformStats();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch platform stats';
      return rejectWithValue(message);
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.loading = false;
        state.platform = action.payload;
        state.error = null;
      })
      .addCase(fetchPlatformStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.platform = null;
      });
  },
});

export default statsSlice.reducer;
