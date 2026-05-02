/**
 * Booking Service
 * 
 * Centralizes all booking-related API calls.
 * - Create booking
 * - Get owner's bookings
 * - Get tenant's bookings
 * - Update booking status
 */

import { BaseService } from './BaseService';
import { bookingsApi, generateIdempotencyKey } from '../api/bookings.api';
import { Booking, CreateBookingInput, UpdateBookingStatusInput } from '../types/api.types';

class BookingService extends BaseService {
  constructor() {
    super('BookingService', {
      deduplication: true,  // Prevent duplicate requests
      caching: true,        // Cache responses
      cacheTTL: 5 * 60 * 1000  // 5 minutes
    });
  }

  /**
   * Create a new booking with idempotency protection
   */
  async createBooking(
    data: CreateBookingInput,
    idempotencyKey?: string
  ): Promise<Booking> {
    // Don't cache mutations
    return this.execute(
      'createBooking',
      () => {
        const key = idempotencyKey || generateIdempotencyKey();
        return bookingsApi.createBooking(data, key);
      }
      // No cache key = no caching
    );
  }

  /**
   * Get owner's bookings (received from tenants)
   */
  async getOwnerBookings(page = 1, limit = 20): Promise<{
    bookings: Booking[];
    meta: { page: number; limit: number; total: number };
  }> {
    return this.execute(
      `getOwnerBookings(page=${page}, limit=${limit})`,
      () => bookingsApi.getOwnerBookings(page, limit),
      `ownerBookings:${page}:${limit}` // Cache key with pagination
    );
  }

  /**
   * Get tenant's bookings (made by tenant)
   */
  async getTenantBookings(page = 1, limit = 20): Promise<{
    bookings: Booking[];
    meta: { page: number; limit: number; total: number };
  }> {
    return this.execute(
      `getTenantBookings(page=${page}, limit=${limit})`,
      () => bookingsApi.getTenantBookings(page, limit),
      `tenantBookings:${page}:${limit}` // Cache key with pagination
    );
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    id: string,
    data: UpdateBookingStatusInput
  ): Promise<Booking> {
    // Don't cache mutations
    return this.execute(
      `updateBookingStatus(${id})`,
      () => bookingsApi.updateBookingStatus(id, data)
      // No cache key = no caching
    );
  }

  /**
   * Clear booking cache (e.g., after update)
   */
  clearBookingCache(): void {
    this.clearCache();
  }
}

export const bookingService = new BookingService();
