import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerApi } from '../../api/owner.api';
import { OwnerSummary, Room, Booking, PropertyNote, OwnerActivityItem } from '../../types/api.types';
import { updateBookingStatus } from './bookings.slice';

const ACTIVITY_STALE_MS = 2 * 60 * 1000;

interface OwnerState {
  summary: OwnerSummary | null;
  myRooms: Room[];
  myBookings: Booking[];
  // Recent activity
  activity: OwnerActivityItem[];
  activityLoading: boolean;
  activityLastFetched: number | null;
  // Property notes (keyed by propertyId)
  propertyNotes: Record<string, PropertyNote[]>;
  notesLoading: Record<string, boolean>;
  notesError: Record<string, string | null>;
  loading: boolean;
  error: string | null;
  // Track optimistic updates
  pendingBookingUpdates: string[]; // booking IDs currently being updated
}
const initialState: OwnerState = {
  summary: null,
  myRooms: [],
  myBookings: [],
  activity: [],
  activityLoading: false,
  activityLastFetched: null,
  propertyNotes: {},
  notesLoading: {},
  notesError: {},
  loading: false,
  error: null,
  pendingBookingUpdates: []
};

// Async thunks
export const fetchOwnerSummary = createAsyncThunk('owner/fetchSummary', async (_, {
  rejectWithValue
}) => {
  try {
    const summary = await ownerApi.getSummary();
    return summary;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch summary';
    return rejectWithValue(message);
  }
});
export const fetchOwnerRooms = createAsyncThunk('owner/fetchRooms', async (_, {
  rejectWithValue
}) => {
  try {
    const rooms = await ownerApi.getMyRooms();
    console.log('Rooms', rooms);
    return rooms;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch rooms';
    return rejectWithValue(message);
  }
});
export const fetchOwnerBookings = createAsyncThunk('owner/fetchBookings', async (_, {
  rejectWithValue
}) => {
  try {
    const bookings = await ownerApi.getMyBookings();
    return bookings;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch bookings';
    return rejectWithValue(message);
  }
});

// Fetch property notes (read-only)
export const fetchPropertyNotes = createAsyncThunk('owner/fetchPropertyNotes', async (propertyId: string, {
  rejectWithValue
}) => {
  try {
    const notes = await ownerApi.getPropertyNotes(propertyId);
    return {
      propertyId,
      notes
    };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch notes';
    return rejectWithValue({
      propertyId,
      message
    });
  }
}, {
  condition: (propertyId, { getState }) => {
    const { owner } = getState() as { owner: OwnerState };

    if (owner.notesLoading[propertyId]) return false;
    if (Object.prototype.hasOwnProperty.call(owner.propertyNotes, propertyId)) return false;

    return true;
  }
});

// Fetch recent activity
export const fetchOwnerActivity = createAsyncThunk('owner/fetchActivity', async (_, {
  rejectWithValue
}) => {
  try {
    const activity = await ownerApi.getRecentActivity();
    return activity;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch activity';
    console.warn('[owner] fetchOwnerActivity failed', message, error);
    return rejectWithValue(message);
  }
}, {
  condition: (_, { getState }) => {
    const { owner } = getState() as { owner: OwnerState };

    if (owner.activityLoading) return false;
    if (!owner.activityLastFetched) return true;

    return Date.now() - owner.activityLastFetched > ACTIVITY_STALE_MS;
  }
});
const ownerSlice = createSlice({
  name: 'owner',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOwnerData: (state) => {
      state.summary = null;
      state.myRooms = [];
      state.myBookings = [];
      state.activity = [];
      state.activityLoading = false;
      state.activityLastFetched = null;
      state.propertyNotes = {};
      state.notesLoading = {};
      state.notesError = {};
      state.pendingBookingUpdates = [];
    }
  },
  extraReducers: (builder) => {
    // Fetch summary
    builder.addCase(fetchOwnerSummary.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(fetchOwnerSummary.fulfilled, (state, action) => {
      state.loading = false;
      state.summary = action.payload;
    }).addCase(fetchOwnerSummary.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch rooms
    builder.addCase(fetchOwnerRooms.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(fetchOwnerRooms.fulfilled, (state, action) => {
      state.loading = false;
      state.myRooms = action.payload;
    }).addCase(fetchOwnerRooms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch bookings
    builder.addCase(fetchOwnerBookings.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(fetchOwnerBookings.fulfilled, (state, action) => {
      state.loading = false;
      state.myBookings = action.payload;
    }).addCase(fetchOwnerBookings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch property notes
    builder.addCase(fetchPropertyNotes.pending, (state, action) => {
      const propertyId = action.meta.arg;
      state.notesLoading[propertyId] = true;
      state.notesError[propertyId] = null;
    }).addCase(fetchPropertyNotes.fulfilled, (state, action) => {
      const {
        propertyId,
        notes
      } = action.payload;
      state.notesLoading[propertyId] = false;
      state.propertyNotes[propertyId] = notes;
    }).addCase(fetchPropertyNotes.rejected, (state, action) => {
      const {
        propertyId,
        message
      } = action.payload as {
        propertyId: string;
        message: string;
      };
      state.notesLoading[propertyId] = false;
      state.notesError[propertyId] = message;
    });

    // Fetch activity
    builder.addCase(fetchOwnerActivity.pending, (state) => {
      state.activityLoading = true;
    }).addCase(fetchOwnerActivity.fulfilled, (state, action) => {
      state.activityLoading = false;
      state.activity = action.payload;
      state.activityLastFetched = Date.now();
    }).addCase(fetchOwnerActivity.rejected, (state) => {
      state.activityLoading = false;
    });

    // OPTIMISTIC UPDATES for Booking Status
    builder.addCase(updateBookingStatus.pending, (state, action) => {
      const {
        id,
        data
      } = action.meta.arg;
      // Track pending update
      state.pendingBookingUpdates.push(id);

      // Optimistically update the booking in the list
      const bookingIndex = state.myBookings.findIndex((b) => b.id === id);
      if (bookingIndex !== -1) {
        // Store previous status in case we need to rollback (could be done via separate map if needed,
        // but for now we rely on re-fetching or simple error handling)
        state.myBookings[bookingIndex].status = data.status;
      }
    });
    builder.addCase(updateBookingStatus.fulfilled, (state, action) => {
      const {
        id
      } = action.meta.arg;
      // Remove from pending
      state.pendingBookingUpdates = state.pendingBookingUpdates.filter((bookingId) => bookingId !== id);

      // Update with server response to be sure
      const bookingIndex = state.myBookings.findIndex((b) => b.id === id);
      if (bookingIndex !== -1 && action.payload) {
        state.myBookings[bookingIndex] = action.payload;
      }

      // Update summary stats optimistically (simple increment/decrement)
      if (state.summary) {
        if (action.payload.status === 'approved') {




          // If it wasn't already approved (it was pending), increment earnings potentially
          // This is complex to calculate accurately client-side without room price,
          // so we'll rely on the background refresh in the component
        }}});builder.addCase(updateBookingStatus.rejected, (state, action) => {
      const {
        id
      } = action.meta.arg;
      // Remove from pending
      state.pendingBookingUpdates = state.pendingBookingUpdates.filter((bookingId) => bookingId !== id);

      // Rollback is handled by re-fetching in the component on error,
      // or we could store previous state. For now, the component triggers a refresh.
    });
  }
});
export const {
  clearError,
  clearOwnerData
} = ownerSlice.actions;
export default ownerSlice.reducer;
