import { useRef, useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { AppNotification } from "../../types/api.types";
import { notificationService } from "../../services";
import {
  buildGroupedNotifications,
  NotificationItem,
} from "../../utils/activityGrouping";
import {
  getNotificationLead,
  getActivityCopy,
  formatActivityTime,
} from "../../utils/dashboardHelpers";
import { useAppDispatch } from "../../store/hooks";
import { showToast } from "../../store/slices/ui.slice";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nowMs: number;
  onNotificationClick?: (notification: NotificationItem) => void;
}

export function NotificationPanel({
  isOpen,
  onClose,
  nowMs,
  onNotificationClick,
}: NotificationPanelProps) {
  const dispatch = useAppDispatch();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [newNotificationIds, setNewNotificationIds] = useState<string[]>([]);
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());

  const flashNewIds = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setNewNotificationIds((current) => Array.from(new Set([...current, ...ids])));
    window.setTimeout(() => {
      setNewNotificationIds((current) => current.filter((id) => !ids.includes(id)));
    }, 4500);
  }, []);

  const loadNotifications = useCallback(
    async (initialLoad: boolean = false) => {
      setIsLoading(initialLoad);
      try {
        const result = await notificationService.getMyNotifications();
        const nextIds = new Set(result.data.map((item) => item.id));
        const newIds =
          previousNotificationIdsRef.current.size === 0
            ? []
            : result.data
                .filter((item) => !previousNotificationIdsRef.current.has(item.id))
                .map((item) => item.id);

        previousNotificationIdsRef.current = nextIds;
        setNotifications(result.data);
        setUnreadCount(result.meta.unreadCount);
        flashNewIds(newIds);
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [flashNewIds],
  );

  useEffect(() => {
    if (isOpen) {
      loadNotifications(true);
    }
  }, [isOpen, loadNotifications]);

  const handleNotificationClick = useCallback(
    async (notification: NotificationItem) => {
      if (!notification.isRead && notification.unreadIds.length > 0) {
        try {
          const updatedNotifications = await Promise.all(
            notification.unreadIds.map((id) => notificationService.markAsRead(id)),
          );

          const updatedMap = new Map(
            updatedNotifications.map((item) => [item.id, item]),
          );

          setNotifications((current) =>
            current.map((item) => updatedMap.get(item.id) || item),
          );
          setUnreadCount((current) =>
            Math.max(0, current - notification.unreadIds.length),
          );
        } catch {
          dispatch(
            showToast({
              message: "Failed to mark notification as read",
              type: "error",
            }),
          );
        }
      }

      onNotificationClick?.(notification);
      onClose();
    },
    [dispatch, onClose, onNotificationClick],
  );

  const groupedNotifications = buildGroupedNotifications(notifications);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => onClose()}
        />
      )}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[calc(100vw-1.5rem)] sm:w-[280px] md:w-[320px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl z-30 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-navy dark:text-white text-sm">
                  Notifications
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Latest owner activity on your properties
                </p>
              </div>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-300">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-14 rounded-xl bg-slate-100 dark:bg-slate-700 animate-pulse"
                  />
                ))}
              </div>
            ) : groupedNotifications.length > 0 ? (
              groupedNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-700/70 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all duration-500 ${
                    notification.isRead ? "" : "bg-amber-50/50 dark:bg-amber-500/5"
                  } ${
                    notification.sourceIds.some((id) =>
                      newNotificationIds.includes(id),
                    )
                      ? "ring-1 ring-emerald-200 dark:ring-emerald-800 bg-emerald-50/70 dark:bg-emerald-900/10 animate-pulse"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-base leading-none mt-0.5">
                      {getNotificationLead(notification)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        {!notification.isRead && (
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-rose-500 flex-shrink-0" />
                        )}
                        <p
                          className={`text-sm text-slate-800 dark:text-slate-100 ${
                            notification.isRead
                              ? "font-medium"
                              : "font-semibold"
                          }`}
                        >
                          {notification.eventType
                            ? getActivityCopy({
                                type: notification.eventType as any,
                                count: notification.count,
                              })
                            : notification.message}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatActivityTime(notification.createdAt, nowMs)}
                      </p>
                      {notification.propertyTitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                          {notification.propertyTitle}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No activity yet — your property is live and waiting.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
