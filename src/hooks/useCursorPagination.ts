/**
 * 🔄 CURSOR PAGINATION HOOK (SIMPLIFIED)
 * 
 * Manages cursor-based pagination state for infinite scroll / load-more patterns.
 * Works alongside existing offset pagination (page/limit).
 * 
 * FEATURES:
 * - Cursor state management
 * - Automatic cleanup on unmount
 * - Memory-efficient state management
 * 
 * SAFETY:
 * - Tracks loading state
 * - Resets cursor on filter/sort changes
 * - Stores nextCursor from server response
 * 
 * USAGE:
 * const {
 *   cursor,
 *   hasNextPage,
 *   isLoading,
 *   updateFromResponse,
 *   setLoading,
 *   reset
 * } = useCursorPagination();
 */

import { useCallback, useState } from "react";

interface CursorState {
  cursor: string | undefined;
  hasNextPage: boolean;
  isLoading: boolean;
}

export function useCursorPagination(initialCursor?: string) {
  const [state, setState] = useState<CursorState>({
    cursor: initialCursor,
    hasNextPage: true,
    isLoading: false
  });

  /**
   * Update cursor and hasNextPage from API response meta
   */
  const updateFromResponse = useCallback(
    (meta: { nextCursor?: string; hasNextPage?: boolean } | undefined) => {
      if (!meta) return;

      setState((prev) => ({
        ...prev,
        cursor: meta.nextCursor,
        hasNextPage: meta.hasNextPage ?? false,
        isLoading: false
      }));
    },
    []
  );

  /**
   * Mark loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading: loading
    }));
  }, []);

  /**
   * Reset cursor when filters/sort changes
   * Called when query conditions change to avoid stale data
   */
  const reset = useCallback(() => {
    setState({
      cursor: undefined,
      hasNextPage: true,
      isLoading: false
    });
  }, []);

  return {
    cursor: state.cursor,
    hasNextPage: state.hasNextPage,
    isLoading: state.isLoading,
    updateFromResponse,
    setLoading,
    reset
  };
}
