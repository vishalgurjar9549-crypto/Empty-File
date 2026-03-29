import axiosInstance from './axios';
import { ApiResponse, User, Room, FeedbackReason, FeedbackSeverity } from '../types/api.types';
import { PropertyAssignment, TenantAssignment } from '../types/admin.types';
import { assertValidParam } from '../utils/apiGuard';
export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalProperties: number;
  pendingApprovals: number;
  activeListings: number;
  totalBookings: number;
}
export interface ActivityLog {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
}
export const adminApi = {
  // Get dashboard stats
  getStats: async (): Promise<AdminStats> => {
    const response = await axiosInstance.get<ApiResponse<AdminStats>>('/admin/stats');
    return response.data.data;
  },
  // Get all users
  getAllUsers: async (filters?: {
    role?: string;
    status?: string;
    search?: string;
  }): Promise<User[]> => {
    const response = await axiosInstance.get<ApiResponse<User[]>>('/admin/users', {
      params: filters
    });
    return response.data.data;
  },
  // Update user status
  updateUserStatus: async (userId: string, status: 'active' | 'disabled'): Promise<User> => {
    assertValidParam(userId, 'userId');
    const response = await axiosInstance.patch<ApiResponse<User>>(`/admin/users/${userId}/status`, {
      status,
      isActive: status === 'active'
    });
    return response.data.data;
  },
  // Get all properties
  getAllProperties: async (filters?: {
    status?: string;
    search?: string;
  }): Promise<Room[]> => {
    const response = await axiosInstance.get<ApiResponse<Room[]>>('/admin/properties', {
      params: filters
    });
    return response.data.data;
  },
  // Approve property
  approveProperty: async (propertyId: string): Promise<Room> => {
    assertValidParam(propertyId, 'propertyId');
    const response = await axiosInstance.patch<ApiResponse<Room>>(`/admin/properties/${propertyId}/approve`);
    return response.data.data;
  },
  // Reject property
  rejectProperty: async (propertyId: string, reason?: string): Promise<Room> => {
    assertValidParam(propertyId, 'propertyId');
    const response = await axiosInstance.patch<ApiResponse<Room>>(`/admin/properties/${propertyId}/reject`, {
      reason
    });
    return response.data.data;
  },
  // Suspend property
  suspendProperty: async (propertyId: string, reason?: string): Promise<Room> => {
    assertValidParam(propertyId, 'propertyId');
    const response = await axiosInstance.patch<ApiResponse<Room>>(`/admin/properties/${propertyId}/suspend`, {
      reason
    });
    return response.data.data;
  },
  // Request correction on a property
  requestPropertyCorrection: async (propertyId: string, reason: FeedbackReason, message: string, severity?: FeedbackSeverity): Promise<Room> => {
    assertValidParam(propertyId, 'propertyId');
    const response = await axiosInstance.patch<ApiResponse<Room>>(`/admin/properties/${propertyId}/needs-correction`, {
      reason,
      message,
      severity
    });
    return response.data.data;
  },
  // Get activity log
  getActivity: async (limit: number = 10): Promise<ActivityLog[]> => {
    const response = await axiosInstance.get<ApiResponse<ActivityLog[]>>('/admin/activity', {
      params: {
        limit
      }
    });
    return response.data.data;
  },
  // ==========================================================================
  // ASSIGNMENT ENDPOINTS
  // ==========================================================================

  // Get property assignments
  getPropertyAssignments: async (filters?: {
    agentId?: string;
    isActive?: boolean;
  }): Promise<PropertyAssignment[]> => {
    const response = await axiosInstance.get<ApiResponse<PropertyAssignment[]>>('/admin/assignments/properties', {
      params: filters
    });
    return response.data.data;
  },
  // Get tenant assignments
  getTenantAssignments: async (filters?: {
    agentId?: string;
    isActive?: boolean;
  }): Promise<TenantAssignment[]> => {
    const response = await axiosInstance.get<ApiResponse<TenantAssignment[]>>('/admin/assignments/tenants', {
      params: filters
    });
    return response.data.data;
  },
  // Assign property to agent
  assignPropertyToAgent: async (agentId: string, propertyId: string, notes?: string): Promise<any> => {
    assertValidParam(agentId, 'agentId');
    assertValidParam(propertyId, 'propertyId');
    const response = await axiosInstance.post<ApiResponse<any>>(`/admin/agents/${agentId}/properties/${propertyId}`, {
      notes
    });
    return response.data.data;
  },
  // Unassign property from agent
  unassignPropertyFromAgent: async (agentId: string, propertyId: string): Promise<any> => {
    assertValidParam(agentId, 'agentId');
    assertValidParam(propertyId, 'propertyId');
    const response = await axiosInstance.delete<ApiResponse<any>>(`/admin/agents/${agentId}/properties/${propertyId}`);
    return response.data;
  },
  // Assign tenant to agent
  assignTenantToAgent: async (agentId: string, tenantId: string, reason?: string): Promise<any> => {
    assertValidParam(agentId, 'agentId');
    assertValidParam(tenantId, 'tenantId');
    const response = await axiosInstance.post<ApiResponse<any>>(`/admin/agents/${agentId}/tenants/${tenantId}`, {
      reason
    });
    return response.data.data;
  },
  // Unassign tenant from agent
  unassignTenantFromAgent: async (agentId: string, tenantId: string): Promise<any> => {
    assertValidParam(agentId, 'agentId');
    assertValidParam(tenantId, 'tenantId');
    const response = await axiosInstance.delete<ApiResponse<any>>(`/admin/agents/${agentId}/tenants/${tenantId}`);
    return response.data;
  }
};