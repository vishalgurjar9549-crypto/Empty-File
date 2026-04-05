/**
 * Lazy Loading Configuration
 * 
 * Defines which routes to lazy-load for better initial performance
 * Routes are split into:
 * - CRITICAL: Loaded immediately (Home, Rooms search)
 * - LAZY: Loaded on navigation (Dashboard, Admin, Details)
 * - VERY_LAZY: Loaded only when needed (Architecture pages, policies)
 */

import React, { Suspense } from 'react';

// ✅ Fallback component for lazy-loaded routes
export function LazyComponentFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-slate-950 transition-colors duration-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 dark:border-slate-700 border-t-[#1E293B] dark:border-t-white mx-auto mb-4"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
          Loading page...
        </p>
      </div>
    </div>
  );
}

/**
 * withLazyLoadingSuspense - Higher-order function
 * Wraps lazy-loaded components with Suspense
 */
export function withLazyLoadingSuspense(
  lazyComponent: React.LazyExoticComponent<any>
) {
  return (
    <Suspense fallback={<LazyComponentFallback />}>
      {React.createElement(lazyComponent)}
    </Suspense>
  );
}
