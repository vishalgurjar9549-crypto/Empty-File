import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/auth.slice';
import { authApi } from '../api/auth.api';
import { Button } from '../components/ui/Button';
import { Role } from '../types/api.types';
export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    role: Role.TENANT
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Check for phone_flow and read query params on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const phoneFromUrl = searchParams.get('phone');
    const roleFromUrl = searchParams.get('role') as Role | null;

    // Pre-fill form with URL parameters if they exist
    if (phoneFromUrl || roleFromUrl) {
      setFormData((prev) => ({
        ...prev,
        phone: phoneFromUrl || prev.phone,
        role: roleFromUrl || prev.role
      }));
    }
  }, [location.search]);

  const validate = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.name.trim()) newErrors.name = 'Name is required';

  if (!formData.email.trim()) newErrors.email = 'Email is required';

  if (!formData.password || formData.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
  }

  // Phone validation (industry standard)
  const phone = formData.phone.replace(/\s+/g, ""); // remove spaces
  const phoneRegex = /^\+?[1-9]\d{9,14}$/; // E.164 format

  if (!phone) {
    newErrors.phone = "Phone number is required";
  } else if (!phoneRegex.test(phone)) {
    newErrors.phone =
      "Enter a valid phone number (10–15 digits, optional country code)";
  }

  if (!formData.role) newErrors.role = "Please select a role";

  setFormErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Call API directly to get user + token
      const res = await authApi.register(formData);
      
      // Dispatch to Redux to update auth state
      dispatch(setCredentials(res));
      
      // Redirect to owner dashboard immediately
      navigate('/owner/dashboard');
    } catch (err: any) {
      // Set error message for display
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setSubmitError(errorMessage);
      setIsSubmitting(false);
    }
  };
  const inputClass = (field: string) => `w-full px-4 py-3 bg-white dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-gold/50 outline-none transition-all dark:text-white dark:placeholder-slate-400 ${formErrors[field] ? 'border-red-300 dark:border-red-700 focus:border-red-400' : 'border-slate-200 dark:border-slate-600 focus:border-gold'}`;
  return <div className="min-h-screen bg-cream dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 pt-20">
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
            Create Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Join Homilivo today
          </p>
        </div>

        {(submitError || formErrors.general) && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">

              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />

            </svg>
            <span>{submitError || formErrors.general}</span>
          </div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Toggle */}
          <div className="flex bg-slate-50 dark:bg-slate-700/50 p-1.5 rounded-xl mb-6 border border-slate-100 dark:border-slate-700">
            <button type="button" onClick={() => setFormData({
            ...formData,
            role: Role.TENANT
          })} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${formData.role === Role.TENANT ? 'bg-white dark:bg-slate-600 text-navy dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white'}`}>

              I need a room
            </button>
            <button type="button" onClick={() => setFormData({
            ...formData,
            role: Role.OWNER
          })} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${formData.role === Role.OWNER ? 'bg-white dark:bg-slate-600 text-navy dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white'}`}>

              I'm an owner
            </button>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({
            ...formData,
            name: e.target.value
          })} className={inputClass('name')} placeholder="John Doe" />

            {formErrors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1">
                {formErrors.name}
              </p>}
          </div>

          {/* Phone Number — REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number
            </label>
            <input type="tel" inputMode='numeric' maxLength={12} required value={formData.phone} onChange={(e) => {
  const value = e.target.value.replace(/[^\d+]/g, "");
  setFormData({
    ...formData,
    phone: value,
  });
}} className={inputClass('phone')} placeholder="+91 98765 43210" />

            {formErrors.phone && <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1">
                {formErrors.phone}
              </p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({
            ...formData,
            email: e.target.value
          })} className={inputClass('email')} placeholder="you@example.com" />

            {formErrors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1">
                {formErrors.email}
              </p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({
            ...formData,
            password: e.target.value
          })} className={inputClass('password')} placeholder="••••••••" />

            {formErrors.password && <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1">
                {formErrors.password}
              </p>}
          </div>

          <Button type="submit" disabled={isSubmitting} loading={isSubmitting} fullWidth size="lg" className="mt-2">

            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-gold font-bold hover:underline hover:text-yellow-600 transition-colors">

            Sign in
          </Link>
        </p>
      </div>
    </div>;
}