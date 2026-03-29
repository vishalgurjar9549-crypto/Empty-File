import React from 'react';
import { X } from 'lucide-react';

interface FilterChipsProps {
  appliedFilters: any;
  onRemoveFilter: (filterKey: string, value?: string) => void;
}

export function FilterChips({ appliedFilters, onRemoveFilter }: FilterChipsProps) {
  const chips: Array<{ label: string; key: string; value?: string }> = [];

  // City chip
  if (appliedFilters.city) {
    chips.push({
      label: appliedFilters.city,
      key: 'city'
    });
  }

  // Price range chip
  if (appliedFilters.minPrice || appliedFilters.maxPrice) {
    const min = appliedFilters.minPrice || '0';
    const max = appliedFilters.maxPrice || '∞';
    chips.push({
      label: `₹${min}–${max}`,
      key: 'price'
    });
  }

  // Room type chips (each type as separate chip)
  if (appliedFilters.roomType?.length) {
    appliedFilters.roomType.forEach((type: string) => {
      chips.push({
        label: type,
        key: 'roomType',
        value: type
      });
    });
  }

  // Ideal for chip
  if (appliedFilters.forWhom) {
    chips.push({
      label: appliedFilters.forWhom,
      key: 'forWhom'
    });
  }

  // Amenities chips (each amenity as separate chip)
  if (appliedFilters.amenities?.length) {
    appliedFilters.amenities.forEach((amenity: string) => {
      chips.push({
        label: amenity,
        key: 'amenities',
        value: amenity
      });
    });
  }

  // If no chips, return null
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2.5 mb-6">
      {chips.map((chip, idx) => (
        <button
          key={`${chip.key}-${chip.value || idx}`}
          onClick={() => onRemoveFilter(chip.key, chip.value)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all group"
        >
          <span>{chip.label}</span>
          <X className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
        </button>
      ))}
    </div>
  );
}
