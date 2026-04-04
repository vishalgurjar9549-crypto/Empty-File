import axiosInstance from './axios';
import { ApiResponse, AppNotification, NotificationsResponse } from '../types/api.types';

export const notificationsApi = {
  getMyNotifications: async (): Promise<NotificationsResponse> => {
    const response = await axiosInstance.get<ApiResponse<AppNotification[]>>('/notifications/me');
    return {
      data: response.data.data,
      meta: response.data.meta as NotificationsResponse['meta']
    };
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await axiosInstance.get<ApiResponse<{
      unreadCount: number;
    }>>('/notifications/unread');
    return response.data.data.unreadCount;
  },

  markAsRead: async (id: string): Promise<AppNotification> => {
    const response = await axiosInstance.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`);
    return response.data.data;
  }
};
