import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
export function AgentRoute({
  children


}: {children: React.ReactNode;}) {
  const {
    user,
    authStatus,
    loading
  } = useAppSelector((state) => state.auth);
  // Block UI while auth is initializing
  if (authStatus === 'INITIALIZING' || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 dark:border-slate-700 border-t-[#1E293B] dark:border-t-white mx-auto mb-4"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verifying your session…
          </p>
        </div>
      </div>;
  }
  if (authStatus === 'UNAUTHENTICATED' || !user) {
    return <Navigate to="/auth/login" replace />;
  }
  // Check for AGENT role (case-insensitive)
  const isAgent = user.role === 'AGENT' || user.role === 'agent';
  if (!isAgent) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}