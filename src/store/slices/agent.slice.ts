import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { agentApi } from '../../api/agent.api';
import { AgentPropertyView, AgentTenantView, NotificationView, AgentNote } from '../../types/agent.types';
import { showToast } from './ui.slice';
interface AgentState {
  properties: AgentPropertyView[];
  tenants: AgentTenantView[];
  notifications: NotificationView[];
  unreadCount: number;
  // Agent's own notes (keyed by propertyId for quick lookup)
  myNotes: Record<string, AgentNote[]>;
  loading: {
    properties: boolean;
    tenants: boolean;
    notifications: boolean;
    notes: boolean;
  };
  error: {
    properties: string | null;
    tenants: string | null;
    notifications: string | null;
    notes: string | null;
  };
  pagination: {
    page: number;
    pageSize: number;
    hasMore: boolean;
    total: number;
  };
}
const initialState: AgentState = {
  properties: [],
  tenants: [],
  notifications: [],
  unreadCount: 0,
  myNotes: {},
  loading: {
    properties: false,
    tenants: false,
    notifications: false,
    notes: false
  },
  error: {
    properties: null,
    tenants: null,
    notifications: null,
    notes: null
  },
  pagination: {
    page: 1,
    pageSize: 20,
    hasMore: false,
    total: 0
  }
};

// Async Thunks

export const fetchAssignedProperties = createAsyncThunk('agent/fetchProperties', async (_, {
  rejectWithValue
}) => {
  try {
    return await agentApi.getAssignedProperties();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
  }
});
export const fetchAssignedTenants = createAsyncThunk('agent/fetchTenants', async (_, {
  rejectWithValue
}) => {
  try {
    return await agentApi.getAssignedTenants();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenants');
  }
});
export const fetchNotifications = createAsyncThunk('agent/fetchNotifications', async ({
  page = 1,
  unreadOnly = false



}: {page?: number;unreadOnly?: boolean;}, {
  rejectWithValue
}) => {
  try {
    return await agentApi.getNotifications(page, 20, unreadOnly);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
  }
});
export const fetchUnreadCount = createAsyncThunk('agent/fetchUnreadCount', async (_, {
  rejectWithValue
}) => {
  try {
    return await agentApi.getUnreadCount();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
  }
});
export const markNotificationAsRead = createAsyncThunk('agent/markRead', async (id: string, {
  rejectWithValue
}) => {
  try {
    return await agentApi.markAsRead(id);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
  }
});
export const markAllNotificationsAsRead = createAsyncThunk('agent/markAllRead', async (_, {
  rejectWithValue
}) => {
  try {
    return await agentApi.markAllAsRead();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
  }
});

// ==========================================================================
// PROPERTY NOTES THUNKS
// ==========================================================================

