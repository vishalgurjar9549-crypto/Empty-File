import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, X, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
} from "../store/slices/notifications.slice";
import { useNavigate } from "react-router-dom";

const NOTIFICATION_REFRESH_MS = 45 * 1000;

const formatNotificationTime = (createdAt: string) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

/**
 * ✅ ENHANCED Notification Badge Component
 * 
 * Features:
 * - Shows badge with unread count (capped at 99+)
 * - Click opens dropdown with last 5 notifications
 * - Each notification item is clickable to mark as read
 * - Optimistic UI updates (mark as read immediately)
 * - Reduces unread count instantly
 * - Auto-refresh every 45s
 * - Smart stale time checks (60s)
 * - Navigate to property/contact/booking based on type
 */
export function NotificationBadgeEnhanced() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { unreadCount, notifications, loading } = useAppSelector(
    (state) => state.notifications
  );
  const [isOpen, setIsOpen] = useState(false);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const recentNotifications = useMemo(
    () => notifications.slice(0, 5),
    [notifications]
  );

  useEffect(() => {
    dispatch(fetchUnreadCount());

    const refreshUnreadCount = window.setInterval(() => {
      dispatch(fetchUnreadCount());
    }, NOTIFICATION_REFRESH_MS);

    return () => {
      window.clearInterval(refreshUnreadCount);
    };
  }, [dispatch]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  if (unreadCount <= 0) {
    return null;
  }

  const label = unreadCount > 99 ? "99+" : unreadCount.toString();

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      dispatch(fetchNotifications());
    }
  };

  /**
   * ✅ CRITICAL: Handle notification click
   * 
   * Behavior:
   * 1. Mark as read immediately (optimistic update)
   * 2. Reduce unread count instantly
   * 3. Close dropdown after brief delay
   * 4. Navigate based on notification type
   */
  const handleNotificationClick = async (notificationId: string) => {
    console.debug(`[NotificationBadgeEnhanced] Clicked notification: ${notificationId}`);

    // ✅ Prevent duplicate clicks
    if (markingIds.has(notificationId)) {
      console.debug(`[NotificationBadgeEnhanced] Already marking ${notificationId}, skipping`);
      return;
    }

    // ✅ Add to marking set
    setMarkingIds((prev) => new Set(prev).add(notificationId));

    try {
      // ✅ Get the notification to extract type/data for routing
      const notification = notifications.find((n) => n.id === notificationId);
      if (!notification) {
        console.warn(`[NotificationBadgeEnhanced] Notification not found: ${notificationId}`);
        return;
      }

      // ✅ Mark as read (optimistic - updates UI immediately)
      console.debug(`[NotificationBadgeEnhanced] Marking ${notificationId} as read`);
      await dispatch(markNotificationAsRead(notificationId));

      // ✅ Close dropdown after brief animation
      setTimeout(() => {
        setIsOpen(false);
      }, 150);

      // ✅ Navigate based on notification type
      console.debug(`[NotificationBadgeEnhanced] Routing notification type: ${notification.type}`);
      handleNotificationNavigation(notification);
    } catch (error) {
      console.error(`[NotificationBadgeEnhanced] Error marking as read:`, error);
    } finally {
      // ✅ Remove from marking set
      setMarkingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  /**
   * ✅ Route notification to relevant page
   */
  const handleNotificationNavigation = (notification: any) => {
    const type = notification.type?.toLowerCase() || "";

    // Get related IDs from metadata
    const propertyId = notification.metadata?.propertyId;
    const bookingId = notification.metadata?.bookingId;
    const contactId = notification.metadata?.contactId;

    console.debug(`[NotificationBadgeEnhanced] Navigation type=${type}, propertyId=${propertyId}, bookingId=${bookingId}, contactId=${contactId}`);

    if (type.includes("property") && propertyId) {
      // ✅ Navigate to property
      navigate(`/dashboard?propertyId=${propertyId}`);
    } else if (type.includes("booking") && bookingId) {
      // ✅ Navigate to bookings tab
      navigate(`/dashboard?tab=bookings&bookingId=${bookingId}`);
    } else if (type.includes("contact") && contactId) {
      // ✅ Navigate to contacts/leads
      navigate(`/dashboard?tab=contacts&contactId=${contactId}`);
    } else {
      // ✅ Default: stay on dashboard
      console.debug(`[NotificationBadgeEnhanced] No specific navigation for type: ${type}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-gold/30 hover:text-gold dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        aria-label={`${label} unread notifications`}
        aria-expanded={isOpen}
        title={`${label} unread notifications`}
      >
        <Bell className="h-4 w-4" />
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-gold px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-black ring-2 ring-white dark:ring-slate-950">
          {label}
        </span>
      </button>

      {/* ✅ DROPDOWN PANEL */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-96 max-w-[calc(100vw-16px)] overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950 transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="border-b border-slate-200/30 px-5 py-4 dark:border-white/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Notifications
                </p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {label} unread
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && recentNotifications.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-gold dark:border-slate-600 dark:border-t-gold mb-3" />
                <p className="font-medium">Loading notifications...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  No notifications yet
                </p>
              </div>
            ) : (
              recentNotifications.map((notification, index) => {
                const isMarking = markingIds.has(notification.id);
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    disabled={isMarking}
                    className={`w-full border-b border-slate-100/50 px-5 py-4 text-left transition-all hover:bg-slate-50/80 disabled:opacity-50 dark:border-white/5 dark:hover:bg-slate-800/40 ${
                      index === recentNotifications.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                          {notification.title}
                        </p>
                        <p className="mt-1.5 text-[11px] leading-snug text-slate-600 dark:text-slate-400">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 pt-0.5 flex-shrink-0">
                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                        {!notification.isRead && (
                          <div
                            className="h-2 w-2 rounded-full bg-gold shadow-sm"
                            title="Unread notification"
                          />
                        )}
                      </div>
                    </div>
                    {isMarking && (
                      <p className="mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        Marking as read...
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer - View All Link */}
          {notifications.length > 5 && (
            <div className="border-t border-slate-100/50 px-5 py-3.5 dark:border-white/5 bg-slate-50/30 dark:bg-slate-900/20">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/notifications");
                }}
                className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-gold hover:text-gold/90 transition-colors py-1"
              >
                View all notifications
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
