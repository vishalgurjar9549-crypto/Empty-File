import React from "react";
import { ShieldCheck } from "lucide-react";

interface AuthHeaderProps {
  badgeText: string;
  title: string;
  description: string;
}

export function AuthHeader({
  badgeText,
  title,
  description,
}: AuthHeaderProps) {
  return (
    <div className="mb-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
        <ShieldCheck className="h-4 w-4" />
        {badgeText}
      </div>

      <h2 className="mt-4 text-3xl sm:text-4xl font-bold font-playfair text-navy dark:text-white">
        {title}
      </h2>

      <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}