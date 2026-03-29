import React from 'react';
import { AlertTriangle, TrendingUp, Clock, ArrowRight, Zap } from 'lucide-react';
interface PreLimitAlertProps {
  viewCount: number;
  viewLimit: number | null;
  userName?: string;
  onUpgrade?: () => void;
}
export function PreLimitAlert({
  viewCount,
  viewLimit,
  userName,
  onUpgrade
}: PreLimitAlertProps) {
  if (viewLimit === null) return null;
  const percentage = viewCount / viewLimit * 100;
  const remaining = viewLimit - viewCount;
  // ─── PRE-WALL CONDITIONING (absolute count >= 7) ──────────────────────
  // Observational social proof — prepares the brain BEFORE the paywall.
  // Calm, factual tone. Not identity-labeling, not fear-based.
  if (viewCount >= 7 && remaining > 0 && percentage < 90) {
    return <div className="mb-4">
        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#C8A45D]/10 dark:bg-[#C8A45D]/20 rounded-full shrink-0">
              <Zap className="w-4 h-4 text-[#C8A45D]" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Many renters upgrade around this stage to avoid interruptions.
            </p>
          </div>
          {onUpgrade && <button onClick={onUpgrade} className="shrink-0 text-xs font-bold text-[#C8A45D] hover:text-[#b8943d] transition-colors flex items-center gap-1">

              Upgrade <ArrowRight className="w-3 h-3" />
            </button>}
        </div>
      </div>;
  }
  // Don't show percentage-based alerts if usage is low or limit reached
  if (percentage < 70 || remaining === 0) return null;
  let content = null;
  // 90% - Critical Urgency
  if (percentage >= 90) {
    content = <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
        <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-full shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-red-800 dark:text-red-300">
            Only {remaining} free unlock{remaining === 1 ? '' : 's'} left
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
            Don't lose access to great homes.{' '}
            {userName ? `${userName}, upgrade` : 'Upgrade'} now to keep
            browsing.
          </p>
        </div>
        {onUpgrade && <button onClick={onUpgrade} className="shrink-0 text-xs font-bold text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors flex items-center gap-1 mt-0.5">

            Upgrade <ArrowRight className="w-3 h-3" />
          </button>}
      </div>;
  }
  // 80% - High Urgency / Social Proof
  else if (percentage >= 80) {
    content = <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full shrink-0">
          <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
            Serious renters usually upgrade here
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Avoid missing out on the best properties by unlocking unlimited
            access.
          </p>
        </div>
        {onUpgrade && <button onClick={onUpgrade} className="shrink-0 text-xs font-bold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors flex items-center gap-1 mt-0.5">

            Upgrade <ArrowRight className="w-3 h-3" />
          </button>}
      </div>;
  }
  // 70% - Medium Urgency / Velocity Check
  else if (percentage >= 70) {
    content = <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-full shrink-0">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
            You're viewing faster than most
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
            {userName ? `Way to go ${userName}! ` : ''}You've already checked{' '}
            {viewCount} properties.
          </p>
        </div>
      </div>;
  }
  return <div className="mb-4">{content}</div>;
}