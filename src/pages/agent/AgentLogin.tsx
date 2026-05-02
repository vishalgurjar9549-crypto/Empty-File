// import React, { useEffect, useState, useRef } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAppDispatch, useAppSelector } from '../../store/hooks';
// import { login, clearError } from '../../store/slices/auth.slice';
// import { Button } from '../../components/ui/Button';
// import { AuthCardLayout } from '../../components/auth/AuthCardLayout';

// /**
//  * ═════════════════════════════════════════════════════════════════════
//  * AGENT LOGIN PAGE
//  * ═════════════════════════════════════════════════════════════════════
//  *
//  * Secure agent authentication with role validation.
//  * - Email + Password form
//  * - Validates role === AGENT
//  * - Redirects to /agent/dashboard on success
//  * - Shows error if user is not an agent
//  */
// export function AgentLogin() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const { loading, error, authStatus, user } = useAppSelector(
//     (state) => state.auth
//   );

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});
//   const [roleCheckError, setRoleCheckError] = useState<string | null>(null);
//   const hasRedirectedRef = useRef(false);

//   // Redirect on successful agent login
//   useEffect(() => {
//     // 1. Skip if still loading from API
//     if (loading) {
//       console.log('[AgentLogin] Still loading from API...');
//       return;
//     }

//     // 2. Skip if not authenticated
//     if (authStatus !== 'AUTHENTICATED') {
//       console.log('[AgentLogin] Not authenticated yet', { authStatus });
//       return;
//     }

//     // 3. Skip if no user data
//     if (!user) {
//       console.log('[AgentLogin] No user data available');
//       return;
//     }

//     // 4. Skip if already redirected (prevent infinite loops)
//     if (hasRedirectedRef.current) {
//       console.log('[AgentLogin] Already redirected, skipping');
//       return;
//     }

//     // 5. Log current state for debugging
//     console.log('[AgentLogin] Checking agent role:', {
//       userId: user.id,
//       userEmail: user.email,
//       rawRole: user.role,
//       normalizedRole: user.role?.toUpperCase(),
//       authStatus
//     });

//     // 6. Normalize and check role
//     const userRole = user.role?.toUpperCase();
//     if (!userRole) {
//       const errorMsg = 'User role is missing. Contact support.';
//       console.error('[AgentLogin] Role is undefined:', { user });
//       setRoleCheckError(errorMsg);
//       return;
//     }

//     // 7. Check if user is an agent
//     if (userRole !== 'AGENT') {
//       const errorMsg = `Access denied. Your account role is "${user.role}". Only agents can access this portal.`;
//       console.warn('[AgentLogin] Access denied - not an agent:', { userRole });
//       setRoleCheckError(errorMsg);
//       return;
//     }

//     // 8. User is an agent - mark as redirecting and navigate
//     console.log('[AgentLogin] ✅ Agent verified, redirecting to dashboard');
//     hasRedirectedRef.current = true;
//     navigate('/agent/dashboard', { replace: true });
//   }, [authStatus, user, loading, navigate]);

//   // Clear errors on mount
//   useEffect(() => {
//     dispatch(clearError());
//     setRoleCheckError(null);
//   }, [dispatch]);

//   const validate = () => {
//     const newErrors: Record<string, string> = {};

//     if (!email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }

//     if (!password) {
//       newErrors.password = 'Password is required';
//     }

//     setFormErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validate()) return;

//     // Clear previous role check error before attempting login
//     setRoleCheckError(null);

//     console.log('[AgentLogin] Attempting login with email:', email);
    
//     // Dispatch login thunk
//     const result = await dispatch(
//       login({
//         email,
//         password,
//       })
//     );

//     // Check if login was rejected
//     if (login.rejected.match(result)) {
//       console.error('[AgentLogin] Login thunk rejected:', result.payload);
//     } else if (login.fulfilled.match(result)) {
//       console.log('[AgentLogin] Login thunk fulfilled, waiting for redirect...');
//     }
//   };

