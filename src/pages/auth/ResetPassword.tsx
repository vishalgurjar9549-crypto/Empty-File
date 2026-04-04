import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, Clock } from "lucide-react";

import { useAppDispatch } from "../../store/hooks";
import { Button } from "../../components/ui/Button";
import { authApi } from "../../api/auth.api";
import { showToast } from "../../store/slices/ui.slice";

type FormErrors = {
  password?: string;
  confirmPassword?: string;
  general?: string;
};

type PageState = "loading" | "validating" | "form" | "success" | "error";

/**
 * RESET PASSWORD PAGE
 *
 * Allows users to set a new password using a reset token.
 *
 * Flow:
 * 1. Component mounts, validates the reset token from URL
 * 2. If valid, shows password reset form
 * 3. If invalid/expired, shows error message
 * 4. On submit, resets password and navigates to login
 *
 * Features:
 * - Token validation on mount
 * - Password strength requirements
 * - Show/hide password toggle
 * - Loading states
 * - Error handling
 * - Responsive design
 */
export function ResetPassword() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const token = searchParams.get("token");

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setPageState("error");
        setValidationError("Reset token is missing from the URL");
        return;
      }

      try {
        setPageState("validating");
        const result = await authApi.validateResetToken(token);

        if (result.valid) {
          setPageState("form");
        } else {
          setPageState("error");
          setValidationError("Reset link is invalid or has expired");
        }
      } catch (error: any) {
        setPageState("error");
        setValidationError("Failed to validate reset token. Please try again.");
      }
    };

    validateToken();
  }, [token]);

  const isFormValid = useMemo(() => {
    return (
      password.trim().length > 0 &&
      confirmPassword.trim().length > 0 &&
      !formErrors.password &&
      !formErrors.confirmPassword
    );
  }, [password, confirmPassword, formErrors]);

  useEffect(() => {
    if (formErrors.general) {
      errorSummaryRef.current?.focus();
    }
  }, [formErrors.general]);

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const validateConfirmPassword = (
    passwordVal: string,
    confirmVal: string
  ) => {
    if (!confirmVal) return "Please confirm your password";
    if (passwordVal !== confirmVal) return "Passwords do not match";
    return "";
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setFormErrors((prev) => ({
      ...prev,
      password: prev.password ? validatePassword(value) || undefined : prev.password,
      confirmPassword:
        confirmPassword && prev.confirmPassword
          ? validateConfirmPassword(value, confirmPassword) || undefined
          : prev.confirmPassword,
      general: undefined,
    }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setFormErrors((prev) => ({
      ...prev,
      confirmPassword: prev.confirmPassword
        ? validateConfirmPassword(password, value) || undefined
        : prev.confirmPassword,
      general: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate() || !token) return;

    setLoading(true);

    try {
      await authApi.resetPassword(token, password.trim());

      dispatch(
        showToast({
          message: "Password reset successfully! Redirecting to login...",
          type: "success",
        })
      );

      setPageState("success");

      // Redirect to login after a few seconds
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to reset password";

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

  // Loading State
  if (pageState === "loading" || pageState === "validating") {
    return (
      <div className="min-h-screen bg-cream dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 animate-pulse">
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Validating reset link...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (pageState === "error") {
    return (
      <div className="min-h-screen bg-cream dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg dark:shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
            {/* Icon */}
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            {/* Error Message */}
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-2">
              Link expired
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {validationError ||
                "This password reset link is no longer valid or has expired."}
            </p>

            {/* Action */}
            <Link
              to="/auth/forgot-password"
              className="inline-block w-full"
            >
              <Button
                fullWidth
                size="lg"
                className="bg-navy dark:bg-white text-white dark:text-navy hover:bg-navy/90 dark:hover:bg-slate-100 transition-all"
              >
                Request new link
              </Button>
            </Link>

            {/* Help Text */}
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
              Remember your password?{" "}
              <Link
                to="/auth/login"
                className="font-semibold text-navy dark:text-white hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (pageState === "success") {
    return (
      <div className="min-h-screen bg-cream dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg dark:shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
            {/* Icon */}
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            {/* Message */}
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-2">
              Password reset!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your password has been successfully reset. You can now login with your new password.
            </p>

            {/* Loading animation */}
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg dark:shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy dark:text-white mb-2">
              Set new password
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Choose a strong password to secure your account
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
            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-navy dark:text-white mb-2"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => {
                    if (password.trim()) {
                      setFormErrors((prev) => ({
                        ...prev,
                        password: validatePassword(password) || undefined,
                      }));
                    }
                  }}
                  placeholder="At least 6 characters"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors outline-none pr-10 ${
                    formErrors.password
                      ? "border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-700"
                      : "border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  } text-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-navy dark:focus:border-white`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-navy dark:text-white mb-2"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  onBlur={() => {
                    if (confirmPassword.trim()) {
                      setFormErrors((prev) => ({
                        ...prev,
                        confirmPassword:
                          validateConfirmPassword(password, confirmPassword) ||
                          undefined,
                      }));
                    }
                  }}
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors outline-none pr-10 ${
                    formErrors.confirmPassword
                      ? "border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-700"
                      : "border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  } text-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-navy dark:focus:border-white`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                  {formErrors.confirmPassword}
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
                  Resetting...
                </span>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Remember your password?{" "}
            <Link
              to="/auth/login"
              className="font-semibold text-navy dark:text-white hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
