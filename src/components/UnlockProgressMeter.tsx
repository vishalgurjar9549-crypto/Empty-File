import React from 'react';
import { Lock } from 'lucide-react';
interface UnlockProgressMeterProps {
  viewCount: number;
  viewLimit: number | null;
  city: string;
  plan: string;
}
export function UnlockProgressMeter({
  viewCount,
  viewLimit,
  city,
  plan
}: UnlockProgressMeterProps) {
  // Only render for FREE plan with a valid limit
  if (plan !== 'FREE' || viewLimit === null) return null;
  const percentage = Math.min(100, Math.max(0, viewCount / viewLimit * 100));
  const remaining = Math.max(0, viewLimit - viewCount);
  const isLocked = remaining === 0;
  // Determine color based on usage percentage
  let colorClass = 'bg-emerald-500';
  if (percentage > 80) {
    colorClass = 'bg-red-500';
  } else if (percentage > 60) {
    colorClass = 'bg-amber-500';
  }
  return <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 mb-4 border border-slate-100 dark:border-slate-700">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {isLocked ? <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Limit Reached
            </span> : <span>
              Free unlocks in{' '}
              <span className="capitalize font-bold text-slate-800 dark:text-slate-200">
                {city}
              </span>
            </span>}
        </span>
        <span className="text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 shadow-sm">
          {viewCount} / {viewLimit}
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
        {/* Progress Bar Fill */}
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass} ${isLocked ? 'animate-pulse' : ''}`} style={{
        width: `${percentage}%`
      }} />

      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {isLocked ? `You've used all ${viewLimit} free unlocks. Upgrade to view more.` : `You've unlocked ${viewCount} of ${viewLimit} owner contacts.`}
      </p>
    </div>;
}