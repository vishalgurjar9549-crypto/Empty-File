// import React, { useEffect, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// import { useAppDispatch } from "../../store/hooks";
// import { setCredentials } from "../../store/slices/auth.slice";
// import { authApi } from "../../api/auth.api";

// import { Button } from "../../components/ui/Button";
// import { AuthLayout } from "../../components/auth/AuthLayout";
// import { AuthErrorAlert } from "../../components/auth/AuthErrorAlert";
// import { PasswordField } from "../../components/auth/PasswordField";
// import { Role } from "../../types/api.types";
// import SearchableSelectInput from "../../components/SearchableSelectInput";

// // ─── Types ────────────────────────────────────────────────────────────────────

// type FormErrors = {
//   name?: string;
//   email?: string;
//   password?: string;
//   confirmPassword?: string;
//   phone?: string;
//   city?: string;
//   general?: string;
// };

// type FormState = {
//   name: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   phone: string;
//   city: string;
// };

// // ─── Constants ────────────────────────────────────────────────────────────────

// export const CITY_OPTIONS = [
//   { label: "Mumbai", value: "mumbai" },
//   { label: "Delhi", value: "delhi" },
//   { label: "Bangalore", value: "bangalore" },
//   { label: "Jaipur", value: "jaipur" },
//   { label: "Kota", value: "kota" },
// ];

// // ─── Pure validation helpers ──────────────────────────────────────────────────

// const PHONE_RE = /^[6-9]\d{9}$/;
// const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// function normalizePhone(value: string): string {
//   return value.replace(/\D/g, "").slice(0, 10);
// }

// /** Validate a single field and return an error string (or undefined). */
// function validateField(
//   name: keyof FormState,
//   form: FormState
// ): string | undefined {
//   switch (name) {
//     case "name":
//       return form.name.trim() ? undefined : "Full name is required";

//     case "email":
//       if (!form.email.trim()) return "Email is required";
//       if (!EMAIL_RE.test(form.email)) return "Enter a valid email address";
//       return undefined;

//     case "phone":
//       if (!form.phone) return "Phone number is required";
//       if (!PHONE_RE.test(form.phone)) return "Enter a valid 10-digit Indian mobile number";
//       return undefined;

//     case "password":
//       if (!form.password) return "Password is required";
//       if (form.password.length < 6) return "Password must be at least 6 characters";
//       return undefined;

//     case "confirmPassword":
//       if (!form.confirmPassword) return "Please confirm your password";
//       if (form.password !== form.confirmPassword) return "Passwords do not match";
//       return undefined;

//     case "city":
//       return form.city.trim() ? undefined : "Please select a city";

//     default:
//       return undefined;
//   }
// }

// /** Validate all fields at once. Returns errors object (empty = valid). */
// function validateAll(form: FormState): FormErrors {
//   const fields: (keyof FormState)[] = [
//     "name", "email", "phone", "password", "confirmPassword", "city",
//   ];

//   return fields.reduce<FormErrors>((acc, field) => {
//     const error = validateField(field, form);
//     if (error) acc[field] = error;
//     return acc;
//   }, {});
// }

// /**
//  * All fields are filled AND individually valid — independently of the
//  * `errors` state object so the button reacts immediately to user input.
//  */
// function isFormValid(form: FormState): boolean {
//   return (
//     form.name.trim().length > 0 &&
//     EMAIL_RE.test(form.email.trim()) &&
//     PHONE_RE.test(form.phone) &&
//     form.password.length >= 6 &&
//     form.confirmPassword === form.password &&
//     form.confirmPassword.length > 0 &&
//     form.city.trim().length > 0
//   );
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// const INITIAL_FORM: FormState = {
//   name: "",
//   email: "",
//   password: "",
//   confirmPassword: "",
//   phone: "",
//   city: "",
// };

// export function AgentRegister() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();

//   const [form, setForm] = useState<FormState>(INITIAL_FORM);
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
//   const [loading, setLoading] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);

//   const errorRef = useRef<HTMLDivElement | null>(null);

//   // Focus error alert when it appears
//   useEffect(() => {
//     if (submitError || errors.general) {
//       errorRef.current?.focus();
//     }
//   }, [submitError, errors.general]);

//   // ── Field helpers ──────────────────────────────────────────────────────────

