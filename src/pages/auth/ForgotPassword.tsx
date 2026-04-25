import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

import { useAppDispatch } from "../../store/hooks";
import { authApi } from "../../api/auth.api";
import { showToast } from "../../store/slices/ui.slice";

const gold = "rgba(212,175,55,0.9)";
const goldSoft = "rgba(212,175,55,0.12)";
const goldBorder = "rgba(212,175,55,0.25)";

type FormErrors = {
  email?: string;
  general?: string;
};

export function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errorRef = useRef<HTMLDivElement | null>(null);

  const isFormValid = useMemo(() => {
    return email.trim().length > 0 && !formErrors.email;
  }, [email, formErrors.email]);

  useEffect(() => {
    if (formErrors.general) {
      errorRef.current?.focus();
    }
  }, [formErrors.general]);

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Enter a valid email address";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setFormErrors({ email: emailError });
      return;
    }

    setLoading(true);

    try {
      await authApi.requestPasswordReset(email.trim());

      dispatch(
        showToast({
          message: "Reset link sent successfully",
          type: "success",
        })
      );

      setSubmitted(true);
      setTimeout(() => navigate("/auth/login"), 2500);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Something went wrong. Try again.";

      setFormErrors({ general: msg });

      dispatch(
        showToast({
          message: msg,
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ SUCCESS SCREEN
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#0d0b06] transition-colors">
        <section className="w-full max-w-md text-center">
          <div
            className="p-8 rounded-2xl border backdrop-blur-lg shadow-xl"
            style={{ borderColor: goldBorder, background: goldSoft }}
          >
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
              style={{ background: goldSoft }}
            >
              <Mail className="w-7 h-7" style={{ color: gold }} />
            </div>

            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Check your email
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Reset link sent to <strong>{email}</strong>
            </p>

            <p className="text-xs text-gray-500">
              Redirecting to login...
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className="
      min-h-screen
      px-4
      pt-10 pb-6

      flex flex-col
      justify-start

      bg-gray-50 dark:bg-[#0d0b06]
      transition-colors
    "
    >
      <section className="w-full max-w-md mx-auto">

        {/* Back */}
        <Link
          to="/auth/login"
          className="
          inline-flex items-center gap-2 text-sm mb-4
          text-gray-600 dark:text-gray-400
          hover:text-black dark:hover:text-white transition
        "
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>

        {/* Card */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[#d4af37]/40 to-transparent">
          <div
            className="
            rounded-2xl p-6 sm:p-8 shadow-xl
            bg-white dark:bg-[#111]
            transition-colors
          "
          >
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Forgot Password
              </h1>
              <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                Enter your email to receive a reset link
              </p>
            </div>

            {/* Input */}
            <div className="mb-5">
              <label className="text-sm mb-2 block text-gray-700 dark:text-gray-300">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormErrors({});
                }}
                placeholder="you@example.com"
                className="
                  w-full px-4 py-3 rounded-xl border outline-none transition

                  bg-white dark:bg-black
                  text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500

                  border-gray-300 dark:border-gray-800
                  focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]
                "
              />

              {formErrors.email && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-2">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Button */}
            <button
              onClick={handleSubmit as any}
              disabled={!isFormValid || loading}
              className="
                w-full py-3.5 rounded-xl font-semibold text-base
                bg-[#d4af37] text-black
                hover:brightness-110
                active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            {/* Info */}
            <p className="text-xs text-center mt-4 text-gray-500">
              Link valid for 10 minutes
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center text-sm space-y-1.5 text-gray-600 dark:text-gray-400">
          <p>
            Remember your password?{" "}
            <Link
              to="/auth/login"
              className="text-black dark:text-white hover:underline"
            >
              Sign in
            </Link>
          </p>

          <p>
            New here?{" "}
            <Link
              to="/auth/register"
              className="text-black dark:text-white hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>

      </section>
    </main>
  );
}