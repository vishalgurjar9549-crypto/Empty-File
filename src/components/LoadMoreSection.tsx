/**
 * 📋 PRODUCTION-GRADE LOAD MORE COMPONENT
 * 
 * Features:
 * 1. Manual "Load More" button (pagination mode)
 * 2. Automatic infinite scroll (optional mode)
 * 3. Error handling with retry capability
 * 4. "No more data" indicator
 * 5. Request cancellation on unmount
 * 6. Loading states and spinner
 * 
 * SAFE PATTERNS:
 * - Cursor resets when filters/sort changes
 * - Prevents duplicate requests (tracks loading state)
 * - Appends results WITHOUT breaking pagination
 * - Compatible with existing page/limit pagination
 * - Network error handling with retry
 * 
 * PERFORMANCE:
 * - Optimized for 100k+ listings
 * - Request cancellation prevents memory leaks
 * - Automatic cleanup on unmount
 */

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchRoomsWithCursor } from "../store/slices/rooms.slice";
import { useCursorPagination } from "../hooks/useCursorPagination";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { RoomFilters, PaginationMeta } from "../types/api.types";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { roomsRequestTracker } from "../utils/requestManagement";

interface LoadMoreSectionProps {
  /** Current pagination metadata with nextCursor and hasNextPage */
  meta: PaginationMeta | null;
  /** Is currently loading more results */
  loading: boolean;
  /** Current active filters (used to detect changes) */
  currentFilters: RoomFilters | undefined;
  /** Enable automatic infinite scroll vs manual button */
  enableInfiniteScroll?: boolean;
  /** Callback when manual load more is clicked */
  onLoadMore?: () => void;
}

export function LoadMoreSection({
  meta,
  loading,
  currentFilters,
  enableInfiniteScroll = false,
  onLoadMore
}: LoadMoreSectionProps) {
  const dispatch = useAppDispatch();
  const { cursor, hasNextPage, isLoading, updateFromResponse, setLoading, reset } =
    useCursorPagination();

  // ✅ ERROR HANDLING: Track fetch errors and retry state
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const roomsError = useAppSelector((state) => state.rooms.error);

  // ✅ CLEANUP: Cancel rooms requests on unmount (scoped to rooms feature)
  useEffect(() => {
    return () => {
      // Cancel only rooms-related requests when component unmounts
      roomsRequestTracker.cancelRequest("load-more");
    };
  }, []);

  // Track previous filters to detect changes
  useEffect(() => {
    // When filters/sort changes, reset cursor to prevent stale data
    reset();
    setError(null);
    setRetryCount(0);
  }, [currentFilters?.city, currentFilters?.sort, currentFilters?.roomType, reset]);

  // Update cursor state from server response
  useEffect(() => {
    updateFromResponse(meta);
  }, [meta, updateFromResponse]);

  // ✅ ERROR MONITORING: Watch for fetch errors from Redux
  useEffect(() => {
    if (roomsError && loading === false) {
      setError(roomsError);
    }
  }, [roomsError, loading]);

  // ✅ SYNC LOADING STATE: Keep hook's isLoading in sync with Redux loading
  useEffect(() => {
    if (loading) {
      setLoading(true);
    }
  }, [loading, setLoading]);

  /**
   * Handle load more (with cursor)
   * Called by button click or intersection observer
   * Includes retry logic for network failures
   */
  const handleLoadMore = useCallback(async () => {
    // ✅ SAFETY: Prevent duplicate requests
    if (isLoading || !meta?.nextCursor || !hasNextPage) {
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch next page with cursor
    // Pass all current filters PLUS the cursor param
    const updatedFilters: RoomFilters = {
      ...currentFilters,
      cursor: meta.nextCursor
    };

    try {
      const result = await dispatch(fetchRoomsWithCursor(updatedFilters) as any);

      // ✅ ERROR CHECK: Redux action result
      if (result.type === fetchRoomsWithCursor.rejected.type) {
        throw new Error(result.payload || "Failed to load more rooms");
      }

      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load more rooms";
      setError(errorMsg);
      setRetryCount((prev) => prev + 1);

      // Log error for diagnostics
      console.error("[LoadMore] Error:", {
        message: errorMsg,
        retryCount: retryCount + 1,
        cursor: meta?.nextCursor
      });
    }
  }, [isLoading, meta?.nextCursor, hasNextPage, currentFilters, dispatch, setLoading, retryCount]);

  // ✅ Infinite scroll: auto-load when user scrolls to bottom
  const { ref } = useIntersectionObserver({
    onVisible: handleLoadMore,
    enabled: enableInfiniteScroll && !error,
    threshold: 0,
    rootMargin: "200px" // Load 200px before user reaches bottom
  });

  // ✅ UI STATE 1: No more results
  if (!hasNextPage && !error) {
    return (
      <div className="flex justify-center py-8 text-gray-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={20} className="text-green-600" />
          <p className="text-gray-600">No more properties to load</p>
        </div>
      </div>
    );
  }

  // ✅ UI STATE 2: Error occurred
  if (error) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Failed to load more properties</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleLoadMore}
                  disabled={loading || !meta?.nextCursor}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Retrying..." : `Retry (Attempt ${retryCount})`}
                </button>
                {retryCount >= 3 && (
                  <div className="text-xs text-red-600 py-2">
                    Max retries reached. Check your connection.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ UI STATE 3: Manual load more button
  if (!enableInfiniteScroll) {
    return (
      <div className="flex justify-center py-8">
        <button
          onClick={handleLoadMore}
          disabled={loading || !meta?.nextCursor}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Loading properties...</span>
            </>
          ) : (
            <>
              <ChevronDown size={20} />
              <span>Load More Properties</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // ✅ UI STATE 4: Infinite scroll - invisible trigger zone at bottom
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Trigger zone for IntersectionObserver */}
      <div
        ref={ref}
        className="w-full min-h-[20px] flex justify-center"
      >
        {loading && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading more properties...</span>
          </div>
        )}
      </div>
      
      {/* Fallback manual button when trigger might not work */}
      {hasNextPage && !loading && (
        <button
          onClick={handleLoadMore}
          disabled={!meta?.nextCursor || isLoading}
          className="flex items-center gap-2 px-6 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronDown size={16} />
          <span>Load More</span>
        </button>
      )}
    </div>
  );
}

