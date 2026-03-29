import { useState, useCallback, useEffect } from 'react';

/**
 * ═════════════════════════════════════════════════════════════════════
 * useAuth HOOK
 * ═════════════════════════════════════════════════════════════════════
 *
 * Custom hook for managing authentication state:
 * - User data
 * - JWT token
 * - Auth method (google/email/phone)
 * - Load token from local storage on mount
 * - Logout functionality
 * - Temporary email/phone for identity linking
 *
 * Usage:
 * const { user, token, authMethod, setAuth, logout, setTemporaryEmail } = useAuth();
 */

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'TENANT' | 'OWNER' | 'ADMIN';
  emailVerified: boolean;
  phoneVerified: boolean;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
}

export type AuthMethod = 'google' | 'email' | 'phone' | null;

export interface AuthState {
  user: User | null;
  token: string | null;
  authMethod: AuthMethod;
  temporaryEmail?: string;
  temporaryPhone?: string;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    authMethod: null,
    loading: true
  });

  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const authMethod = localStorage.getItem('authMethod') as AuthMethod;

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          token,
          authMethod,
          loading: false
        });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('authMethod');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // ═════════════════════════════════════════════════════════════════════
  // SET AUTH (on successful login)
  // ═════════════════════════════════════════════════════════════════════
  const setAuth = useCallback((
    user: User,
    token: string,
    method: AuthMethod
  ) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('authMethod', method || '');

    setAuthState({
      user,
      token,
      authMethod: method,
      loading: false
    });
  }, []);

  // ═════════════════════════════════════════════════════════════════════
  // LOGOUT
  // ═════════════════════════════════════════════════════════════════════
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authMethod');
    localStorage.removeItem('temporaryEmail');
    localStorage.removeItem('temporaryPhone');

    setAuthState({
      user: null,
      token: null,
      authMethod: null,
      loading: false
    });
  }, []);

  // ═════════════════════════════════════════════════════════════════════
  // SET TEMPORARY EMAIL (for email verification modal)
  // ═════════════════════════════════════════════════════════════════════
  const setTemporaryEmail = useCallback((email: string) => {
    localStorage.setItem('temporaryEmail', email);
    setAuthState(prev => ({
      ...prev,
      temporaryEmail: email
    }));
  }, []);

  // ═════════════════════════════════════════════════════════════════════
  // SET TEMPORARY PHONE (for phone linking)
  // ═════════════════════════════════════════════════════════════════════
  const setTemporaryPhone = useCallback((phone: string) => {
    localStorage.setItem('temporaryPhone', phone);
    setAuthState(prev => ({
      ...prev,
      temporaryPhone: phone
    }));
  }, []);

  // ═════════════════════════════════════════════════════════════════════
  // UPDATE USER (may be used after email verification)
  // ═════════════════════════════════════════════════════════════════════
  const updateUser = useCallback((updates: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    }
  }, [authState.user]);

  // ═════════════════════════════════════════════════════════════════════
  // CHECK IF AUTHENTICATED
  // ═════════════════════════════════════════════════════════════════════
  const isAuthenticated = authState.user !== null && authState.token !== null;

  return {
    // State
    user: authState.user,
    token: authState.token,
    authMethod: authState.authMethod,
    tempEmail: authState.temporaryEmail,
    tempPhone: authState.temporaryPhone,
    loading: authState.loading,
    isAuthenticated,

    // Actions
    setAuth,
    logout,
    setTemporaryEmail,
    setTemporaryPhone,
    updateUser
  };
};
