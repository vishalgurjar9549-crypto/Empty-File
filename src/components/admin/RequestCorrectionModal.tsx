import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { X, AlertCircle, Send } from 'lucide-react';
import { FeedbackReason, FeedbackSeverity } from '../../types/api.types';

interface RequestCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    reason: FeedbackReason,
    message: string,
    severity?: FeedbackSeverity
  ) => void;
  propertyTitle: string;
}

const REASON_OPTIONS: {
  value: FeedbackReason;
  label: string;
  description: string;
}[] = [
  {
    value: 'wrong_price',
    label: 'Wrong Price',
    description: 'Listed price does not match market rate or actual rent',
  },
  {
    value: 'fake_images',
    label: 'Fake / Misleading Images',
    description: 'Images do not match the actual property',
  },
  {
    value: 'wrong_address',
    label: 'Wrong Address or Location',
    description: 'Location information is incorrect or misleading',
  },
  {
    value: 'missing_amenities',
    label: 'Missing Amenities',
    description: 'Important amenities or details are not listed',
  },
  {
    value: 'duplicate_listing',
    label: 'Duplicate Listing',
    description: 'This property is already listed',
  },
  {
    value: 'policy_violation',
    label: 'Policy Violation',
    description: 'Violates platform terms or policies',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other issues requiring correction',
  },
];

const MIN_MESSAGE_LENGTH = 20;

