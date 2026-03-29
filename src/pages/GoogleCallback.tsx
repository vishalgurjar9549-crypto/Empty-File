import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { updateUser } from '../store/slices/auth.slice';
import { showToast } from '../store/slices/ui.slice';
/**
 * GOOGLE OAUTH CALLBACK PAGE
 *
 * This page receives the JWT token from the backend after Google OAuth.
 * It extracts the token from the URL, stores it, and redirects to the appropriate page.
 *
 * Flow:
 * 1. User authenticates with Google
 * 2. Backend redirects to: /auth/google/callback?token=JWT_TOKEN
 * 3. This page extracts token from URL
 * 4. Stores token in localStorage and Redux
 * 5. Redirects to appropriate dashboard based on role
 */
export function GoogleCallback() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    if (error) {
      // OAuth failed
      dispatch(showToast({
        message: 'Google authentication failed. Please try again.',
        type: 'error'
      }));
      navigate('/auth/login', {
        replace: true
      });
      return;
    }
    if (!token) {
      // No token received
      dispatch(showToast({
        message: 'Authentication failed. Please try again.',
        type: 'error'
      }));
      navigate('/auth/login', {
        replace: true
      });
      return;
    }
    try {
      // Decode JWT to get user info (without verification - backend already verified)
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Store token in localStorage
      localStorage.setItem('kangaroo_token', token);
      // Create user object from JWT payload
      const user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name || 'User',
        phone: null,
        phoneVerified: false,
        phoneVerifiedAt: null,
        city: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      // Store user in localStorage
      localStorage.setItem('kangaroo_user', JSON.stringify(user));
      // Manually update Redux state by reloading the page
      // This will trigger the auth initialization flow
      dispatch(showToast({
        message: 'Successfully signed in with Google!',
        type: 'success'
      }));
      // Redirect based on role
      const userRole = payload.role?.toUpperCase();
      if (userRole === 'ADMIN') {
        window.location.href = '/admin';
      } else if (userRole === 'OWNER') {
        window.location.href = '/owner/dashboard';
      } else if (userRole === 'AGENT') {
        window.location.href = '/agent/dashboard';
      } else {
        window.location.href = '/rooms';
      }
    } catch (error) {
      console.error('Error processing Google OAuth callback:', error);
      dispatch(showToast({
        message: 'Failed to process authentication. Please try again.',
        type: 'error'
      }));
      navigate('/auth/login', {
        replace: true
      });
    }
  }, [searchParams, navigate, dispatch]);
  return <div className="min-h-screen bg-cream dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy dark:border-white mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-300 font-medium">
          Completing sign in with Google...
        </p>
      </div>
    </div>;
}