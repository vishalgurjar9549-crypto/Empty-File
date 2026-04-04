import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';

import { RoomCard } from '../components/RoomCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRooms } from '../store/slices/rooms.slice';

/* =========================================================
   FILTER CHIPS
========================================================= */
function FilterChips({ appliedFilters, onRemoveFilter }: any) {
  const hasFilters =
    appliedFilters.city ||
    appliedFilters.minPrice ||
    appliedFilters.maxPrice ||
    appliedFilters.roomType;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {appliedFilters.city && (
        <Chip
          label={`City: ${appliedFilters.city}`}
          onRemove={() => onRemoveFilter('city')}
        />
      )}

      {(appliedFilters.minPrice || appliedFilters.maxPrice) && (
        <Chip
          label={`₹${appliedFilters.minPrice || 0} - ₹${appliedFilters.maxPrice || 'Any'}`}
          onRemove={() => onRemoveFilter('price')}
        />
      )}

      {appliedFilters.roomType && (
        <Chip
          label={`Type: ${appliedFilters.roomType.toUpperCase()}`}
          onRemove={() => onRemoveFilter('roomType')}
        />
      )}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="group inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 dark:bg-gold/15 dark:border-gold/25 px-3.5 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 shadow-sm transition-all duration-200 hover:border-gold hover:bg-gold/15 dark:hover:bg-gold/20 hover:shadow-md"
    >
      <span className="truncate">{label}</span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 transition-colors group-hover:bg-white dark:group-hover:bg-slate-700">
        <X className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
      </span>
    </button>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export function RoomsListing() {
  const dispatch = useAppDispatch();
  const { rooms, loading, meta } = useAppSelector((state) => state.rooms);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* =============================
     GET FILTERS FROM URL
  ============================== */
  const getFiltersFromURL = () => {
    return {
      city: searchParams.get('city') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      roomType: searchParams.get('roomType') || '',
    };
  };

  const [filters, setFilters] = useState(() => getFiltersFromURL());
  const [appliedFilters, setAppliedFilters] = useState(() => getFiltersFromURL());
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'latest');
  const [page, setPage] = useState(() => Number(searchParams.get('page') || '1'));

  /* =============================
     API FILTERS MEMO
  ============================== */
  const apiFilters = useMemo(
    () => ({
      city: appliedFilters.city || undefined,
      minPrice: appliedFilters.minPrice || undefined,
      maxPrice: appliedFilters.maxPrice || undefined,
      roomType: appliedFilters.roomType || undefined,
      sort: sortBy,
      page,
      limit: 20,
    }),
    [appliedFilters, sortBy, page]
  );

  /* =============================
     APPLY FILTERS
  ============================== */
  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setPage(1);
  };

  /* =============================
     REMOVE FILTER CHIP
  ============================== */
  const handleRemoveFilter = (key: string, value?: string) => {
    const updated = { ...appliedFilters };

    if (key === 'roomType') {
      updated.roomType = '';
    } else if (key === 'price') {
      updated.minPrice = '';
      updated.maxPrice = '';
    } else {
      (updated as any)[key] = '';
    }

    setAppliedFilters(updated);
    setFilters(updated);
    setPage(1);
  };

  /* =============================
     SYNC URL
  ============================== */
  useEffect(() => {
    const params = new URLSearchParams();

    if (appliedFilters.city) params.set('city', appliedFilters.city);
    if (appliedFilters.minPrice) params.set('minPrice', appliedFilters.minPrice);
    if (appliedFilters.maxPrice) params.set('maxPrice', appliedFilters.maxPrice);
    if (appliedFilters.roomType) params.set('roomType', appliedFilters.roomType);
    if (sortBy !== 'latest') params.set('sort', sortBy);
    if (page > 1) params.set('page', String(page));

    setSearchParams(params);
  }, [appliedFilters, sortBy, page, setSearchParams]);

  /* =============================
     FETCH DATA (STRICT MODE SAFE)
  ============================== */
  const fetchedRef = useRef(false);
  const prevKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = JSON.stringify(apiFilters);

    if (prevKeyRef.current !== key) {
      fetchedRef.current = false;
    }

    if (fetchedRef.current) return;

    fetchedRef.current = true;
    prevKeyRef.current = key;

    dispatch(fetchRooms(apiFilters));
  }, [apiFilters, dispatch]);

  /* =============================
     UI
  ============================== */
  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Find Your Stay
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {meta?.total || 0} properties
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition hover:border-gold hover:text-gold"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              <option value="latest">Latest</option>
              <option value="most_viewed">Most Viewed</option>
              <option value="most_contacted">Most Contacted</option>
              <option value="price_low">Price Low → High</option>
              <option value="price_high">Price High → Low</option>
            </select>
          </div>
        </div>

        {/* FILTER CHIPS */}
        <div className="mb-6">
          <FilterChips
            appliedFilters={appliedFilters}
            onRemoveFilter={handleRemoveFilter}
          />
        </div>

        {/* CONTENT */}
        <div className="flex items-start gap-6">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            onApplyFilters={handleApplyFilters}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />

          {/* GRID */}
          <div className="min-w-0 flex-1">
            {loading.fetch ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[300px] rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse"
                  />
                ))}
              </div>
            ) : rooms.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {rooms.map((room: any) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-20 text-center">
                <Search className="mx-auto mb-4 h-10 w-10 opacity-30" />
                <p className="text-slate-600 dark:text-slate-300">
                  No properties found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
