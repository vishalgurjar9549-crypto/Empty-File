/**
 * 🚦 REQUEST MANAGEMENT UTILITY
 * 
 * Production-grade request handling with:
 * - Automatic cancellation of in-flight requests
 * - Retry logic with exponential backoff
 * - Race condition prevention
 * - Request tracking and diagnostics
 * 
 * SCENARIOS:
 * 1. User scrolls fast (multiple requests in flight)
 * 2. User changes filters/sort (old request should cancel)
 * 3. Network timeout (auto-retry with backoff)
 * 4. Critical failures (stop after max retries)
 */

/**
 * Request state tracker
 * Prevents race conditions by tracking active requests
 */
class RequestTracker {
  private activeRequests = new Map<string, AbortController>();
  private requestTimestamps = new Map<string, number>();

  /**
   * Create or get abort controller for request key
   * Cancels previous request with same key
   */
  startRequest(key: string): AbortController {
    // Cancel previous request with same key
    const existing = this.activeRequests.get(key);
    if (existing) {
      existing.abort();
    }

    const controller = new AbortController();
    this.activeRequests.set(key, controller);
    this.requestTimestamps.set(key, Date.now());

    return controller;
  }

  /**
   * Mark request as complete
   */
  completeRequest(key: string): void {
    this.activeRequests.delete(key);
    this.requestTimestamps.delete(key);
  }

  /**
   * Cancel specific request
   */
  cancelRequest(key: string): void {
    const controller = this.activeRequests.get(key);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(key);
      this.requestTimestamps.delete(key);
    }
  }

  /**
   * Cancel all active requests (on page unmount, filter change)
   */
  cancelAll(): void {
    this.activeRequests.forEach((controller) => controller.abort());
    this.activeRequests.clear();
    this.requestTimestamps.clear();
  }

  /**
   * Get active request count (for diagnostics)
   */
  getActiveCount(): number {
    return this.activeRequests.size;
  }

  /**
   * Get request age in milliseconds (for diagnostics)
   */
  getRequestAge(key: string): number | null {
    const timestamp = this.requestTimestamps.get(key);
    if (!timestamp) return null;
    return Date.now() - timestamp;
  }

  /**
   * Check if request is still active
   */
  isActive(key: string): boolean {
    return this.activeRequests.has(key);
  }
}

/**
 * Retry logic with exponential backoff
 * 
 * STRATEGY:
 * - Retry 1: wait 300ms
 * - Retry 2: wait 900ms (3x)
 * - Retry 3: wait 2700ms (3x)
 * - Max retries: 3
 */
export interface RetryOptions {
  maxRetries?: number;          // Default: 3
  baseDelayMs?: number;         // Default: 300ms
  backoffMultiplier?: number;   // Default: 3
  shouldRetry?: (error: any) => boolean; // Default: only network errors
}

/**
 * Perform async operation with retry
 * 
 * @param operation - Async function to retry
 * @param options - Retry configuration
 * @returns Result or throws after max retries
 * 
 * USE CASE: API calls that might fail temporarily
 * - Network timeouts
 * - 5xx server errors
 * - Temporary unavailability
 * 
 * EXAMPLE:
 * try {
 *   const data = await retryWithBackoff(
 *     () => api.get('/rooms?cursor=xyz'),
 *     { maxRetries: 3 }
 *   );
 * } catch (error) {
 *   // Failed after 3 retries
 * }
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 300,
    backoffMultiplier = 3,
    shouldRetry = defaultShouldRetry
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if:
      // 1. On last attempt
      // 2. Shouldn't retry this error type
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelayMs * Math.pow(backoffMultiplier, attempt);

      // Log retry attempt in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[Pagination] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Default retry predicate - retry on network/timeout errors only
 * Don't retry on 4xx client errors
 */
function defaultShouldRetry(error: any): boolean {
  // Network errors (no response from server)
  if (!error.response) {
    return true;
  }

  // Retry on 5xx server errors
  const status = error.response?.status;
  if (status >= 500) {
    return true;
  }

  // Timeout errors
  if (error.code === "ECONNABORTED") {
    return true;
  }

  // Don't retry on 4xx client errors
  return false;
}

/**
 * Combine request cancellation with retry logic
 * Full-featured request handler for production
 */
export async function fetchWithRetryAndCancel<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options?: {
    requestKey?: string;
    requestTracker?: RequestTracker;
    retryOptions?: RetryOptions;
  }
): Promise<T> {
  const { requestKey = "default", requestTracker = globalRequestTracker, retryOptions } = options || {};

  const controller = requestTracker.startRequest(requestKey);

  try {
    return await retryWithBackoff(
      () => operation(controller.signal),
      {
        ...retryOptions,
        // Add AbortError to non-retryable errors
        shouldRetry: (error) => {
          // Never retry AbortError (from cancellation)
          if (error?.name === "AbortError") {
            return false;
          }
          return (retryOptions?.shouldRetry || defaultShouldRetry)(error);
        }
      }
    );
  } finally {
    requestTracker.completeRequest(requestKey);
  }
}

/**
 * Global request tracker singleton
 * Access from anywhere in app
 */
export const globalRequestTracker = new RequestTracker();

/**
 * Scoped request tracker for rooms feature only
 * Prevents affecting other API calls
 */
export const roomsRequestTracker = new RequestTracker();

/**
 * Export RequestTracker class for advanced usage
 */
export { RequestTracker };
