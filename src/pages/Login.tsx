import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login, clearError } from "../store/slices/auth.slice";
import { Button } from "../components/ui/Button";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { loading, error, authStatus, user } = useAppSelector(
    (state) => state.auth,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (authStatus !== "AUTHENTICATED" || !user) return;
    if (hasRedirectedRef.current) return;

    // Check if this is phone flow - if so, allow user to stay on login page
    const searchParams = new URLSearchParams(location.search);
    const isPhoneFlow = searchParams.get("phone_flow") === "true";
    if (isPhoneFlow) {
      return; // Allow phone flow users to stay on login page
    }

    hasRedirectedRef.current = true;
    // If redirected here from a protected action, return to that page first
    const from = (location.state as any)?.from;
    const isAuthPage = (path: string) =>
      path.startsWith("/auth/login") || path.startsWith("/auth/register");
    if (from && !isAuthPage(from)) {
      navigate(from, {
        replace: true,
      });
      return;
    }
    // FIXED: Normalize role to uppercase for consistent comparison
    const userRole = user.role?.toUpperCase();
    if (userRole === "ADMIN") {
      navigate("/admin", {
        replace: true,
      });
    } else if (userRole === "OWNER") {
      navigate("/owner/dashboard", {
        replace: true,
      });
    } else if (userRole === "AGENT") {
      navigate("/agent/dashboard", {
        replace: true,
      });
    } else if (userRole === "TENANT") {
      navigate("/rooms", {
        replace: true,
      });
    } else {
      navigate("/", {
        replace: true,
      });
    }
  }, [authStatus, user, navigate, location.state, location.search]);
  // ✅ Wake backend when login page loads
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;

    fetch(`${apiUrl}/health`).catch(() => {});
  }, []);
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(
      login({
        email,
        password,
        portal: "USER",
      }),
    );
  };
  // ── Google OAuth Handler ─────────────────────────────────────────────
  // ── Google OAuth Handler ─────────────────────────────────────────────
  const handleGoogleLogin = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    await fetch(`${apiUrl}/health`, { method: "GET", cache: "no-store" });
  } catch {}

  const url = `${apiUrl}/auth/google`;

  // If running inside mobile app
  if (Capacitor.isNativePlatform()) {
    await Browser.open({
      url: `${url}?mobile=true`,
    });
  } else {
    // Normal web login
    window.location.href = url;
  }
};


  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 pt-20">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-navy/10 dark:shadow-black/30 p-6 sm:p-8 border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4 group">
            <div className="w-12 h-12 bg-navy dark:bg-slate-700 rounded-tr-xl rounded-bl-xl flex items-center justify-center mx-auto shadow-lg shadow-navy/20 transition-transform group-hover:scale-110 duration-300">
              <span className="text-gold font-playfair font-bold text-2xl">
                K
              </span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy dark:text-white font-playfair mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Sign in to manage your account
          </p>
        </div>

        {(error || formErrors.general) && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 flex-shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error || formErrors.general}</span>
          </div>
        )}

        {/* ── Google OAuth Button ──────────────────────────────────── */}
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          size="lg"
          fullWidth
          className="mb-6 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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

        {/* ── Divider ─────────────────────────────────────────────── */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 bg-white dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-gold/50 outline-none transition-all dark:text-white dark:placeholder-slate-400 ${formErrors.email ? "border-red-300 dark:border-red-700 focus:border-red-400" : "border-slate-200 dark:border-slate-600 focus:border-gold"}`}
              placeholder="you@example.com"
            />

            {formErrors.email && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1">
                {formErrors.email}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <a
                href="#"
                className="text-xs font-medium text-gold hover:text-yellow-600 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 bg-white dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-gold/50 outline-none transition-all dark:text-white dark:placeholder-slate-400 ${formErrors.password ? "border-red-300 dark:border-red-700 focus:border-red-400" : "border-slate-200 dark:border-slate-600 focus:border-gold"}`}
              placeholder="••••••••"
            />

            {formErrors.password && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1">
                {formErrors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            fullWidth
            size="lg"
            className="mt-2"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="text-gold font-bold hover:underline hover:text-yellow-600 transition-colors"
          >
            Sign up
          </Link>
        </p>

        {/* Admin portal link
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
        Admin?{' '}
        <Link
         to="/admin/login"
         className="text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white underline transition-colors">
          Login here
        </Link>
        </p> */}
      </div>
    </div>
  );
}
