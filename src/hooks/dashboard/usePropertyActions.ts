/**
 * usePropertyActions
 * 
 * Manages property-related state and actions:
 * - Edit property modal state
 * - Resubmit for review modal state
 * - View feedback modal state
 * - Notifications dropdown state
 * - Toggle room status action
 * - Resubmit for review logic
 */

import { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { fetchOwnerRooms } from "../../store/slices/owner.slice";
import { fetchOwnerSummary } from "../../store/slices/owner.slice";
import { toggleRoomStatus } from "../../store/slices/rooms.slice";
import { showToast } from "../../store/slices/auth.slice";
import { Room } from "../../types/api.types";
import { propertyService } from "../../services";

export function usePropertyActions() {
  const dispatch = useAppDispatch();

  // ========== STATE ==========
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [resubmitModal, setResubmitModal] = useState<{
    isOpen: boolean;
    room: Room | null;
  }>({
    isOpen: false,
    room: null,
  });
  const [viewingFeedback, setViewingFeedback] = useState<Room | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // ========== HANDLERS ==========

  /**
   * Toggle a property's active/inactive status
   */
  const handleToggleStatus = (id: string) => {
    dispatch(toggleRoomStatus(id)).then(() => {
      dispatch(fetchOwnerRooms());
    });
  };

  /**
   * Resubmit a property for review after corrections
   */
  const handleResubmit = async (roomId: string) => {
    try {
      await propertyService.resubmitForReview(roomId);
      dispatch(
        showToast({
          message: "Property resubmitted successfully!",
          type: "success",
        })
      );
      setResubmitModal({ isOpen: false, room: null });
      setViewingFeedback(null);
      dispatch(fetchOwnerRooms());
      dispatch(fetchOwnerSummary());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to resubmit";
      dispatch(
        showToast({
          message: errorMessage,
          type: "error",
        })
      );
      setResubmitModal({ isOpen: false, room: null });
    }
  };

  /**
   * Open edit modal for a property
   */
  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
  };

  /**
   * Close edit modal and refresh rooms
   */
  const closeEditRoom = () => {
    setEditingRoom(null);
    dispatch(fetchOwnerRooms());
  };

  /**
   * Open resubmit modal
   */
  const openResubmitModal = (room: Room) => {
    setResubmitModal({ isOpen: true, room });
  };

  /**
   * Close resubmit modal
   */
  const closeResubmitModal = () => {
    setResubmitModal({ isOpen: false, room: null });
  };

  /**
   * Open feedback viewing modal
   */
  const openViewFeedback = (room: Room) => {
    setViewingFeedback(room);
  };

  /**
   * Close feedback modal and clear editing/resubmit state
   */
  const closeViewFeedback = () => {
    setViewingFeedback(null);
  };

  /**
   * Handle edit button click from feedback modal
   */
  const handleEditFromFeedback = (room: Room) => {
    setViewingFeedback(null);
    setEditingRoom(room);
  };

  /**
   * Handle resubmit from feedback modal
   */
  const handleResubmitFromFeedback = (room: Room) => {
    openResubmitModal(room);
  };

  return {
    // State
    editingRoom,
    resubmitModal,
    viewingFeedback,
    isNotificationsOpen,

    // Setters
    setEditingRoom,
    setResubmitModal,
    setViewingFeedback,
    setIsNotificationsOpen,

    // Handlers
    handleToggleStatus,
    handleResubmit,
    openEditRoom,
    closeEditRoom,
    openResubmitModal,
    closeResubmitModal,
    openViewFeedback,
    closeViewFeedback,
    handleEditFromFeedback,
    handleResubmitFromFeedback,
  };
}
