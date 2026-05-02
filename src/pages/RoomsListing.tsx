import { useEffect, useState, useMemo, useRef, memo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, SlidersHorizontal } from "lucide-react";

import { RoomCard } from "../components/RoomCard";
import { FilterSidebar } from "../components/FilterSidebar";
import { VirtualizedGrid } from "../components/VirtualizedGrid";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchRooms } from "../store/slices/rooms.slice";

/* ─────────────────────────────────────────────
   FILTER CHIPS
───────────────────────────────────────────── */
const Chip = memo(function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="group inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200"
      style={{
        background: "rgba(212,175,55,0.1)",
        border: "1px solid rgba(212,175,55,0.35)",
        color: "rgba(212,175,55,0.95)",
      }}
    >
      <span className="truncate tracking-wide uppercase">{label}</span>
      <span className="flex h-4 w-4 items-center justify-center rounded-full transition-colors group-hover:bg-white/10">
        <X className="h-3 w-3" />
      </span>
    </button>
  );
});

const FilterChips = memo(function FilterChips({
  appliedFilters,
  onRemoveFilter,
}: any) {
  const hasFilters =
    appliedFilters.city ||
    appliedFilters.minPrice ||
    appliedFilters.maxPrice ||
    appliedFilters.roomType ||
    appliedFilters.roomTypes?.length > 0 ||
    (appliedFilters.genderPreference &&
      appliedFilters.genderPreference !== "ANY") ||
    appliedFilters.idealFor?.length > 0;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mr-1">
        Active:
      </span>
      {appliedFilters.city && (
        <Chip
          label={`📍 ${appliedFilters.city}`}
          onRemove={() => onRemoveFilter("city")}
        />
      )}
      {(appliedFilters.minPrice || appliedFilters.maxPrice) && (
        <Chip
          label={`₹${appliedFilters.minPrice || 0}–₹${
            appliedFilters.maxPrice || "∞"
          }`}
          onRemove={() => onRemoveFilter("price")}
        />
      )}
      {appliedFilters.roomType && (
        <Chip
          label={appliedFilters.roomType.toUpperCase()}
          onRemove={() => onRemoveFilter("roomType")}
        />
      )}
      {appliedFilters.roomTypes?.length > 0 && (
        <Chip
          label={appliedFilters.roomTypes.join(", ")}
          onRemove={() => onRemoveFilter("roomTypes")}
        />
      )}
      {appliedFilters.genderPreference &&
        appliedFilters.genderPreference !== "ANY" && (
          <Chip
            label={
              appliedFilters.genderPreference === "MALE_ONLY"
                ? "Boys Only"
                : appliedFilters.genderPreference === "FEMALE_ONLY"
                ? "Girls Only"
                : "Anyone"
            }
            onRemove={() => onRemoveFilter("genderPreference")}
          />
        )}
      {appliedFilters.idealFor?.length > 0 && (
        <Chip
          label={`For: ${appliedFilters.idealFor.join(", ")}`}
          onRemove={() => onRemoveFilter("idealFor")}
        />
      )}
    </div>
  );
});

