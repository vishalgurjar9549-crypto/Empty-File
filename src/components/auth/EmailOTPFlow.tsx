import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mail, Clock } from 'lucide-react';

interface EmailOTPFlowProps {
  onBack: () => void;
  onLoginSuccess: (user: any, token: string) => void;
  onError: (error: string) => void;
}

/**
 * ═════════════════════════════════════════════════════════════════════
 * EMAIL OTP FLOW COMPONENT
 * ═════════════════════════════════════════════════════════════════════
 *
 * 2-step passwordless email login:
 * Step 1: Enter email → Send OTP
 * Step 2: Enter 6-digit OTP → Verify & login
 *
 * Features:
 * - Auto-focus 6-digit OTP input
 * - Paste support
 * - Resend OTP with 30s cooldown
 * - Loading states
 * - Error handling
 */

type Step = 'email' | 'otp';

export const EmailOTPFlow: React.FC<EmailOTPFlowProps> = ({
  onBack,
  onLoginSuccess,
  onError
}) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Handle OTP paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedData = e.clipboardData?.getData('text') || '';
      if (/^\d{6}$/.test(pastedData)) {
        setOtp(pastedData);
        e.preventDefault();
      }
    };

    const input = otpInputRef.current;
    if (input) {
      input.addEventListener('paste', handlePaste);
      return () => input.removeEventListener('paste', handlePaste);
    }
  }, []);

  // Auto-focus OTP input when step changes
  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // ═════════════════════════════════════════════════════════════════════
  // STEP 1: REQUEST OTP
  // ═════════════════════════════════════════════════════════════════════
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      onError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/request-email-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!data.success) {
        onError(data.message || 'Failed to send OTP');
        return;
      }

      setStep('otp');
      setResendCooldown(30);
      setResendCount(1);
    } catch (error: any) {
      onError(error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════
  // STEP 2: VERIFY OTP & LOGIN
  // ═════════════════════════════════════════════════════════════════════
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      onError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!data.success) {
        // OTP expired - allow resend
        if (data.code === 'INVALID_OTP' && data.message.includes('expired')) {
          onError('OTP expired. Please request a new one.');
          setStep('email');
          setOtp('');
          return;
        }

        onError(data.message || 'OTP verification failed');
        return;
      }

      // ✅ LOGIN SUCCESSFUL
      onLoginSuccess(data.data.user, data.data.token);
    } catch (error: any) {
      onError(error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════
  // RESEND OTP
  // ═════════════════════════════════════════════════════════════════════
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/request-email-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.success) {
        setResendCooldown(30);
        setResendCount(resendCount + 1);
        setOtp('');
      } else {
        onError('Failed to resend OTP');
      }
    } catch (error: any) {
      onError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {step === 'email' ? (
          // ═════════════════════════════════════════════════════════════════════
          // STEP 1: EMAIL INPUT
          // ═════════════════════════════════════════════════════════════════════
          <form onSubmit={handleRequestOTP}>
            <div className="mb-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mx-auto mb-4">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Enter your email
              </h2>
              <p className="text-center text-gray-600">
                We'll send you a one-time code
              </p>
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 mb-6 transition-colors"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </form>
        ) : (
          // ═════════════════════════════════════════════════════════════════════
          // STEP 2: OTP INPUT
          // ═════════════════════════════════════════════════════════════════════
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Enter verification code
              </h2>
              <p className="text-center text-gray-600 text-sm">
                We sent a 6-digit code to {email}
              </p>
            </div>

            {/* 6-Digit OTP Input */}
            <div className="mb-6">
              <input
                ref={otpInputRef}
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-center text-3xl font-bold tracking-widest transition-colors"
                disabled={loading}
              />
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-4"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-3">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || loading}
                className="text-purple-600 font-medium hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {resendCooldown > 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Resend in {resendCooldown}s</span>
                  </>
                ) : (
                  'Resend Code'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
