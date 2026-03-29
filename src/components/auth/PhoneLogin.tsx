import React, { useState } from 'react';
import { ArrowLeft, Phone } from 'lucide-react';

interface PhoneLoginProps {
  onBack: () => void;
  onLoginSuccess: (user: any, token: string) => void;
  onRegisterRequired: (phone: string) => void;
  onError: (error: string) => void;
}

/**
 * ═════════════════════════════════════════════════════════════════════
 * PHONE LOGIN COMPONENT
 * ═════════════════════════════════════════════════════════════════════
 *
 * Direct phone login (no OTP required):
 * - Enter phone number
 * - If user exists → Login with JWT
 * - If user doesn't exist → Redirect to register with prefilled phone
 *
 * Perfect for users who already have accounts created via email/Google.
 */

export const PhoneLogin: React.FC<PhoneLoginProps> = ({
  onBack,
  onLoginSuccess,
  onRegisterRequired,
  onError
}) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.length < 10) {
      onError('Please enter a valid phone number (minimum 10 digits)');
      return;
    }

    const fullPhone = `${countryCode} ${phone}`;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      });

      const data = await response.json();

      if (!data.success) {
        // User not found - need to register
        if (response.status === 404 || data.message?.includes('No account found')) {
          // Redirect to register with prefilled phone
          onRegisterRequired(fullPhone);
          return;
        }

        onError(data.message || 'Login failed');
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value.slice(0, 15));
  };

  const formatPhoneDisplay = () => {
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)} ${phone.slice(3)}`;
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Phone Login
          </h2>
          <p className="text-center text-gray-600 text-sm">
            Already have an account? Sign in with your phone
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Country Code + Phone */}
          <div className="mb-6 flex gap-2">
            {/* Country Code Selector */}
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-20 px-2 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-center font-medium"
              disabled={loading}
            >
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+91">+91</option>
              <option value="+86">+86</option>
              <option value="+81">+81</option>
            </select>

            {/* Phone Number Input */}
            <input
              type="tel"
              value={formatPhoneDisplay()}
              onChange={handlePhoneChange}
              placeholder="10-15 digits"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 font-medium transition-colors"
              disabled={loading}
            />
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 mb-6 text-center">
            This account must be verified with email for some features
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || phone.length < 10}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-4"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Register Option */}
          <div className="text-center text-sm text-gray-600">
            <p>New to Kangaroo Rooms?</p>
            <p className="text-green-600 font-medium mt-1">
              We'll create your account instantly
            </p>
          </div>
        </form>

        {/* Additional Info */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>📱 No OTP, direct login for existing accounts</p>
        </div>
      </div>
    </div>
  );
};
