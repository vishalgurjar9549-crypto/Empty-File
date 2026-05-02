/**
 * Notification Service
 * 
 * Centralizes all notification-related API calls.
 * - Get notifications
 * - Mark as read
 * - Get unread count
 */

import { BaseService } from './BaseService';
import { notificationsApi } from '../api/notifications.api';
import { AppNotification } from '../types/api.types';

interface NotificationsResponse {
  data: AppNotification[];
  meta: {
    unreadCount: number;
  };
}

class NotificationService extends BaseService {
  constructor() {
    super('NotificationService', {
      deduplication: true,  // Prevent duplicate requests
      caching: true,        // Cache responses
      cacheTTL: 30 * 1000   // 30 seconds (more frequent updates for notifications)
    });
  }

  /**
   * Get user's notifications
   */
  async getMyNotifications(): Promise<NotificationsResponse> {
    return this.execute(
      'getMyNotifications',
      () => notificationsApi.getMyNotifications(),
      'notifications' // Cache key
    );
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    return this.execute(
      'getUnreadCount',
      () => notificationsApi.getUnreadCount(),
      'unreadCount' // Cache key
    );
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<AppNotification> {
    // Don't cache mutations
    const result = await this.execute(
      `markAsRead(${notificationId})`,
      () => notificationsApi.markAsRead(notificationId)
      // No cache key = no caching
    );
    
    // Invalidate notification lists after marking as read
    this.clearCacheKey('notifications');
    this.clearCacheKey('unreadCount');
    
    return result;
  }

  /**
   * Clear notification cache (e.g., to force refresh)
   */
  clearNotificationCache(): void {
    this.clearCache();
  }
}

export const notificationService = new NotificationService();
