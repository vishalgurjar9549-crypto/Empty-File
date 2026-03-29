import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';
import { RoomCard } from '../components/RoomCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { FilterChips } from '../components/FilterChips';
import { LoadMoreSection } from '../components/LoadMoreSection';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRooms } from '../store/slices/rooms.slice';
import { RoomFilters } from '../types/api.types';

export function RoomsListing() {
  const dispatch = useAppDispatch();
  const {
    rooms,
    loading,
    meta
  } = useAppSelector((state) => state.rooms);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ============================================
  // FIX #1: Helper to parse filters from URL (no useCallback needed)
  // ============================================
  const getFiltersFromURL = () => {
    const amenitiesStr = searchParams.get('amenities') || '';
    // Support both 'roomType' (new) and 'type' (legacy) for backward compatibility
    const roomTypeStr = searchParams.get('roomType') || searchParams.get('type') || '';
    return {
      city: searchParams.get('city') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      roomType: roomTypeStr ? roomTypeStr.split(',').filter(Boolean) : [],
      forWhom: searchParams.get('forWhom') || '',
      amenities: amenitiesStr ? amenitiesStr.split(',').filter(Boolean) : [] as string[]
    };
  };

  // ============================================
  // FIX #2: Initialize filters from URL using useState initializer
  // Initializer function only runs once on component mount
  // ============================================
  const [filters, setFilters] = useState(() => getFiltersFromURL());
  const [appliedFilters, setAppliedFilters] = useState(() => getFiltersFromURL());
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'recommended');

  // ============================================
  // FIX #3: Create memoized apiFilters object
  // Prevents object recreation on every render
  // Only recreates when actual filter values change
  // ============================================
  const apiFilters = useMemo(() => ({
    city: appliedFilters.city || undefined,
    minPrice: appliedFilters.minPrice || undefined,
    maxPrice: appliedFilters.maxPrice || undefined,
    roomType: appliedFilters.roomType?.length ? appliedFilters.roomType.join(',') : undefined,
    idealFor: appliedFilters.forWhom || undefined,
    amenities: appliedFilters.amenities?.length ? appliedFilters.amenities.join(',') : undefined,
    onlyActive: 'true',
    sort: sortBy,
    page: 1,
    limit: 20
  }), [appliedFilters, sortBy]);

  // ============================================
  // Handler for Apply Filters button
  // ============================================
  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  };

  // ============================================
  // Handler for removing individual filters via chips
  // ============================================
  const handleRemoveFilter = (filterKey: string, value?: string) => {
    const updated = { ...appliedFilters };

    if (filterKey === 'roomType' && value) {
      // Remove specific room type
      updated.roomType = (updated.roomType || []).filter((t: string) => t !== value);
    } else if (filterKey === 'amenities' && value) {
      // Remove specific amenity
      updated.amenities = (updated.amenities || []).filter((a: string) => a !== value);
    } else if (filterKey === 'price') {
      // Clear both min and max price
      updated.minPrice = '';
      updated.maxPrice = '';
    } else if (filterKey === 'city') {
      // Clear city
      updated.city = '';
    } else if (filterKey === 'forWhom') {
      // Clear forWhom
      updated.forWhom = '';
    }

    // Apply the updated filters to BOTH states
    setAppliedFilters(updated);
    setFilters(updated);
  };

  // ============================================
  // SYNC: When sidebar opens, sync filters from appliedFilters
  // This ensures UI inputs reflect current applied filters
  // ============================================
  useEffect(() => {
    if (isFilterOpen) {
      setFilters(appliedFilters);
    }
  }, [isFilterOpen, appliedFilters]);

  // ============================================
  // REFS: Track Strict Mode double calls & filter changes
  // ============================================
  const hasFetchedRef = useRef(false);
  const prevApiKeyRef = useRef<string | null>(null);

  // ============================================
  // Restore scroll position on component mount
  // ============================================
  useEffect(() => {
    const savedScrollY = sessionStorage.getItem('roomsScrollY');
    if (savedScrollY) {
      const scrollY = parseInt(savedScrollY, 10);
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
      sessionStorage.removeItem('roomsScrollY');
    }
  }, []);

  // ============================================
  // Save scroll position when component unmounts
  // ============================================
  useEffect(() => {
    return () => {
      sessionStorage.setItem('roomsScrollY', String(window.scrollY));
    };
  }, []);

  // ============================================
  // Update URL when applied filters change
  // (Separate from API call - this is for URL persistence)
  // ============================================
  useEffect(() => {
    const newSearchParams = new URLSearchParams();

    if (appliedFilters.city) newSearchParams.set('city', appliedFilters.city);
    if (appliedFilters.minPrice) newSearchParams.set('minPrice', appliedFilters.minPrice);
    if (appliedFilters.maxPrice) newSearchParams.set('maxPrice', appliedFilters.maxPrice);
    if (appliedFilters.roomType?.length) newSearchParams.set('roomType', appliedFilters.roomType.join(','));
    if (appliedFilters.forWhom) newSearchParams.set('forWhom', appliedFilters.forWhom);
    if (appliedFilters.amenities?.length) newSearchParams.set('amenities', appliedFilters.amenities.join(','));
    if (sortBy && sortBy !== 'recommended') newSearchParams.set('sort', sortBy);

    setSearchParams(newSearchParams);
  }, [appliedFilters, sortBy, setSearchParams]);

  // ============================================
  // FETCH ROOMS EFFECT - Handles filter changes + Strict Mode
  // 
  // How it works:
  // 1. Creates unique key from current filters (apiKey)
  // 2. Checks if filters changed (prevApiKeyRef !== apiKey)
  // 3. If changed: reset hasFetchedRef to allow new fetch
  // 4. If same: block via hasFetchedRef (prevents Strict Mode double)
  // 5. Stores new apiKey for next comparison
  // ============================================
  useEffect(() => {
    const apiKey = JSON.stringify(apiFilters);

    // Allow fetch if filters changed (new apiKey)
    if (prevApiKeyRef.current !== apiKey) {
      hasFetchedRef.current = false;
    }

    // Prevent double call (React Strict Mode safety)
    if (hasFetchedRef.current) return;

    // Mark that we've fetched this filter combination
    hasFetchedRef.current = true;
    prevApiKeyRef.current = apiKey;

    // Fetch rooms with current filters
    dispatch(fetchRooms(apiFilters));
  }, [apiFilters, dispatch]);

  return <div className="min-h-screen bg-cream dark:bg-slate-950  transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy dark:text-white font-playfair mb-1">
              Find Your Stay
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Showing {meta?.total || 0} properties available now
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button onClick={() => setIsFilterOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-navy dark:text-white font-medium shadow-sm active:scale-95 transition-all">

              <Filter className="w-4 h-4" />
              Filters
            </button>

            <div className="relative flex-1 min-w-[180px] md:w-56">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-white text-sm font-medium focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 cursor-pointer shadow-sm">

                <option value="recommended">Recommended</option>
                <option value="popular">Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Chips - Airbnb style applied filters */}
        <div className="mb-6">
          <FilterChips appliedFilters={appliedFilters} onRemoveFilter={handleRemoveFilter} />
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar */}
          <FilterSidebar filters={filters} setFilters={setFilters} onApplyFilters={handleApplyFilters} isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />


          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading.fetch ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm h-[400px] animate-pulse">

                    <div className="h-56 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="p-5 space-y-4">
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>
                  </div>)}
              </div> : rooms.length > 0 ? <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {rooms.map((room) => <RoomCard key={room.id} room={room} />)}
                </div>
                {/* ✅ INFINITE SCROLL: LoadMoreSection triggers when scrolled to bottom */}
                <LoadMoreSection
                  meta={meta}
                  loading={loading.fetch}
                  currentFilters={apiFilters}
                  enableInfiniteScroll={true}
                />
              </div> : <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center px-4">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-navy dark:text-white mb-2 font-playfair">
                  No properties found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                  We couldn't find any matches for your current filters. Try
                  adjusting your search criteria.
                </p>
                <button onClick={() => {
              const clearedFilters = {
                city: '',
                minPrice: '',
                maxPrice: '',
                roomType: [],
                forWhom: '',
                amenities: []
              };
              setFilters(clearedFilters);
              handleApplyFilters(clearedFilters);
            }} className="px-8 py-3 bg-navy dark:bg-white text-white dark:text-navy font-semibold rounded-xl hover:bg-gold dark:hover:bg-slate-200 transition-colors shadow-lg shadow-navy/20">

                  Clear All Filters
                </button>
              </div>}
          </div>
        </div>
      </div>
    </div>;
}
