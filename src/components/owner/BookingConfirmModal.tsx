import {
  X,
  AlertTriangle,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "../ui/Button";
import { Booking } from "../../types/api.types";
import FullscreenLoader from "../../components/ui/Loader";

interface BookingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: Booking | null;
  action: "approve" | "reject";
  propertyTitle: string;
  loading: boolean;
}

export function BookingConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  booking,
  action,
  propertyTitle,
  loading
}: BookingConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const isApprove = action === "approve";

  /* ---------------- SCROLL LOCK ---------------- */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ---------------- ESC CLOSE ---------------- */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  /* ---------------- FOCUS ---------------- */
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  if (loading) {
  return (
    <FullscreenLoader
      message={
        action === "approve"
          ? "Approving booking..."
          : "Rejecting booking..."
      }
    />
  );
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-black border border-slate-200 dark:border-white/10 shadow-2xl"
      >

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/10">

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-playfair flex items-center gap-2">
            {isApprove ? (
              <>
                <CheckCircle className="w-5 h-5 text-gold" />
                Confirm Approval
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Reject Booking
              </>
            )}
          </h3>

          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5">

          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/60 p-4 space-y-3">

            <InfoRow label="Tenant" value={booking.tenantName} />
            <InfoRow label="Property" value={propertyTitle} />
            <InfoRow
              label="Visit-in"
              value={new Date(booking.moveInDate).toLocaleDateString()}
            />
          </div>

          {!isApprove && (
            <div className="flex gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <p>
                This action cannot be undone. The tenant will be notified immediately.
              </p>
            </div>
          )}

          {isApprove && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Approving this booking will notify the tenant and mark the property as booked.
            </p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row sm:justify-end gap-3">



          <Button
            onClick={onConfirm}
            loading={loading}
            className={`w-full sm:w-auto px-5 font-semibold ${
              isApprove
                ? "bg-gold hover:bg-gold/90 text-black shadow-lg"
                : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20"
            }`}
          >
            {isApprove ? "Approve Booking" : "Reject Booking"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- SUB COMPONENT ---------- */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="font-medium text-slate-900 dark:text-white text-right max-w-[200px] truncate">
        {value}
      </span>
    </div>
  );
}