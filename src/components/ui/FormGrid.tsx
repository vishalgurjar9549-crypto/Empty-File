import React from 'react';
import { GRID_PATTERNS, SPACING } from '../../constants/designSystem';

interface FormGridProps {
  children: React.ReactNode;
  /**
   * Number of columns at different breakpoints
   * Example: { md: 2, lg: 3 }
   * Default: { md: 2 } (1 col mobile, 2 cols tablet+)
   */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'dense' | 'compact' | 'default' | 'comfortable' | 'relaxed' | 'loose';
  className?: string;
}

/**
 * FormGrid Component
 * 
 * Replaces 20+ duplicated form field grid patterns across:
 * - AddPropertyModal
 * - EditPropertyModal  
 * - Profile
 * - Various forms
 * 
 * Usage:
 * <FormGrid columns={{ md: 2 }} gap="default">
 *   <TextInput label="First Name" />
 *   <TextInput label="Last Name" />
 * </FormGrid>
 * 
 * <FormGrid columns={{ sm: 1, md: 2, lg: 3 }} gap="comfortable">
 *   {formFields.map(field => <TextInput key={field.id} {...field} />)}
 * </FormGrid>
 */
export function FormGrid({
  children,
  columns = { md: 2 },
  gap = 'default',
  className = '',
}: FormGridProps) {
  const gapMap = {
    dense: SPACING.gapDense,
    compact: SPACING.gapCompact,
    default: SPACING.gapDefault,
    comfortable: SPACING.gapComfortable,
    relaxed: SPACING.gapRelaxed,
    loose: SPACING.gapLoose,
  };

  // Build responsive column classes
  let colClasses = 'grid-cols-1'; // base mobile-first
  
  if (columns.sm) colClasses += ` sm:grid-cols-${columns.sm}`;
  if (columns.md) colClasses += ` md:grid-cols-${columns.md}`;
  if (columns.lg) colClasses += ` lg:grid-cols-${columns.lg}`;
  if (columns.xl) colClasses += ` xl:grid-cols-${columns.xl}`;

  return (
    <div className={`grid ${colClasses} ${gapMap[gap]} ${className}`}>
      {children}
    </div>
  );
}
