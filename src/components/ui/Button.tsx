import React from 'react';
import { Loader2 } from 'lucide-react';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gold text-white hover:bg-yellow-600 shadow-sm shadow-gold/20 active:bg-yellow-700 border border-transparent',
  secondary: 'bg-navy text-white hover:bg-slate-800 shadow-sm shadow-navy/20 active:bg-slate-900 border border-transparent',
  outline: 'bg-transparent border-2 border-navy text-navy hover:bg-navy hover:text-white dark:border-slate-400 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border border-transparent',
  danger: 'bg-white border border-red-500 text-red-500 hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-900/20 shadow-sm'
};
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-5 py-2.5 text-sm min-h-[44px]',
  lg: 'px-8 py-3.5 text-base min-h-[52px]'
};
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 select-none';
  const widthStyles = fullWidth ? 'w-full' : '';
  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyles}
    ${className}
  `.trim();
  return <button className={combinedClassName} disabled={disabled || loading} {...props}>

      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>;
}