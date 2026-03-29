import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { subscriptionApi } from '../../api/subscription.api';
import { SubscriptionPlan, CurrentSubscription } from '../../types/subscription.types';
interface Subscription {
  id: string;
  plan: string;
  city: string;
  isActive: boolean;
  expiresAt: string | Date | null;
  createdAt: string;
}
interface SubscriptionState {
  subscriptions: any[];
  pricing: SubscriptionPlan[];
  pricingCity: string | null;
  current: CurrentSubscription | null;
  visibility: any;
  loading: boolean;
  error: string | null;
}
const initialState: SubscriptionState = {
  subscriptions: [],
  pricing: [],
  pricingCity: null,
  current: null,
  visibility: null,
  loading: false,
  error: null
};

// Helper: normalize subscription array from backend, computing isActive
function normalizeSubscriptions(payload: any[]): any[] {
  const now = new Date();
  return payload.map((sub: any) => ({
    ...sub,
    isActive: sub.isActive !== undefined ? sub.isActive : !sub.expiresAt || new Date(sub.expiresAt) > now
  }));
}

// Async thunks
export const fetchCurrentSubscription = createAsyncThunk('subscription/fetchCurrent', async (_, {
  rejectWithValue
}) => {
  try {
    const response = await subscriptionApi.getCurrent();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription');
  }
});
export const fetchPricing = createAsyncThunk('subscription/fetchPricing', async (city: string, {
  rejectWithValue
}) => {
  try {
    // ✅ SAFETY: Never call API with undefined/empty city
    if (!city || city === 'undefined' || city === 'null' || city.trim() === '') {
      console.warn('[fetchPricing] Blocked dispatch with invalid city:', city);
      return rejectWithValue('Invalid city parameter');
    }
    const response = await subscriptionApi.getPricing(city);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch pricing');
  }
});
export const fetchSubscriptions = createAsyncThunk('subscription/fetchSubscriptions', async (_, {
  rejectWithValue
}) => {
  try {
    const response = await subscriptionApi.getCurrent();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscriptions');
  }
});
export const fetchSubscriptionByCity = createAsyncThunk('subscription/fetchSubscriptionByCity', async (city: string, {
  rejectWithValue
}) => {
  try {
    // ✅ SAFETY: Never call API with undefined/empty city
    if (!city || city === 'undefined' || city === 'null' || city.trim() === '') {
      console.warn('[fetchSubscriptionByCity] Blocked dispatch with invalid city:', city);
      return rejectWithValue('Invalid city parameter');
    }
    const response = await subscriptionApi.getSubscriptionByCity(city);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription');
  }
});
export const checkAccess = createAsyncThunk('subscription/checkAccess', async ({
  city,
  roomId



}: {city: string;roomId: string;}, {
  rejectWithValue
}) => {
  try {
    // ✅ SAFETY: Never call API with undefined params
    if (!city || !roomId || city === 'undefined') {
      console.warn('[checkAccess] Blocked dispatch with invalid params:', {
        city,
        roomId
      });
      return rejectWithValue('Invalid parameters');
    }
    const response = await subscriptionApi.checkAccess(city, roomId);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to check access');
  }
});
export const upgradeSubscription = createAsyncThunk('subscription/upgradeSubscription', async (data: {
  plan: 'GOLD' | 'PLATINUM';
  city: string;
}, {
  rejectWithValue
}) => {
  try {
    // ✅ Validate before API call
    if (!data.plan || !data.city) {
      throw new Error('Plan and city are required');
    }
    if (data.plan !== 'GOLD' && data.plan !== 'PLATINUM') {
      throw new Error('Only GOLD and PLATINUM plans can be upgraded');
    }
    const response = await subscriptionApi.createOrder(data);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create order');
  }
});
export const fetchVisibility = createAsyncThunk('subscription/fetchVisibility', async ({
  propertyId,
  city



}: {propertyId: string;city: string;}, {
  rejectWithValue
}) => {
  try {
    // ✅ SAFETY: Never call API with undefined params
    if (!propertyId || !city || city === 'undefined') {
      console.warn('[fetchVisibility] Blocked dispatch with invalid params:', {
        propertyId,
        city
      });
      return rejectWithValue('Invalid parameters');
    }
    const response = await subscriptionApi.getVisibility(propertyId, city);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch visibility');
  }
});
export const trackPropertyView = createAsyncThunk('subscription/trackPropertyView', async (propertyId: string, {
  rejectWithValue
}) => {
  try {
    await subscriptionApi.trackView({
      propertyId
    });
    return propertyId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to track property view');
  }
});
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearVisibility: (state) => {
      state.visibility = null;
    },
    clearPricing: (state) => {
      state.pricing = [];
      state.pricingCity = null;
    }
  },
  extraReducers: (builder) => {
    builder
    // Fetch current subscription
    .addCase(fetchCurrentSubscription.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
      state.loading = false;
      const payload = action.payload;
      // Backend returns array for multi-city, single object for FREE fallback
      if (Array.isArray(payload)) {
        state.subscriptions = normalizeSubscriptions(payload);
        state.current = state.subscriptions[0] || null;
      } else {
        state.current = payload;
        state.subscriptions = [];
      }
    }).addCase(fetchCurrentSubscription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Fetch subscriptions (also hits /current)
    .addCase(fetchSubscriptions.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(fetchSubscriptions.fulfilled, (state, action) => {
      state.loading = false;
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.subscriptions = normalizeSubscriptions(payload);
        state.current = state.subscriptions[0] || null;
      } else {
        state.current = payload;
        state.subscriptions = [];
      }
    }).addCase(fetchSubscriptions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Fetch pricing — tracks which city the pricing belongs to
    .addCase(fetchPricing.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(fetchPricing.fulfilled, (state, action) => {
      state.loading = false;
      state.pricing = action.payload;
      // ✅ FIX: Always store normalized (lowercase) city for consistent comparison
      state.pricingCity = action.meta.arg?.toLowerCase().trim() || null;
    }).addCase(fetchPricing.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      // ✅ FIX: Still record which city failed so modal can show error instead of infinite skeleton
      state.pricingCity = action.meta.arg?.toLowerCase().trim() || null;
    })

    // Check access
    .addCase(checkAccess.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(checkAccess.fulfilled, (state, action) => {
      state.loading = false;
      state.visibility = action.payload;
    }).addCase(checkAccess.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Upgrade subscription (create order)
    .addCase(upgradeSubscription.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(upgradeSubscription.fulfilled, (state) => {
      state.loading = false;
    }).addCase(upgradeSubscription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Fetch visibility
    .addCase(fetchVisibility.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(fetchVisibility.fulfilled, (state, action) => {
      state.loading = false;
      state.visibility = action.payload;
    }).addCase(fetchVisibility.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Track property view
    .addCase(trackPropertyView.pending, (state) => {


      // No loading state needed for tracking
    }).addCase(trackPropertyView.fulfilled, (state) => {

        // No state update needed
      }).addCase(trackPropertyView.rejected, (state, action) => {// Silently fail tracking
        console.error('Failed to track property view:', action.payload);
      });
  }
});
export const {
  clearError,
  clearVisibility,
  clearPricing
} = subscriptionSlice.actions;
export default subscriptionSlice.reducer;