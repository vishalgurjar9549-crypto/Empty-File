import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileApi } from '../../api/profile.api';
import { updateUser } from './auth.slice';
import { showToast } from './ui.slice';
import axiosInstance from '../../api/axios';
import type { InternalAxiosRequestConfig } from 'axios';
interface OtpState {
  isOpen: boolean;
  phone: string | null;
  loading: boolean;
  error: string | null;
  pendingRequest: InternalAxiosRequestConfig | null;

  // ✅ NEW: store retry result so UI can update automatically
  lastRetryData?: any;
}
const initialState: OtpState = {
  isOpen: false,
  phone: null,
  loading: false,
  error: null,
  pendingRequest: null,
  lastRetryData: null
};

// ✅ UPDATED: retry unlock request after phone save
export const updatePhoneThunk = createAsyncThunk('otp/updatePhone', async (phone: string, {
  dispatch,
  getState,
  rejectWithValue
}) => {
  try {
    const response = await profileApi.updatePhone(phone);
    if (response.success && response.user) {
      // update phone in auth slice
      dispatch(updateUser({
        phone: response.user.phone
      }));
      const state = getState() as any;
      const pendingRequest = state.otp.pendingRequest;

      // 🔁 retry original request (unlock contact)
      if (pendingRequest) {
        try {
          const retryResponse = await axiosInstance(pendingRequest);
          dispatch(showToast({
            message: 'Phone number saved successfully!',
            type: 'success'
          }));

          // ✅ return retry data for UI auto update
          return {
            response,
            retryData: retryResponse.data
          };
        } catch (retryError) {
          dispatch(showToast({
            message: 'Phone saved, but original request failed. Please try again.',
            type: 'error'
          }));
          return {
            response,
            retryData: null
          };
        }
      }
      dispatch(showToast({
        message: 'Phone number saved successfully!',
        type: 'success'
      }));
      return {
        response,
        retryData: null
      };
    }
    throw new Error('Failed to update phone number');
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to update phone number';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
const otpSlice = createSlice({
  name: 'otp',
  initialState,
  reducers: {
    openOtpModal: (state, action: PayloadAction<{
      pendingRequest: InternalAxiosRequestConfig;
      phone?: string;
    }>) => {
      state.isOpen = true;
      state.pendingRequest = action.payload.pendingRequest;
      state.phone = action.payload.phone || null;
      state.error = null;
    },
    closeOtpModal: (state) => {
      state.isOpen = false;
      state.phone = null;
      state.error = null;
      state.pendingRequest = null;
    },
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearOtpRetryData: (state) => {
      state.lastRetryData = null;
    }
  },
  extraReducers: (builder) => {
    builder
    // update phone
    .addCase(updatePhoneThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(updatePhoneThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.isOpen = false;
      state.phone = null;
      state.pendingRequest = null;

      // ✅ store retry result for UI
      state.lastRetryData = action.payload?.retryData || null;
    }).addCase(updatePhoneThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});
export const {
  openOtpModal,
  closeOtpModal,
  setPhone,
  clearError,
  clearOtpRetryData
} = otpSlice.actions;
export default otpSlice.reducer;