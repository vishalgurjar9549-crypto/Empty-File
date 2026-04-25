import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, Clock } from "lucide-react";

import { useAppDispatch } from "../../store/hooks";
import { authApi } from "../../api/auth.api";
import { showToast } from "../../store/slices/ui.slice";

type FormErrors = {
  password?: string;
  confirmPassword?: string;
  general?: string;
};

type PageState = "loading" | "validating" | "form" | "success" | "error";

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
      } catch {
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

  const validateConfirmPassword = (passwordVal: string, confirmVal: string) => {
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

      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to reset password";

      dispatch(showToast({ message: msg, type: "error" }));
      setFormErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (pageState === "loading" || pageState === "validating") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d0b06]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto bg-[#d4af37]/10">
            <Clock className="w-7 h-7 text-[#d4af37] animate-spin" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Validating reset link...
          </p>
        </div>
      </main>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (pageState === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d0b06] px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[#d4af37]/40 to-transparent">
            <div className="bg-gray-100 dark:bg-[#111] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center bg-red-500/10">
                <Lock className="w-7 h-7 text-red-400" />
              </div>

              <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                Link expired
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                {validationError}
              </p>

              <Link to="/auth/forgot-password">
                <button className="w-full py-3 rounded-xl bg-[#d4af37] text-black font-semibold hover:brightness-110">
                  Request new link
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ---------------- SUCCESS ---------------- */
  if (pageState === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d0b06] px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[#d4af37]/40 to-transparent">
            <div className="bg-gray-100 dark:bg-[#111] rounded-2xl p-8 text-center">
              <CheckCircle2 className="w-7 h-7 text-[#d4af37] mx-auto mb-4" />

              <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                Password Reset
              </h2>

              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your password has been updated successfully.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ---------------- FORM ---------------- */
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#0d0b06]">
      <section className="w-full max-w-md">

        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[#d4af37]/40 to-transparent">
          <div className="bg-gray-100 dark:bg-[#111] rounded-2xl p-8 shadow-2xl">

            <h1 className="text-3xl font-bold text-black dark:text-white mb-6">
              Set New Password
            </h1>

            {formErrors.general && (
              <div className="mb-4 text-red-500 text-sm">
                {formErrors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-gray-300 dark:border-gray-800 text-black dark:text-white"
              />

              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-gray-300 dark:border-gray-800 text-black dark:text-white"
              />

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full py-3 rounded-xl bg-[#d4af37] text-black font-semibold"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

            </form>
          </div>
        </div>

      </section>
    </main>
  );
}