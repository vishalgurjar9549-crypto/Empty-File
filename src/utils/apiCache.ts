/**
 * Simple in-memory API cache for frontend
 * Prevents duplicate API calls within TTL window
 * 
 * Usage:
 * const cities = await cachedFetch('cities', () => fetchCities(), 5 * 60 * 1000)
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Get or fetch data with intelligent caching
 * @param key - Unique cache key
 * @param fetchFn - Function that fetches the data
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 * @returns Cached or freshly fetched data
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000, // 5 minutes default
): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key);

  // Return cached data if still valid
  if (entry && now - entry.timestamp < entry.ttl) {
    console.debug(`[Cache HIT] ${key} (${Math.round((entry.ttl - (now - entry.timestamp)) / 1000)}s remaining)`);
    return entry.data;
  }

  // Log cache miss
  entry && console.debug(`[Cache EXPIRED] ${key}`);
  !entry && console.debug(`[Cache MISS] ${key}`);

  try {
    // Fetch fresh data
    const data = await fetchFn();

    // Store in cache
    cache.set(key, {
      data,
      timestamp: now,
      ttl,
    });

    console.debug(`[Cache SET] ${key} (TTL: ${Math.round(ttl / 1000)}s)`);
    return data;
  } catch (error) {
    // If fetch fails and we have stale cache, return it
    if (entry) {
      console.warn(`[Cache FALLBACK] ${key} - using stale data after fetch error`);
      return entry.data;
    }
    throw error;
  }
}

/**
 * Manually clear specific cache entry
 */
export function clearCache(key: string): void {
  if (cache.has(key)) {
    cache.delete(key);
    console.debug(`[Cache CLEARED] ${key}`);
  }
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cache.clear();
  console.debug(`[Cache CLEARED ALL]`);
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl,
      isExpired: Date.now() - entry.timestamp >= entry.ttl,
    })),
  };
}
