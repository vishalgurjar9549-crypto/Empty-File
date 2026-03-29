import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingsApi } from '../../api/bookings.api';
import { Booking, CreateBookingInput, UpdateBookingStatusInput, PaginationMeta } from '../../types/api.types';
import { showToast } from './ui.slice';
interface BookingsState {
  bookings: Booking[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}
const initialState: BookingsState = {
  bookings: [],
  meta: null,
  loading: false,
  error: null
};

// Async thunks
export const createBooking = createAsyncThunk('bookings/createBooking', async (data: CreateBookingInput & {
  idempotencyKey?: string;
}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const {
      idempotencyKey,
      ...bookingData
    } = data;
    const booking = await bookingsApi.createBooking(bookingData, idempotencyKey);
    dispatch(showToast({
      message: 'Booking request sent successfully!',
      type: 'success'
    }));
    return booking;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to create booking';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
export const fetchTenantBookings = createAsyncThunk('bookings/fetchTenantBookings', async ({
  page = 1,
  limit = 20



}: {page?: number;limit?: number;}, {
  rejectWithValue
}) => {
  try {
    const response = await bookingsApi.getTenantBookings(page, limit);
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch bookings';
    return rejectWithValue(message);
  }
});
export const fetchOwnerBookings = createAsyncThunk('bookings/fetchOwnerBookings', async ({
  page = 1,
  limit = 20



}: {page?: number;limit?: number;}, {
  rejectWithValue
}) => {
  try {
    const response = await bookingsApi.getOwnerBookings(page, limit);
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch bookings';
    return rejectWithValue(message);
  }
});
export const updateBookingStatus = createAsyncThunk('bookings/updateBookingStatus', async ({
  id,
  data



}: {id: string;data: UpdateBookingStatusInput;}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const booking = await bookingsApi.updateBookingStatus(id, data);
    dispatch(showToast({
      message: 'Booking updated successfully!',
      type: 'success'
    }));
    return booking;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to update booking';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBookings: (state) => {
      state.bookings = [];
      state.meta = null;
    }
  },
  extraReducers: (builder) => {
    // Create booking
    builder.addCase(createBooking.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(createBooking.fulfilled, (state, action) => {
      state.loading = false;
      state.bookings.unshift(action.payload);
    }).addCase(createBooking.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch tenant bookings
    builder.addCase(fetchTenantBookings.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(fetchTenantBookings.fulfilled, (state, action) => {
      state.loading = false;
      state.bookings = action.payload.bookings;
      state.meta = action.payload.meta;
    }).addCase(fetchTenantBookings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch owner bookings
    builder.addCase(fetchOwnerBookings.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(fetchOwnerBookings.fulfilled, (state, action) => {
      state.loading = false;
      state.bookings = action.payload.bookings;
      state.meta = action.payload.meta;
    }).addCase(fetchOwnerBookings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update booking status
    builder.addCase(updateBookingStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(updateBookingStatus.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.bookings.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
    }).addCase(updateBookingStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});
export const {
  clearError,
  clearBookings
} = bookingsSlice.actions;
export default bookingsSlice.reducer;