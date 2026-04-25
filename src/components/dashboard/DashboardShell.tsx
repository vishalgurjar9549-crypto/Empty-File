import { ReactNode } from "react";
 
type DashboardShellProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};
 
export function DashboardShell({ title, subtitle, action, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-shell-bg)] text-[var(--color-text-primary)]">
      {/* Top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
 
      <div className="mx-auto max-w-[var(--container-max-width)] px-4 py-8 sm:px-6 md:py-12 md:px-8 lg:py-16">
        {/* Header row - Title and Action buttons */}
        <div className="mb-9 flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between md:mb-12">
          {/* Left side: Title and subtitle */}
          <div className="flex-1 min-w-0">
            <p className="text-[var(--text-2xs)] font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-2">
              Dashboard
            </p>
            <h1 className="text-display mb-3">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base text-[var(--color-text-secondary)] max-w-md">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right side: Action buttons (Notification + Add Property) */}
          {action && (
            <div className="flex items-center gap-3 flex-shrink-0 min-h-10">
              {action}
            </div>
          )}
        </div>
 
        {children}
      </div>
    </div>
  );
}