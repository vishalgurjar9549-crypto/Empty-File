/**
 * 🔐 SAFE ROOM DEDUPLICATION UTILITY
 * 
 * Production-grade deduplication for merging paginated results.
 * Prevents duplicate room IDs when appending results from cursor-based pagination.
 * 
 * SAFETY:
 * - O(n) deduplication using Set (efficient for 100k+ items)
 * - Preserves order (first occurrence wins)
 * - Type-safe with full TypeScript
 * - Immutable (doesn't modify input)
 * 
 * SCENARIOS:
 * 1. Fast user scroll (multiple requests in flight)
 * 2. Cursor invalidation (backend data changed)
 * 3. Network retry (same cursor fetched twice)
 * 4. Filter/sort change during loading
 */

import { Room } from "../types/api.types";

/**
 * Merge rooms with automatic deduplication
 * 
 * @param existing - Current rooms in state
 * @param incoming - New rooms from API response
 * @returns Merged rooms with no duplicates (first occurrence wins)
 * 
 * PERFORMANCE:
 * - Time: O(n + m) where n = existing, m = incoming
 * - Space: O(n + m)
 * - Suitable for 100k+ items
 * 
 * EXAMPLE:
 * const merged = deduplicateAndMerge([room1, room2], [room2, room3]);
 * // Result: [room1, room2, room3] (room2 not duplicated)
 */
export function deduplicateAndMerge(
  existing: Room[],
  incoming: Room[]
): Room[] {
  // ✅ OPTIMIZATION: Create Set of existing IDs (O(n))
  const existingIds = new Set(existing.map((r) => r.id));

  // ✅ PERFORMANCE: Use single pass filter + concat
  const newRooms = incoming.filter((room) => !existingIds.has(room.id));

  // ✅ IMMUTABLE: Don't modify input arrays
  return [...existing, ...newRooms];
}

/**
 * Check if new rooms would create duplicates
 * Useful for logging/diagnostics at scale
 * 
 * @param existing - Current rooms
 * @param incoming - New rooms from API
 * @returns Count of duplicate IDs that would be filtered
 * 
 * USE CASE: Monitor for unexpected duplicates in production
 * If count > 0, indicates potential:
 * - Race conditions
 * - Cursor invalidation
 * - Concurrent requests
 */
export function countDuplicates(existing: Room[], incoming: Room[]): number {
  const existingIds = new Set(existing.map((r) => r.id));
  return incoming.filter((room) => existingIds.has(room.id)).length;
}

/**
 * Safely append rooms with duplicate detection and logging
 * Production-grade version with diagnostics
 * 
 * @param existing - Current rooms
 * @param incoming - New rooms from API
 * @param options - Configuration
 * @returns Merged rooms with optional diagnostics
 * 
 * DIAGNOSTICS:
 * - Detects duplicate IDs
 * - Logs warnings at scale
 * - Returns merge info
 * 
 * EXAMPLE:
 * const result = safeAppendWithDiagnostics(rooms, newRooms, {
 *   enableLogging: true,
 *   requestId: "req-123"
 * });
 */
export function safeAppendWithDiagnostics(
  existing: Room[],
  incoming: Room[],
  options?: {
    enableLogging?: boolean;
    requestId?: string;
    maxRooms?: number; // Alert if exceeds (prevent runaway growth)
  }
): {
  rooms: Room[];
  duplicateCount: number;
  totalCount: number;
  isHealthy: boolean;
} {
  const { enableLogging = false, requestId = "unknown", maxRooms = 50000 } = options || {};

  const duplicateCount = countDuplicates(existing, incoming);
  const merged = deduplicateAndMerge(existing, incoming);
  const totalCount = merged.length;
  const isHealthy = duplicateCount === 0 && totalCount <= maxRooms;

  // ✅ PRODUCTION LOGGING: Alert on issues
  if (enableLogging) {
    if (duplicateCount > 0) {
      console.warn(`[Pagination] Duplicates detected in request ${requestId}:`, {
        duplicate_count: duplicateCount,
        existing_count: existing.length,
        incoming_count: incoming.length,
        merged_count: merged.length,
        health: isHealthy ? "OK" : "DEGRADED"
      });
    }

    if (totalCount > maxRooms) {
      console.warn(
        `[Pagination] Memory warning: rooms list exceeds ${maxRooms} in request ${requestId}:`,
        {
          current_count: totalCount,
          max_recommended: maxRooms,
          recommendation: "Consider paginating or clearing old results"
        }
      );
    }
  }

  return {
    rooms: merged,
    duplicateCount,
    totalCount,
    isHealthy
  };
}

/**
 * Clear old rooms beyond a threshold
 * Use when list grows too large at scale
 * 
 * @param rooms - Current room list
 * @param keepNewest - How many recent items to keep (default: 200)
 * @returns Trimmed room list
 * 
 * USE CASE:
 * After 10 load-more clicks, user has 200 items.
 * Memory becomes concern with 100k+ items per load.
 * Keep newest 200, discard older ones (they can reload).
 * 
 * EXAMPLE:
 * setRooms(trimRoomList(rooms, 500));
 */
export function trimRoomList(rooms: Room[], keepNewest: number = 200): Room[] {
  if (rooms.length <= keepNewest) {
    return rooms;
  }

  // Keep the newest (last) keepNewest items
  return rooms.slice(rooms.length - keepNewest);
}

/**
 * Get unique room IDs for duplicate detection
 * Useful for debugging at scale
 * 
 * @param rooms - Room list to analyze
 * @returns Set of unique IDs
 */
export function getUniqueRoomIds(rooms: Room[]): Set<string> {
  return new Set(rooms.map((r) => r.id));
}

/**
 * Verify no duplicates in room list
 * Safety check before state update
 * 
 * @param rooms - Room list to verify
 * @returns true if all IDs are unique
 * 
 * USE CASE: Development/testing verification
 * Example:
 * if (!verifyNoDuplicates(mergedRooms)) {
 *   console.error("Duplicate IDs detected!");
 *   return; // Don't update state
 * }
 * setRooms(mergedRooms);
 */
export function verifyNoDuplicates(rooms: Room[]): boolean {
  const ids = getUniqueRoomIds(rooms);
  return ids.size === rooms.length;
}
