import React from 'react';
import { useAppSelector } from '../store/hooks';
import { UpgradePrompt } from './UpgradePrompt';
interface SubscriptionGateProps {
  feature: 'contact' | 'map';
  city: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
export function SubscriptionGate({
  feature,
  city,
  children,
  fallback
}: SubscriptionGateProps) {
  const {
    visibility,
    loading
  } = useAppSelector((state) => state.subscription);
  const {
    user
  } = useAppSelector((state) => state.auth);
  // If loading, show nothing or skeleton (handled by parent usually)
  if (loading && !visibility) return null;
  // FIXED: Normalize role to uppercase for consistent comparison
  const userRole = user?.role?.toUpperCase();
  // If owner or admin, always show
  if (userRole === 'OWNER' || userRole === 'ADMIN') {
    return <>{children}</>;
  }
  // Check specific permission
  const canAccess = feature === 'contact' ? visibility?.canViewContact : visibility?.canViewMap;
  if (canAccess) {
    return <>{children}</>;
  }
  // Access Denied - Show Gate
  if (feature === 'map') {
    return <div className="relative rounded-2xl overflow-hidden">
        {/* Blurred Content */}
        <div className="blur-sm pointer-events-none select-none opacity-50">
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-navy/5 dark:bg-black/30 backdrop-blur-[2px]">
          <div className="max-w-sm w-full mx-4">
            <UpgradePrompt city={city} message={visibility?.message || 'Upgrade to view exact property location on map'} viewCount={visibility?.viewCount} viewLimit={visibility?.viewLimit} />

          </div>
        </div>
      </div>;
  }
  // Default (Contact) Gate
  return <div className="space-y-4">
      {fallback}
      <UpgradePrompt city={city} message={visibility?.message || 'Upgrade to view owner contact details'} variant="compact" viewCount={visibility?.viewCount} viewLimit={visibility?.viewLimit} />

    </div>;
}