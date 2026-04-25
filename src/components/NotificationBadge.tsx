import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchNotifications,
  fetchUnreadCount,
} from "../store/slices/notifications.slice";

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

export function NotificationBadge() {
  const dispatch = useAppDispatch();
  const { unreadCount, notifications, loading } = useAppSelector(
    (state) => state.notifications,
  );
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const recentNotifications = useMemo(
    () => notifications.slice(0, 5),
    [notifications],
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

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-950">
          <div className="border-b border-slate-200 px-3 py-2 dark:border-white/10">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Notifications
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {label} unread
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && recentNotifications.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                Loading notifications...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                No notifications
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="max-h-12 border-b border-slate-100 px-3 py-2 last:border-b-0 dark:border-white/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {notification.title}
                    </p>
                    <p className="shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                    {notification.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
