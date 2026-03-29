import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTenantDashboard as fetchDashboardApi, TenantDashboardData } from '../../api/tenantDashboard.api';

/**
 * Tenant Dashboard Slice
 *
 * Dedicated state for the tenant control center.
 * Fetches ONCE on page mount. Does NOT refetch on tab switch.
 */

interface TenantDashboardState {
  data: TenantDashboardData | null;
  loading: boolean;
  error: string | null;
}
const initialState: TenantDashboardState = {
  data: null,
  loading: false,
  error: null
};
export const fetchTenantDashboardData = createAsyncThunk('tenantDashboard/fetch', async (_, {
  rejectWithValue
}) => {
  try {
    return await fetchDashboardApi();
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to load dashboard';
    return rejectWithValue(message);
  }
});
const tenantDashboardSlice = createSlice({
  name: 'tenantDashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTenantDashboardData.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(fetchTenantDashboardData.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    }).addCase(fetchTenantDashboardData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});
export const {
  clearDashboard
} = tenantDashboardSlice.actions;
export default tenantDashboardSlice.reducer;