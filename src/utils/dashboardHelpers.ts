/**
 * Dashboard Helper Functions
 * Extracted from Dashboard1.tsx for reusability and testability
 */

import { OwnerActivityItem, AppNotification } from '../types/api.types';

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatActivityTime(createdAt: string, nowMs: number): string {
  const diffMs = Math.max(0, nowMs - new Date(createdAt).getTime());
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function getActivityCopy(
  activity: Pick<ActivityItem, "type" | "count">,
): string {
  switch (activity.type) {
    case "PROPERTY_VIEW":
      return activity.count > 1
        ? `🔥 ${activity.count} people viewed your property`
        : "🔥 Someone viewed your property";
    case "CONTACT_UNLOCK":
      return activity.count > 1
        ? `📞 ${activity.count} people unlocked your contact`
        : "📞 Someone unlocked your contact today";
    case "CONTACT_ACCESS":
      return activity.count > 1
        ? `📞 ${activity.count} people revisited your contact details`
        : "📞 Someone revisited your contact details";
    default:
      return "🔥 Someone interacted with your property";
  }
}

export function getNotificationLead(
  notification: Pick<NotificationItem, "eventType">,
): string {
  switch (notification.eventType) {
    case "PROPERTY_VIEW":
      return "🔥";
    case "CONTACT_UNLOCK":
    case "CONTACT_ACCESS":
      return "📞";
    default:
      return "🔔";
  }
}

export function isWithinMinutes(createdAt: string, minutes: number, nowMs: number) {
  return nowMs - new Date(createdAt).getTime() < minutes * 60 * 1000;
}

export function isToday(createdAt: string, nowMs: number) {
  const date = new Date(createdAt);
  const now = new Date(nowMs);
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function getRandomRefreshDelay() {
  return 20000 + Math.floor(Math.random() * 20001);
}

// Type definitions for grouped items
export type ActivityItem = {
  id: string;
  type: OwnerActivityItem["type"];
  propertyId: string;
  propertyTitle: string;
  createdAt: string;
  count: number;
  sourceIds: string[];
};

export type NotificationItem = {
  id: string;
  type: string;
  propertyId?: string;
  propertyTitle?: string;
  createdAt: string;
  count: number;
  sourceIds: string[];
  unreadIds: string[];
  isRead: boolean;
  eventType?: string;
  message: string;
};
