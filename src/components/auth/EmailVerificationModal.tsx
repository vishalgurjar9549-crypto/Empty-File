import React, { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, Clock, Mail, ShieldCheck, X } from "lucide-react";
import axiosInstance from "../../api/axios";

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  onSuccess: () => void;
  onClose: () => void;
  onError: (error: string) => void;
}

type Step = "send" | "verify";

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  email,
  onSuccess,
  onClose,
  onError,
}) => {
  const [step, setStep] = useState<Step>("send");
  const [emailInput, setEmailInput] = useState(email || "");
  const [otpSentToEmail, setOtpSentToEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // field errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // touched state
  const [emailTouched, setEmailTouched] = useState(false);
  const [otpTouched, setOtpTouched] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const titleId = useId();
  const descriptionId = useId();
  const emailErrorId = useId();
  const otpErrorId = useId();
  const serverErrorId = useId();

  const normalizeEmail = (value: string) => value.trim().toLowerCase();
  const currentEmail = normalizeEmail(emailInput);

  const validateEmail = (value: string): string | null => {
    const normalized = normalizeEmail(value);

    if (!normalized) return "Please enter your email address.";
    if (!EMAIL_REGEX.test(normalized)) return "Please enter a valid email address.";

    return null;
  };

  const validateOtp = (value: string): string | null => {
    if (!value) return "Please enter the verification code.";
    if (!/^\d{6}$/.test(value)) return "Please enter a valid 6-digit code.";
    return null;
  };

  const runEmailValidation = (value: string) => {
    const error = validateEmail(value);
    setEmailError(error);
    return !error;
  };

  const runOtpValidation = (value: string) => {
    const error = validateOtp(value);
    setOtpError(error);
    return !error;
  };

  useEffect(() => {
    if (!isOpen) return;

    setEmailInput(email || "");
    setStep("send");
    setOtp("");
    setResendCooldown(0);
    setOtpSentToEmail(null);

    setEmailError(null);
    setOtpError(null);
    setServerError(null);

    setEmailTouched(false);
    setOtpTouched(false);

    const timeout = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timeout);
  }, [isOpen, email]);

  useEffect(() => {
    if (step === "verify" && otpInputRef.current) {
      const timeout = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 120);

      return () => clearTimeout(timeout);
    }
  }, [step]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [isOpen, loading, onClose]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const input = otpInputRef.current;
    if (!input) return;

    const handlePaste = (e: ClipboardEvent) => {
      const pastedData = e.clipboardData?.getData("text") || "";
      const cleaned = pastedData.replace(/\D/g, "").slice(0, 6);

      if (cleaned.length === 6) {
        setOtp(cleaned);
        setOtpTouched(true);
        setOtpError(null);
        setServerError(null);
        e.preventDefault();
      }
    };

    input.addEventListener("paste", handlePaste);
    return () => input.removeEventListener("paste", handlePaste);
  }, [step]);

  if (!isOpen) return null;

  const isEmailValid = !validateEmail(emailInput);
  const isOtpValid = !validateOtp(otp);

  const handleSendOTP = async () => {
    setServerError(null);
    setEmailTouched(true);

    const validEmail = runEmailValidation(emailInput);
    if (!validEmail) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("kangaroo_token");

      const response = await axiosInstance.post(
        "/auth/send-email-otp",
        { email: currentEmail },
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined
      );

      const data: any = response?.data;

      if (!data?.success) {
        const message = data?.message || "Failed to send verification code.";
        setServerError(message);
        onError(message);
        return;
      }

      setStep("verify");
      setResendCooldown(30);
      setOtpSentToEmail(currentEmail);
      setOtp("");
      setOtpTouched(false);
      setOtpError(null);
      setServerError(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to send verification code.";
      setServerError(message);
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    setServerError(null);
    setEmailTouched(true);
    setOtpTouched(true);

    const validEmail = runEmailValidation(emailInput);
    const validOtp = runOtpValidation(otp);

    if (!validEmail || !validOtp) return;

    if (otpSentToEmail && currentEmail !== otpSentToEmail) {
      const message = "Email changed. Please send a new code to the updated email.";
      setServerError(message);
      setStep("send");
      setOtp("");
      setResendCooldown(0);
      setOtpSentToEmail(null);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("kangaroo_token");

      const response = await axiosInstance.post(
        "/auth/verify-email-otp",
        {
          email: currentEmail,
          otp,
        },
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined
      );

      const data: any = response?.data;

      if (!data?.success) {
        if (
          data?.code === "INVALID_OTP" &&
          String(data?.message || "").toLowerCase().includes("expired")
        ) {
          setServerError("Code expired. Please request a new one.");
          setStep("send");
          setOtp("");
          setResendCooldown(0);
          setOtpSentToEmail(null);
          return;
        }

        const message = data?.message || "Verification failed.";
        setServerError(message);
        onError(message);
        return;
      }

      onSuccess();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to verify code.";
      setServerError(message);
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    await handleSendOTP();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close email verification modal"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-2xl shadow-black/20 dark:shadow-black/50 animate-in fade-in zoom-in-95 duration-200 "
      >
        {/* Close */}
        <button
          type="button"
          onClick={() => !loading && onClose()}
          aria-label="Close modal"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10  items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gold via-amber-400 to-gold" />

        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8 ">
          {/* Info banner */}
          <div className="mb-6 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-900/20 px-4 py-3.5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Email verification required
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Verify your email to continue with this action securely.
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy/5 dark:bg-white/5 ring-1 ring-slate-200 dark:ring-slate-700">
              {step === "send" ? (
                <Mail className="h-8 w-8 text-navy dark:text-white" />
              ) : (
                <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>

            <h2
              id={titleId}
              className="text-2xl sm:text-3xl font-bold font-playfair text-navy dark:text-white"
            >
              {step === "send" ? "Verify your email" : "Enter verification code"}
            </h2>

            <p
              id={descriptionId}
              className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto"
            >
              {step === "send"
                ? "We’ll send a 6-digit verification code to your email address."
                : "Enter the 6-digit code we sent to continue securely."}
            </p>

            {step === "verify" && otpSentToEmail && (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Sent to{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">
                  {otpSentToEmail}
                </span>
              </p>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <div
              id={serverErrorId}
              role="alert"
              className="mb-5 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            >
              {serverError}
            </div>
          )}

          {step === "send" ? (
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="verification-email"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Email address
                </label>
                <input
                  ref={emailInputRef}
                  id="verification-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (emailTouched) runEmailValidation(e.target.value);
                    setServerError(null);
                  }}
                  onBlur={() => {
                    setEmailTouched(true);
                    runEmailValidation(emailInput);
                  }}
                  disabled={loading}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? emailErrorId : undefined}
                  placeholder="you@example.com"
                  className={`w-full rounded-2xl border bg-white dark:bg-slate-800 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:ring-4 ${
                    emailError
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500"
                      : "border-slate-300 dark:border-slate-700 focus:border-gold focus:ring-gold/10"
                  }`}
                />
                {emailError && (
                  <p
                    id={emailErrorId}
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading || !isEmailValid}
                className="w-full h-12 rounded-2xl bg-navy dark:bg-white text-white dark:text-navy font-semibold hover:bg-navy/90 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-navy/20 dark:shadow-black/20"
              >
                {loading ? "Sending code..." : "Send verification code"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label
                  htmlFor="verification-email"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Email address
                </label>
                <input
                  id="verification-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (emailTouched) runEmailValidation(e.target.value);
                    setServerError(null);
                  }}
                  onBlur={() => {
                    setEmailTouched(true);
                    runEmailValidation(emailInput);
                  }}
                  disabled={loading}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? emailErrorId : undefined}
                  placeholder="you@example.com"
                  className={`w-full rounded-2xl border bg-white dark:bg-slate-800 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:ring-4 ${
                    emailError
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500"
                      : "border-slate-300 dark:border-slate-700 focus:border-gold focus:ring-gold/10"
                  }`}
                />
                {emailError && (
                  <p
                    id={emailErrorId}
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="verification-otp"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  6-digit verification code
                </label>
                <input
                  ref={otpInputRef}
                  id="verification-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(value);
                    if (otpTouched) runOtpValidation(value);
                    setServerError(null);
                  }}
                  onBlur={() => {
                    setOtpTouched(true);
                    runOtpValidation(otp);
                  }}
                  disabled={loading}
                  aria-invalid={!!otpError}
                  aria-describedby={otpError ? otpErrorId : undefined}
                  placeholder="000000"
                  className={`w-full rounded-2xl border bg-white dark:bg-slate-800 px-4 py-4 text-center text-2xl sm:text-3xl font-bold tracking-[0.35em] text-slate-900 dark:text-white placeholder:tracking-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:ring-4 ${
                    otpError
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500"
                      : "border-slate-300 dark:border-slate-700 focus:border-gold focus:ring-gold/10"
                  }`}
                />
                {otpError && (
                  <p
                    id={otpErrorId}
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    {otpError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isEmailValid || !isOtpValid}
                className="w-full h-12 rounded-2xl bg-navy dark:bg-white text-white dark:text-navy font-semibold hover:bg-navy/90 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-navy/20 dark:shadow-black/20"
              >
                {loading ? "Verifying..." : "Verify & continue"}
              </button>

              <div className="pt-1 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  Didn’t receive the code?
                </p>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading || !isEmailValid}
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-gold hover:text-yellow-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  {resendCooldown > 0 ? (
                    <>
                      <Clock className="w-4 h-4" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    "Resend code"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};