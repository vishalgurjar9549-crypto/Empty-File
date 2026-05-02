/**
 * Services Index
 * 
 * Central export point for all services.
 * Provides clean API for hooks and components.
 * 
 * BaseService provides:
 * - Consistent error handling and logging
 * - Optional request deduplication
 * - Optional response caching with TTL
 * 
 * All services inherit from BaseService for:
 * ✓ Consistent error logging
 * ✓ Request deduplication (prevents duplicate in-flight requests)
 * ✓ Response caching (configurable per service)
 * ✓ Cache invalidation helpers
 */

export { BaseService, type BaseServiceConfig } from './BaseService';
export { ownerService } from './ownerService';
export { propertyService } from './propertyService';
export { bookingService } from './bookingService';
export { notificationService } from './notificationService';