//   /** Update a field value and re-validate it (only if already touched). */
//   function handleChange(name: keyof FormState, value: string) {
//     const updated = { ...form, [name]: value };
//     setForm(updated);

//     // Validate on-the-fly once the user has blurred the field at least once
//     if (touched[name]) {
//       const error = validateField(name, updated);
//       setErrors((prev) => ({ ...prev, [name]: error }));
//     }

//     // Always re-validate confirmPassword when password changes
//     if (name === "password" && touched.confirmPassword) {
//       const cpError = validateField("confirmPassword", updated);
//       setErrors((prev) => ({ ...prev, confirmPassword: cpError }));
//     }
//   }

//   /** Mark a field as touched and validate it immediately on blur. */
//   function handleBlur(name: keyof FormState) {
//     setTouched((prev) => ({ ...prev, [name]: true }));
//     const error = validateField(name, form);
//     setErrors((prev) => ({ ...prev, [name]: error }));
//   }

//   // ── Submit ─────────────────────────────────────────────────────────────────

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();

//     // Mark everything touched so all errors show
//     const allTouched = Object.keys(form).reduce(
//       (acc, k) => ({ ...acc, [k]: true }),
//       {} as Record<keyof FormState, boolean>
//     );
//     setTouched(allTouched);

//     const validationErrors = validateAll(form);
//     setErrors(validationErrors);

//     if (Object.keys(validationErrors).length > 0) return;

//     setLoading(true);
//     setSubmitError(null);

//     try {
//       const res = await authApi.register({
//         ...form,
//         phone: normalizePhone(form.phone),
//         role: Role.AGENT,
//       });

//       dispatch(setCredentials(res));
//       navigate("/agent/login", { replace: true });
//     } catch (err: any) {
//       setSubmitError(
//         err?.response?.data?.message ?? "Registration failed. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ── Styling helpers ────────────────────────────────────────────────────────

//   const inputClass = (hasError?: boolean) =>
//     [
//       "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all",
//       "bg-white text-slate-900 placeholder:text-slate-400",
//       "dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500",
//       hasError
//         ? "border-red-400 dark:border-red-700 focus:ring-4 focus:ring-red-500/10"
//         : "border-slate-300 dark:border-slate-700 focus:border-gold focus:ring-4 focus:ring-gold/10",
//     ].join(" ");

//   const ErrorMsg = ({ msg }: { msg?: string }) =>
//     msg ? (
//       <p className="mt-1 text-xs text-red-600 dark:text-red-400">{msg}</p>
//     ) : null;

//   // ── Render ─────────────────────────────────────────────────────────────────

//   const canSubmit = isFormValid(form) && !loading;

//   return (
//     <AuthLayout
//       badge="Agent onboarding"
//       title="Become an Agent"
//       description="Create your agent account and start managing leads."
//       heroBadge="Grow your real estate business"
//       heroTitle="Close more deals with a smarter workspace"
//       heroDescription="Track leads, manage listings, and scale your real estate business faster."
//       heroPoints={[
//         { title: "Lead management", description: "Track and convert faster" },
//         { title: "Listing control", description: "Manage properties easily" },
//         { title: "Analytics", description: "Understand your growth" },
//       ]}
//     >
//       {/* ── Global error ── */}
//       {(submitError || errors.general) && (
//         <AuthErrorAlert
//           error={submitError || errors.general!}
//           title="Registration failed"
//           errorRef={errorRef}
//         />
//       )}

//       <form onSubmit={handleSubmit} noValidate className="space-y-5">

//         {/* NAME */}
//         <div>
//           <input
//             type="text"
//             placeholder="Full name"
//             value={form.name}
//             onChange={(e) => handleChange("name", e.target.value)}
//             onBlur={() => handleBlur("name")}
//             className={inputClass(!!errors.name)}
//           />
//           <ErrorMsg msg={errors.name} />
//         </div>

//         {/* PHONE */}
//         <div>
//           <input
//             type="tel"
//             placeholder="Phone (9876543210)"
//             value={form.phone}
//             onChange={(e) => handleChange("phone", normalizePhone(e.target.value))}
//             onBlur={() => handleBlur("phone")}
//             className={inputClass(!!errors.phone)}
//           />
//           <ErrorMsg msg={errors.phone} />
//         </div>

