import React, { useState } from 'react';
import { Mail, Phone, Chrome } from 'lucide-react';

interface LoginScreenProps {
  onGoogleClick: () => void;
  onEmailClick: () => void;
  onPhoneClick: () => void;
  isLoading?: boolean;
}

/**
 * ═════════════════════════════════════════════════════════════════════
 * LOGIN SCREEN COMPONENT
 * ═════════════════════════════════════════════════════════════════════
 *
 * Unified login screen with 3 entry points:
 * 1. Google OAuth
 * 2. Email OTP
 * 3. Phone Login
 *
 * No passwords required anywhere.
 */

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoogleClick,
  onEmailClick,
  onPhoneClick,
  isLoading = false
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Kangaroo Rooms</h1>
          <p className="text-gray-600">Find your perfect room, instantly</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-500 text-sm font-medium">Choose login method</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Login Options */}
        <div className="space-y-3">
          {/* Google */}
          <button
            onClick={onGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>

          {/* Email */}
          <button
            onClick={onEmailClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">Continue with Email</span>
          </button>

          {/* Phone */}
          <button
            onClick={onPhoneClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Phone className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Continue with Phone</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>🔒 Secure, passwordless login</p>
          <p className="mt-2">No account? <span className="text-blue-600 font-medium">Sign up instantly</span></p>
        </div>
      </div>
    </div>
  );
};
