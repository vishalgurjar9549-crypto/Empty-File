import React, { useEffect, useState } from "react";
import { X, Filter } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loadCities, loadAmenities } from "../store/slices/metadata.slice";
interface FilterSidebarProps {
  filters: any;
  setFilters: (filters: any) => void;
  onApplyFilters: (filters: any) => void;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  resultCount?: number;
}
const MAX_RENT = 500000; // industry upper bound
const MIN_RENT = 0;
const ROOM_TYPES = ["Single", "Shared", "PG", "1BHK", "2BHK"];
export function FilterSidebar({
  filters,
  setFilters,
  onApplyFilters,
  isOpen,
  onClose,
  isLoading = false,
  resultCount = 0
}: FilterSidebarProps) {
  const dispatch = useAppDispatch();
  const {
    cities,
    amenities
  } = useAppSelector((state) => state.metadata);

  // Local state for editing filters
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (cities.length === 0) {
      dispatch(loadCities());
    }
    if (amenities.length === 0) {
      dispatch(loadAmenities());
    }
  }, [dispatch, cities.length, amenities.length]);

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.city) count++;
    if (localFilters.minPrice || localFilters.maxPrice) count++;
    if (localFilters.roomType?.length) count++;
    if (localFilters.forWhom) count++;
    if (localFilters.amenities?.length) count++;
    return count;
  };
  // Lock body scroll when mobile menu is open
  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     document.body.style.overflow = '';
  //   }
  //   return () => {
  //     document.body.style.overflow = '';
  //   };
  // }, [isOpen]);
  
  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "";
  //   }
  //   return () => {
  //     document.body.style.overflow = "";
  //   };
  // }, [isOpen]);

  useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [isOpen]);

  const handleChange = (key: string, value: any) => {
    setLocalFilters({
      ...localFilters,
      [key]: value
    });
  };

  const toggleAmenity = (amenity: string) => {
    const current = localFilters.amenities || [];
    const updated = current.includes(amenity) ? current.filter((a: string) => a !== amenity) : [...current, amenity];
    handleChange("amenities", updated);
  };

  const handlePriceChange = (key: "minPrice" | "maxPrice", value: string) => {
    let num = Number(value);
    if (isNaN(num)) num = 0;
    num = Math.max(MIN_RENT, Math.min(num, MAX_RENT));

    let updatedFilters = { ...localFilters, [key]: num };
    if (key === "minPrice" && localFilters.maxPrice && num > localFilters.maxPrice) {
      updatedFilters.maxPrice = num;
    }
    if (key === "maxPrice" && localFilters.minPrice && num < localFilters.minPrice) {
      updatedFilters.minPrice = num;
    }

    setLocalFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClearAll = () => {
    const clearedFilters = {
      city: '',
      minPrice: '',
      maxPrice: '',
      roomType: [],
      forWhom: '',
      amenities: []
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };
  return <>
      {/* Overlay for mobile */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={onClose} aria-hidden="true" />

      <aside style={{
      paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)"
    }} className={`
    fixed inset-y-0 left-0 z-50 w-full max-w-[300px]
    bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
    shadow-2xl transform transition-transform duration-300 ease-in-out
    lg:translate-x-0 lg:static lg:shadow-none lg:z-0 lg:h-auto lg:block
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="pt-6 px-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gold" />
              <h2 className="text-lg font-bold text-navy dark:text-white font-playfair">
                Filters
              </h2>
              {getActiveFilterCount() > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-gold text-white text-xs font-bold rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors" aria-label="Close filters">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-8">
            {/* City */}
            <div>
              <h3 className="font-semibold text-sm text-navy dark:text-white mb-3 uppercase tracking-wider">
                Location
              </h3>
              <div className="relative">
                <select value={localFilters.city || ""} onChange={(e) => handleChange("city", e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all appearance-none cursor-pointer">
                  <option value="">All Cities</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>
                      {c.name}
                    </option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-sm text-navy dark:text-white mb-3 uppercase tracking-wider">
                Price Range (₹)
              </h3>
              <div className="flex gap-3 items-center">
                {/* <input type="number" placeholder="Min" value={filters.minPrice || ""} onChange={(e) => handleChange("minPrice", e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-slate-400" /> */}
                <input
  type="number"
  placeholder="Min"
  min={MIN_RENT}
  max={MAX_RENT}
  step="500"
  value={localFilters.minPrice ?? ""}
  onChange={(e) => handlePriceChange("minPrice", e.target.value)}
  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-slate-400"
/>

                <span className="text-slate-400">-</span>
                {/* <input type="number" placeholder="Max" value={filters.maxPrice || ""} onChange={(e) => handleChange("maxPrice", e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-slate-400" /> */}
                <input
  type="number"
  placeholder="Max"
  min={MIN_RENT}
  max={MAX_RENT}
  step="500"
  value={localFilters.maxPrice ?? ""}
  onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-slate-400"
/>
              </div>
            </div>

            {/* Room Type */}
            <div>
              <h3 className="font-semibold text-sm text-navy dark:text-white mb-3 uppercase tracking-wider">
                Room Type
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {ROOM_TYPES.map((type) => {
                  const isSelected = localFilters.roomType?.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        const current = localFilters.roomType || [];
                        const updated = current.includes(type)
                          ? current.filter((t: string) => t !== type)
                          : [...current, type];
                        handleChange("roomType", updated);
                      }}
                      className={`py-2.5 px-3 rounded-lg border-2 font-medium text-sm transition-all cursor-pointer ${
                        isSelected
                          ? 'border-gold bg-gold/10 text-gold dark:text-gold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-gold/50'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* For Whom */}
            <div>
              <h3 className="font-semibold text-sm text-navy dark:text-white mb-3 uppercase tracking-wider">
                Ideal For
              </h3>
              <div className="space-y-2.5">
                {["Students", "Working Professionals", "Family"].map((target) => <label key={target} className="flex items-center gap-3 cursor-pointer group select-none">
                      <div className="relative flex items-center">
                        <input type="radio" name="forWhom" checked={localFilters.forWhom === target} onChange={() => handleChange("forWhom", target)} className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 transition-all checked:border-gold checked:bg-gold hover:border-gold" />

                        <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity peer-checked:opacity-100"></div>
                      </div>
                      <span className="text-slate-600 dark:text-slate-300 group-hover:text-navy dark:group-hover:text-white transition-colors">
                        {target}
                      </span>
                    </label>)}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="font-semibold text-sm text-navy dark:text-white mb-3 uppercase tracking-wider">
                Amenities
              </h3>
              <div className="space-y-2.5">
                {amenities.map((amenity) => <label key={amenity} className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                      <input type="checkbox" checked={localFilters.amenities?.includes(amenity)} onChange={() => toggleAmenity(amenity)} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 transition-all checked:border-gold checked:bg-gold hover:border-gold" />

                      <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-slate-600 dark:text-slate-300 group-hover:text-navy dark:group-hover:text-white transition-colors">
                      {amenity}
                    </span>
                  </label>)}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
            <button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className={`w-full py-3.5 bg-gold text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-gold/20 ${
                isLoading
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:bg-gold/90 active:scale-95'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </span>
              ) : (
                <span>
                  {resultCount > 0 ? `Show ${resultCount} properties` : 'Apply Filters'}
                </span>
              )}
            </button>
            <button
              onClick={handleClearAll}
              disabled={isLoading}
              className={`w-full py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all shadow-sm ${
                isLoading
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:bg-white dark:hover:bg-slate-800 hover:text-navy dark:hover:text-white hover:border-navy dark:hover:border-white'
              }`}
            >
              Clear All
            </button>
          </div>
        </div>
      </aside>
    </>;
}