//         {/* EMAIL */}
//         <div>
//           <input
//             type="email"
//             placeholder="Email address"
//             value={form.email}
//             onChange={(e) => handleChange("email", e.target.value)}
//             onBlur={() => handleBlur("email")}
//             className={inputClass(!!errors.email)}
//           />
//           <ErrorMsg msg={errors.email} />
//         </div>

//         {/* PASSWORD */}
//         <div>
//           <PasswordField
//             value={form.password}
//             onChange={(v) => handleChange("password", v)}
//             onBlur={() => handleBlur("password")}
//             error={errors.password}
//             placeholder="Password"
//           />
//         </div>

//         {/* CONFIRM PASSWORD */}
//         <div>
//           <PasswordField
//             value={form.confirmPassword}
//             onChange={(v) => handleChange("confirmPassword", v)}
//             onBlur={() => handleBlur("confirmPassword")}
//             error={errors.confirmPassword}
//             placeholder="Confirm password"
//           />
//         </div>

//         {/* CITY */}
//         <div>
//           <SearchableSelectInput
//             id="city"
//             value={form.city}
//             onChange={(value) => {
//               handleChange("city", value);
//               // Selecting from the dropdown counts as touching the field
//               setTouched((prev) => ({ ...prev, city: true }));
//             }}
//             options={CITY_OPTIONS}
//             placeholder="Select city"
//             inputClassName={inputClass(!!errors.city)}
//           />
//           <ErrorMsg msg={errors.city} />
//         </div>

//         {/* SUBMIT */}
//         <Button
//           type="submit"
//           fullWidth
//           size="lg"
//           loading={loading}
//           disabled={!canSubmit}
//           className="h-12 rounded-xl bg-gold text-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           Create Agent Account
//         </Button>
//       </form>

//       <p className="mt-6 text-center text-sm text-slate-500">
//         Already an agent?{" "}
//         <Link to="/agent/login" className="font-semibold text-gold">
//           Login here
//         </Link>
//       </p>
//     </AuthLayout>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch } from "../../store/hooks";
import { setCredentials } from "../../store/slices/auth.slice";
import { authApi } from "../../api/auth.api";

import { Button } from "../../components/ui/Button";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthErrorAlert } from "../../components/auth/AuthErrorAlert";
import { PasswordField } from "../../components/auth/PasswordField";
import { Role } from "../../types/api.types";
import SearchableSelectInput from "../../components/SearchableSelectInput";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  city?: string;
  general?: string;
};

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  city: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const CITY_OPTIONS = [
  { label: "Mumbai", value: "mumbai" },
  { label: "Delhi", value: "delhi" },
  { label: "Bangalore", value: "bangalore" },
  { label: "Jaipur", value: "jaipur" },
  { label: "Kota", value: "kota" },
];

// ─── Pure validation helpers ──────────────────────────────────────────────────

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

function validateField(name: keyof FormState, form: FormState): string | undefined {
  switch (name) {
    case "name":
      return form.name.trim() ? undefined : "Full name is required";
    case "email":
      if (!form.email.trim()) return "Email is required";
      if (!EMAIL_RE.test(form.email)) return "Enter a valid email address";
      return undefined;
    case "phone":
      if (!form.phone) return "Phone number is required";
      if (!PHONE_RE.test(form.phone)) return "Enter a valid 10-digit Indian mobile number";
      return undefined;
    case "password":
      if (!form.password) return "Password is required";
      if (form.password.length < 6) return "Password must be at least 6 characters";
      return undefined;
    case "confirmPassword":
      if (!form.confirmPassword) return "Please confirm your password";
      if (form.password !== form.confirmPassword) return "Passwords do not match";
      return undefined;
    case "city":
      return form.city.trim() ? undefined : "Please select a city";
    default:
      return undefined;
  }
}

function validateAll(form: FormState): FormErrors {
  const fields: (keyof FormState)[] = [
    "name", "email", "phone", "password", "confirmPassword", "city",
  ];
  return fields.reduce<FormErrors>((acc, field) => {
    const error = validateField(field, form);
    if (error) acc[field] = error;
    return acc;
  }, {});
}