/* ─────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 animate-pulse">
      <div className="h-48 bg-slate-200 dark:bg-slate-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SORT OPTIONS
───────────────────────────────────────────── */
const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "most_viewed", label: "Most Viewed" },
  { value: "most_contacted", label: "Most Contacted" },
  { value: "price_low", label: "Price: Low → High" },
  { value: "price_high", label: "Price: High → Low" },
];

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export function RoomsListing() {
  const dispatch = useAppDispatch();
  const { rooms, loading, meta } = useAppSelector((s) => s.rooms);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* ── Infinite scroll state ── */
  const [allRooms, setAllRooms] = useState<typeof rooms>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  // ✅ Refs to prevent duplicate API calls
  const isFetchingRef = useRef(false);
  const fetchingMoreRef = useRef(false);
  const lockRef = useRef(false);
  const pageRef = useRef(1);
  const triggerRef = useRef(false);
  /* ── Responsive columns ── */
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => setWindowWidth(window.innerWidth), 150);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const columns = useMemo(() => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 1024) return 2;
    if (windowWidth < 1280) return 3;
    return 4;
  }, [windowWidth]);

  // estimateSize is just a hint — measureElement corrects it after mount
  const estimateSize = useMemo(() => {
    if (columns === 1) return 370;
    if (columns === 2) return 390;
    if (columns === 3) return 410;
    return 420;
  }, [columns]);

  /* ── Helpers ── */
  const getFiltersFromURL = useCallback(() => {
    const roomTypesParam = searchParams.get("roomTypes") || "";
    const idealForParam = searchParams.get("idealFor") || "";
    return {
      city: searchParams.get("city") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      roomType: searchParams.get("roomType") || "",
      roomTypes: roomTypesParam
        ? roomTypesParam.split(",").filter(Boolean)
        : [],
      genderPreference: searchParams.get("genderPreference") || "",
      idealFor: idealForParam ? idealForParam.split(",").filter(Boolean) : [],
    };
  }, [searchParams]);

  const [filters, setFilters] = useState(() => getFiltersFromURL());
  const [appliedFilters, setAppliedFilters] = useState(() =>
    getFiltersFromURL(),
  );
  const [sortBy, setSortBy] = useState(
    () => searchParams.get("sort") || "latest",
  );
  const [page, setPage] = useState(() =>
    Number(searchParams.get("page") || "1"),
  );
  const PAGE_LIMIT = 10;

  // ✅ Base filters (without page) — stable for initial fetch
  const baseFilters = useMemo(
    () => ({
      city: appliedFilters.city || undefined,
      minPrice: appliedFilters.minPrice || undefined,
      maxPrice: appliedFilters.maxPrice || undefined,
      roomType: appliedFilters.roomType || undefined,
      roomTypes: appliedFilters.roomTypes?.length
        ? appliedFilters.roomTypes
        : undefined,
      genderPreference:
        appliedFilters.genderPreference &&
        appliedFilters.genderPreference !== "ANY"
          ? appliedFilters.genderPreference
          : undefined,
      idealFor: appliedFilters.idealFor?.length
        ? appliedFilters.idealFor
        : undefined,
      sort: sortBy,
      limit: PAGE_LIMIT,
    }),
    [
      appliedFilters.city,
      appliedFilters.minPrice,
      appliedFilters.maxPrice,
      appliedFilters.roomType,
      appliedFilters.roomTypes,
      appliedFilters.genderPreference,
      appliedFilters.idealFor,
      sortBy,
    ],
  );

  // ✅ Trigger reset when filter/sort changes
  const filterKey = useMemo(
    () => JSON.stringify({ ...appliedFilters, sort: sortBy }),
    [appliedFilters, sortBy],
  );

  /* ── Handlers ── */
  const handleApplyFilters = useCallback((newFilters: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[RoomsListing] handleApplyFilters:`, {
        newFilters,
        timestamp: new Date().toISOString(),
      });
    }

    setFilters(newFilters);
    setAppliedFilters(newFilters);

    // ✅ CRITICAL: Clear local state when filters change
    // This ensures new API results will be synced from Redux
    setAllRooms([]);
    setHasMore(true);
    setPage(1);
    pageRef.current = 1; // ✅ ADD THIS
  }, []);

  const handleRemoveFilter = useCallback((key: string) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[RoomsListing] handleRemoveFilter:`, key);
    }

    setAppliedFilters((prev: any) => {
      const updated = { ...prev };
      if (key === "price") {
        updated.minPrice = "";
        updated.maxPrice = "";
      } else if (key === "roomTypes") updated.roomTypes = [];
      else if (key === "idealFor") updated.idealFor = [];
      else updated[key] = "";

      if (process.env.NODE_ENV === "development") {
        console.log(`[RoomsListing] handleRemoveFilter updated:`, updated);
      }

      return updated;
    });

    setFilters((prev: any) => {
      const updated = { ...prev };
      if (key === "price") {
        updated.minPrice = "";
        updated.maxPrice = "";
      } else if (key === "roomTypes") updated.roomTypes = [];
      else if (key === "idealFor") updated.idealFor = [];
      else updated[key] = "";
      return updated;
    });

    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
    setPage(1);
  }, []);

  /* ── Sync URL ── */
  useEffect(() => {
    const p = new URLSearchParams();
    if (appliedFilters.city) p.set("city", appliedFilters.city);
    if (appliedFilters.minPrice) p.set("minPrice", appliedFilters.minPrice);
    if (appliedFilters.maxPrice) p.set("maxPrice", appliedFilters.maxPrice);
    if (appliedFilters.roomType) p.set("roomType", appliedFilters.roomType);
    if (appliedFilters.roomTypes?.length)
      p.set("roomTypes", appliedFilters.roomTypes.join(","));
    if (
      appliedFilters.genderPreference &&
      appliedFilters.genderPreference !== "ANY"
    )
      p.set("genderPreference", appliedFilters.genderPreference);
    if (appliedFilters.idealFor?.length)
      p.set("idealFor", appliedFilters.idealFor.join(","));
    if (sortBy !== "latest") p.set("sort", sortBy);
    if (page > 1) p.set("page", String(page));
    setSearchParams(p);
  }, [appliedFilters, sortBy, page, setSearchParams]);

  /* ── Fetch next page ── */
  const fetchNextPage = useCallback(async () => {
 
    // ✅ Guard: prevent duplicate fetches
    if (
      lockRef.current || // ✅ HARD LOCK
      fetchingMoreRef.current ||
      loadingMore ||
      !hasMore ||
      loading.fetch
    )
      return;

    if (fetchingMoreRef.current) return;

    fetchingMoreRef.current = true;
    lockRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;
      setPage(nextPage);
      const result = await dispatch(
        fetchRooms({ ...baseFilters, page: nextPage }),
      ).unwrap();
   console.log(
  "PAGE:",
  nextPage,
  result.rooms.map((r: any) => r.id)
);
      // ✅ Guard: no results = end of pagination
      if (!result?.rooms?.length) {
        setHasMore(false);
        return;
      }

      // ✅ Update page after successful fetch

      // ✅ SINGLE state update: append with deduplication
      setAllRooms((prev) => {
  const updated = [...prev, ...result.rooms];

  if (result.meta?.total && updated.length >= result.meta.total) {
    setHasMore(false);
  } else if (result.rooms.length < PAGE_LIMIT) {
    setHasMore(false);
  }

  return updated;
});
    } catch (e) {
      console.error("[RoomsListing] fetchNextPage error", e);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
      fetchingMoreRef.current = false;
      lockRef.current = false; // ✅ ADD THIS
    }
  }, [loadingMore, hasMore, baseFilters, dispatch, loading.fetch, PAGE_LIMIT]);

  /* ── Initial fetch on filter change ── */
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // ✅ Guard: already fetching OR filter hasn't changed
    if (isFetchingRef.current || lastKeyRef.current === filterKey) return;

    if (process.env.NODE_ENV === "development") {
      console.log(`[RoomsListing] Filter changed, resetting pagination`, {
        filterKey,
        baseFilters,
      });
    }

    // ✅ Reset ALL pagination state
    setAllRooms([]);
    setHasMore(true);
    setLoadingMore(false);
    setPage(1);
    lastKeyRef.current = filterKey;
    isFetchingRef.current = true;

    // ✅ Fetch page 1 with current filters
    dispatch(fetchRooms({ ...baseFilters, page: 1 }))
      .unwrap()
      .then((result) => {
        if (result?.rooms?.length) {
          // ✅ Single source of truth: setAllRooms with initial data
          setAllRooms(result.rooms);
        }
      })
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [filterKey, baseFilters, dispatch]);

  useEffect(() => {
    const el = gridScrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (
        lockRef.current ||
        fetchingMoreRef.current ||
        loadingMore ||
        !hasMore ||
        loading.fetch
      ) {
        return;
      }

      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;

      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;

      // ✅ EDGE TRIGGER (only fire once)
      if (isNearBottom && !triggerRef.current) {
        triggerRef.current = true;
        fetchNextPage();
      }

      // ✅ RESET trigger when user scrolls up
      if (!isNearBottom) {
        triggerRef.current = false;
      }
    };

    el.addEventListener("scroll", handleScroll);

    return () => el.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasMore, loadingMore, loading.fetch]);
  /* ── Derived ── */
  const isInitialLoading = loading.fetch && allRooms.length === 0;
  const isEmpty = !isInitialLoading && allRooms.length === 0;

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div className="h-screen bg-[#f8f6f1] dark:bg-[#0d0b06] flex flex-col overflow-hidden">
      {/* Page header */}
      <div className="w-full px-6 lg:px-8 py-6 flex-shrink-0 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Find Your Stay
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {meta?.total
                  ? `${meta.total.toLocaleString()} properties available`
                  : "Browse all properties"}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  color: "rgba(212,175,55,0.9)",
                }}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-300/30 cursor-pointer"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar — has its own independent scroll, doesn't affect grid */}
        <div className="hidden lg:flex h-full w-72 flex-col flex-shrink-0 border-r border-slate-200/70 dark:border-slate-800/60 bg-white dark:bg-[#0d0b06]">
          <div className="h-full overflow-y-auto px-4">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onApplyFilters={handleApplyFilters}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>
        </div>

        {/* ─────────────────────────────────────────────
          ✅ THE SINGLE SCROLL CONTAINER FOR THE GRID
          - gridScrollRef attached here
          - overflow-y-auto is ONLY here (not in VirtualizedGrid)
          - VirtualizedGrid receives this ref → virtualizer
            attaches to this element → ONE scrollbar total
          - Sentinel lives inside here so IntersectionObserver
            fires relative to this scroll container
        ───────────────────────────────────────────── */}
        <div
          ref={gridScrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
          style={{
            // Hide scrollbar cross-browser while keeping scroll functional
            msOverflowStyle: "none", // IE / Edge
            scrollbarWidth: "none", // Firefox
          }}
        >
          <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-8 py-6">
            {/* Filter chips */}
            {appliedFilters && (
              <div className="mb-6">
                <FilterChips
                  appliedFilters={appliedFilters}
                  onRemoveFilter={handleRemoveFilter}
                />
              </div>
            )}

            {isInitialLoading ? (
              <div className="grid gap-3 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-32 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/30">
                <Search
                  className="mb-4 h-12 w-12 opacity-20"
                  style={{ color: "rgba(212,175,55,0.6)" }}
                />
                <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">
                  No properties found
                </p>
                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <>
                {/*
                  ✅ VirtualizedGrid changes:
                  - containerHeight prop REMOVED (no longer exists)
                  - scrollContainerRef={gridScrollRef} passed in
                  - key resets virtualizer on column/data change
                */}
                <VirtualizedGrid
                  key={`grid-${columns}`}
                  scrollContainerRef={gridScrollRef}
                  items={allRooms}
                  renderItem={(room) => <RoomCard room={room} />}
                  columns={columns}
                  estimateSize={estimateSize}
                  overscan={4}
                />

                {/* Infinite scroll sentinel — inside the scroll container */}
                <div
                  ref={sentinelRef}
                  className="mt-4 py-8 flex justify-center"
                >
                  {loadingMore && (
                    <div
                      className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium"
                      style={{
                        background: "rgba(212,175,55,0.08)",
                        border: "1px solid rgba(212,175,55,0.2)",
                        color: "rgba(212,175,55,0.85)",
                      }}
                    >
                      <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Loading more…
                    </div>
                  )}
                  {!hasMore && allRooms.length > 0 && (
                    <p className="text-sm text-slate-400 dark:text-slate-500 tracking-wide">
                      — All {allRooms.length} properties loaded —
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
