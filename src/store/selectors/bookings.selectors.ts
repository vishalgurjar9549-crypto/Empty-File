/**
 * Redux Selectors for Bookings
 * 
 * Consolidated bookings selectors to support safe Redux consolidation.
 * These selectors provide derived data while keeping the Redux store flexible.
 * 
 * Phase 5 (Safe Consolidation):
 * - selectMyBookings: Returns owner's received bookings filtered from bookings.slice
 * - Allows migration from owner.myBookings without removing state
 * - Enables gradual transition to single booking source of truth
 */

import { RootState } from '../store';
import { Booking } from '../../types/api.types';

/**
 * selectMyBookings - Get current owner's received bookings
 * 
 * Migration strategy:
 * - Filters bookings.bookings by current user's ID
 * - Ensures we only get bookings FOR this owner (what tenants booked)
 * - Replaces direct usage of owner.myBookings
 * 
 * @param state Redux root state
 * @returns Array of bookings received by current owner
 */
export const selectMyBookings = (state: RootState): Booking[] => {
  const user = state.auth.user;
  const allBookings = state.bookings.bookings;

  // If no user or no bookings, return empty array
  if (!user || !allBookings || allBookings.length === 0) {
    return [];
  }

  // Filter to only bookings FOR this owner (ownerId matches current user)
  // Bookings are what tenants made for this owner's properties
  return allBookings.filter((booking) => {
    // Check if booking's owner ID matches current user
    return booking.owner?.id === user.id || booking.ownerId === user.id;
  });
};

/**
 * selectTenantBookings - Get current tenant's made bookings
 * 
 * For tenants viewing their own bookings
 * 
 * @param state Redux root state
 * @returns Array of bookings made by current tenant
 */
export const selectTenantBookings = (state: RootState): Booking[] => {
  const user = state.auth.user;
  const allBookings = state.bookings.bookings;

  // If no user or no bookings, return empty array
  if (!user || !allBookings || allBookings.length === 0) {
    return [];
  }

  // Filter to only bookings made BY this tenant
  return allBookings.filter((booking) => {
    // Check if booking's tenant ID matches current user
    return booking.tenant?.id === user.id || booking.tenantId === user.id;
  });
};

/**
 * selectPendingBookings - Get pending bookings for current owner
 * 
 * @param state Redux root state
 * @returns Array of pending bookings received by owner
 */
export const selectPendingBookings = (state: RootState): Booking[] => {
  return selectMyBookings(state).filter((booking) => booking.status === 'pending');
};

/**
 * selectApprovedBookings - Get approved bookings for current owner
 * 
 * @param state Redux root state
 * @returns Array of approved bookings received by owner
 */
export const selectApprovedBookings = (state: RootState): Booking[] => {
  return selectMyBookings(state).filter((booking) => booking.status === 'approved');
};

/**
 * selectRejectedBookings - Get rejected bookings for current owner
 * 
 * @param state Redux root state
 * @returns Array of rejected bookings received by owner
 */
export const selectRejectedBookings = (state: RootState): Booking[] => {
  return selectMyBookings(state).filter((booking) => booking.status === 'rejected');
};

/**
 * selectBookingById - Get a specific booking by ID
 * 
 * @param state Redux root state
 * @param bookingId ID of booking to find
 * @returns Booking object or undefined
 */
export const selectBookingById = (state: RootState, bookingId: string): Booking | undefined => {
  return state.bookings.bookings.find((b) => b.id === bookingId);
};

/**
 * selectIsBookingPending - Check if a booking is being updated
 * 
 * Used to show loading state during approval/rejection
 * 
 * @param state Redux root state
 * @param bookingId ID of booking to check
 * @returns true if booking is being updated
 */
export const selectIsBookingPending = (state: RootState, bookingId: string): boolean => {
  return state.owner.pendingBookingUpdates.includes(bookingId);
};

/**
 * selectBookingsLoading - Get bookings loading state
 * 
 * @param state Redux root state
 * @returns true if bookings are loading
 */
export const selectBookingsLoading = (state: RootState): boolean => {
  return state.bookings.loading;
};

/**
 * selectBookingsError - Get bookings error state
 * 
 * @param state Redux root state
 * @returns Error message or null
 */
export const selectBookingsError = (state: RootState): string | null => {
  return state.bookings.error;
};