function isFormValid(form: FormState): boolean {
  return (
    form.name.trim().length > 0 &&
    EMAIL_RE.test(form.email.trim()) &&
    PHONE_RE.test(form.phone) &&
    form.password.length >= 6 &&
    form.confirmPassword.length > 0 &&
    form.confirmPassword === form.password &&
    form.city.trim().length > 0
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  city: "",
};

export function AgentRegister() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (submitError || errors.general) {
      errorRef.current?.focus();
    }
  }, [submitError, errors.general]);

  // ── Field helpers ──────────────────────────────────────────────────────────

  function handleChange(name: keyof FormState, value: string) {
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name]) {
      const error = validateField(name, updated);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
    if (name === "password" && touched.confirmPassword) {
      const cpError = validateField("confirmPassword", updated);
      setErrors((prev) => ({ ...prev, confirmPassword: cpError }));
    }
  }

  function handleBlur(name: keyof FormState) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, form);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof FormState, boolean>
    );
    setTouched(allTouched);
    const validationErrors = validateAll(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    setSubmitError(null);
    try {
      const res = await authApi.register({
        ...form,
        phone: normalizePhone(form.phone),
        role: Role.AGENT,
      });
      dispatch(setCredentials(res));
      navigate("/agent/login", { replace: true });
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ?? "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Styling ────────────────────────────────────────────────────────────────

  // py-2.5 instead of py-3 — saves ~3px per field × 6 fields = ~18px total
  const inputClass = (hasError?: boolean) =>
    [
      "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all",
      "bg-white text-slate-900 placeholder:text-slate-400",
      "dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500",
      hasError
        ? "border-red-400 dark:border-red-700 focus:ring-4 focus:ring-red-500/10"
        : "border-slate-300 dark:border-slate-700 focus:border-gold focus:ring-4 focus:ring-gold/10",
    ].join(" ");

  const ErrorMsg = ({ msg }: { msg?: string }) =>
    msg ? (
      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400 leading-tight">{msg}</p>
    ) : null;

  const canSubmit = isFormValid(form) && !loading;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AuthLayout
      badge="Agent onboarding"
      title="Become an Agent"
      description="Create your agent account and start managing leads."
      heroBadge="Grow your real estate business"
      heroTitle="Close more deals with a smarter workspace"
      heroDescription="Track leads, manage listings, and scale your real estate business faster."
      heroPoints={[
        { title: "Lead management", description: "Track and convert faster" },
        { title: "Listing control", description: "Manage properties easily" },
        { title: "Analytics", description: "Understand your growth" },
      ]}
    >
      {(submitError || errors.general) && (
        <AuthErrorAlert
          error={submitError || errors.general!}
          title="Registration failed"
          errorRef={errorRef}
        />
      )}

      {/* space-y-3 instead of space-y-5 — saves ~8px across 6 gaps = ~48px total */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3">

        <div>
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            className={inputClass(!!errors.name)}
          />
          <ErrorMsg msg={errors.name} />
        </div>

        <div>
          <input
            type="tel"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", normalizePhone(e.target.value))}
            onBlur={() => handleBlur("phone")}
            className={inputClass(!!errors.phone)}
          />
          <ErrorMsg msg={errors.phone} />
        </div>

        <div>
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={inputClass(!!errors.email)}
          />
          <ErrorMsg msg={errors.email} />
        </div>

        <div>
          <PasswordField
            value={form.password}
            onChange={(v) => handleChange("password", v)}
            onBlur={() => handleBlur("password")}
            error={errors.password}
            placeholder="Password"
          />
        </div>

        <div>
          <PasswordField
            value={form.confirmPassword}
            onChange={(v) => handleChange("confirmPassword", v)}
            onBlur={() => handleBlur("confirmPassword")}
            error={errors.confirmPassword}
            placeholder="Confirm password"
          />
        </div>

        <div>
          <SearchableSelectInput
            id="city"
            value={form.city}
            onChange={(value) => {
              handleChange("city", value);
              setTouched((prev) => ({ ...prev, city: true }));
            }}
            options={CITY_OPTIONS}
            placeholder="Select city"
            inputClassName={inputClass(!!errors.city)}
          />
          <ErrorMsg msg={errors.city} />
        </div>

        {/* h-11 instead of h-12 — saves 4px */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          disabled={!canSubmit}
          className="h-11 w-full rounded-xl bg-gold text-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Agent Account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already an agent?{" "}
        <Link to="/agent/login" className="font-semibold text-gold">
          Login here
        </Link>
      </p>
    </AuthLayout>
  );
}