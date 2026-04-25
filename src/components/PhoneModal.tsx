import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
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

// ─── Focus Trap Hook ────────────────────────────────────────────────────────
function useFocusTrap(ref: React.RefObject<HTMLDivElement>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const FOCUSABLE =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const el = ref.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const nodes = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!nodes.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

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
    };

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [active, ref]);
}

// ─── Scroll Lock Hook ───────────────────────────────────────────────────────
function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const originalStyle = document.body.getAttribute('style') || '';

    // Lock scroll without layout shift (preserve scrollbar width)
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.cssText = `
      overflow: hidden;
      position: fixed;
      top: -${scrollY}px;
      left: 0;
      right: 0;
      padding-right: ${scrollBarWidth}px;
    `;

    return () => {
      document.body.setAttribute('style', originalStyle);
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

// ─── Component ──────────────────────────────────────────────────────────────
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
  const [isVisible, setIsVisible] = useState(false); // for enter animation

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const descriptionId = useId();
  const phoneErrorId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const generalErrorId = useId();

  const normalizedPhone = useMemo(
    () => phone.replace(/\D/g, '').slice(0, PHONE_DIGITS_REQUIRED),
    [phone]
  );

  // ── Hooks ──
  useFocusTrap(modalRef, true);
  useScrollLock(true);

  // ── Save last focused element & animate in ──
  useEffect(() => {
    lastFocusedElementRef.current = document.activeElement as HTMLElement;
    // Trigger enter animation on next frame
    requestAnimationFrame(() => setIsVisible(true));

    return () => {
      lastFocusedElementRef.current?.focus?.();
    };
  }, []);

  // ── Auto-focus first input on step change ──
  useEffect(() => {
    const timer = setTimeout(() => firstInputRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [step]);

  // ── Inert background content for accessibility ──
  useEffect(() => {
    // Make everything outside the modal inert so screen readers & keyboard
    // can't reach background content
    const appRoot = document.getElementById('root');
    if (appRoot) {
      appRoot.setAttribute('inert', '');
      appRoot.setAttribute('aria-hidden', 'true');
    }
    return () => {
      if (appRoot) {
        appRoot.removeAttribute('inert');
        appRoot.removeAttribute('aria-hidden');
      }
    };
  }, []);

  // ── Helpers ──
  const clearFieldError = (field: keyof ValidationErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));

  const validateIndianPhone = (value: string): string | undefined => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'Phone number is required';
    if (digits.length !== PHONE_DIGITS_REQUIRED) return 'Enter a valid 10-digit mobile number';
    if (!/^[6-9]\d{9}$/.test(digits)) return 'Enter a valid Indian mobile number';
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return 'Email is required';
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value.trim()))
      return 'Enter a valid email address';
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(value))
      return 'Password must include at least 1 letter and 1 number';
  };

  const closeModal = () => {
    if (loading) return;
    setIsVisible(false);
    // Wait for exit animation before unmounting
    setTimeout(() => {
      setErrors({});
      onClose();
    }, 200);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, PHONE_DIGITS_REQUIRED));
    clearFieldError('phone');
  };

  const handleCheckPhone = async () => {
    const phoneError = validateIndianPhone(normalizedPhone);
    if (phoneError) { setErrors({ phone: phoneError }); return; }

    setLoading(true);
    setErrors({});

    try {
      const response = await axiosInstance.post('/auth/check-phone', { phone: normalizedPhone });
      const { exists, isTemp: isTempAccount } = response.data.data;

      if (exists && isTempAccount) { setStep('claim'); return; }

      if (exists && !isTempAccount) {
        try {
          const result = await authApi.loginPhone(normalizedPhone);
          dispatch(setCredentials({ user: result.user, token: result.token }));
          onClose();
          navigate('/owner/dashboard');
        } catch (loginErr: any) {
          setErrors({
            general:
              loginErr?.response?.data?.message ||
              'Unable to log in with this phone number. Please try again.',
          });
        }
        return;
      }

      onClose();
      navigate(`/auth/register?phone=${normalizedPhone}&role=OWNER&phone_flow=true`);
    } catch (err: any) {
      setErrors({
        general:
          err?.response?.data?.message ||
          'Unable to verify phone number right now. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAccount = async () => {
    const nextErrors: ValidationErrors = {
      phone: validateIndianPhone(normalizedPhone),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    if (Object.values(nextErrors).some(Boolean)) { setErrors(nextErrors); return; }

    setLoading(true);
    setErrors({});

    try {
      const response = await axiosInstance.post('/auth/claim-account', {
        phone: normalizedPhone,
        email: email.trim().toLowerCase(),
        password,
      });
      const { user, token } = response.data.data;
      dispatch(setCredentials({ user, token }));
      onClose();
      navigate('/owner/dashboard');
    } catch (err: any) {
      setErrors({
        general:
          err?.response?.data?.message ||
          'Unable to claim account right now. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (loading) return;
    if (e.target === e.currentTarget) closeModal();
  };

  const onBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && !loading) closeModal();
  };

  // ── Shared input wrapper classes ──
  const inputWrapper = (hasError: boolean) =>
    `flex h-14 w-full overflow-hidden rounded-2xl border bg-white transition-all duration-200
     focus-within:ring-2 dark:bg-slate-800
     ${
       hasError
         ? 'border-red-400 dark:border-red-700 focus-within:ring-red-400/40'
         : 'border-slate-200 dark:border-slate-700 focus-within:border-amber-400 focus-within:ring-amber-500/30'
     }`;

  const inputClass =
    'h-full w-full bg-transparent pl-11 pr-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white';

  const errorBlock = (id: string, message: string) => (
    <div id={id} role="alert" aria-live="assertive" className="mt-2 flex items-start gap-2">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
      <p className="text-sm font-medium text-red-600 dark:text-red-400">{message}</p>
    </div>
  );

  // ── Portal render ──
  return ReactDOM.createPortal(
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-[6px] transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* ── Scroll container (click outside to close) ── */}
      <div
        role="presentation"
        className="fixed inset-0 z-50 overflow-y-auto"
        onMouseDown={onBackdropClick}
        onKeyDown={onBackdropKeyDown}
      >
        {/* Centre the modal vertically; min-h ensures short viewports still scroll */}
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">

          {/* ── Modal panel ── */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className={`relative w-full sm:max-w-lg rounded-[28px] border border-slate-200/70
              bg-white shadow-[0_32px_96px_rgba(15,23,42,0.32)] ring-1 ring-black/5
              dark:border-slate-800 dark:bg-slate-900
              transition-all duration-200
              ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
            `}
          >

            {/* ── Header ── */}
            <div className="relative overflow-hidden rounded-t-[28px] border-b border-amber-400/20 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-500 px-5 py-5 sm:px-7 sm:py-6 text-white">
              {/* Decorative blobs */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-amber-300/20 blur-2xl" />

              {/* Close button */}
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                aria-label="Close modal"
                className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center
                  rounded-full text-white/90 transition-all duration-150
                  hover:bg-white/15 hover:text-white
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80
                  disabled:cursor-not-allowed disabled:opacity-50
                  sm:right-4 sm:top-4"
              >
                <X size={17} strokeWidth={2.5} />
              </button>

              <div className="relative z-10 pr-8">
                {/* Icon badge */}
                <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 shadow-lg ring-1 ring-white/25 backdrop-blur-sm sm:h-14 sm:w-14">
                  <Phone className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={2.2} />
                </div>

                <h2
                  id={titleId}
                  className="text-center text-lg font-bold tracking-tight text-white sm:text-xl"
                >
                  {step === 'phone' ? 'Continue with phone' : 'Claim your account'}
                </h2>

                <p
                  id={descriptionId}
                  className="mt-1.5 text-center text-sm text-white/85 sm:text-[15px]"
                >
                  {step === 'phone'
                    ? 'Enter your mobile number to continue'
                    : 'Finish setup to access your account'}
                </p>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="p-5 sm:p-7">

              {/* General error */}
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

              {/* ══ PHONE STEP ══════════════════════════════════════════════ */}
              {step === 'phone' && (
                <div className="space-y-5">
                  {/* Info banner */}
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm dark:border-amber-500/20 dark:bg-amber-500/10">
                    <p className="font-semibold text-amber-900 dark:text-amber-100">Quick access</p>
                    <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-100/70">
                      We'll check whether your number already has an account.
                    </p>
                  </div>

                  {/* Phone field */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Phone Number
                      <span className="ml-1 text-red-500" aria-hidden="true">*</span>
                    </label>

                    <div className={inputWrapper(!!errors.phone)}>
                      {/* Country code pill */}
                      <div className="flex min-w-[72px] items-center justify-center border-r border-slate-200 px-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                        {COUNTRY_CODE}
                      </div>

                      <div className="relative flex-1">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400" />
                        <input
                          ref={firstInputRef}
                          id="phone"
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          value={phone}
                          onChange={handlePhoneChange}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleCheckPhone(); }}
                          maxLength={10}
                          placeholder="9876543210"
                          disabled={loading}
                          aria-required="true"
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? phoneErrorId : 'phone-hint'}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <p id="phone-hint" className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Enter a valid 10-digit Indian mobile number.
                    </p>
                    {errors.phone && errorBlock(phoneErrorId, errors.phone)}
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={handleCheckPhone}
                    disabled={loading || normalizedPhone.length !== 10}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl
                      bg-gradient-to-r from-amber-500 to-yellow-500
                      px-4 text-sm font-semibold text-slate-950
                      shadow-lg shadow-amber-500/25
                      transition-all duration-200
                      hover:-translate-y-0.5 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-yellow-400
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
                      disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/25 border-t-slate-900" />
                        Checking…
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

              {/* ══ CLAIM STEP ══════════════════════════════════════════════ */}
              {step === 'claim' && (
                <div className="space-y-5">
                  {/* Info banner */}
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
                    <p className="font-semibold">Account found</p>
                    <p className="mt-0.5 text-xs">Complete the details below to claim this account.</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Email Address
                      <span className="ml-1 text-red-500" aria-hidden="true">*</span>
                    </label>

                    <div className={`relative ${inputWrapper(!!errors.email)}`}>
                      <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 h-[17px] w-[17px] -translate-y-1/2 text-slate-400" />
                      <input
                        ref={firstInputRef}
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleClaimAccount(); }}
                        disabled={loading}
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? emailErrorId : undefined}
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </div>
                    {errors.email && errorBlock(emailErrorId, errors.email)}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Password
                      <span className="ml-1 text-red-500" aria-hidden="true">*</span>
                    </label>

                    <div className={`relative ${inputWrapper(!!errors.password)}`}>
                      <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-[17px] w-[17px] -translate-y-1/2 text-slate-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleClaimAccount(); }}
                        disabled={loading}
                        aria-required="true"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? passwordErrorId : 'password-hint'}
                        placeholder="••••••••"
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        disabled={loading}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5
                          text-slate-500 transition-colors duration-150
                          hover:bg-slate-100 hover:text-slate-700
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                          dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
                      </button>
                    </div>

                    <p id="password-hint" className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Use at least 8 characters with 1 letter and 1 number.
                    </p>
                    {errors.password && errorBlock(passwordErrorId, errors.password)}
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={handleClaimAccount}
                    disabled={loading}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl
                      bg-gradient-to-r from-amber-500 to-yellow-500
                      px-4 text-sm font-semibold text-slate-950
                      shadow-lg shadow-amber-500/25
                      transition-all duration-200
                      hover:-translate-y-0.5 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-yellow-400
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
                      disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/25 border-t-slate-900" />
                        Claiming Account…
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
      </div>
    </>,
    document.body
  );
}