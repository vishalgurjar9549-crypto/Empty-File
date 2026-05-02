/**
 * Owner Service
 * 
 * Centralizes all owner-related API calls.
 * - Dashboard summary
 * - Owner's rooms
 * - Owner's bookings
 * - Recent activity
 * - Property notes
 */

import { BaseService } from './BaseService';
import { ownerApi } from '../api/owner.api';
import { OwnerSummary, Room, Booking, PropertyNote, OwnerActivityItem } from '../types/api.types';

class OwnerService extends BaseService {
  constructor() {
    super('OwnerService', { 
      deduplication: true,  // Prevent duplicate requests
      caching: true,        // Cache responses
      cacheTTL: 5 * 60 * 1000  // 5 minutes
    });
  }

  /**
   * Get owner dashboard summary
   */
  async getSummary(): Promise<OwnerSummary> {
    return this.execute(
      'getSummary',
      () => ownerApi.getSummary(),
      'summary' // Cache key
    );
  }

  /**
   * Get owner's rooms
   */
  async getMyRooms(): Promise<Room[]> {
    return this.execute(
      'getMyRooms',
      () => ownerApi.getMyRooms(),
      'myRooms' // Cache key
    );
  }

  /**
   * Get owner's bookings
   */
  async getMyBookings(): Promise<Booking[]> {
    return this.execute(
      'getMyBookings',
      () => ownerApi.getMyBookings(),
      'myBookings' // Cache key
    );
  }

  /**
   * Get recent activity for owner dashboard
   */
  async getRecentActivity(): Promise<OwnerActivityItem[]> {
    return this.execute(
      'getRecentActivity',
      () => ownerApi.getRecentActivity(),
      'activity' // Cache key
    );
  }

  /**
   * Clear owner rooms cache (call after property mutations: create, update, delete)
   * This ensures next fetchOwnerRooms call gets fresh data from API
   */
  clearOwnerRoomsCache(): void {
    this.invalidateCache('myRooms');
  }

  /**
   * Get property notes (read-only)
   */
  async getPropertyNotes(propertyId: string): Promise<PropertyNote[]> {
    return this.execute(
      `getPropertyNotes(${propertyId})`,
      () => ownerApi.getPropertyNotes(propertyId),
      `notes:${propertyId}` // Cache key per property
    );
  }
}

export const ownerService = new OwnerService();

