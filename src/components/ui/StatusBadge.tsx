import React from 'react';
import { COLOR_PALETTE } from '../../constants/designSystem';

export type StatusVariant = 'success' | 'pending' | 'error' | 'warning' | 'neutral';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  animated?: boolean;
  animateIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

/**
 * StatusBadge Component
 * 
 * Replaces 50+ duplicated badge patterns across Dashboard1, Profile, Pricing, Admin pages
 * 
 * Usage:
 * <StatusBadge variant="success">Approved</StatusBadge>
 * <StatusBadge variant="pending" animated>Pending</StatusBadge>
 * <StatusBadge variant="error" size="sm">Rejected</StatusBadge>
 * <StatusBadge variant="success" icon={<CheckIcon />}>Complete</StatusBadge>
 * <StatusBadge variant="pending" animateIcon icon={<DotIcon />}>Under Review</StatusBadge>
 */
export function StatusBadge({
  variant,
  children,
  animated = false,
  animateIcon = false,
  className = '',
  size = 'md',
  icon,
}: StatusBadgeProps) {
  const statusStyles = COLOR_PALETTE.status[variant];
  
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 
        rounded-full border font-semibold
        transition-all
        ${sizeClasses[size]}
        ${statusStyles.bg}
        ${statusStyles.text}
        ${statusStyles.border}
        ${animated ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {icon && (
        <span className={`flex-shrink-0 ${animateIcon ? 'animate-pulse' : ''}`}>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
