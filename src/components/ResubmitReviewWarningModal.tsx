import React, { useEffect, useId, useRef } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, X, Pencil } from 'lucide-react';

interface ResubmitReviewWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onEdit?: () => void;
  propertyTitle: string;
  loading?: boolean;
}

export function ResubmitReviewWarningModal({
  isOpen,
  onClose,
  onConfirm,
  onEdit,
  propertyTitle,
  loading = false,
}: ResubmitReviewWarningModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    lastFocusedElementRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';

    const timeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timeout);
      lastFocusedElementRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialogRef.current) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current.querySelectorAll<
          HTMLButtonElement | HTMLAnchorElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const focusable = Array.from(focusableElements).filter(
          (el) => !el.hasAttribute('hidden') && el.offsetParent !== null
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-700">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-95" />
            <div className="relative px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>

                  <div className="min-w-0">
                    <h2
                      id={titleId}
                      className="text-lg sm:text-xl font-semibold text-white"
                    >
                      Ready to resubmit this property?
                    </h2>
                    <p
                      id={descriptionId}
                      className="mt-1 text-sm text-orange-50/95"
                    >
                      Please confirm that you’ve reviewed and fixed the admin feedback before sending it back for approval.
                    </p>
                  </div>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close resubmit warning modal"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Property
              </p>
              <p className="mt-1 text-sm sm:text-base font-semibold text-slate-900 dark:text-white break-words">
                {propertyTitle}
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/20">
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-300">
                Before resubmitting, make sure you have:
              </p>

              <ul className="mt-3 space-y-2.5">
                {[
                  'Reviewed the admin feedback carefully',
                  'Updated incorrect property details',
                  'Replaced misleading or incorrect images',
                  'Checked rent, location, amenities, and room info',
                  'Saved all your latest changes before resubmitting',
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-sm text-orange-800 dark:text-orange-200"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500 dark:text-orange-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                What happens after resubmitting?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                Your property will be sent back to the admin team and may go under review again.
                Until approval, some visibility or actions may remain limited.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900 sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onEdit ?? onClose}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Pencil className="h-4 w-4" />
                Go Back & Edit
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-navy px-5 text-sm font-semibold text-white transition hover:bg-navy/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Resubmitting...' : 'Yes, Resubmit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}