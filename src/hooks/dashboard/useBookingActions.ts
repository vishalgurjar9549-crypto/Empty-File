/**
 * useBookingActions
 * 
 * Manages booking-related state and actions:
 * - Booking confirm modal state
 * - Approve/reject booking logic
 * - Booking status updates
 */

import { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { updateBookingStatus } from "../../store/slices/bookings.slice";
import { fetchOwnerBookings, fetchOwnerSummary } from "../../store/slices/owner.slice";
import { Booking } from "../../types/api.types";

export function useBookingActions() {
  const dispatch = useAppDispatch();

  // ========== STATE ==========
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
    action: "approve" | "reject";
  }>({
    isOpen: false,
    booking: null,
    action: "approve",
  });

  // ========== HANDLERS ==========

  /**
   * Initiate a booking action (approve or reject)
   * Opens the confirmation modal
   */
  const initiateBookingAction = (booking: Booking, action: "approve" | "reject") => {
    setConfirmModal({
      isOpen: true,
      booking,
      action,
    });
  };

  /**
   * Confirm and execute the booking action
   * Updates booking status and refreshes data
   */
  const handleConfirmBookingAction = () => {
    if (!confirmModal.booking) return;

    const { id } = confirmModal.booking;
    const { action } = confirmModal;
    const statusToSet = action === "approve" ? "approved" : "rejected";

    // Close modal immediately
    setConfirmModal((prev) => ({
      ...prev,
      isOpen: false,
    }));

    // Dispatch update
    dispatch(
      updateBookingStatus({
        id,
        data: {
          status: statusToSet,
        },
      }),
    ).then((result) => {
      if (updateBookingStatus.fulfilled.match(result)) {
        // Wait 2 seconds before refreshing to ensure backend is updated
        setTimeout(() => {
          dispatch(fetchOwnerBookings());
          dispatch(fetchOwnerSummary());
        }, 2000);
      } else {
        // Refresh immediately on error for UI consistency
        dispatch(fetchOwnerBookings());
      }
    });
  };

  /**
   * Close the confirmation modal without taking action
   */
  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  return {
    // State
    confirmModal,

    // Setters
    setConfirmModal,

    // Handlers
    initiateBookingAction,
    handleConfirmBookingAction,
    closeConfirmModal,
  };
}
