/**
 * Property Service
 * 
 * Centralizes all property-related API calls.
 * - Resubmit property for review
 * - Update property status
 * - Property operations
 */

import { BaseService } from './BaseService';
import { roomsApi } from '../api/rooms.api';
import { Room } from '../types/api.types';

class PropertyService extends BaseService {
  constructor() {
    super('PropertyService', {
      deduplication: true,  // Prevent duplicate requests
      caching: true,        // Cache responses
      cacheTTL: 5 * 60 * 1000  // 5 minutes
    });
  }

  /**
   * Resubmit a property for review after corrections
   */
  async resubmitForReview(propertyId: string): Promise<Room> {
    // Don't cache mutations - they change state
    return this.execute(
      `resubmitForReview(${propertyId})`,
      () => roomsApi.resubmitForReview(propertyId)
      // No cache key = no caching
    );
  }

  /**
   * Toggle property active/inactive status
   */
  async toggleStatus(propertyId: string): Promise<Room> {
    // Don't cache mutations
    return this.execute(
      `toggleStatus(${propertyId})`,
      () => roomsApi.toggleRoomStatus(propertyId)
      // No cache key = no caching
    );
  }

  /**
   * Get property by ID
   */
  async getProperty(propertyId: string): Promise<Room> {
    return this.execute(
      `getProperty(${propertyId})`,
      () => roomsApi.getRoomById(propertyId),
      `property:${propertyId}` // Cache key per property
    );
  }

  /**
   * Clear property cache (e.g., after update)
   */
  clearPropertyCache(propertyId: string): void {
    this.clearCacheKey(`property:${propertyId}`);
  }

  /**
   * Clear all property-related caches
   */
  clearAllCaches(): void {
    this.clearCache();
  }
}

export const propertyService = new PropertyService();
