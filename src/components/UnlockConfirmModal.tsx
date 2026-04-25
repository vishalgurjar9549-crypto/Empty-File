import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const gold = "rgba(212,175,55,0.9)";
const goldSoft = "rgba(212,175,55,0.12)";
const goldBorder = "rgba(212,175,55,0.35)";

function UnlockConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isUnlocking,
  todayContacts,
  remainingContacts,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isUnlocking: boolean;
  todayContacts: number;
  remainingContacts: number | null;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Lock scroll + ESC
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isUnlocking) onClose();
    };

    document.addEventListener("keydown", handleKey);
    closeBtnRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, isUnlocking, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !first || !last) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-confirm-title"
      aria-describedby="unlock-confirm-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUnlocking) onClose();
      }}
    >
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* MODAL */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        
        bg-white dark:bg-[#0f172a]
        border"
        style={{
          borderColor: goldBorder,
        }}
      >
        {/* Glow Accent */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: `0 0 40px ${goldSoft}`,
          }}
        />

        {/* Close */}
        <button
          ref={closeBtnRef}
          onClick={onClose}
          disabled={isUnlocking}
          aria-label="Close dialog"
          className="
            absolute top-4 right-4 p-2 rounded-lg transition
            text-slate-400 hover:text-white
            hover:bg-white/5
            focus:outline-none focus:ring-2 focus:ring-offset-2
          "
          style={{ outlineColor: gold }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2
          id="unlock-confirm-title"
          className="text-xl font-semibold tracking-tight"
          style={{ color: gold }}
        >
          Unlock Contact Access
        </h2>

        {/* Description */}
        <p
          id="unlock-confirm-desc"
          className="mt-2 text-sm text-slate-500 dark:text-slate-400"
        >
          You're about to unlock premium contact details. This action will use your available quota.
        </p>

        {/* Content */}
        <div className="mt-6 space-y-4">
          {/* Stats */}
          <div className="rounded-xl p-4 border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              🔥 <span className="font-semibold">{todayContacts}</span> contacts used today
            </p>
          </div>

          {/* Remaining */}
          {remainingContacts !== null && (
            <div
              className="rounded-xl p-4 border"
              style={{
                borderColor: goldBorder,
                background: goldSoft,
              }}
            >
              <p className="text-sm font-medium" style={{ color: gold }}>
                ⚠️ {remainingContacts} unlocks remaining
              </p>

              {remainingContacts <= 3 && (
                <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                  High demand — almost exhausted
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isUnlocking}
            className="
              w-full py-2.5 rounded-xl font-medium transition
              bg-slate-100 hover:bg-slate-200
              dark:bg-slate-800 dark:hover:bg-slate-700
              text-slate-700 dark:text-white
            "
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isUnlocking}
            className="
              w-full py-2.5 rounded-xl font-medium transition
              text-black
              shadow-lg
              disabled:opacity-60 disabled:cursor-not-allowed
            "
            style={{
              background: `linear-gradient(135deg, ${gold}, rgba(255,215,0,0.9))`,
            }}
          >
            {isUnlocking ? "Unlocking..." : "Confirm Unlock"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnlockConfirmModal;