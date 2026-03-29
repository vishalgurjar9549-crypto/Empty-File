import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, clearError } from '../../store/slices/auth.slice';
import { Button } from '../../components/ui/Button';
export function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    loading,
    error,
    authStatus,
    user
  } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const hasRedirectedRef = useRef(false);
  // Redirect on successful admin login
  useEffect(() => {
    if (authStatus !== 'AUTHENTICATED' || !user) return;
    if (hasRedirectedRef.current) return;
    const userRole = user.role?.toUpperCase();
    if (userRole === 'ADMIN') {
      hasRedirectedRef.current = true;
      navigate('/admin', {
        replace: true
      });
    }
  }, [authStatus, user, navigate]);
  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(login({
      email,
      password,
      portal: 'ADMIN'
    }));
  };
  return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Admin badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs font-semibold tracking-wider uppercase">
            🔒 Admin Portal
          </span>
        </div>

        <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 p-6 sm:p-8 border border-slate-800">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4 group">
              <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-tr-xl rounded-bl-xl flex items-center justify-center mx-auto shadow-lg transition-transform group-hover:scale-110 duration-300">
                <span className="text-gold font-playfair font-bold text-2xl">
                  K
                </span>
              </div>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-playfair mb-2">
              Admin Login
            </h1>
            <p className="text-slate-400 text-sm">
              Restricted access — authorised personnel only
            </p>
          </div>

          {(error || formErrors.general) && <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-300 text-sm flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">

                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />

              </svg>
              <span>{error || formErrors.general}</span>
            </div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-4 py-3 bg-slate-800 border rounded-xl focus:ring-2 focus:ring-gold/50 outline-none transition-all text-white placeholder-slate-500 ${formErrors.email ? 'border-red-700 focus:border-red-500' : 'border-slate-700 focus:border-gold'}`} placeholder="admin@example.com" autoComplete="email" />

              {formErrors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">
                  {formErrors.email}
                </p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full px-4 py-3 bg-slate-800 border rounded-xl focus:ring-2 focus:ring-gold/50 outline-none transition-all text-white placeholder-slate-500 ${formErrors.password ? 'border-red-700 focus:border-red-500' : 'border-slate-700 focus:border-gold'}`} placeholder="••••••••" autoComplete="current-password" />

              {formErrors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">
                  {formErrors.password}
                </p>}
            </div>

            <Button type="submit" disabled={loading} loading={loading} fullWidth size="lg" className="mt-2">

              Sign In to Admin
            </Button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-8">
            Not an admin?{' '}
            <Link to="/auth/login" className="text-slate-500 hover:text-slate-300 underline transition-colors">

              Go to user login
            </Link>
          </p>
        </div>
      </div>
    </div>;
}