//   return (
//     <AuthCardLayout
//       badge={{
//         icon: '🤖',
//         text: 'Agent Portal',
//       }}
//       title="Agent Login"
//       subtitle="Access your agent dashboard"
//       footerLink={{
//         text: "Don't have an account?",
//         linkText: 'Apply as Agent',
//         href: '/agent/register',
//       }}
//     >
//       {/* Errors */}
//       {(error || roleCheckError || formErrors.general) && (
//         <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-300 text-sm flex items-start gap-2">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5 flex-shrink-0 mt-0.5"
//             viewBox="0 0 20 20"
//             fill="currentColor"
//           >
//             <path
//               fillRule="evenodd"
//               d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
//               clipRule="evenodd"
//             />
//           </svg>
//           <span>{roleCheckError || error || formErrors.general}</span>
//         </div>
//       )}

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="space-y-5">
//         <div>
//           <label className="block text-sm font-medium text-slate-300 mb-1.5">
//             Email Address
//           </label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className={`w-full px-4 py-3 bg-slate-800 border rounded-xl focus:ring-2 focus:ring-gold/50 outline-none transition-all text-white placeholder-slate-500 ${
//               formErrors.email
//                 ? 'border-red-700 focus:border-red-500'
//                 : 'border-slate-700 focus:border-gold'
//             }`}
//             placeholder="agent@example.com"
//             autoComplete="email"
//           />
//           {formErrors.email && (
//             <p className="text-red-400 text-xs mt-1.5 ml-1">
//               {formErrors.email}
//             </p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-slate-300 mb-1.5">
//             Password
//           </label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className={`w-full px-4 py-3 bg-slate-800 border rounded-xl focus:ring-2 focus:ring-gold/50 outline-none transition-all text-white placeholder-slate-500 ${
//               formErrors.password
//                 ? 'border-red-700 focus:border-red-500'
//                 : 'border-slate-700 focus:border-gold'
//             }`}
//             placeholder="••••••••"
//             autoComplete="current-password"
//           />
//           {formErrors.password && (
//             <p className="text-red-400 text-xs mt-1.5 ml-1">
//               {formErrors.password}
//             </p>
//           )}
//         </div>

//         <Button
//           type="submit"
//           disabled={loading}
//           loading={loading}
//           fullWidth
//           size="lg"
//           className="mt-2"
//         >
//           Sign In to Agent Portal
//         </Button>
//       </form>

//       {/* Additional Links */}
//       <div className="mt-6 pt-6 border-t border-slate-800 text-center space-y-2 text-xs">
//         <p>
//           <Link
//             to="/auth/forgot-password"
//             className="text-slate-500 hover:text-slate-300 underline transition-colors"
//           >
//             Forgot your password?
//           </Link>
//         </p>
//         <p className="text-slate-600">
//           Regular user?{' '}
//           <Link
//             to="/auth/login"
//             className="text-slate-500 hover:text-slate-300 underline transition-colors"
//           >
//             Go to user login
//           </Link>
//         </p>
//       </div>
//     </AuthCardLayout>
//   );
// }



import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { login, clearError } from "../../store/slices/auth.slice";

import { Button } from "../../components/ui/Button";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthErrorAlert } from "../../components/auth/AuthErrorAlert";
import { PasswordField } from "../../components/auth/PasswordField";

type FormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export function AgentLogin() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading, error, authStatus, user } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const hasRedirectedRef = useRef(false);
  const errorRef = useRef<HTMLDivElement | null>(null);

  /* =========================
     VALIDATION
  ========================== */
  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Invalid email";
    return "";
  };

  const inputClass = (error?: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all
   bg-white text-slate-900 placeholder:text-slate-400
   dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500
   ${
     error
       ? "border-red-400 dark:border-red-700 focus:ring-4 focus:ring-red-500/10"
       : "border-slate-300 dark:border-slate-700 focus:border-gold focus:ring-4 focus:ring-gold/10"
   }`;

  const validatePassword = (value: string) => {
    if (!value) return "Password required";
    if (value.length < 6) return "Min 6 characters";
    return "";
  };

  const isFormValid = useMemo(() => {
    return (
      email &&
      password &&
      !formErrors.email &&
      !formErrors.password
    );
  }, [email, password, formErrors]);

  const validate = () => {
    const errors: FormErrors = {};

    const e = validateEmail(email);
    const p = validatePassword(password);

    if (e) errors.email = e;
    if (p) errors.password = p;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* =========================
     REDIRECT (AGENT ONLY)
  ========================== */
  useEffect(() => {
    if (authStatus !== "AUTHENTICATED" || !user) return;
    if (hasRedirectedRef.current) return;

    const role = user.role?.toUpperCase();

    if (role !== "AGENT") {
      setFormErrors({
        general: `Access denied. Role = ${user.role}`,
      });
      return;
    }

    hasRedirectedRef.current = true;
    navigate("/agent/dashboard", { replace: true });
  }, [authStatus, user, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error || formErrors.general) {
      errorRef.current?.focus();
    }
  }, [error, formErrors.general]);

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    dispatch(
      login({
        email: email.trim(),
        password,
        portal: "AGENT",
      })
    );
  };

  const generalError = error || formErrors.general;

  /* =========================
     UI
  ========================== */
  return (
    <AuthLayout
      badge="Agent Secure Access"
      title="Agent Login"
      description="Access your listings, leads and dashboard."

      heroBadge="Premium agent workspace"
      heroTitle="Manage your real estate pipeline effortlessly"
      heroDescription="Track leads, manage listings, and close deals faster with your dedicated agent dashboard."

      heroPoints={[
        {
          title: "Lead tracking",
          description: "Never miss a potential deal.",
        },
        {
          title: "Listing control",
          description: "Update properties in real-time.",
        },
        {
          title: "Performance insights",
          description: "Understand your growth.",
        },
      ]}
    >
      {/* ERROR */}
      {generalError && (
        <AuthErrorAlert
          error={generalError}
          title="Login failed"
          errorRef={errorRef}
        />
      )}

      {/* GOOGLE LOGIN */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        fullWidth
        disabled={loading}
        className="mb-5 h-12 rounded-xl"
      >
        Continue with Google
      </Button>

      {/* DIVIDER */}
      <div className="relative mb-5">
        <div className="border-t border-slate-200 dark:border-slate-800" />
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white dark:bg-slate-900 px-3 text-xs text-slate-500">
          or
        </span>
      </div>

      {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
  {/* EMAIL */}
  <div>
    <input
      type="email"
      placeholder="Agent email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all
        bg-white text-slate-900 placeholder:text-slate-400
        dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500
        ${
          formErrors.email
            ? "border-red-400 dark:border-red-700 focus:ring-4 focus:ring-red-500/10"
            : "border-slate-300 dark:border-slate-700 focus:border-gold focus:ring-4 focus:ring-gold/10"
        }`}
    />
    {formErrors.email && (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
        {formErrors.email}
      </p>
    )}
  </div>

  {/* PASSWORD */}
  <PasswordField
    value={password}
    onChange={(v) => setPassword(v)}
    error={formErrors.password}
    placeholder="Password"
  />

  {/* SUBMIT */}
  <Button
    type="submit"
    fullWidth
    size="lg"
    loading={loading}
    disabled={!isFormValid}
    className="h-12 rounded-xl bg-gold text-black hover:bg-yellow-500"
  >
    Sign In as Agent
  </Button>
</form>

      {/* FOOTER */}
      <p className="mt-6 text-center text-sm text-slate-500">
        Want to join as agent?{" "}
        <Link to="/agent/register" className="text-gold font-semibold">
          Apply here
        </Link>
      </p>

      {/* STYLES */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: #0f0f0f;
          border: 1px solid #2a2a2a;
          color: white;
        }

        .input:focus {
          border-color: #d4af37;
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
          outline: none;
        }

        .input-error {
          border-color: #dc2626;
        }

        .error {
          font-size: 12px;
          color: #f87171;
          margin-top: 4px;
        }
      `}</style>
    </AuthLayout>
  );
}