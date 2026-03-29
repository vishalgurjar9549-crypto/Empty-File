import api from './axios';
import { ApiResponse, Booking, CreateBookingInput, UpdateBookingStatusInput, PaginationMeta } from '../types/api.types';
import { assertValidParam } from '../utils/apiGuard';

/**
 * Generates a UUID v4 for idempotency keys.
 *
 * SINGLE SOURCE OF TRUTH — Do not duplicate this function.
 * Import it wherever idempotency keys are needed:
 *   import { generateIdempotencyKey } from '../api/bookings.api';
 *
 * Uses crypto.randomUUID() (available in all modern browsers and Node 19+).
 * Fallback to manual generation for older environments.
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: manual UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETED: standalone `export const createBooking` (was dead code, zero imports)
//
// WHY IT WAS DANGEROUS:
// - Same name as the Redux thunk in bookings.slice.ts
// - Untyped `data: any` parameter bypassed CreateBookingInput validation
// - Returned raw `response.data` instead of unwrapped `response.data.data`
// - Its existence invited accidental import by future developers
//
// The ONLY way to create a booking is now through bookingsApi.createBooking()
// which enforces typed input, roomId validation, and Idempotency-Key header.
// ─────────────────────────────────────────────────────────────────────────────

export const bookingsApi = {
  /**
   * Create a booking with idempotency protection.
   *
   * CRITICAL: This is the ONLY booking creation function in the codebase.
   * It ALWAYS attaches the Idempotency-Key header. If no key is provided,
   * one is auto-generated as a safety net — but callers SHOULD pass their
   * own key to enable retry semantics (same key = safe retry).
   *
   * @param data - Typed booking input (roomId validated via assertValidParam)
   * @param idempotencyKey - UUID v4 for exactly-once processing
   */
  createBooking: async (data: CreateBookingInput, idempotencyKey?: string): Promise<Booking> => {
    assertValidParam(data.roomId, 'roomId');
    const key = idempotencyKey || generateIdempotencyKey();
    const response = await api.post<ApiResponse<Booking>>('/bookings', data, {
      headers: {
        'Idempotency-Key': key
      }
    });
    return response.data.data;
  },
  // Get tenant's bookings
  getTenantBookings: async (page = 1, limit = 20): Promise<{
    bookings: Booking[];
    meta: PaginationMeta;
  }> => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings/my', {
      params: {
        page,
        limit
      }
    });
    return {
      bookings: response.data.data,
      meta: response.data.meta || {
        page,
        limit,
        total: response.data.data.length
      }
    };
  },
  // Get owner's bookings
  getOwnerBookings: async (page = 1, limit = 20): Promise<{
    bookings: Booking[];
    meta: PaginationMeta;
  }> => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings/owner', {
      params: {
        page,
        limit
      }
    });
    return {
      bookings: response.data.data,
      meta: response.data.meta || {
        page,
        limit,
        total: response.data.data.length
      }
    };
  },
  // Update booking status (owner only)
  updateBookingStatus: async (id: string, data: UpdateBookingStatusInput): Promise<Booking> => {
    assertValidParam(id, 'bookingId');
    const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, data);
    return response.data.data;
  }
};