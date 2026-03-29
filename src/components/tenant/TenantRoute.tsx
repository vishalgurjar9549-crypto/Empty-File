import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
interface TenantRouteProps {
  children: React.ReactNode;
}
export function TenantRoute({
  children
}: TenantRouteProps) {
  const {
    user,
    authStatus,
    loading
  } = useAppSelector((state) => state.auth);
  // Show loading spinner while auth is initializing
  if (authStatus === 'INITIALIZING' || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-slate-950 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 dark:border-slate-700 border-t-[#1E293B] dark:border-t-white mx-auto mb-4"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verifying access...
          </p>
        </div>
      </div>;
  }
  // Check if user is authenticated and has TENANT role
  // Case-insensitive check for robustness
  const isTenant = user?.role?.toUpperCase() === 'TENANT';
  if (authStatus === 'UNAUTHENTICATED' || !user || !isTenant) {
    // Redirect to login if not authenticated or not a tenant
    // If logged in as something else (e.g. OWNER), they shouldn't be here
    return <Navigate to="/auth/login" replace />;
  }
  return <>{children}</>;
}