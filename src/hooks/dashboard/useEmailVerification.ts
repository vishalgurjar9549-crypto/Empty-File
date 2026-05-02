/**
 * useEmailVerification
 * 
 * Manages email verification flow:
 * - Email verification modal state
 * - Post-verification action queue
 * - Email verification handlers
 */

import { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { updateUser, getCurrentUser, showToast } from "../../store/slices/auth.slice";

export function useEmailVerification() {
  const dispatch = useAppDispatch();

  // ========== STATE ==========
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
  const [postVerifyAction, setPostVerifyAction] = useState<null | (() => void)>(null);

  // ========== HANDLERS ==========

  /**
   * Handle successful email verification
   */
  const handleEmailVerificationSuccess = () => {
    dispatch(
      updateUser({
        emailVerified: true,
      } as any),
    );
    dispatch(getCurrentUser());
    setIsEmailVerificationOpen(false);

    // Execute any queued action after verification
    const action = postVerifyAction;
    setPostVerifyAction(null);
    action?.();
  };

  /**
   * Handle email verification modal close
   */
  const handleEmailVerificationClose = () => {
    setIsEmailVerificationOpen(false);
    setPostVerifyAction(null);
  };

  /**
   * Require email verification before proceeding with an action
   * If email is verified, the action runs immediately
   * Otherwise, opens verification modal and queues the action
   */
  const requireEmailVerification = (
    isEmailVerified: boolean,
    onVerified: () => void,
  ) => {
    if (isEmailVerified) {
      onVerified();
      return;
    }

    setPostVerifyAction(() => onVerified);
    setIsEmailVerificationOpen(true);
  };

  /**
   * Handle email verification error
   */
  const handleEmailVerificationError = (error: string) => {
    dispatch(showToast({ message: error, type: "error" }));
  };

  return {
    // State
    isEmailVerificationOpen,
    postVerifyAction,

    // Setters
    setIsEmailVerificationOpen,
    setPostVerifyAction,

    // Handlers
    handleEmailVerificationSuccess,
    handleEmailVerificationClose,
    handleEmailVerificationError,
    requireEmailVerification,
  };
}