export function RequestCorrectionModal({
  isOpen,
  onClose,
  onConfirm,
  propertyTitle,
}: RequestCorrectionModalProps) {
  const [reason, setReason] = useState<FeedbackReason>('fake_images');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<FeedbackSeverity>('minor');
  const [touched, setTouched] = useState(false);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const descriptionId = useId();
  const messageErrorId = useId();
  const messageHintId = useId();

  const trimmedMessage = message.trim();
  const isMessageTooShort =
    trimmedMessage.length > 0 && trimmedMessage.length < MIN_MESSAGE_LENGTH;
  const showMessageError = touched && (!trimmedMessage || isMessageTooShort);
  const isFormValid = trimmedMessage.length >= MIN_MESSAGE_LENGTH;

  const selectedReason = useMemo(
    () => REASON_OPTIONS.find((opt) => opt.value === reason),
    [reason]
  );

  // Lock background scroll + focus handling
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

  // ESC close + focus trap
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
          HTMLButtonElement | HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement | HTMLAnchorElement
        >(
          'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
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

  const resetForm = () => {
    setReason('fake_images');
    setMessage('');
    setSeverity('minor');
    setTouched(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    setTouched(true);

    if (!isFormValid) return;

    onConfirm(reason, trimmedMessage, severity);
    resetForm();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
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
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 max-h-[90dvh] flex flex-col border border-slate-200/80 dark:border-slate-700/80"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-700 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/80 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2
                  id={titleId}
                  className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white"
                >
                  Request Correction
                </h2>
                <p
                  id={descriptionId}
                  className="mt-1 text-sm text-slate-600 dark:text-slate-400"
                >
                  Send clear feedback to the property owner so they can fix the listing.
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                aria-label="Close request correction modal"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-transparent text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="space-y-6">
              {/* Property Info */}
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Property
                </p>
                <p className="mt-1 text-sm sm:text-base font-semibold text-slate-900 dark:text-white break-words">
                  {propertyTitle}
                </p>
              </section>

              {/* Issue Category */}
              <section>
                <fieldset>
                  <legend className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Issue Category <span className="text-red-500">*</span>
                  </legend>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Choose the issue that best matches the correction needed.
                  </p>

                  <div
                    role="radiogroup"
                    aria-label="Issue category"
                    className="mt-4 grid grid-cols-1 gap-3"
                  >
                    {REASON_OPTIONS.map((option) => {
                      const checked = reason === option.value;

                      return (
                        <label
                          key={option.value}
                          className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all focus-within:ring-2 focus-within:ring-navy/30 ${
                            checked
                              ? 'border-navy bg-navy/5 dark:border-slate-200 dark:bg-slate-800'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <input
                            type="radio"
                            name="feedback-reason"
                            value={option.value}
                            checked={checked}
                            onChange={() => setReason(option.value)}
                            className="mt-1 h-4 w-4 accent-navy"
                          />

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {option.label}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {option.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </section>

              {/* Message */}
              <section>
                <label
                  htmlFor="correction-message"
                  className="block text-sm font-semibold text-slate-900 dark:text-slate-100"
                >
                  Feedback Message <span className="text-red-500">*</span>
                </label>

                <p
                  id={messageHintId}
                  className="mt-1 text-xs text-slate-500 dark:text-slate-400"
                >
                  Be specific. Explain exactly what should be corrected.
                </p>

                <textarea
                  id="correction-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => setTouched(true)}
                  aria-invalid={showMessageError}
                  aria-describedby={`${messageHintId} ${showMessageError ? messageErrorId : ''}`.trim()}
                  placeholder="Example: The uploaded images do not match the actual room. Please upload real images showing the bedroom, washroom, and entrance area."
                  className={`mt-3 w-full rounded-xl border bg-white p-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 resize-y min-h-[160px] dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 ${
                    showMessageError
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100 dark:border-red-500/60 dark:focus:ring-red-500/10'
                      : 'border-slate-300 focus:border-navy focus:ring-navy/10 dark:border-slate-600 dark:focus:border-slate-300 dark:focus:ring-slate-500/10'
                  }`}
                />

                <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {message.length} characters
                  </p>

                  {showMessageError ? (
                    <p
                      id={messageErrorId}
                      className="text-xs font-medium text-red-600 dark:text-red-400"
                    >
                      {trimmedMessage.length === 0
                        ? 'Feedback message is required.'
                        : `Please provide at least ${MIN_MESSAGE_LENGTH} characters.`}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Minimum {MIN_MESSAGE_LENGTH} characters
                    </p>
                  )}
                </div>
              </section>

              {/* Severity */}
              <section>
                <fieldset>
                  <legend className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Issue Severity
                  </legend>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Helps the owner understand how urgently the issue should be fixed.
                  </p>

                  <div
                    role="radiogroup"
                    aria-label="Issue severity"
                    className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
                  >
                    <label
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all focus-within:ring-2 focus-within:ring-blue-200 ${
                        severity === 'minor'
                          ? 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-300'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="feedback-severity"
                        value="minor"
                        checked={severity === 'minor'}
                        onChange={() => setSeverity('minor')}
                        className="sr-only"
                      />
                      <p className="text-sm font-semibold">Minor Issue</p>
                      <p className="mt-1 text-xs opacity-80">Quick fix needed</p>
                    </label>

                    <label
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all focus-within:ring-2 focus-within:ring-orange-200 ${
                        severity === 'major'
                          ? 'border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-950/30 dark:text-orange-300'
                          : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 dark:border-slate-700 dark:hover:border-orange-700 dark:hover:bg-orange-950/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="feedback-severity"
                        value="major"
                        checked={severity === 'major'}
                        onChange={() => setSeverity('major')}
                        className="sr-only"
                      />
                      <p className="text-sm font-semibold">Major Issue</p>
                      <p className="mt-1 text-xs opacity-80">
                        Significant changes required
                      </p>
                    </label>
                  </div>
                </fieldset>
              </section>

              {/* Info */}
              <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                      What happens next?
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-400">
                      <li>• Property status will change to “Needs Correction”</li>
                      <li>• Owner will receive your feedback message</li>
                      <li>• Property will be hidden from users until corrected</li>
                      <li>• Owner can resubmit after making changes</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-700 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/80 sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-navy px-5 text-sm font-medium text-white transition hover:bg-navy/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                <Send className="h-4 w-4" />
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}