import { Link } from "react-router-dom";
import { Crown, Lock } from "lucide-react";
interface UpgradePromptProps {
  city: string;
  message?: string;
  variant?: "default" | "compact";
  viewCount?: number;
  viewLimit?: number;
}
export function UpgradePrompt({
  city,
  message,
  variant = "default",
  viewCount,
  viewLimit,
}: UpgradePromptProps) {
  const safeCity = city && city !== "undefined" && city !== "null" ? city : "";
  const pricingLink = safeCity ? `/pricing?city=${safeCity}` : "/pricing";
  const showCounter = viewCount !== undefined && viewLimit !== undefined;
  const counterText = showCounter
    ? `${viewCount} / ${viewLimit} free properties viewed`
    : null;
  if (variant === "compact") {
    return (
      <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="shrink-0 p-2 bg-navy/5 dark:bg-white/10 rounded-full">
              <Lock className="w-4 h-4 text-navy dark:text-white" />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {message || "Upgrade to unlock"}
            </span>
          </div>
          <Link
            to={pricingLink}
            className="w-full sm:w-auto text-center px-4 py-2 bg-navy dark:bg-slate-200 text-white dark:text-navy text-sm font-bold rounded-lg hover:bg-gold dark:hover:bg-white transition-colors"
          >
            View Plans
          </Link>
        </div>
        {counterText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:ml-11">
            {counterText}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden p-5 sm:p-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl shadow-navy/5 dark:shadow-black/20 text-center">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-navy to-gold" />

      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-navy/5 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-navy dark:text-white font-playfair mb-2">
        Unlock Premium Access
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 max-w-xs sm:max-w-sm mx-auto">
        {message ||
          `Upgrade your plan to view contact details and exact locations${
            safeCity ? ` in ${safeCity}` : ""
          }.`}
      </p>

      {counterText && (
        <div className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg inline-block">
          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            {counterText}
          </p>
        </div>
      )}

      <Link
        to={pricingLink}
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 bg-navy dark:bg-slate-200 text-white dark:text-navy text-sm font-bold rounded-xl hover:bg-gold dark:hover:bg-white transition-all duration-300 shadow-lg shadow-navy/20 dark:shadow-black/20 hover:shadow-gold/20 hover:-translate-y-1"
      >
        <span>{safeCity ? `View ${safeCity} Plans` : "View Plans"}</span>
        <Crown className="w-4 h-4 shrink-0" />
      </Link>

      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
        Starting at just ₹99/month
      </p>
    </div>
  );
}
