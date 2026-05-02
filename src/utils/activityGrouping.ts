/**
 * Activity Feed Grouping Utilities
 * Extract and group activity/notification data
 */

import { OwnerActivityItem, AppNotification } from '../types/api.types';
import { ActivityItem, NotificationItem } from './dashboardHelpers';

export function buildGroupedActivityFeed(
  activityItems: OwnerActivityItem[],
): ActivityItem[] {
  const grouped = new Map<string, ActivityItem>();

  activityItems.forEach((activity) => {
    const key = `${activity.propertyId}:${activity.type}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.count += 1;
      existing.sourceIds.push(activity.id);
      if (
        new Date(activity.createdAt).getTime() >
        new Date(existing.createdAt).getTime()
      ) {
        existing.createdAt = activity.createdAt;
      }
      return;
    }

    grouped.set(key, {
      id: key,
      type: activity.type,
      propertyId: activity.propertyId,
      propertyTitle: activity.propertyTitle,
      createdAt: activity.createdAt,
      count: 1,
      sourceIds: [activity.id],
    });
  });

  return Array.from(grouped.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function buildGroupedNotifications(
  notificationItems: AppNotification[],
): NotificationItem[] {
  const grouped = new Map<string, NotificationItem>();

  notificationItems.forEach((notification) => {
    const eventType = notification.payload?.eventType;
    const propertyId = notification.payload?.propertyId;
    const key =
      eventType && propertyId
        ? `${propertyId}:${eventType}`
        : `notification:${notification.id}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.count += 1;
      existing.sourceIds.push(notification.id);
      if (!notification.isRead) {
        existing.unreadIds.push(notification.id);
        existing.isRead = false;
      }
      if (
        new Date(notification.createdAt).getTime() >
        new Date(existing.createdAt).getTime()
      ) {
        existing.createdAt = notification.createdAt;
      }
      return;
    }

    grouped.set(key, {
      id: key,
      type: notification.type,
      propertyId,
      propertyTitle: notification.payload?.propertyTitle,
      createdAt: notification.createdAt,
      count: 1,
      sourceIds: [notification.id],
      unreadIds: notification.isRead ? [] : [notification.id],
      isRead: notification.isRead,
      eventType,
      message: notification.message,
    });
  });

  return Array.from(grouped.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
