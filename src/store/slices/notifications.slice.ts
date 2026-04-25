import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsApi } from '../../api/notifications.api';
import { AppNotification } from '../../types/api.types';

const UNREAD_COUNT_STALE_MS = 30 * 1000;
const NOTIFICATIONS_STALE_MS = 60 * 1000;

interface NotificationsState {
  unreadCount: number;
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;
  unreadLastFetched: number | null;
  notificationsLastFetched: number | null;
}

const initialState: NotificationsState = {
  unreadCount: 0,
  notifications: [],
  loading: false,
  error: null,
  unreadLastFetched: null,
  notificationsLastFetched: null,
};

// Async thunks
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await notificationsApi.getUnreadCount();
      return count;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch unread count';
      console.warn('[notifications] fetchUnreadCount failed', message, error);
      return rejectWithValue(message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { notifications } = getState() as { notifications: NotificationsState };

      if (notifications.loading) return false;
      if (!notifications.unreadLastFetched) return true;

      return Date.now() - notifications.unreadLastFetched > UNREAD_COUNT_STALE_MS;
    },
  }
);

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsApi.getMyNotifications();
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch notifications';
      console.warn('[notifications] fetchNotifications failed', message, error);
      return rejectWithValue(message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { notifications } = getState() as { notifications: NotificationsState };

      if (notifications.loading) return false;
      if (!notifications.notificationsLastFetched) return true;

      return Date.now() - notifications.notificationsLastFetched > NOTIFICATIONS_STALE_MS;
    },
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const notification = await notificationsApi.markAsRead(id);
      return notification;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to mark as read';
      return rejectWithValue(message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.unreadLastFetched = null;
      state.notificationsLastFetched = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload;
        state.unreadLastFetched = Date.now();
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.unreadCount = action.payload.meta?.unreadCount || 0;
        state.unreadLastFetched = Date.now();
        state.notificationsLastFetched = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Mark as read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
        // Decrement unread count if it was unread
        if (action.payload.isRead && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
