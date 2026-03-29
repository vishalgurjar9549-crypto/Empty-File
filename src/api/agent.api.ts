import axiosInstance from './axios';
import { ApiResponse } from '../types/api.types';
import { AgentPropertyView, AgentTenantView, NotificationView, NotificationsResponse, AgentNote } from '../types/agent.types';
import { assertValidParam } from '../utils/apiGuard';
export const agentApi = {
  // Get assigned properties
  getAssignedProperties: async (): Promise<AgentPropertyView[]> => {
    const response = await axiosInstance.get<ApiResponse<AgentPropertyView[]>>('/agent/properties');
    return response.data.data;
  },
  // Get assigned tenants
  getAssignedTenants: async (): Promise<AgentTenantView[]> => {
    const response = await axiosInstance.get<ApiResponse<AgentTenantView[]>>('/agent/tenants');
    return response.data.data;
  },
  // Get notifications
  getNotifications: async (page = 1, pageSize = 20, unreadOnly = false): Promise<NotificationsResponse> => {
    const response = await axiosInstance.get<ApiResponse<NotificationView[]>>('/notifications', {
      params: {
        page,
        pageSize,
        unreadOnly
      }
    });

    // The backend returns { success: true, data: [], meta: { ... } }
    // We need to return both data and meta
    return {
      data: response.data.data,
      meta: response.data.meta as NotificationsResponse['meta']
    };
  },
  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await axiosInstance.get<ApiResponse<{
      unreadCount: number;
    }>>('/notifications/unread');
    return response.data.data.unreadCount;
  },
  // Mark notification as read
  markAsRead: async (id: string): Promise<NotificationView> => {
    const response = await axiosInstance.patch<ApiResponse<NotificationView>>(`/notifications/${id}/read`);
    return response.data.data;
  },
  // Mark all as read
  markAllAsRead: async (): Promise<number> => {
    const response = await axiosInstance.patch<ApiResponse<{
      markedAsRead: number;
    }>>('/notifications/read-all');
    return response.data.data.markedAsRead;
  },
  // ==========================================================================
  // PROPERTY NOTES (Agent can create/edit/delete their own notes)
  // ==========================================================================

  // Create a note for a property
  createPropertyNote: async (propertyId: string, content: string): Promise<AgentNote> => {
    assertValidParam(propertyId, 'propertyId');
    const response = await axiosInstance.post<ApiResponse<AgentNote>>(`/properties/${propertyId}/notes`, {
      content
    });
    return response.data.data;
  },
  // Update a note (agent can only update their own)
  updateNote: async (noteId: string, content: string): Promise<AgentNote> => {
    assertValidParam(noteId, 'noteId');
    const response = await axiosInstance.patch<ApiResponse<AgentNote>>(`/notes/${noteId}`, {
      content
    });
    return response.data.data;
  },
  // Delete a note (soft delete, agent can only delete their own)
  deleteNote: async (noteId: string): Promise<void> => {
    assertValidParam(noteId, 'noteId');
    await axiosInstance.delete(`/notes/${noteId}`);
  }
};