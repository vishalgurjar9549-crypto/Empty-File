import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Calendar,
  User,
  Phone,
  CheckCircle,
  Mail,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createBooking } from '../store/slices/bookings.slice';
import { showToast } from '../store/slices/ui.slice';
import { generateIdempotencyKey } from '../api/bookings.api';
import { Room } from '../types/api.types';
import { Button } from './ui/Button';


interface BookingModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = 'form' | 'success';

type FormDataState = {
  name: string;
  email: string;
  phone: string;
  date: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormDataState, string>>;

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

const getTodayLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const sanitizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 10);

export function BookingModal({ room, isOpen, onClose }: BookingModalProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading } = useAppSelector((state) => state.bookings);
  const { user, authStatus } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<BookingStep>('form');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(generateIdempotencyKey());

  const initialFormData = useMemo<FormDataState>(
    () => ({
      name: user?.name || '',
      email: user?.email || '',
      phone: sanitizePhone(user?.phone || ''),
      date: '',
      message: '',
    }),
    [user]
  );

  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const roomImage = room?.images?.[0] || '/placeholder-room.jpg';

  useEffect(() => {
    if (!isOpen) return;

    // ✅ FIXED: Use HTML element instead of body to prevent layout shift
    const htmlElement = document.documentElement;
    const originalOverflow = htmlElement.style.overflow;
    const originalPaddingRight = htmlElement.style.paddingRight;
    
    // Add scrollbar width padding to prevent layout jump
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    htmlElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      htmlElement.style.paddingRight = scrollbarWidth + 'px';
    }
    
    setIdempotencyKey(generateIdempotencyKey());

    return () => {
      htmlElement.style.overflow = originalOverflow || '';
      htmlElement.style.paddingRight = originalPaddingRight || '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (authStatus === 'AUTHENTICATED' && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: sanitizePhone(user.phone || prev.phone),
      }));
    }
  }, [authStatus, user]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      if (step === 'form') {
        firstInputRef.current?.focus();
      } else {
        closeButtonRef.current?.focus();
      }
    }, 50);

    return () => window.clearTimeout(timer);
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        const visibleFocusable = Array.from(focusable).filter(
          (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
        );

        if (visibleFocusable.length === 0) return;

        const first = visibleFocusable[0];
        const last = visibleFocusable[visibleFocusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setErrors({});
      setFormData(initialFormData);
    }
  }, [isOpen, initialFormData]);

  const updateField = <K extends keyof FormDataState>(field: K, value: FormDataState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const cleanedPhone = sanitizePhone(formData.phone);

    if (!trimmedName) {
      newErrors.name = 'Full name is required';
    } else if (trimmedName.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!cleanedPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (!INDIAN_MOBILE_REGEX.test(cleanedPhone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    }

    if (!formData.date) {
      newErrors.date = 'Preferred Visit-in date is required';
    } else {
      const selected = new Date(`${formData.date}T00:00:00`);
      const today = new Date(`${getTodayLocalDate()}T00:00:00`);

      if (selected < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (loading) return;
    if (!validate()) return;

    const bookingData = {
      roomId: room.id,
      tenantName: formData.name.trim(),
      tenantEmail: formData.email.trim(),
      tenantPhone: sanitizePhone(formData.phone),
      moveInDate: formData.date,
      message: formData.message.trim(),
      idempotencyKey,
    };

    try {
      const action = await dispatch(createBooking(bookingData));

      if (createBooking.fulfilled.match(action)) {
        setIdempotencyKey(generateIdempotencyKey());
        setStep('success');
        dispatch(showToast({
          message: 'Booking request sent successfully!',
          type: 'success'
        }));
      } else if (createBooking.rejected.match(action)) {
        console.log('Booking failed:', action);
        const errorMsg = (action.payload as any) ;
        dispatch(showToast({
          message: errorMsg,
          type: 'error'
        }));
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'An unexpected error occurred. Please try again.';
      dispatch(showToast({
        message: errorMsg,
        type: 'error'
      }));
    }
  };

  const resetState = () => {
    setStep('form');
    setErrors({});
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: sanitizePhone(user?.phone || ''),
      date: '',
      message: '',
    });
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  if (authStatus === 'INITIALIZING') {
    return (
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-loading-title"
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <div className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-slate-800">
          <h2 id="booking-loading-title" className="sr-only">
            Checking authentication
          </h2>
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-navy dark:border-slate-700 dark:border-t-white" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verifying your session…
          </p>
        </div>
      </div>
    );
  }

  if (authStatus === 'UNAUTHENTICATED') {
    return (
      <div
        className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-required-title"
        aria-describedby="auth-required-description"
      >
        <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />

        <div
          ref={dialogRef}
          className="relative w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 sm:max-w-md sm:rounded-2xl sm:zoom-in dark:bg-slate-800"
        >
          <div
            className="p-6 sm:p-8"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          >
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 dark:bg-white/10 sm:h-16 sm:w-16">
                <LogIn className="h-7 w-7 text-gold dark:text-white sm:h-8 sm:w-8" />
              </div>

              <h3
                id="auth-required-title"
                className="mb-3 text-xl font-playfair font-bold text-navy dark:text-white sm:text-2xl"
              >
                Sign In Required
              </h3>

              <p
                id="auth-required-description"
                className="mb-7 text-sm text-slate-600 dark:text-slate-300 sm:text-base"
              >
                Please sign in to book a visit for this property. It only takes a minute.
              </p>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    onClose();
                    navigate('/auth/login', {
                      state: { from: `/rooms/${room.id}` },
                    });
                  }}
                >
                  Sign In to Continue
                </Button>

                <Button variant="outline" size="md" fullWidth onClick={onClose}>
                  Cancel
                </Button>
              </div>

              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/auth/register');
                  }}
                  className="font-medium text-gold hover:underline"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      aria-describedby="booking-modal-description"
    >
      <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={handleClose} />

      <div
        ref={dialogRef}
        className="relative flex max-h-[92dvh] w-full mx-4 flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 sm:mx-0 sm:max-w-md sm:rounded-2xl sm:zoom-in md:max-w-lg dark:bg-slate-800"
      >
        {step === 'form' ? (
          <>
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700 sm:px-6 sm:py-4">
              <div>
                <h3
                  id="booking-modal-title"
                  className="text-lg font-playfair font-bold text-navy dark:text-white sm:text-xl"
                >
                  Book Your Visit
                </h3>
                <p
                  id="booking-modal-description"
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  Schedule a visit in 30 seconds
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Close booking modal"
              >
                <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
              <div className="mb-5 flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-700/50 sm:p-4">
                <img
                  src={roomImage}
                  alt={room.title}
                  className="h-14 w-14 flex-shrink-0 rounded-lg object-cover sm:h-16 sm:w-16"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold text-navy dark:text-white">
                    {room.title}
                  </h4>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {room.location}
                  </p>
                  <p className="mt-1 text-sm font-bold text-gold">
                    ₹{room.pricePerMonth.toLocaleString()}/mo
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="booking-name"
                      className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Full Name
                      <span className="text-red-600 dark:text-red-400" aria-hidden="true">
                        *
                      </span>
                      <span className="sr-only">(Required)</span>
                    </label>

                    <div
                      className={`relative flex w-full overflow-hidden rounded-lg border bg-white transition-all focus-within:ring-2 dark:bg-slate-700 ${
                        errors.name
                          ? 'border-red-400 focus-within:ring-red-400/50 dark:border-red-700'
                          : 'border-slate-200 focus-within:ring-gold/40 dark:border-slate-600'
                      }`}
                    >
                      <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        ref={firstInputRef}
                        id="booking-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'booking-name-error' : undefined}
                        placeholder="John Doe"
                        className="h-11 w-full bg-transparent pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                      />
                    </div>

                    {errors.name && (
                      <div
                        id="booking-name-error"
                        role="alert"
                        className="mt-2 flex items-start gap-2"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">
                          {errors.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="booking-phone"
                      className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Phone Number
                      <span className="text-red-600 dark:text-red-400" aria-hidden="true">
                        *
                      </span>
                      <span className="sr-only">(Required)</span>
                    </label>

                    <div
                      className={`relative flex w-full overflow-hidden rounded-lg border bg-white transition-all focus-within:ring-2 dark:bg-slate-700 ${
                        errors.phone
                          ? 'border-red-400 focus-within:ring-red-400/50 dark:border-red-700'
                          : 'border-slate-200 focus-within:ring-gold/40 dark:border-slate-600'
                      }`}
                    >
                      <Phone className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="booking-phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', sanitizePhone(e.target.value))}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'booking-phone-error' : undefined}
                        placeholder="9876543210"
                        className="h-11 w-full bg-transparent pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                      />
                    </div>

                    {errors.phone && (
                      <div
                        id="booking-phone-error"
                        role="alert"
                        className="mt-2 flex items-start gap-2"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">
                          {errors.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
               {/* Email */}
<div>
  <label
    htmlFor="booking-email"
    className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
  >
    Email Address
    <span className="text-red-600 dark:text-red-400" aria-hidden="true">
      *
    </span>
    <span className="sr-only">(Required)</span>
  </label>

  <div
    className={`relative flex w-full overflow-hidden rounded-lg border bg-slate-100 dark:bg-slate-600/40 ${
      errors.email
        ? 'border-red-400 dark:border-red-700'
        : 'border-slate-200 dark:border-slate-600'
    }`}
  >
    {/* Icon */}
    <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

    {/* Input */}
    <input
      id="booking-email"
      name="email"
      type="email"
      value={formData.email}
      disabled
      readOnly
      aria-readonly="true"
      className="h-11 w-full cursor-not-allowed bg-transparent pl-9 pr-10 text-sm text-slate-500 dark:text-slate-300 outline-none"
    />

    {/* Lock Indicator */}
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gold">
      Locked
    </span>
  </div>

  {/* Helper text */}
  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
    This email is linked to your account and cannot be changed.
  </p>

  {errors.email && (
    <div
      id="booking-email-error"
      role="alert"
      className="mt-2 flex items-start gap-2"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
      <p className="text-xs font-medium text-red-600 dark:text-red-400">
        {errors.email}
      </p>
    </div>
  )}
</div>

                {/* Date */}
                <div>
                  <label
                    htmlFor="booking-date"
                    className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                   Preferred Visit Date *
                    <span className="text-red-600 dark:text-red-400" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only">(Required)</span>
                  </label>

                  <div
                    className={`relative flex w-full overflow-hidden rounded-lg border bg-white transition-all focus-within:ring-2 dark:bg-slate-700 ${
                      errors.date
                        ? 'border-red-400 focus-within:ring-red-400/50 dark:border-red-700'
                        : 'border-slate-200 focus-within:ring-gold/40 dark:border-slate-600'
                    }`}
                  >
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="booking-date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      min={getTodayLocalDate()}
                      aria-invalid={!!errors.date}
                      aria-describedby={errors.date ? 'booking-date-error' : undefined}
                      className="h-11 w-full bg-transparent pl-9 pr-3 text-sm text-slate-900 outline-none dark:text-white"
                    />
                  </div>

                  {errors.date && (
                    <div
                      id="booking-date-error"
                      role="alert"
                      className="mt-2 flex items-start gap-2"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">
                        {errors.date}
                      </p>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="booking-message"
                    className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Message
                    <span className="font-normal text-slate-500 dark:text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    id="booking-message"
                    name="message"
                    value={formData.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    rows={3}
                    aria-describedby="booking-message-help"
                    placeholder="Any specific requirements or questions..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-gold/40 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  <p
                    id="booking-message-help"
                    className="mt-1.5 text-xs text-slate-500 dark:text-slate-400"
                  >
                    Let the owner know about any preferences or specific requirements.
                  </p>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div
              className="flex-shrink-0 border-t border-slate-100 bg-white px-4 pb-3 pt-3 dark:border-slate-700 dark:bg-slate-800 sm:px-6"
              style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
            >
              <Button
                type="button"
                onClick={() => handleSubmit()}
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="min-h-[48px]"
              >
                Book Visit
              </Button>
            </div>
          </>
        ) : (
          <div
            className="flex h-full min-h-[360px] flex-col items-center justify-center p-8 text-center sm:min-h-[400px] sm:p-12"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 animate-in zoom-in duration-300 dark:bg-green-900/30 dark:text-green-400 sm:h-20 sm:w-20">
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>

            <h3 className="mb-3 text-xl font-playfair font-bold text-navy dark:text-white sm:text-2xl">
              Request Sent!
            </h3>

            <p className="mx-auto mb-7 max-w-xs text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              The owner has been notified. You will receive a confirmation call shortly on{' '}
              <span className="font-semibold text-navy dark:text-white">{formData.phone}</span>.
            </p>

            <Button
              ref={closeButtonRef as any}
              variant="primary"
              size="lg"
              onClick={handleClose}
              className="min-w-[180px] sm:min-w-[200px]"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}