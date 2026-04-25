/**
 * DESIGN SYSTEM CONSTANTS
 * Single source of truth for all design tokens
 * Last Updated: April 19, 2026
 */

// ═════════════════════════════════════════════════════════════
// Z-INDEX HIERARCHY - Fixed stacking order
// ═════════════════════════════════════════════════════════════

export const Z_INDEX = {
  // Hidden layers
  hidden: -1,
  
  // Base layers
  base: 0,
  dropdown: 10,
  sticky: 20,
  
  // Modal & Overlays
  modalBackdrop: 40,      // Backdrop behind modals
  modal: 50,              // All modals use this
  
  // Top layers
  navbar: 40,
  mobileNav: 50,
  tooltip: 60,
} as const;

// ═════════════════════════════════════════════════════════════
// MODAL SYSTEM - Consistent sizing patterns
// ═════════════════════════════════════════════════════════════

export const MODAL_SIZES = {
  // Small modals (email verification, simple dialogs)
  sm: {
    width: 'w-full sm:max-w-md',
    height: 'max-h-[90dvh]',
    padding: 'px-4 py-6 sm:px-6',
  },
  
  // Default modals (booking, sharing, notifications)
  md: {
    width: 'w-full sm:max-w-lg',
    height: 'max-h-[90dvh]',
    padding: 'px-4 py-6 sm:px-6',
  },
  
  // Large modals (assignments, complex operations)
  lg: {
    width: 'w-full sm:max-w-2xl',
    height: 'max-h-[90dvh]',
    padding: 'px-4 py-6 sm:px-6',
  },
  
  // Extra large modals (property management, complex forms)
  xl: {
    width: 'w-full sm:max-w-5xl',
    height: 'sm:max-h-[94dvh]',
    padding: 'px-0 py-0 sm:px-0 sm:py-0',  // Sheet-style, no padding in wrapper
  },
  
  // Full screen (maps, galleries)
  full: {
    width: 'w-full',
    height: 'max-h-screen',
    padding: 'px-0 py-0',
  },
} as const;

export const MODAL_COMMON = {
  backdrop: 'fixed inset-0 bg-navy/50 dark:bg-navy/70 backdrop-blur-sm',
  overlay: 'fixed inset-0 z-[40] flex items-center justify-center p-4 sm:p-6',
  container: 'relative flex flex-col rounded-2xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden',
  closeButton: 'absolute right-4 top-4 sm:right-6 sm:top-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gold',
} as const;

// ═════════════════════════════════════════════════════════════
// CONTAINER SYSTEM - Standard responsive widths
// ═════════════════════════════════════════════════════════════

export const CONTAINERS = {
  // Full width with standard padding
  full: 'max-w-full',
  
  // Standard content container (used for most pages)
  default: 'max-w-7xl',
  
  // Slightly narrower container
  narrow: 'max-w-6xl',
  
  // Narrow text-focused
  prose: 'max-w-3xl',
  
  // Wide for dashboards
  wide: 'max-w-7xl',
} as const;

export const CONTAINER_PADDING = {
  mobile: 'px-4',
  tablet: 'sm:px-6',
  desktop: 'lg:px-8',
  // Combined standard: px-4 sm:px-6 lg:px-8
} as const;

export const CONTAINER_STANDARD = `${CONTAINERS.default} mx-auto ${CONTAINER_PADDING.mobile} ${CONTAINER_PADDING.tablet} ${CONTAINER_PADDING.desktop}`;

// ═════════════════════════════════════════════════════════════
// SPACING SCALE - Consistent padding, margin, gap
// ═════════════════════════════════════════════════════════════

export const SPACING = {
  // Vertical spacing (sections)
  sectionMobile: 'py-4',    // Small sections on mobile
  sectionSmall: 'py-6 sm:py-8',
  sectionMedium: 'py-8 sm:py-12 md:py-16',
  sectionLarge: 'py-12 sm:py-16 md:py-24',
  sectionXL: 'py-16 sm:py-24 md:py-32',
  
  // Gaps (flex/grid spacing)
  gapDense: 'gap-2',
  gapCompact: 'gap-3',
  gapDefault: 'gap-4',
  gapComfortable: 'gap-5',
  gapRelaxed: 'gap-6',
  gapLoose: 'gap-8',
  
  // Responsive gaps (for grids that scale)
  gapResponsive: 'gap-3 sm:gap-5 md:gap-6',
} as const;

// ═════════════════════════════════════════════════════════════
// GRID SYSTEM - Consistent breakpoint patterns
// ═════════════════════════════════════════════════════════════

export const GRID_PATTERNS = {
  // 1 column on mobile, 2 on tablet, 3 on desktop
  cols123: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  
  // 1 column on mobile, 2 on tablet, 2 on desktop
  cols12: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2',
  
  // 1 column on mobile, 2 on tablet, 3 on desktop, 4 on ultrawideBasic
  cols1234: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4',
  
  // 2 columns everywhere
  cols2: 'grid-cols-2 md:grid-cols-2',
} as const;

// ═════════════════════════════════════════════════════════════
// COLORS - Design tokens
// ═════════════════════════════════════════════════════════════

export const COLOR_PALETTE = {
  gold: 'rgba(212,175,55,0.9)',
  goldLight: 'rgba(212,175,55,0.15)',
  navy: '#1E293B',
  navyLight: 'rgba(30,41,59,0.5)',
  
  // Status colors with dark mode support
  status: {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    pending: {
      bg: 'bg-orange-50 dark:bg-orange-900/30',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
    },
    neutral: {
      bg: 'bg-slate-100 dark:bg-slate-700',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-300 dark:border-slate-600',
    },
  },
} as const;

// ═════════════════════════════════════════════════════════════
// FORM ELEMENTS
// ═════════════════════════════════════════════════════════════

export const FORM_STYLES = {
  input: 'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-[rgba(212,175,55,0.6)] focus:ring-2 focus:ring-[rgba(212,175,55,0.15)]',
  
  select: 'w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 pr-9 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-[rgba(212,175,55,0.6)] focus:ring-2 focus:ring-[rgba(212,175,55,0.15)] cursor-pointer',
  
  label: 'block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2',
  
  fieldWrapper: 'space-y-1.5',
} as const;

// ═════════════════════════════════════════════════════════════
// CARD & SECTION STYLES
// ═════════════════════════════════════════════════════════════

export const CARD_STYLES = {
  base: 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-6',
  hover: 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-6 hover:shadow-md transition-shadow',
  elevated: 'rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg',
} as const;

export const SECTION_STYLES = {
  container: 'py-8 md:py-12 lg:py-16',
  maxWidth: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
} as const;

// ═════════════════════════════════════════════════════════════
// TRANSITIONS & ANIMATIONS
// ═════════════════════════════════════════════════════════════

export const ANIMATIONS = {
  fadeIn: 'animate-in fade-in duration-200',
  slideIn: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
  zoomIn: 'animate-in fade-in zoom-in-95 duration-200',
} as const;

// ═════════════════════════════════════════════════════════════
// UTILITIES - Commonly used class combinations
// ═════════════════════════════════════════════════════════════

export const FLEX_CENTER = 'inline-flex items-center';
export const FLEX_CENTER_GAP = 'inline-flex items-center gap-1.5';
export const FLEX_BETWEEN = 'flex items-center justify-between';
export const GRID_RESPONSIVE = `grid ${GRID_PATTERNS.cols123} ${SPACING.gapResponsive}`;
