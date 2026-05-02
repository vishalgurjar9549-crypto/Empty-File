import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  AMENITIES_LIST,
  getAmenitiesByCategory,
  CATEGORY_LABELS,
  AMENITY_CATEGORIES,
  Amenity,
  AmenityCategoryKey,
} from '../constants/amenities.config';
import * as Icons from 'lucide-react';

interface AmenitiesFormProps {
  /** Array of selected amenity IDs */
  selectedAmenities: string[];
  
  /** Callback when amenity selection changes */
  onAmenitiesChange: (amenityIds: string[]) => void;
  
  /** Optional error message */
  error?: string;
  
  /** Optional aria-describedby for accessibility */
  ariaDescribedBy?: string;
}

/**
 * Dynamically get Lucide icon component by name
 */
const getIconComponent = (iconName: string) => {
  const icon = (Icons as Record<string, React.ComponentType<any>>)[iconName];
  return icon || Icons.Package;
};

/**
 * Modern accordion-based amenities form component
 * Features:
 * - Accordion layout: only one category open at a time
 * - Reduces scrolling on mobile
 * - Smooth expand/collapse animations
 * - Card/tile-based selection UI
 * - Priority amenities highlighted
 * - Responsive grid layout
 * - Mobile-optimized
 * - Maintains selection state across categories
 */
export const AmenitiesForm: React.FC<AmenitiesFormProps> = ({
  selectedAmenities,
  onAmenitiesChange,
  error,
  ariaDescribedBy,
}) => {
  // Get amenities grouped by category
  const amenitiesByCategory = useMemo(() => getAmenitiesByCategory(), []);
  
  // State for accordion: track which category is open (default: essentials)
  const [activeCategory, setActiveCategory] = useState<AmenityCategoryKey>(
    AMENITY_CATEGORIES.ESSENTIALS
  );

  const handleToggleAmenity = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      onAmenitiesChange(selectedAmenities.filter((id) => id !== amenityId));
    } else {
      onAmenitiesChange([...selectedAmenities, amenityId]);
    }
  };

  const toggleCategory = (categoryKey: AmenityCategoryKey) => {
    // If clicking the already open category, close it
    // Otherwise, open the new category and close the old one
    setActiveCategory(activeCategory === categoryKey ? '' as AmenityCategoryKey : categoryKey);
  };

  return (
    <fieldset
      className="space-y-0"
      aria-describedby={ariaDescribedBy}
    >
      <legend className="sr-only">Amenities</legend>

      {/* Amenities Accordion */}
      <div className="space-y-2 rounded-2xl border border-slate-200 overflow-hidden dark:border-slate-700">
        {Object.entries(amenitiesByCategory).map(([categoryKey, amenities], index) => {
          const isActive = activeCategory === categoryKey;
          const categoryLabel = CATEGORY_LABELS[categoryKey as keyof typeof CATEGORY_LABELS];
          const selectedCount = amenities.filter((a) => selectedAmenities.includes(a.id)).length;

          return (
            <div key={categoryKey} className={index > 0 ? 'border-t border-slate-200 dark:border-slate-700' : ''}>
              {/* Accordion Header - Clickable */}
              <button
                type="button"
                onClick={() => toggleCategory(categoryKey as AmenityCategoryKey)}
                className={`
                  w-full px-4 py-4 flex items-center justify-between gap-3 
                  transition-all duration-200 ease-out
                  hover:bg-slate-50 dark:hover:bg-slate-800/50
                  ${isActive ? 'bg-amber-50 dark:bg-amber-900/15' : 'bg-white dark:bg-slate-800/30'}
                `}
                aria-expanded={isActive}
                aria-controls={`category-content-${categoryKey}`}
              >
                {/* Left: Title and Item Count */}
                <div className="flex flex-col items-start gap-1 text-left flex-1">
                  <h3 className={`text-base font-semibold transition-colors ${isActive ? 'text-amber-900 dark:text-amber-100' : 'text-slate-900 dark:text-white'}`}>
                    {categoryLabel}
                  </h3>
                  <p className={`text-xs transition-colors ${isActive ? 'text-amber-700 dark:text-amber-200/70' : 'text-slate-500 dark:text-slate-400'}`}>
                    {amenities.length} items • {selectedCount} selected
                  </p>
                </div>

                {/* Right: Chevron Icon */}
                <ChevronDown
                  className={`
                    h-5 w-5 flex-shrink-0 transition-all duration-300 ease-out
                    ${isActive ? 'rotate-180 text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}
                  `}
                />
              </button>

              {/* Accordion Content - Expandable */}
              <div
                id={`category-content-${categoryKey}`}
                className={`
                  overflow-hidden transition-all duration-300 ease-out
                  ${isActive ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="px-4 py-4 bg-slate-50/50 dark:bg-slate-800/20">
                  {/* Category Amenities Grid */}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {amenities.map((amenity) => {
                      const isSelected = selectedAmenities.includes(amenity.id);
                      const IconComponent = getIconComponent(amenity.icon);
                      const isPriority = amenity.isPriority;

                      return (
                        <label
                          key={amenity.id}
                          className={`
                            group flex cursor-pointer select-none items-center gap-3 
                            rounded-2xl border-2 px-4 py-3 transition-all duration-200
                            ${
                              isSelected
                                ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200 dark:border-amber-500 dark:bg-amber-500/10 dark:ring-amber-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600'
                            }
                          `}
                          title={amenity.description}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleAmenity(amenity.id)}
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-amber-600 transition focus:ring-2 focus:ring-amber-500 dark:border-slate-600 dark:bg-slate-700"
                            aria-label={amenity.label}
                          />

                          {/* Icon and Label */}
                          <div className="flex flex-1 items-center gap-2 min-w-0">
                            <IconComponent
                              className={`
                                h-4 w-4 flex-shrink-0 transition-colors
                                ${
                                  isSelected
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400'
                                }
                              `}
                            />
                            <span
                              className={`
                                text-sm font-medium truncate
                                ${
                                  isSelected
                                    ? 'text-slate-900 dark:text-white'
                                    : 'text-slate-700 dark:text-slate-300'
                                }
                              `}
                            >
                              {amenity.label}
                            </span>

                            {/* Priority Badge */}
                            {isPriority && (
                              <span
                                className={`
                                  ml-auto flex-shrink-0 inline-flex items-center px-2 py-1 
                                  rounded-full text-xs font-semibold
                                  ${
                                    isSelected
                                      ? 'bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                  }
                                `}
                              >
                                ★
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Info Text */}
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        <strong>Tip:</strong> Items marked with ★ are priority amenities that significantly improve listing appeal.
      </p>
    </fieldset>
  );
};

export default AmenitiesForm;
