/**
 * Base Service
 * 
 * Provides common functionality for all services:
 * - Consistent error handling and logging
 * - Optional request deduplication (prevents duplicate in-flight requests)
 * - Optional response caching with TTL
 * 
 * Features:
 * ✓ Type-safe wrapper methods
 * ✓ Automatic error logging with service name context
 * ✓ Request deduplication by cache key
 * ✓ Response caching with configurable TTL
 * ✓ Zero impact on existing API signatures
 */

/**
 * Cache entry with timestamp
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Service configuration
 */
export interface BaseServiceConfig {
  /** Enable request deduplication (default: true) */
  deduplication?: boolean;
  /** Enable response caching (default: false) */
  caching?: boolean;
  /** Cache TTL in milliseconds (default: 5 minutes) */
  cacheTTL?: number;
}

/**
 * BaseService - Base class for all domain services
 * 
 * Handles:
 * - Consistent error logging
 * - Request deduplication
 * - Response caching
 * 
 * Usage:
 * ```typescript
 * class MyService extends BaseService {
 *   constructor() {
 *     super('MyService', { caching: true, cacheTTL: 60000 });
 *   }
 * 
 *   async getData(): Promise<Data> {
 *     return this.execute('getData', () => api.getData());
 *   }
 * }
 * ```
 */
export abstract class BaseService {
  protected readonly serviceName: string;
  protected readonly config: Required<BaseServiceConfig>;
  
  /** Tracks in-flight requests for deduplication */
  private pendingRequests = new Map<string, Promise<any>>();
  
  /** Tracks cached responses */
  private cache = new Map<string, CacheEntry<any>>();

  constructor(serviceName: string, config: BaseServiceConfig = {}) {
    this.serviceName = serviceName;
    this.config = {
      deduplication: config.deduplication !== false,
      caching: config.caching ?? false,
      cacheTTL: config.cacheTTL ?? 5 * 60 * 1000, // 5 minutes default
    };
  }

  /**
   * Execute an async operation with error handling, deduplication, and optional caching
   * 
   * @param operationName - Name of the operation (for logging)
   * @param operation - Async function to execute
   * @param cacheKey - Optional cache key (if provided and caching enabled, result will be cached)
   * @returns Promise<T> - Operation result
   */
  protected async execute<T>(
    operationName: string,
    operation: () => Promise<T>,
    cacheKey?: string
  ): Promise<T> {
    // Check cache first (if enabled and cacheKey provided)
    if (this.config.caching && cacheKey) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Check for duplicate in-flight request (if enabled and cacheKey provided)
    if (this.config.deduplication && cacheKey) {
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        return pending as Promise<T>;
      }
    }

    try {
      // Create the promise
      const promise = operation();

      // Track pending request if deduplication enabled and cacheKey provided
      if (this.config.deduplication && cacheKey) {
        this.pendingRequests.set(cacheKey, promise);
      }

      // Await the result
      const result = await promise;

      // Cache result if caching enabled and cacheKey provided
      if (this.config.caching && cacheKey) {
        this.setCache(cacheKey, result);
      }

      return result;
    } catch (error) {
      // Consistent error logging
      this.logError(operationName, error);
      throw error;
    } finally {
      // Remove from pending requests
      if (this.config.deduplication && cacheKey) {
        this.pendingRequests.delete(cacheKey);
      }
    }
  }

  /**
   * Log error with service context
   */
  protected logError(operationName: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${this.serviceName}] ${operationName} failed:`, errorMessage);
  }

  /**
   * Get value from cache if valid
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.config.cacheTTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store value in cache
   */
  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Invalidate cache for a specific key (public method for mutation handling)
   * Call after mutations (create, update, delete) to ensure next fetch gets fresh data
   */
  public invalidateCache(key: string): void {
    this.cache.delete(key);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.serviceName}] Cache invalidated for key: ${key}`);
    }
  }

  /**
   * Manually clear cache (useful for testing or forcing refresh)
   */
  protected clearCache(): void {
    this.cache.clear();
  }

  /**
   * Manually clear a specific cache entry
   */
  protected clearCacheKey(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Get cache stats (for debugging)
   */
  protected getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
