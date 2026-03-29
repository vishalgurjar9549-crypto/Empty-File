/**
 * Global Theme Configuration
 *
 * CRITICAL: Use these tokens throughout the application.
 * DO NOT hardcode colors, spacing, or other design values.
 */

export const theme = {
  colors: {
    // Primary brand colors
    primary: '#1E293B',
    // Navy - main brand color
    secondary: '#C8A45D',
    // Gold - accent color
    background: '#FAF7F2',
    // Cream - page background
    accent: '#F59E0B',
    // Amber - highlights

    // Semantic colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    // Text colors
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      tertiary: '#94A3B8',
      inverse: '#FFFFFF'
    },
    // Background variations
    bg: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
      cream: '#FAF7F2'
    },
    // Border colors
    border: {
      light: '#E2E8F0',
      default: '#CBD5E1',
      dark: '#94A3B8'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px'
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px'
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out'
  }
} as const;
export type Theme = typeof theme;

// Tailwind class name helpers for consistent usage
export const tw = {
  // Button variants
  button: {
    primary: 'bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
    ghost: 'text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
  },
  // Input styles
  input: {
    base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all',
    error: 'border-error focus:ring-error'
  },
  // Card styles
  card: {
    base: 'bg-white rounded-xl border border-gray-200 shadow-sm',
    hover: 'hover:shadow-md transition-shadow duration-300'
  }
} as const;