import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AdminState, PropertyStatus, UserStatus, RequestCorrectionInput, AdminPaginationMeta } from '../../types/admin.types';
import { User, Room, FeedbackReason, FeedbackSeverity, PaginationMeta } from '../../types/api.types';
import { showToast } from './ui.slice';
import { adminApi } from '../../api/admin.api';
const initialState: AdminState = {
  users: [],
  properties: [],
  stats: null,
  recentActivity: [],
  // ✅ NEW: Pagination metadata (null until paginated response received)
  propertiesMeta: null,
  usersMeta: null,
  loading: false,
  error: null,
  // Assignment State
  propertyAssignments: [],
  tenantAssignments: [],
  assignmentsLoading: false,
  assignmentsError: null,
  // ✅ All agents (for agent assignments visibility)
  allAgents: [],
  agentsLoading: false,
  usersRequestId: null,
  propertiesRequestId: null
};

// Async Thunks - REPLACED WITH REAL API CALLS
export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async (_, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const stats = await adminApi.getStats();
    return stats;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch admin stats';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
export const fetchAllUsers = createAsyncThunk('admin/fetchUsers', async (filters: {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  cursor?: string;
} = {}, {
  dispatch,
  rejectWithValue,
  signal
}) => {
  try {
    const response = await adminApi.getAllUsers(filters, signal);
    // ✅ Return both data and meta
    return response;
  } catch (error: any) {
    if (signal.aborted || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
      throw error;
    }

    const message = error.response?.data?.message || 'Failed to fetch users';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
export const fetchAllProperties = createAsyncThunk('admin/fetchProperties', async (filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  cursor?: string;
} = {}, {
  dispatch,
  rejectWithValue,
  signal
}) => {
  try {
    const response = await adminApi.getAllProperties(filters, signal);
    // ✅ Return both data and meta
    return response;
  } catch (error: any) {
    if (signal.aborted || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
      throw error;
    }

    const message = error.response?.data?.message || 'Failed to fetch properties';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
export const updatePropertyStatus = createAsyncThunk('admin/updatePropertyStatus', async ({
  id,
  status,
  reason




}: {id: string;status: PropertyStatus;reason?: string;}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    let updatedProperty: Room;
    if (status === 'approved') {
      updatedProperty = await adminApi.approveProperty(id);
    } else if (status === 'rejected') {
      updatedProperty = await adminApi.rejectProperty(id, reason);
    } else if (status === 'suspended') {
      updatedProperty = await adminApi.suspendProperty(id, reason);
    } else {
      throw new Error('Invalid status');
    }
    dispatch(showToast({
      message: `Property status updated to ${status}`,
      type: 'success'
    }));
    return {
      id,
      status,
      property: updatedProperty
    };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to update property status';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
export const updateUserStatus = createAsyncThunk('admin/updateUserStatus', async ({
  id,
  status



}: {id: string;status: UserStatus;}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const updatedUser = await adminApi.updateUserStatus(id, status);
    dispatch(showToast({
      message: `User status updated to ${status}`,
      type: 'success'
    }));
    return {
      id,
      status,
      user: updatedUser
    };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to update user status';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
export const requestPropertyCorrection = createAsyncThunk('admin/requestPropertyCorrection', async ({
  id,
  reason,
  message,
  severity





}: {id: string;reason: FeedbackReason;message: string;severity?: FeedbackSeverity;}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const updatedProperty = await adminApi.requestPropertyCorrection(id, reason, message, severity);
    dispatch(showToast({
      message: 'Correction request sent to property owner',
      type: 'success'
    }));
    // Return the Room object directly — no wrapper needed
    return updatedProperty;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to request correction';
    dispatch(showToast({
      message: msg,
      type: 'error'
    }));
    return rejectWithValue(msg);
  }
});
export const fetchRecentActivity = createAsyncThunk('admin/fetchActivity', async (limit: number = 10, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const activity = await adminApi.getActivity(limit);
    return activity;
  } catch (error: any) {
    // Activity log is non-critical, don't show error toast
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity');
  }
});

// Assignment Thunks
export const fetchPropertyAssignments = createAsyncThunk('admin/fetchPropertyAssignments', async (filters: {
  agentId?: string;
  isActive?: boolean;
} = {}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const assignments = await adminApi.getPropertyAssignments(filters);
    return assignments;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch property assignments';
    // Don't toast on initial load errors to avoid spamming if multiple fail
    return rejectWithValue(message);
  }
});
export const fetchTenantAssignments = createAsyncThunk('admin/fetchTenantAssignments', async (filters: {
  agentId?: string;
  isActive?: boolean;
} = {}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const assignments = await adminApi.getTenantAssignments(filters);
    return assignments;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch tenant assignments';
    return rejectWithValue(message);
  }
});

// ✅ NEW: Fetch all agents (for displaying agents with zero assignments)
export const fetchAllAgents = createAsyncThunk('admin/fetchAllAgents', async (_, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const response = await adminApi.getAllUsers({ role: 'AGENT', limit: 1000 });
    return response.users;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch agents';
    // Don't toast on initial load errors
    return rejectWithValue(message);
  }
});

// Mutation Thunks
export const assignPropertyToAgent = createAsyncThunk('admin/assignPropertyToAgent', async ({
  agentId,
  propertyId,
  notes




}: {agentId: string;propertyId: string;notes?: string;}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    await adminApi.assignPropertyToAgent(agentId, propertyId, notes);
    dispatch(showToast({
      message: 'Property assigned successfully',
      type: 'success'
    }));
    // Refresh assignments
    dispatch(fetchPropertyAssignments({}));
    return {
      agentId,
      propertyId
    };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to assign property';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
export const unassignPropertyFromAgent = createAsyncThunk('admin/unassignPropertyFromAgent', async ({
  agentId,
  propertyId



}: {agentId: string;propertyId: string;}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    await adminApi.unassignPropertyFromAgent(agentId, propertyId);
    dispatch(showToast({
      message: 'Property unassigned successfully',
      type: 'success'
    }));
    // Refresh assignments
    dispatch(fetchPropertyAssignments({}));
    return {
      agentId,
      propertyId
    };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to unassign property';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
export const assignTenantToAgent = createAsyncThunk('admin/assignTenantToAgent', async ({
  agentId,
  tenantId,
  reason




}: {agentId: string;tenantId: string;reason?: string;}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    await adminApi.assignTenantToAgent(agentId, tenantId, reason);
    dispatch(showToast({
      message: 'Tenant assigned successfully',
      type: 'success'
    }));
    // Refresh assignments
    dispatch(fetchTenantAssignments({}));
    return {
      agentId,
      tenantId
    };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to assign tenant';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
export const unassignTenantFromAgent = createAsyncThunk('admin/unassignTenantFromAgent', async ({
  agentId,
  tenantId



}: {agentId: string;tenantId: string;}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    await adminApi.unassignTenantFromAgent(agentId, tenantId);
    dispatch(showToast({
      message: 'Tenant unassigned successfully',
      type: 'success'
    }));
    // Refresh assignments
    dispatch(fetchTenantAssignments({}));
    return {
      agentId,
      tenantId
    };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to unassign tenant';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    addActivityLog: (state, action) => {
      state.recentActivity.unshift({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload
      });
      if (state.recentActivity.length > 10) state.recentActivity.pop();
    }
  },
  extraReducers: (builder) => {
    // Stats
    builder.addCase(fetchAdminStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(fetchAdminStats.fulfilled, (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    }).addCase(fetchAdminStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Users
    builder.addCase(fetchAllUsers.pending, (state, action) => {
      state.loading = true;
      state.error = null;
      state.usersRequestId = action.meta.requestId;
    }).addCase(fetchAllUsers.fulfilled, (state, action) => {
      if (state.usersRequestId !== action.meta.requestId) return;

      state.loading = false;
      state.usersRequestId = null;
      // ✅ Extract data and meta from paginated response
      state.users = action.payload.users;
      state.usersMeta = action.payload.meta;
    }).addCase(fetchAllUsers.rejected, (state, action) => {
      if (state.usersRequestId !== action.meta.requestId) return;

      state.loading = false;
      state.usersRequestId = null;
      if (!action.meta.aborted) {
        state.error = action.payload as string;
      }
    });

    // Properties
    builder.addCase(fetchAllProperties.pending, (state, action) => {
      state.loading = true;
      state.error = null;
      state.propertiesRequestId = action.meta.requestId;
    }).addCase(fetchAllProperties.fulfilled, (state, action) => {
      if (state.propertiesRequestId !== action.meta.requestId) return;

      state.loading = false;
      state.propertiesRequestId = null;
      // ✅ Extract data and meta from paginated response
      state.properties = action.payload.properties;
      state.propertiesMeta = action.payload.meta;
    }).addCase(fetchAllProperties.rejected, (state, action) => {
      if (state.propertiesRequestId !== action.meta.requestId) return;

      state.loading = false;
      state.propertiesRequestId = null;
      if (!action.meta.aborted) {
        state.error = action.payload as string;
      }
    });

    // Update Property
    builder.addCase(updatePropertyStatus.fulfilled, (state, action) => {
      const index = state.properties.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        // Update the property with the response from backend
        state.properties[index] = action.payload.property;

        // Also update activity log
        state.recentActivity.unshift({
          id: Date.now().toString(),
          action: `Property ${action.payload.status}`,
          target: state.properties[index].title,
          timestamp: new Date().toISOString(),
          type: action.payload.status === 'approved' ? 'success' : 'warning'
        });
      }
    });

    // Update User
    builder.addCase(updateUserStatus.fulfilled, (state, action) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        // Update user with response from backend
        state.users[index] = action.payload.user;
        state.recentActivity.unshift({
          id: Date.now().toString(),
          action: `User ${action.payload.status}`,
          target: state.users[index].name,
          timestamp: new Date().toISOString(),
          type: action.payload.status === 'active' ? 'success' : 'error'
        });
      }
    });

    // Request Correction — action.payload IS the updated Room object
    builder.addCase(requestPropertyCorrection.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(requestPropertyCorrection.fulfilled, (state, action) => {
      state.loading = false;
      const updated = action.payload;
      const index = state.properties.findIndex((p) => p.id === updated.id);
      if (index !== -1) {
        state.properties[index] = updated;

        // Add activity log
        state.recentActivity.unshift({
          id: Date.now().toString(),
          action: 'Correction Requested',
          target: updated.title,
          timestamp: new Date().toISOString(),
          type: 'warning'
        });
      }
    }).addCase(requestPropertyCorrection.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Recent Activity
    builder.addCase(fetchRecentActivity.fulfilled, (state, action) => {
      state.recentActivity = action.payload;
    });

    // Assignments - Property
    builder.addCase(fetchPropertyAssignments.pending, (state) => {
      state.assignmentsLoading = true;
      state.assignmentsError = null;
    }).addCase(fetchPropertyAssignments.fulfilled, (state, action) => {
      state.assignmentsLoading = false;
      state.propertyAssignments = action.payload;
    }).addCase(fetchPropertyAssignments.rejected, (state, action) => {
      state.assignmentsLoading = false;
      state.assignmentsError = action.payload as string;
    });

    // Assignments - Tenant
    builder.addCase(fetchTenantAssignments.pending, (state) => {
      state.assignmentsLoading = true;
      state.assignmentsError = null;
    }).addCase(fetchTenantAssignments.fulfilled, (state, action) => {
      state.assignmentsLoading = false;
      state.tenantAssignments = action.payload;
    }).addCase(fetchTenantAssignments.rejected, (state, action) => {
      state.assignmentsLoading = false;
      state.assignmentsError = action.payload as string;
    });

    // ✅ All Agents (for agent assignments visibility)
    builder.addCase(fetchAllAgents.pending, (state) => {
      state.agentsLoading = true;
    }).addCase(fetchAllAgents.fulfilled, (state, action) => {
      state.agentsLoading = false;
      state.allAgents = action.payload;
    }).addCase(fetchAllAgents.rejected, (state) => {
      state.agentsLoading = false;
      state.allAgents = [];
    });

    // ✅ FIX: Add handlers for assignment mutations (MISSING BEFORE)
    // These were calling dispatch(fetchPropertyAssignments()) but had no reducer handlers
    builder.addCase(assignPropertyToAgent.pending, (state) => {
      state.assignmentsLoading = true;
      state.assignmentsError = null;
    }).addCase(assignPropertyToAgent.fulfilled, (state) => {
      state.assignmentsLoading = false;
    }).addCase(assignPropertyToAgent.rejected, (state, action) => {
      state.assignmentsError = action.payload as string;
      state.assignmentsLoading = false;
    });

    builder.addCase(unassignPropertyFromAgent.pending, (state) => {
      state.assignmentsLoading = true;
      state.assignmentsError = null;
    }).addCase(unassignPropertyFromAgent.fulfilled, (state) => {
      state.assignmentsLoading = false;
    }).addCase(unassignPropertyFromAgent.rejected, (state, action) => {
      state.assignmentsError = action.payload as string;
      state.assignmentsLoading = false;
    });

    builder.addCase(assignTenantToAgent.pending, (state) => {
      state.assignmentsLoading = true;
      state.assignmentsError = null;
    }).addCase(assignTenantToAgent.fulfilled, (state) => {
      state.assignmentsLoading = false;
    }).addCase(assignTenantToAgent.rejected, (state, action) => {
      state.assignmentsError = action.payload as string;
      state.assignmentsLoading = false;
    });

    builder.addCase(unassignTenantFromAgent.pending, (state) => {
      state.assignmentsLoading = true;
      state.assignmentsError = null;
    }).addCase(unassignTenantFromAgent.fulfilled, (state) => {
      state.assignmentsLoading = false;
    }).addCase(unassignTenantFromAgent.rejected, (state, action) => {
      state.assignmentsError = action.payload as string;
      state.assignmentsLoading = false;
    });
  }
});
export const {
  addActivityLog
} = adminSlice.actions;
export default adminSlice.reducer;
