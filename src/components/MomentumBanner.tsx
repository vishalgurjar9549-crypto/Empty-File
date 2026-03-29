import React from 'react';
import { Zap, TrendingUp, Target, Flame, Home } from 'lucide-react';
interface MomentumBannerProps {
  viewCount: number;
  userName?: string;
}
export function MomentumBanner({
  viewCount,
  userName
}: MomentumBannerProps) {
  // Don't show below 3 unlocks — no commitment signal yet
  if (viewCount < 3) return null;
  const firstName = userName?.split(' ')[0];
  // ─── COMMITMENT ESCALATION TIERS ─────────────────────────────────────
  // Each tier validates the user's sunk effort and nudges forward
  let message: string;
  let icon: React.ReactNode;
  let bgClass: string;
  let textClass: string;
  let labelTextClass: string;
  let label: string;
  if (viewCount >= 9) {
    // Tier 5: Momentum protection — frame upgrade as maintaining progress
    label = 'Keep Going';
    message = firstName ? `${firstName}, don't let your search slow down now.` : `Don't let your search slow down now.`;
    icon = <Flame className="w-4 h-4 text-red-500 dark:text-red-400 fill-current" />;
    bgClass = 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-100 dark:border-red-800';
    textClass = 'text-red-700 dark:text-red-200';
    labelTextClass = 'text-red-800 dark:text-red-300';
  } else if (viewCount >= 8) {
    // Tier 4: Closer identity — shift from searching → deciding
    label = 'Almost Home';
    message = firstName ? `${firstName}, you're very close to securing a home.` : `You're very close to securing a home.`;
    icon = <Home className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    bgClass = 'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border-sky-100 dark:border-sky-800';
    textClass = 'text-sky-700 dark:text-sky-200';
    labelTextClass = 'text-sky-800 dark:text-sky-300';
  } else if (viewCount >= 6) {
    // Tier 3: Progress validation — they're ahead of the pack
    label = "You're Ahead";
    message = firstName ? `${firstName}, you're closer than most renters to finding a home.` : `You're closer than most renters to finding a home.`;
    icon = <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    bgClass = 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-100 dark:border-amber-800';
    textClass = 'text-amber-700 dark:text-amber-200';
    labelTextClass = 'text-amber-800 dark:text-amber-300';
  } else if (viewCount >= 5) {
    // Tier 2: IDENTITY SHIFT — "you ARE a serious house-hunter"
    label = 'Serious House-Hunter';
    message = firstName ? `${firstName}, you're now in serious house-hunting mode.` : `You're now in serious house-hunting mode.`;
    icon = <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    bgClass = 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-100 dark:border-emerald-800';
    textClass = 'text-emerald-700 dark:text-emerald-200';
    labelTextClass = 'text-emerald-800 dark:text-emerald-300';
  } else if (viewCount >= 3) {
    // Tier 1: Identity labeling — early commitment signal
    label = 'Active Searcher';
    message = firstName ? `${firstName}, you're actively house-hunting now.` : `You're actively house-hunting now.`;
    icon = <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />;
    bgClass = 'from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-violet-100 dark:border-violet-800';
    textClass = 'text-violet-700 dark:text-violet-200';
    labelTextClass = 'text-violet-800 dark:text-violet-300';
  } else {
    return null;
  }
  return <div className={`mb-5 bg-gradient-to-r ${bgClass} border rounded-xl p-3 flex items-center gap-3 shadow-sm`}>

      <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm shrink-0">
        {icon}
      </div>
      <div>
        <p className={`text-xs font-bold ${labelTextClass} uppercase tracking-wider mb-0.5`}>

          {label}
        </p>
        <p className={`text-sm ${textClass} font-medium`}>{message}</p>
      </div>
    </div>;
}