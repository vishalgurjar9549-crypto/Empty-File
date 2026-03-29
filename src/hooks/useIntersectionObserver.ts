/**
 * 🔍 INTERSECTION OBSERVER HOOK
 * 
 * Automatically triggers callback when element enters viewport.
 * Used for infinite scroll / "load more when user scrolls to bottom" pattern.
 * 
 * SAFETY:
 * - Cleanup on unmount
 * - Prevents multiple triggers
 * - Optional threshold/delay configuration
 * 
 * USAGE:
 * const { ref, isVisible } = useIntersectionObserver({
 *   onVisible: () => loadMore(),
 *   threshold: 0.1
 * });
 * 
 * return <div ref={ref}>Load more trigger zone</div>;
 */

import { useEffect, useRef, useCallback } from "react";

interface UseIntersectionObserverOptions {
  onVisible?: () => void;
  threshold?: number | number[];
  rootMargin?: string;
  enabled?: boolean;
}

export function useIntersectionObserver({
  onVisible,
  threshold = 0,
  rootMargin = "100px",
  enabled = true
}: UseIntersectionObserverOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Skip if disabled or no element
    if (!enabled || !ref.current) return;

    // ✅ SAFETY: Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && onVisible) {
            onVisible();
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(ref.current);

    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [onVisible, threshold, rootMargin, enabled]);

  return { ref };
}
