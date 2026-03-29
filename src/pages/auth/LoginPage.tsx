import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginScreen } from '../components/auth/LoginScreen';
import { EmailOTPFlow } from '../components/auth/EmailOTPFlow';
import { PhoneLogin } from '../components/auth/PhoneLogin';
import { EmailVerificationModal } from '../components/auth/EmailVerificationModal';
import { useAuth } from '../../hooks/useAuth';
import { Toast } from '../components/Toast';

type LoginView = 'main' | 'email' | 'phone' | 'register';

/**
 * ═════════════════════════════════════════════════════════════════════
 * LOGIN PAGE
 * ═════════════════════════════════════════════════════════════════════
 *
 * Unified authentication page with 3 entry points:
 * 1. Google OAuth
 * 2. Email OTP (2-step passwordless)
 * 3. Phone Login (direct or redirect to register)
 *
 * Features:
 * - No page reloads
 * - Step-based navigation
 * - Loading states
 * - Error handling with toasts
 * - Automatic redirect after successful login
 *
 * Example integration in your router:
 * import { LoginPage } from './pages/auth/LoginPage';
 * <Route path="/auth/login" element={<LoginPage />} />
 */

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuth();

  // UI State
  const [view, setView] = useState<LoginView>('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // ═════════════════════════════════════════════════════════════════════
  // GOOGLE OAUTH
  // ═════════════════════════════════════════════════════════════════════
  const handleGoogleClick = () => {
    // Redirect to Google OAuth endpoint
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    window.location.href = `/api/auth/google?mobile=${isMobile}`;
  };

  // Handle Google callback (when user returns from Google)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Extract user from token or fetch from /api/auth/me
      fetchCurrentUser(token);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        setError('Failed to get user data');
        return;
      }

      const data = await response.json();
      setAuth(data.data, token, 'google');

      // Show success and redirect
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════
  // EMAIL OTP SUCCESS
  // ═════════════════════════════════════════════════════════════════════
  const handleEmailOTPSuccess = (user: any, token: string) => {
    setAuth(user, token, 'email');
    setTimeout(() => navigate('/dashboard'), 500);
  };

  // ═════════════════════════════════════════════════════════════════════
  // PHONE LOGIN SUCCESS
  // ═════════════════════════════════════════════════════════════════════
  const handlePhoneLoginSuccess = (user: any, token: string) => {
    // Check if email is verified
    if (!user.emailVerified) {
      // Show verification modal
      setVerificationEmail(user.email);
      setShowVerificationModal(true);
      // But still save auth so user can see dashboard
      setAuth(user, token, 'phone');
      return;
    }

    setAuth(user, token, 'phone');
    setTimeout(() => navigate('/dashboard'), 500);
  };

  // ═════════════════════════════════════════════════════════════════════
  // PHONE LOGIN → REGISTER REDIRECT
  // ═════════════════════════════════════════════════════════════════════
  const handlePhoneRegisterRequired = (phone: string) => {
    // Navigate to register with prefilled phone
    navigate('/auth/register', { state: { phone } });
  };

  // ═════════════════════════════════════════════════════════════════════
  // EMAIL VERIFICATION SUCCESS
  // ═════════════════════════════════════════════════════════════════════
  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    setError(null);
    // Close modal and continue
  };

  // ═════════════════════════════════════════════════════════════════════
  // ERROR TOAST
  // ═════════════════════════════════════════════════════════════════════
  const handleError = (msg: string) => {
    setError(msg);
    // Auto-clear after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  return (
    <>
      {/* Main Content */}
      <div className="relative">
        {view === 'main' && (
          <LoginScreen
            onGoogleClick={handleGoogleClick}
            onEmailClick={() => setView('email')}
            onPhoneClick={() => setView('phone')}
            isLoading={loading}
          />
        )}

        {view === 'email' && (
          <EmailOTPFlow
            onBack={() => setView('main')}
            onLoginSuccess={handleEmailOTPSuccess}
            onError={handleError}
          />
        )}

        {view === 'phone' && (
          <PhoneLogin
            onBack={() => setView('main')}
            onLoginSuccess={handlePhoneLoginSuccess}
            onRegisterRequired={handlePhoneRegisterRequired}
            onError={handleError}
          />
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        email={verificationEmail}
        onSuccess={handleVerificationSuccess}
        onClose={() => setShowVerificationModal(false)}
        onError={handleError}
      />
    </>
  );
};

export default LoginPage;
