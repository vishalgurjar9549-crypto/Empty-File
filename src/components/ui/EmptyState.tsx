import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  showIllustration?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  showIllustration = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon/Illustration */}
      {showIllustration && (
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </div>
      )}

      {/* Content */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 text-center">
        {title}
      </h3>

      <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {/* CTA Button */}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          size="md"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