export const createPropertyNote = createAsyncThunk('agent/createPropertyNote', async ({
  propertyId,
  content



}: {propertyId: string;content: string;}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const note = await agentApi.createPropertyNote(propertyId, content);
    dispatch(showToast({
      message: 'Note created successfully',
      type: 'success'
    }));
    return {
      propertyId,
      note
    };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to create note';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
export const updatePropertyNote = createAsyncThunk('agent/updatePropertyNote', async ({
  noteId,
  propertyId,
  content




}: {noteId: string;propertyId: string;content: string;}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const note = await agentApi.updateNote(noteId, content);
    dispatch(showToast({
      message: 'Note updated successfully',
      type: 'success'
    }));
    return {
      propertyId,
      note
    };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to update note';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
export const deletePropertyNote = createAsyncThunk('agent/deletePropertyNote', async ({
  noteId,
  propertyId



}: {noteId: string;propertyId: string;}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    await agentApi.deleteNote(noteId);
    dispatch(showToast({
      message: 'Note deleted successfully',
      type: 'success'
    }));
    return {
      noteId,
      propertyId
    };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to delete note';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    clearAgentErrors: (state) => {
      state.error = {
        properties: null,
        tenants: null,
        notifications: null,
        notes: null
      };
    },
    resetAgentState: () => initialState
  },
  extraReducers: (builder) => {
    // Properties
    builder.addCase(fetchAssignedProperties.pending, (state) => {
      state.loading.properties = true;
      state.error.properties = null;
    });
    builder.addCase(fetchAssignedProperties.fulfilled, (state, action) => {
      state.loading.properties = false;
      state.properties = action.payload;
    });
    builder.addCase(fetchAssignedProperties.rejected, (state, action) => {
      state.loading.properties = false;
      state.error.properties = action.payload as string;
    });

    // Tenants
    builder.addCase(fetchAssignedTenants.pending, (state) => {
      state.loading.tenants = true;
      state.error.tenants = null;
    });
    builder.addCase(fetchAssignedTenants.fulfilled, (state, action) => {
      state.loading.tenants = false;
      state.tenants = action.payload;
    });
    builder.addCase(fetchAssignedTenants.rejected, (state, action) => {
      state.loading.tenants = false;
      state.error.tenants = action.payload as string;
    });

    // Notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading.notifications = true;
      state.error.notifications = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading.notifications = false;
      state.notifications = action.payload.data;
      state.unreadCount = action.payload.meta.unreadCount;
      state.pagination = {
        page: action.payload.meta.page,
        pageSize: action.payload.meta.pageSize,
        hasMore: action.payload.meta.hasMore,
        total: action.payload.meta.total
      };
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading.notifications = false;
      state.error.notifications = action.payload as string;
    });

    // Unread Count
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    // Mark Read
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find((n) => n.id === action.payload.id);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = action.payload.readAt;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // Mark All Read
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
        n.readAt = new Date().toISOString();
      });
      state.unreadCount = 0;
    });

    // ==========================================================================
    // PROPERTY NOTES REDUCERS
    // ==========================================================================

    // Create Note
    builder.addCase(createPropertyNote.pending, (state) => {
      state.loading.notes = true;
      state.error.notes = null;
    });
    builder.addCase(createPropertyNote.fulfilled, (state, action) => {
      state.loading.notes = false;
      const {
        propertyId,
        note
      } = action.payload;
      if (!state.myNotes[propertyId]) {
        state.myNotes[propertyId] = [];
      }
      state.myNotes[propertyId].push(note);
    });
    builder.addCase(createPropertyNote.rejected, (state, action) => {
      state.loading.notes = false;
      state.error.notes = action.payload as string;
    });

    // Update Note
    builder.addCase(updatePropertyNote.pending, (state) => {
      state.loading.notes = true;
      state.error.notes = null;
    });
    builder.addCase(updatePropertyNote.fulfilled, (state, action) => {
      state.loading.notes = false;
      const {
        propertyId,
        note
      } = action.payload;
      if (state.myNotes[propertyId]) {
        const index = state.myNotes[propertyId].findIndex((n) => n.id === note.id);
        if (index !== -1) {
          state.myNotes[propertyId][index] = note;
        }
      }
    });
    builder.addCase(updatePropertyNote.rejected, (state, action) => {
      state.loading.notes = false;
      state.error.notes = action.payload as string;
    });

    // Delete Note
    builder.addCase(deletePropertyNote.pending, (state) => {
      state.loading.notes = true;
      state.error.notes = null;
    });
    builder.addCase(deletePropertyNote.fulfilled, (state, action) => {
      state.loading.notes = false;
      const {
        noteId,
        propertyId
      } = action.payload;
      if (state.myNotes[propertyId]) {
        state.myNotes[propertyId] = state.myNotes[propertyId].filter((n) => n.id !== noteId);
      }
    });
    builder.addCase(deletePropertyNote.rejected, (state, action) => {
      state.loading.notes = false;
      state.error.notes = action.payload as string;
    });
  }
});
export const {
  clearAgentErrors,
  resetAgentState
} = agentSlice.actions;
export default agentSlice.reducer;