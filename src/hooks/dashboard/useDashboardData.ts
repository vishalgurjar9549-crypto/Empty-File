/**
 * useDashboardData
 * 
 * Manages all data-fetching logic for the dashboard:
 * - Redux selectors for user, summary, rooms, bookings
 * - Data loading and refresh logic
 * - Derived values (pending bookings, correction count)
 * - Time-based state (nowMs for activity timestamps)
 */

import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchOwnerSummary,
  fetchOwnerRooms,
  fetchOwnerBookings,
} from "../../store/slices/owner.slice";
import { fetchCurrentSubscription } from "../../store/slices/subscription.slice";
import { selectMyBookings } from "../../store/selectors/bookings.selectors";
import { getRandomRefreshDelay } from "../../utils/dashboardHelpers";

export function useDashboardData() {
  const dispatch = useAppDispatch();

  // Redux selectors
  const { user } = useAppSelector((state) => state.auth);
  const { summary, myRooms, loading, pendingBookingUpdates } =
    useAppSelector((state) => state.owner);
  // ✅ NEW: Use consolidated selector for bookings from bookings.slice
  const myBookings = useAppSelector(selectMyBookings);

  // Derived values
  const userRole = user?.role?.toUpperCase();
  const needsCorrectionCount = myRooms.filter(
    (r) => r.reviewStatus?.toUpperCase() === "NEEDS_CORRECTION",
  ).length;
  const pendingBookings = myBookings.filter((b) => b.status === "pending");

  // State
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Refs for cleanup
  const refreshTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // ========== INTERVAL: Update timestamps every 30 seconds ==========
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  // ========== EFFECT: Fetch data on mount ==========
  useEffect(() => {
    isMountedRef.current = true;

    if (userRole === "OWNER") {
      // Fetch initial data
      dispatch(fetchOwnerSummary());
      dispatch(fetchOwnerRooms());
      dispatch(fetchOwnerBookings());

      // Schedule random refreshes
      const scheduleRefresh = () => {
        refreshTimerRef.current = window.setTimeout(async () => {
          if (!isMountedRef.current) return;
          
          setNowMs(Date.now());
          if (isMountedRef.current) {
            scheduleRefresh();
          }
        }, getRandomRefreshDelay());
      };

      scheduleRefresh();
    } else if (userRole === "TENANT") {
      dispatch(fetchCurrentSubscription());
    }

    return () => {
      isMountedRef.current = false;
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [dispatch, userRole]);

  return {
    // Redux data
    user,
    summary,
    myRooms,
    myBookings,
    loading,
    pendingBookingUpdates,

    // Derived values
    userRole,
    needsCorrectionCount,
    pendingBookings,

    // State
    nowMs,

    // Helpers
    dispatch,
  };
}
