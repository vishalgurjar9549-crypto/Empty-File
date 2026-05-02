import { logger } from "../utils/logger";

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * ✅ CACHING LAYER FOR SCALING: In-memory cache with TTL support
 *
 * Features:
 * - Simple key-value store with automatic expiration
 * - 30-second TTL for room listings
 * - Reduces database load significantly under high traffic
 * - thread-safe through JavaScript's single-threaded nature
 *
 * Usage:
 * - Cache key is hash of filters + sort + cursor
 * - Perfect for paginated responses
 * - Automatic expiration prevents stale data
 */
export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL = 30000; // 30 seconds
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 60 seconds
    this.startCleanup();
  }

  /**
   * Generate cache key from filters and pagination
   */
  static generateKey(filters: any): string {
    const key = {
      // ✅ ADD THESE TWO (CRITICAL FIX)
      page: filters?.page || 1,
      limit: filters?.limit || 20,

      city: filters?.city || "",
      roomType: filters?.roomType || "",
      roomTypes: filters?.roomTypes ? JSON.stringify(filters.roomTypes) : "",
      idealFor: filters?.idealFor ? JSON.stringify(filters.idealFor) : "",
      genderPreference: filters?.genderPreference || "",
      minPrice: filters?.minPrice || "",
      maxPrice: filters?.maxPrice || "",
      sort: filters?.sort || "latest",

      // keep cursor also
      cursor: filters?.cursor || "",
    };

    return JSON.stringify(key);
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    logger.debug(`Cache HIT for key: ${key.substring(0, 50)}...`);
    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(key, entry);
    logger.debug(
      `Cache SET for key: ${key.substring(0, 50)}... (TTL: ${ttl}ms)`,
    );
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.cache.delete(key);
    logger.debug(`Cache CLEARED for key: ${key.substring(0, 50)}...`);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`Cache CLEARED ALL (${size} entries removed)`);
  }

  /**
   * Clear cache for specific city (when new rooms added)
   */
  clearCityCache(city: string): void {
    let cleared = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(`"city":"${city}"`)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    logger.info(`Cache cleared for city: ${city} (${cleared} entries)`);
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: string[];
  } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()).slice(0, 10), // First 10 keys
    };
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      let expiredCount = 0;
      const now = Date.now();

      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt < now) {
          this.cache.delete(key);
          expiredCount++;
        }
      }

      if (expiredCount > 0) {
        logger.debug(`Cache cleanup: removed ${expiredCount} expired entries`);
      }
    }, 60000); // Run every 60 seconds
  }

  /**
   * Stop cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Destroy cache service (cleanup)
   */
  destroy(): void {
    this.stopCleanup();
    this.cache.clear();
  }
}

// ✅ Singleton instance for application
let cacheInstance: CacheService | null = null;

export function getCacheService(): CacheService {
  if (!cacheInstance) {
    cacheInstance = new CacheService();
  }
  return cacheInstance;
}
