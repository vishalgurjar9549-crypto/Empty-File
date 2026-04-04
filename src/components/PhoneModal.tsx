import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  X,
  Phone,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axiosInstance from '../api/axios';
import { authApi } from '../api/auth.api';
import { setCredentials } from '../store/slices/auth.slice';

interface PhoneModalProps {
  onClose: () => void;
}

type ModalStep = 'phone' | 'claim';

type ValidationErrors = {
  phone?: string;
  email?: string;
  password?: string;
  general?: string;
};

const PHONE_DIGITS_REQUIRED = 10;
const COUNTRY_CODE = '+91';

export function PhoneModal({ onClose }: PhoneModalProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState<ModalStep>('phone');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const descriptionId = useId();
  const phoneErrorId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const generalErrorId = useId();

  const normalizedPhone = useMemo(() => {
    return phone.replace(/\D/g, '').slice(0, PHONE_DIGITS_REQUIRED);
  }, [phone]);

  useEffect(() => {
    lastFocusedElementRef.current = document.activeElement as HTMLElement;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      lastFocusedElementRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [step]);

  const clearFieldError = (field: keyof ValidationErrors) => {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      general: undefined,
    }));
  };

  const validateIndianPhone = (value: string): string | undefined => {
    const digits = value.replace(/\D/g, '');

    if (!digits) return 'Phone number is required';

    if (digits.length !== PHONE_DIGITS_REQUIRED) {
      return 'Enter a valid 10-digit mobile number';
    }

    if (!/^[6-9]\d{9}$/.test(digits)) {
      return 'Enter a valid Indian mobile number';
    }

    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return 'Email is required';

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(value.trim())) {
      return 'Enter a valid email address';
    }

    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required';

    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(value)) {
      return 'Password must include at least 1 letter and 1 number';
    }

    return undefined;
  };

  const closeModal = () => {
    if (loading) return;
    setErrors({});
    onClose();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value
      .replace(/\D/g, '')
      .slice(0, PHONE_DIGITS_REQUIRED);
    setPhone(digitsOnly);
    clearFieldError('phone');
  };

  const handleCheckPhone = async () => {
    const phoneError = validateIndianPhone(normalizedPhone);

    if (phoneError) {
      setErrors({ phone: phoneError });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const cleanPhone = normalizedPhone;

      const response = await axiosInstance.post('/auth/check-phone', {
        phone: cleanPhone,
      });

      const { exists, isTemp: isTempAccount } = response.data.data;

      if (exists && isTempAccount) {
        setStep('claim');
        return;
      }

      if (exists && !isTempAccount) {
        try {
          const result = await authApi.loginPhone(cleanPhone);

          dispatch(setCredentials({ user: result.user, token: result.token }));
          onClose();
          navigate('/owner/dashboard');
        } catch (loginErr: any) {
          const message =
            loginErr?.response?.data?.message ||
            'Unable to log in with this phone number. Please try again.';
          setErrors({ general: message });
        }
        return;
      }

      onClose();
      navigate(`/auth/register?phone=${cleanPhone}&role=OWNER&phone_flow=true`);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Unable to verify phone number right now. Please try again.';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAccount = async () => {
    const phoneError = validateIndianPhone(normalizedPhone);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    const nextErrors: ValidationErrors = {
      phone: phoneError,
      email: emailError,
      password: passwordError,
    };

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const cleanPhone = normalizedPhone;

      const response = await axiosInstance.post('/auth/claim-account', {
        phone: cleanPhone,
        email: email.trim().toLowerCase(),
        password,
      });

      const { user, token } = response.data.data;

      dispatch(setCredentials({ user, token }));
      onClose();
      navigate('/owner/dashboard');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Unable to claim account right now. Please try again.';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (loading) return;
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      if (!loading) {
        closeModal();
      }
      return;
    }

    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4"
      role="presentation"
      onMouseDown={onBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={onKeyDown}
        className="relative z-10 w-[92%] max-w-sm sm:max-w-md max-h-[94vh] overflow-y-auto rounded-[26px] border border-slate-200/70 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.28)] ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="relative overflow-hidden border-b border-amber-100/60 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-500 px-4 py-4 sm:px-6 sm:py-5 text-white dark:border-white/10">
          <div className="absolute right-0 top-0 h-28 w-28 translate-x-6 -translate-y-6 rounded-full bg-white/10 blur-2xl" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeModal}
            disabled={loading}
            aria-label="Close modal"
            className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
          </button>

          <div className="relative z-10 pr-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/18 shadow-lg ring-1 ring-white/20 backdrop-blur-md sm:h-14 sm:w-14">
              <Phone className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </div>

            <h2
              id={titleId}
              className="text-center text-lg font-bold tracking-tight sm:text-xl"
            >
              {step === 'phone' ? 'Continue with phone' : 'Claim your account'}
            </h2>

            <p
              id={descriptionId}
              className="mt-1.5 text-center text-sm text-white/90"
            >
              {step === 'phone'
                ? 'Enter your mobile number to continue'
                : 'Finish setup to access your account'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          {/* General Error */}
          {errors.general && (
            <div
              id={generalErrorId}
              role="alert"
              aria-live="assertive"
              className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* PHONE STEP */}
          {step === 'phone' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                <p className="font-medium">Quick access</p>
                <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-100/70">
                  We’ll check whether your number already has an account.
                </p>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Phone Number
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div
                  className={`flex h-14 w-full overflow-hidden rounded-2xl border bg-white transition-all focus-within:ring-2 dark:bg-slate-800 ${
                    errors.phone
                      ? 'border-red-400 dark:border-red-700 focus-within:ring-red-400/40'
                      : 'border-slate-300 dark:border-slate-700 focus-within:border-amber-400 focus-within:ring-amber-500/30'
                  }`}
                >
                  <div className="flex min-w-[74px] items-center justify-center border-r border-slate-200 px-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                    {COUNTRY_CODE}
                  </div>

                  <div className="relative flex-1">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                    <input
                      ref={firstInputRef}
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={phone}
                      onChange={handlePhoneChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCheckPhone();
                      }}
                      maxLength={10}
                      placeholder="9876543210"
                      disabled={loading}
                      aria-required="true"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? phoneErrorId : 'phone-help'}
                      className="h-full w-full bg-transparent pl-11 pr-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white sm:text-base"
                    />
                  </div>
                </div>

                <p
                  id="phone-help"
                  className="mt-2 text-xs text-slate-500 dark:text-slate-400"
                >
                  Enter a valid 10-digit Indian mobile number.
                </p>

                {errors.phone && (
                  <div
                    id={phoneErrorId}
                    role="alert"
                    aria-live="assertive"
                    className="mt-2 flex items-start gap-2"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {errors.phone}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCheckPhone}
                disabled={loading || normalizedPhone.length !== 10}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:from-amber-400 hover:to-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:text-slate-950 dark:focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/20 border-t-slate-900" />
                    Checking...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* CLAIM STEP */}
          {step === 'claim' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
                <p className="font-medium">Account found</p>
                <p className="mt-1 text-xs">
                  Complete the details below to claim this account.
                </p>
              </div>

              {/* EMAIL FIELD */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Email Address
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div
                  className={`relative flex h-14 w-full overflow-hidden rounded-2xl border bg-white transition-all focus-within:ring-2 dark:bg-slate-800 ${
                    errors.email
                      ? 'border-red-400 dark:border-red-700 focus-within:ring-red-400/40'
                      : 'border-slate-300 dark:border-slate-700 focus-within:border-amber-400 focus-within:ring-amber-500/30'
                  }`}
                >
                  <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                  <input
                    ref={firstInputRef}
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError('email');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleClaimAccount();
                    }}
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? emailErrorId : undefined}
                    placeholder="you@example.com"
                    className="h-full w-full bg-transparent pl-11 pr-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white sm:text-base"
                  />
                </div>

                {errors.email && (
                  <div
                    id={emailErrorId}
                    role="alert"
                    aria-live="assertive"
                    className="mt-2 flex items-start gap-2"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {errors.email}
                    </p>
                  </div>
                )}
              </div>

              {/* PASSWORD FIELD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Password
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div
                  className={`relative flex h-14 w-full overflow-hidden rounded-2xl border bg-white transition-all focus-within:ring-2 dark:bg-slate-800 ${
                    errors.password
                      ? 'border-red-400 dark:border-red-700 focus-within:ring-red-400/40'
                      : 'border-slate-300 dark:border-slate-700 focus-within:border-amber-400 focus-within:ring-amber-500/30'
                  }`}
                >
                  <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError('password');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleClaimAccount();
                    }}
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? passwordErrorId : 'password-help'}
                    placeholder="••••••••"
                    className="h-full w-full bg-transparent pl-11 pr-12 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white sm:text-base"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>

                <p
                  id="password-help"
                  className="mt-2 text-xs text-slate-500 dark:text-slate-400"
                >
                  Use at least 8 characters with 1 letter and 1 number.
                </p>

                {errors.password && (
                  <div
                    id={passwordErrorId}
                    role="alert"
                    aria-live="assertive"
                    className="mt-2 flex items-start gap-2"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {errors.password}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleClaimAccount}
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:from-amber-400 hover:to-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:text-slate-950 dark:focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/20 border-t-slate-900" />
                    Claiming Account...
                  </>
                ) : (
                  <>
                    Claim Account
                    <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}