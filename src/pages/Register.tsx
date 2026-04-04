import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/slices/auth.slice";
import { authApi } from "../api/auth.api";
import { Button } from "../components/ui/Button";
import { Role } from "../types/api.types";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthErrorAlert } from "../components/auth/AuthErrorAlert";
import { PasswordField } from "../components/auth/PasswordField";

type FormData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  role: Role;
};

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: string;
  general?: string;
};

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    role: Role.TENANT,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const phoneFromUrl = searchParams.get("phone");
    const roleFromUrl = searchParams.get("role") as Role | null;

    if (phoneFromUrl || roleFromUrl) {
      setFormData((prev) => ({
        ...prev,
        phone: phoneFromUrl || prev.phone,
        role: roleFromUrl || prev.role,
      }));
    }
  }, [location.search]);

  useEffect(() => {
    if (submitError || formErrors.general) {
      errorSummaryRef.current?.focus();
    }
  }, [submitError, formErrors.general]);

  const validateName = (value: string) => {
    if (!value.trim()) return "Full name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

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

  const normalizePhone = (value: string) => {
    // keep only digits and one leading +
    let cleaned = value.replace(/[^\d+]/g, "");

    // allow + only at the beginning
    if (cleaned.includes("+")) {
      cleaned = "+" + cleaned.replace(/\+/g, "").replace(/^\+/, "");
    }

    return cleaned;
  };

  const validatePhone = (value: string) => {
    const phone = normalizePhone(value);

    if (!phone) return "Phone number is required";

    // Indian local: 10 digits starting from 6-9
    const indianLocalRegex = /^[6-9]\d{9}$/;

    // Indian international: +91XXXXXXXXXX or 91XXXXXXXXXX
    const indianIntlRegex = /^(?:\+91|91)[6-9]\d{9}$/;

    if (!indianLocalRegex.test(phone) && !indianIntlRegex.test(phone)) {
      return "Enter a valid Indian phone number";
    }

    return "";
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const phoneError = validatePhone(formData.phone);

    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (phoneError) newErrors.phone = phoneError;
    if (!formData.role) newErrors.role = "Please select a role";

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = useMemo(() => {
    return (
      formData.name.trim().length > 0 &&
      formData.email.trim().length > 0 &&
      formData.password.trim().length > 0 &&
      formData.phone.trim().length > 0 &&
      !formErrors.name &&
      !formErrors.email &&
      !formErrors.password &&
      !formErrors.phone
    );
  }, [formData, formErrors]);

  const updateField = (field: keyof FormData, value: string | Role) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSubmitError(null);

    setFormErrors((prev) => {
      const next = { ...prev, general: undefined };

      if (field === "name" && prev.name) {
        next.name = validateName(String(value)) || undefined;
      }

      if (field === "email" && prev.email) {
        next.email = validateEmail(String(value)) || undefined;
      }

      if (field === "password" && prev.password) {
        next.password = validatePassword(String(value)) || undefined;
      }

      if (field === "phone" && prev.phone) {
        next.phone = validatePhone(String(value)) || undefined;
      }

      if (field === "role" && prev.role) {
        next.role = undefined;
      }

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const normalizedPhone = normalizePhone(formData.phone.trim());

      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: normalizedPhone,
      };

      const res = await authApi.register(payload);
      dispatch(setCredentials(res));

      const userRole = res?.user?.role?.toUpperCase?.() || formData.role;

      if (userRole === "OWNER") {
        navigate("/owner/dashboard", { replace: true });
      } else if (userRole === "AGENT") {
        navigate("/agent/dashboard", { replace: true });
      } else if (userRole === "TENANT") {
        navigate("/rooms", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        "Registration failed. Please try again.";

      setSubmitError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all ${
      formErrors[field]
        ? "border-red-400 dark:border-red-700 focus:ring-4 focus:ring-red-500/10"
        : "border-slate-300 dark:border-slate-700 focus:border-gold focus:ring-4 focus:ring-gold/10"
    }`;

  const generalError = submitError || formErrors.general;

  return (
    <AuthLayout
      badge="Secure sign up"
      title="Create Account"
      description="Join Homilivo and start your rental journey today."
      heroBadge="Create your account and get started faster"
      heroTitle="Join your rental workspace in minutes"
      heroDescription="Discover rooms, manage listings, connect with verified users, and simplify your renting journey from day one."
      heroPoints={[
        {
          title: "Search smarter",
          description: "Save time with a smoother rental discovery experience.",
        },
        {
          title: "List with confidence",
          description:
            "Owners can manage properties and reach the right tenants.",
        },
        {
          title: "Secure onboarding",
          description: "Built with role-based account flow and cleaner UX.",
        },
      ]}
    >
      {generalError && (
        <AuthErrorAlert
          error={generalError}
          title="Registration failed"
          errorRef={errorSummaryRef}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            I am here as
          </label>

          <div className="flex rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-1.5">
            <button
              type="button"
              onClick={() => updateField("role", Role.TENANT)}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                formData.role === Role.TENANT
                  ? "bg-white dark:bg-slate-700 text-navy dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  : "text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white"
              }`}
              aria-pressed={formData.role === Role.TENANT}
            >
              I need a room
            </button>

            <button
              type="button"
              onClick={() => updateField("role", Role.OWNER)}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                formData.role === Role.OWNER
                  ? "bg-white dark:bg-slate-700 text-navy dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  : "text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white"
              }`}
              aria-pressed={formData.role === Role.OWNER}
            >
              I&apos;m an owner
            </button>
          </div>

          {formErrors.role && (
            <p className="mt-1.5 ml-1 text-xs text-red-600 dark:text-red-400">
              {formErrors.role}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            aria-invalid={!!formErrors.name}
            aria-describedby={formErrors.name ? "name-error" : undefined}
            className={inputClass("name")}
            placeholder="John Doe"
          />
          {formErrors.name && (
            <p
              id="name-error"
              className="mt-1.5 ml-1 text-xs text-red-600 dark:text-red-400"
              role="alert"
            >
              {formErrors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={(e) =>
              updateField("phone", normalizePhone(e.target.value))
            }
            aria-invalid={!!formErrors.phone}
            aria-describedby={formErrors.phone ? "phone-error" : undefined}
            className={inputClass("phone")}
            placeholder="+91 9876543210"
          />
          {formErrors.phone && (
            <p
              id="phone-error"
              className="mt-1.5 ml-1 text-xs text-red-600 dark:text-red-400"
              role="alert"
            >
              {formErrors.phone}
            </p>
          )}
        </div>

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
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            aria-invalid={!!formErrors.email}
            aria-describedby={formErrors.email ? "email-error" : undefined}
            className={inputClass("email")}
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
          value={formData.password}
          onChange={(value) => updateField("password", value)}
          error={formErrors.password}
          placeholder="Create a password"
          autoComplete="new-password"
        />

        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          loading={isSubmitting}
          fullWidth
          size="lg"
          className="mt-2 h-12 rounded-xl"
        >
          Create Account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-semibold text-gold hover:text-yellow-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
