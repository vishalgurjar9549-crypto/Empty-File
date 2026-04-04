import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login, clearError } from "../store/slices/auth.slice";
import { Button } from "../components/ui/Button";

import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthErrorAlert } from "../components/auth/AuthErrorAlert";
import { PasswordField } from "../components/auth/PasswordField";

type FormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { loading, error, authStatus, user } = useAppSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const hasRedirectedRef = useRef(false);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const isFormValid = useMemo(() => {
    return (
      email.trim().length > 0 &&
      password.trim().length > 0 &&
      !formErrors.email &&
      !formErrors.password
    );
  }, [email, password, formErrors.email, formErrors.password]);

  useEffect(() => {
    if (authStatus !== "AUTHENTICATED" || !user) return;
    if (hasRedirectedRef.current) return;

    const searchParams = new URLSearchParams(location.search);
    const isPhoneFlow = searchParams.get("phone_flow") === "true";
    if (isPhoneFlow) return;

    hasRedirectedRef.current = true;

    const from = (location.state as any)?.from;
    const isAuthPage = (path: string) =>
      path.startsWith("/auth/login") || path.startsWith("/auth/register");

    if (from && !isAuthPage(from)) {
      navigate(from, { replace: true });
      return;
    }

    const userRole = user.role?.toUpperCase();

    if (userRole === "ADMIN") {
      navigate("/admin", { replace: true });
    } else if (userRole === "OWNER") {
      navigate("/owner/dashboard", { replace: true });
    } else if (userRole === "AGENT") {
      navigate("/agent/dashboard", { replace: true });
    } else if (userRole === "TENANT") {
      navigate("/rooms", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [authStatus, user, navigate, location.state, location.search]);

  useEffect(() => {
    fetch(`${apiUrl}/health`).catch(() => {});
  }, [apiUrl]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error || formErrors.general) {
      errorSummaryRef.current?.focus();
    }
  }, [error, formErrors.general]);

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

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

    if (error) dispatch(clearError());
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    setFormErrors((prev) => ({
      ...prev,
      password: prev.password ? validatePassword(value) || undefined : prev.password,
      general: undefined,
    }));

    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;
    if (!validate()) return;

    dispatch(
      login({
        email: email.trim(),
        password,
        portal: "USER",
      }),
    );
  };

  const handleGoogleLogin = async () => {
    try {
      await fetch(`${apiUrl}/health`, { method: "GET", cache: "no-store" });
    } catch {}

    const url = `${apiUrl}/auth/google`;

    if (Capacitor.isNativePlatform()) {
      await Browser.open({
        url: `${url}?mobile=true`,
      });
    } else {
      window.location.href = url;
    }
  };

  const generalError = error || formErrors.general;

  return (
    <AuthLayout
      badge="Secure sign in"
      title="Welcome Back"
      description="Sign in to access your account and continue where you left off."
      heroBadge="Secure access for tenants, owners & agents"
      heroTitle="Welcome back to your rental workspace"
      heroDescription="Manage listings, save favourite properties, track applications, and continue your room search without friction."
      heroPoints={[
        {
          title: "Verified property workflows",
          description: "Cleaner browsing and better trust for renters and owners.",
        },
        {
          title: "Fast sign in across devices",
          description: "Optimized for web, tablets, and mobile app experiences.",
        },
        {
          title: "Secure account access",
          description: "Protected authentication flow with role-based navigation.",
        },
      ]}
    >
      {generalError && (
        <AuthErrorAlert
          error={generalError}
          title="Sign in failed"
          errorRef={errorSummaryRef}
        />
      )}

      <Button
        type="button"
        onClick={handleGoogleLogin}
        variant="outline"
        size="lg"
        fullWidth
        disabled={loading}
        className="mb-6 h-12 flex items-center justify-center gap-3 rounded-xl border-slate-300 dark:border-slate-700"
        aria-label="Continue with Google"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-slate-900 px-4 text-slate-500 dark:text-slate-400">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            aria-invalid={!!formErrors.email}
            aria-describedby={formErrors.email ? "email-error" : undefined}
            className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all ${
              formErrors.email
                ? "border-red-400 dark:border-red-700 focus:ring-4 focus:ring-red-500/10"
                : "border-slate-300 dark:border-slate-700 focus:border-gold focus:ring-4 focus:ring-gold/10"
            }`}
            placeholder="you@example.com"
          />
          {formErrors.email && (
            <p
              id="email-error"
              className="mt-1.5 ml-1 text-xs text-red-600 dark:text-red-400"
              role="alert"
            >
              {formErrors.email}
            </p>
          )}
        </div>

        <PasswordField
          id="password"
          name="password"
          label="Password"
          value={password}
          onChange={handlePasswordChange}
          error={formErrors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
          helperLink={
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-gold hover:text-yellow-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm transition-colors"
            >
              Forgot password?
            </Link>
          }
        />

        <Button
          type="submit"
          disabled={loading || !isFormValid}
          loading={loading}
          fullWidth
          size="lg"
          className="mt-2 h-12 rounded-xl"
        >
          Sign In
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          to="/auth/register"
          className="font-semibold text-gold hover:text-yellow-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm transition-colors"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}