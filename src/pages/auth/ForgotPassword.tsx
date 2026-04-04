import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

import { useAppDispatch } from "../../store/hooks";
import { Button } from "../../components/ui/Button";
import { authApi } from "../../api/auth.api";
import { showToast } from "../../store/slices/ui.slice";

type FormErrors = {
  email?: string;
  general?: string;
};

/**
 * FORGOT PASSWORD PAGE
 *
 * Allows users to request a password reset via email.
 *
 * Features:
 * - Email validation
 * - Loading state during submission
 * - Success message when email is sent
 * - Link back to login
 * - Responsive design
 */
export function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const isFormValid = useMemo(() => {
    return email.trim().length > 0 && !formErrors.email;
  }, [email, formErrors.email]);

  useEffect(() => {
    if (formErrors.general) {
      errorSummaryRef.current?.focus();
    }
  }, [formErrors.general]);

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    const emailError = validateEmail(email);

    if (emailError) newErrors.email = emailError;

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setFormErrors((prev) => ({
      ...prev,
      email: prev.email ? validateEmail(value) || undefined : prev.email,
      general: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await authApi.requestPasswordReset(email.trim());

      // Show success message
      dispatch(
        showToast({
          message: "Check your email for password reset instructions",
          type: "success",
        })
      );

      setSubmitted(true);

      // After a few seconds, navigate back to login
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to request password reset";

      dispatch(
        showToast({
          message: errorMessage,
          type: "error",
        })
      );

      setFormErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg dark:shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
            {/* Icon */}
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-2">
              Check your email
            </h2>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We've sent a password reset link to{" "}
              <span className="font-semibold text-navy dark:text-white">{email}</span>
            </p>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                <strong>Next steps:</strong>
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Check your email (including spam folder)</li>
                <li>Click the reset link</li>
                <li>Enter your new password</li>
                <li>Login with your new password</li>
              </ul>
            </div>

            {/* Link timeout message */}
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-6">
              The reset link expires in 20 minutes for security
            </p>

            {/* Redirect message */}
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Redirecting to login in 3 seconds...
            </p>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Didn't receive the email?
            </p>
            <Link
              to="/auth/forgot-password"
              className="text-sm font-semibold text-navy dark:text-white hover:text-navy/80 dark:hover:text-slate-300 transition-colors"
            >
              Try again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg dark:shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy dark:text-white mb-2">
              Forgot password?
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Enter your email to receive reset instructions
            </p>
          </div>

          {/* Error Alert */}
          {formErrors.general && (
            <div
              ref={errorSummaryRef}
              role="alert"
              tabIndex={-1}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <p className="text-sm font-medium text-red-800 dark:text-red-400">
                {formErrors.general}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-navy dark:text-white mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => {
                  if (email.trim()) {
                    setFormErrors((prev) => ({
                      ...prev,
                      email: validateEmail(email) || undefined,
                    }));
                  }
                }}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors outline-none ${
                  formErrors.email
                    ? "border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-700"
                    : "border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                } text-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-navy dark:focus:border-white`}
                disabled={loading}
              />
              {formErrors.email && (
                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={!isFormValid || loading}
              className="bg-navy dark:bg-white text-white dark:text-navy hover:bg-navy/90 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            {/* Info */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-500">
              We'll send a secure link to your email (valid for 20 minutes)
            </p>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Remember your password?{" "}
            <Link
              to="/auth/login"
              className="font-semibold text-navy dark:text-white hover:underline"
            >
              Sign in
            </Link>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="font-semibold text-navy dark:text-white hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
