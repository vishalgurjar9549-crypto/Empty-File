import { RoomType, IdealFor, GenderPreference } from "../types/api.types";

/**
 * CENTRALIZED FILTER OPTIONS
 * Single source of truth for all filter constants
 * Used across: AddPropertyModal, EditPropertyModal, FilterSidebar
 */

// ============================================
// ROOM TYPES
// ============================================
export const ROOM_TYPES: RoomType[] = [
  "Single",
  "Shared",
  "PG",
  "1RK",
  "2RK",
  "1BHK",
  "2BHK",
  "3BHK",
  "4BHK",
  "Independent House",
];

export const ROOM_TYPE_OPTIONS = ROOM_TYPES.map((type) => ({
  label: type,
  value: type,
}));

// ============================================
// IDEAL FOR (Property Type Suitability)
// ============================================
export const IDEAL_FOR: IdealFor[] = [
  "Students",
  "Working Professionals",
  "Family",
];

export const IDEAL_FOR_OPTIONS = IDEAL_FOR.map((type) => ({
  label: type,
  value: type,
}));

// ============================================
// GENDER PREFERENCES
// ============================================
export const GENDER_PREFERENCE_OPTIONS: GenderPreference[] = [
  "ANY",
  "MALE_ONLY",
  "FEMALE_ONLY",
];

export const GENDER_PREFERENCE_LABELS: Record<GenderPreference, string> = {
  ANY: "Anyone",
  MALE_ONLY: "Boys only",
  FEMALE_ONLY: "Girls only",
};

export const GENDER_PREFERENCE_UI_OPTIONS = GENDER_PREFERENCE_OPTIONS.map(
  (pref) => ({
    label: GENDER_PREFERENCE_LABELS[pref],
    value: pref,
  })
);

// ============================================
// BUDGET RANGES (Indian Market - Monthly Rent)
// ============================================
export interface BudgetRange {
  label: string;
  min: number;
  max: number;
}

export const BUDGET_RANGES: BudgetRange[] = [
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 – ₹15,000", min: 10000, max: 15000 },
  { label: "₹15,000 – ₹20,000", min: 15000, max: 20000 },
  { label: "₹20,000 – ₹30,000", min: 20000, max: 30000 },
  { label: "₹30,000 – ₹50,000", min: 30000, max: 50000 },
  { label: "Above ₹50,000", min: 50000, max: 500000 },
];

// ============================================
// SEARCH BAR OPTIONS (with lowercase values for API)
// ============================================

/**
 * Room type options for SearchBar dropdown
 * Format: { label: string, value: lowercase_room_type }
 * Backend maps lowercase to proper case in RoomController
 */
export interface SearchOption {
  label: string;
  value: string;
}

export const SEARCH_ROOM_TYPE_OPTIONS: SearchOption[] = ROOM_TYPES.map((type) => ({
  label: type,
  value: type.toLowerCase(),
}));

/**
 * Budget options for SearchBar dropdown
 * Format: { label: string, value: "min-max" }
 * SearchBar parses this string format for API parameters
 */
export const SEARCH_BUDGET_OPTIONS: SearchOption[] = BUDGET_RANGES.map((range) => ({
  label: range.label,
  value: `${range.min}-${range.max}`,
}));

// ============================================
// UTILITIES
// ============================================

/**
 * Get budget range label for given min/max values
 * Returns matching range label or formatted custom range
 */
export const getBudgetRangeLabel = (
  minPrice: number,
  maxPrice: number
): string => {
  const matchedRange = BUDGET_RANGES.find(
    (range) =>
      (minPrice === 0 || minPrice === range.min) &&
      (maxPrice === 500000 || maxPrice === range.max)
  );

  if (matchedRange) {
    return matchedRange.label;
  }

  // Format custom range
  if (!minPrice && !maxPrice) return "Any Price";
  if (!maxPrice || maxPrice === 500000) return `₹${minPrice.toLocaleString()}+`;
  return `₹${minPrice.toLocaleString()} – ₹${maxPrice.toLocaleString()}`;
};
