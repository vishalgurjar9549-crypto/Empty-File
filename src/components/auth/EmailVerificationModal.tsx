import React, { useState, useRef, useEffect } from "react";
import { X, Mail, Clock, AlertCircle } from "lucide-react";
import axiosInstance from "../../api/axios";

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  onSuccess: () => void;
  onClose: () => void;
  onError: (error: string) => void;
}

/**
 * ═════════════════════════════════════════════════════════════════════
 * EMAIL VERIFICATION MODAL
 * ═════════════════════════════════════════════════════════════════════
 *
 * Triggered when API returns:
 * {
 *   code: "EMAIL_VERIFICATION_REQUIRED",
 *   message: "Please verify your email before proceeding"
 * }
 *
 * Features:
 * - 2-step verification (send OTP → verify OTP)
 * - Auto-filled email (shows current user's email)
 * - Resend with cooldown
 * - On success: Close modal + retry previous action automatically
 *
 * Use Case: User tries to create a property without email verification
 */

type Step = "send" | "verify";

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  email,
  onSuccess,
  onClose,
  onError: _onError,
}) => {
  const [step, setStep] = useState<Step>("send");
  const [emailInput, setEmailInput] = useState(email || "");
  const [otpSentToEmail, setOtpSentToEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setEmailInput(email || "");
    setStep("send");
    setOtp("");
    setResendCooldown(0);
    setOtpSentToEmail(null);
    setInlineError(null);
  }, [isOpen, email]);

  // Auto-focus OTP input
  useEffect(() => {
    if (step === "verify" && otpInputRef.current) {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Handle OTP paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedData = e.clipboardData?.getData("text") || "";
      if (/^\d{6}$/.test(pastedData)) {
        setOtp(pastedData);
        e.preventDefault();
      }
    };

    const input = otpInputRef.current;
    if (input) {
      input.addEventListener("paste", handlePaste);
      return () => input.removeEventListener("paste", handlePaste);
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  const normalizeEmail = (value: string) => value.trim().toLowerCase();
  const currentEmail = normalizeEmail(emailInput);

  // ═════════════════════════════════════════════════════════════════════
  // REQUEST OTP
  // ═════════════════════════════════════════════════════════════════════
  const handleSendOTP = async () => {
    setInlineError(null);
    if (!currentEmail) {
      setInlineError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("kangaroo_token");
      console.log("SENDING EMAIL:", currentEmail);
      const response = await axiosInstance.post(
        "/auth/send-email-otp",
        { email: currentEmail },
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined,
      );
      const data: any = response?.data;

      if (!data?.success) {
        setInlineError(data?.message || "Failed to send OTP");
        return;
      }

      setStep("verify");
      setResendCooldown(30);
      setOtpSentToEmail(currentEmail);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Network error";
      setInlineError(message);
    } finally {
      setLoading(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════
  // VERIFY OTP
  // ═════════════════════════════════════════════════════════════════════
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!currentEmail) {
      setInlineError("Please enter your email");
      return;
    }

    // If user edits email after sending OTP, they must resend to new email.
    if (otpSentToEmail && currentEmail !== otpSentToEmail) {
      setInlineError(
        "Email changed. Please send a new code to the updated email.",
      );
      setStep("send");
      setOtp("");
      setResendCooldown(0);
      setOtpSentToEmail(null);
      return;
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setInlineError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // verify-email-otp is protected by authMiddleware
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
          : undefined,
      );

      const data: any = response?.data;

      if (!data?.success) {
        if (
          data?.code === "INVALID_OTP" &&
          String(data?.message || "").includes("expired")
        ) {
          setInlineError("OTP expired. Please request a new one.");
          setStep("send");
          setOtp("");
          setResendCooldown(0);
          setOtpSentToEmail(null);
          return;
        }

        setInlineError(data?.message || "OTP verification failed");
        return;
      }

      // ✅ VERIFICATION SUCCESSFUL
      onSuccess();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Network error";
      setInlineError(message);
    } finally {
      setLoading(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════
  // RESEND OTP
  // ═════════════════════════════════════════════════════════════════════
  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    await handleSendOTP();
  };

  const EmailField = (
    <div className="mt-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Email
      </label>
      <input
        type="email"
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
        disabled={loading}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
        placeholder="you@example.com"
      />
    </div>
  );

  const InlineError = inlineError ? (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {inlineError}
    </div>
  ) : null;

  const hasSentTo =
    otpSentToEmail && step === "verify" ? (
      <p className="text-gray-500 text-xs mt-2 text-center">
        Code sent to <span className="font-semibold">{otpSentToEmail}</span>
      </p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Alert */}
        <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900 text-sm">
              Email Verification Required
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Verify your email to continue with this action
            </p>
          </div>
        </div>

        {step === "send" ? (
          // ═════════════════════════════════════════════════════════════════════
          // STEP 1: SEND OTP
          // ═════════════════════════════════════════════════════════════════════
          <div>
            <div className="text-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-3">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Verify email
              </h3>
              <p className="text-gray-600 text-sm">
                Enter the email where you want to receive the code
              </p>
              {EmailField}
              {InlineError}
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </div>
        ) : (
          // ═════════════════════════════════════════════════════════════════════
          // STEP 2: VERIFY OTP
          // ═════════════════════════════════════════════════════════════════════
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                Enter verification code
              </h3>
              <p className="text-gray-600 text-sm text-center">
                Check your email for the 6-digit code
              </p>
              {hasSentTo}
              {EmailField}
              {InlineError}
            </div>

            {/* OTP Input */}
            <div className="mb-6">
              <input
                ref={otpInputRef}
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center text-3xl font-bold tracking-widest transition-colors"
                disabled={loading}
              />
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-4"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-3">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-blue-600 font-medium hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {resendCooldown > 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Resend in {resendCooldown}s</span>
                  </>
                ) : (
                  "Resend Code"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
