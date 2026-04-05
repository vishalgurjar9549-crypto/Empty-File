import { useEffect, useState, useMemo, useRef, memo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Search, X } from "lucide-react";

import { RoomCard } from "../components/RoomCard";
import { FilterSidebar } from "../components/FilterSidebar";
import { VirtualizedGrid } from "../components/VirtualizedGrid";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchRooms } from "../store/slices/rooms.slice";

/* =========================================================
   FILTER CHIPS
========================================================= */
/**
 * ✅ Memoized FilterChips component
 * Prevents re-renders when the chips list doesn't change
 */
const FilterChips = memo(function FilterChips({
  appliedFilters,
  onRemoveFilter,
}: any) {
  const hasFilters =
    appliedFilters.city ||
    appliedFilters.minPrice ||
    appliedFilters.maxPrice ||
    appliedFilters.roomType ||
    (appliedFilters.roomTypes && appliedFilters.roomTypes.length > 0) ||
    (appliedFilters.genderPreference &&
      appliedFilters.genderPreference !== "ANY") ||
    (appliedFilters.idealFor && appliedFilters.idealFor.length > 0);

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {appliedFilters.city && (
        <Chip
          label={`City: ${appliedFilters.city}`}
          onRemove={() => onRemoveFilter("city")}
        />
      )}

      {(appliedFilters.minPrice || appliedFilters.maxPrice) && (
        <Chip
          label={`₹${appliedFilters.minPrice || 0} - ₹${
            appliedFilters.maxPrice || "Any"
          }`}
          onRemove={() => onRemoveFilter("price")}
        />
      )}

      {appliedFilters.roomType && (
        <Chip
          label={`Type: ${appliedFilters.roomType.toUpperCase()}`}
          onRemove={() => onRemoveFilter("roomType")}
        />
      )}

      {/* ✅ NEW: Display multi-select room types */}
      {appliedFilters.roomTypes && appliedFilters.roomTypes.length > 0 && (
        <Chip
          label={`Types: ${appliedFilters.roomTypes.join(", ")}`}
          onRemove={() => onRemoveFilter("roomTypes")}
        />
      )}

      {/* ✅ NEW: Display gender preference */}
      {appliedFilters.genderPreference &&
        appliedFilters.genderPreference !== "ANY" && (
          <Chip
            label={`Gender: ${
              appliedFilters.genderPreference === "MALE_ONLY"
                ? "Boys"
                : appliedFilters.genderPreference === "FEMALE_ONLY"
                ? "Girls"
                : "Anyone"
            }`}
            onRemove={() => onRemoveFilter("genderPreference")}
          />
        )}

      {/* ✅ NEW: Display ideal for */}
      {appliedFilters.idealFor && appliedFilters.idealFor.length > 0 && (
        <Chip
          label={`Ideal For: ${appliedFilters.idealFor.join(", ")}`}
          onRemove={() => onRemoveFilter("idealFor")}
        />
      )}
    </div>
  );
});

/**
 * ✅ Memoized Chip component
 * Prevents re-renders when sibling chips update
 */
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
      className="group inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 dark:bg-gold/15 dark:border-gold/25 px-3.5 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 shadow-sm transition-all duration-200 hover:border-gold hover:bg-gold/15 dark:hover:bg-gold/20 hover:shadow-md"
    >
      <span className="truncate">{label}</span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 transition-colors group-hover:bg-white dark:group-hover:bg-slate-700">
        <X className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
      </span>
    </button>
  );
});

/* =========================================================
   MAIN COMPONENT
========================================================= */
export function RoomsListing() {
  const dispatch = useAppDispatch();
  const { rooms, loading, meta } = useAppSelector((state) => state.rooms);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* =============================
     INFINITE SCROLL STATE
  ============================== */
  const [allRooms, setAllRooms] = useState<typeof rooms>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* =============================
     GET FILTERS FROM URL
  ============================== */
  const getFiltersFromURL = () => {
    const roomTypesParam = searchParams.get("roomTypes") || "";
    const idealForParam = searchParams.get("idealFor") || "";
    return {
      city: searchParams.get("city") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      roomType: searchParams.get("roomType") || "",
      // ✅ NEW: Parse roomTypes from URL (comma-separated string → array)
      roomTypes: roomTypesParam
        ? roomTypesParam.split(",").filter((rt) => rt.trim())
        : [],
      // ✅ NEW: Parse genderPreference from URL
      genderPreference: searchParams.get("genderPreference") || "",
      // ✅ NEW: Parse idealFor from URL (comma-separated string → array)
      idealFor: idealForParam
        ? idealForParam.split(",").filter((inf) => inf.trim())
        : [],
    };
  };

  const [filters, setFilters] = useState(() => getFiltersFromURL());
  const [appliedFilters, setAppliedFilters] = useState(() =>
    getFiltersFromURL(),
  );
  const [sortBy, setSortBy] = useState(
    () => searchParams.get("sort") || "latest",
  );

  // ✅ CURSOR PAGINATION: Use cursor instead of page
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(() =>
    Number(searchParams.get("page") || "1"),
  ); // For display only

  /* =============================
     API FILTERS MEMO - WITH CURSOR PAGINATION
  ============================== */
  const apiFilters = useMemo(() => {
    return {
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
      cursor: nextCursor,
      limit: 20,
    };
  }, [
    JSON.stringify(appliedFilters), // ✅ KEY FIX
    sortBy,
    nextCursor,
  ]);

  /* =============================
     FILTER KEY - STABLE DEPENDENCY FOR useEffect
     ✅ FIX: Create string key instead of object reference
  ============================== */
  const filterKey = useMemo(() => {
    return JSON.stringify({
      city: appliedFilters.city || "",
      minPrice: appliedFilters.minPrice || "",
      maxPrice: appliedFilters.maxPrice || "",
      roomType: appliedFilters.roomType || "",
      roomTypes: appliedFilters.roomTypes || [],
      genderPreference: appliedFilters.genderPreference || "",
      idealFor: appliedFilters.idealFor || [],
      sort: sortBy,
    });
  }, [appliedFilters, sortBy]);

  /* =============================
     APPLY FILTERS - useCallback for optimization
  ============================== */
  const handleApplyFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setAllRooms([]); // Clear existing rooms
    setNextCursor(undefined); // ✅ CURSOR PAGINATION: Reset cursor when filters change
    setHasMore(true);
    setPage(1);
  }, []);

  /* =============================
     REMOVE FILTER CHIP - useCallback for optimization
     ✅ FIX: No dependencies - uses functional setState
  ============================== */
  const handleRemoveFilter = useCallback(
    (key: string) => {
      setAppliedFilters((prev) => {
        const updated = { ...prev };

        if (key === "roomType") {
          updated.roomType = "";
        } else if (key === "roomTypes") {
          updated.roomTypes = [];
        } else if (key === "idealFor") {
          updated.idealFor = [];
        } else if (key === "price") {
          updated.minPrice = "";
          updated.maxPrice = "";
        } else if (key === "genderPreference") {
          updated.genderPreference = "";
        } else {
          (updated as any)[key] = "";
        }

        return updated;
      });

      setFilters((prev) => {
        const updated = { ...prev };
        if (key === "roomType") {
          updated.roomType = "";
        } else if (key === "roomTypes") {
          updated.roomTypes = [];
        } else if (key === "idealFor") {
          updated.idealFor = [];
        } else if (key === "price") {
          updated.minPrice = "";
          updated.maxPrice = "";
        } else if (key === "genderPreference") {
          updated.genderPreference = "";
        } else {
          (updated as any)[key] = "";
        }
        return updated;
      });

      setPage(1);
    },
    [], // ✅ No dependencies - uses functional setState
  );

  /* =============================
     SORT CHANGE - useCallback for optimization
  ============================== */
  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
    setPage(1);
  }, []);

  /* =============================
     SYNC URL
  ============================== */
  useEffect(() => {
    const params = new URLSearchParams();

    if (appliedFilters.city) params.set("city", appliedFilters.city);
    if (appliedFilters.minPrice)
      params.set("minPrice", appliedFilters.minPrice);
    if (appliedFilters.maxPrice)
      params.set("maxPrice", appliedFilters.maxPrice);
    if (appliedFilters.roomType)
      params.set("roomType", appliedFilters.roomType);
    // ✅ NEW: Sync multi-select room types to URL
    if (appliedFilters.roomTypes && appliedFilters.roomTypes.length > 0) {
      params.set("roomTypes", appliedFilters.roomTypes.join(","));
    }
    // ✅ NEW: Sync gender preference to URL
    if (
      appliedFilters.genderPreference &&
      appliedFilters.genderPreference !== "ANY"
    ) {
      params.set("genderPreference", appliedFilters.genderPreference);
    }
    // ✅ NEW: Sync ideal for to URL
    if (appliedFilters.idealFor && appliedFilters.idealFor.length > 0) {
      params.set("idealFor", appliedFilters.idealFor.join(","));
    }
    if (sortBy !== "latest") params.set("sort", sortBy);
    if (page > 1) params.set("page", String(page));

    setSearchParams(params);
  }, [appliedFilters, sortBy, page, setSearchParams]);

  /* =============================
     FETCH NEXT PAGE (INFINITE SCROLL WITH CURSOR)
  ============================== */
  const fetchNextPage = useCallback(async () => {
    // ✅ CRITICAL FIX #1: Double-check loading state to prevent race conditions
    if (loadingMore || !hasMore || loading.fetch) {
      console.log("[RoomsListing] Fetch blocked:", {
        loadingMore,
        hasMore,
        reduxLoading: loading.fetch,
      });
      return;
    }

    setLoadingMore(true);
    console.log("[RoomsListing] Fetching next page with cursor:", nextCursor);

    try {
      // ✅ CURSOR PAGINATION: Pass cursor instead of calculating page
      const nextPageFilters = { ...apiFilters, cursor: nextCursor };

      // Dispatch fetch for next page
      const result = await dispatch(fetchRooms(nextPageFilters)).unwrap();

      // ✅ CRITICAL FIX #2: Verify we got valid response before processing
      if (!result || !result.rooms || result.rooms.length === 0) {
        console.log("[RoomsListing] No more rooms available");
        setHasMore(false);
        return;
      }

      // ✅ Update the cursor for next fetch
      if (result.meta?.nextCursor) {
        setNextCursor(result.meta.nextCursor);
      }

      // ✅ Append rooms instead of replacing
      setAllRooms((prev) => {
        // Deduplicate by room ID to prevent duplicates
        const existingIds = new Set(prev.map((r) => r.id));
        const newRooms = result.rooms.filter((r) => !existingIds.has(r.id));

        // ✅ CRITICAL FIX #3: Only append if we actually got new rooms
        if (newRooms.length === 0) {
          console.warn("[RoomsListing] All returned rooms were duplicates");
          return prev; // Don't update if all duplicates
        }

        return [...prev, ...newRooms];
      });

      // ✅ CRITICAL FIX #4: Check if we've reached the end
      if (result.meta?.hasNextPage === false) {
        setHasMore(false);
        console.log("[RoomsListing] Reached end (hasNextPage=false)");
      } else if (result.rooms.length < 20) {
        setHasMore(false);
        console.log("[RoomsListing] Reached end (less than limit)");
      }
    } catch (error) {
      console.error("[RoomsListing] Error fetching next page:", error);
    } finally {
      // ✅ CRITICAL: Always reset loading flag
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, hasMore, apiFilters, dispatch, loading.fetch]);

  /* =============================
     FETCH DATA - STABILIZED DEPENDENCIES (FIX FOR INFINITE LOOP)
     ✅ FIX #2: Use filterKey string instead of apiFilters object
     ✅ FIX #3: Add mount guard to prevent double fetch
     ✅ FIX #4: REMOVE apiFilters from dependency - only use filterKey
  ============================== */
  const isFetchingRef = useRef(false);
  const lastFetchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // ✅ FIX #4.1: Guard - skip if already fetching
    if (isFetchingRef.current) {
      console.log("[RoomsListing] Skipping fetch - already fetching");
      return;
    }

    // ✅ FIX #4.2: Guard - skip if filterKey hasn't actually changed
    if (lastFetchKeyRef.current === filterKey) {
      console.log("[RoomsListing] Skipping fetch - filterKey unchanged");
      return;
    }

    // ✅ FIX #4.3: ACTUAL FILTER CHANGE detected
    console.log("[RoomsListing] Filters changed, resetting scroll state", {
      newKey: filterKey,
      oldKey: lastFetchKeyRef.current,
    });

    // Reset scroll pagination when filters change
    setAllRooms([]);
    setHasMore(true);
    setLoadingMore(false);
    setNextCursor(undefined);

    // Mark key as fetched BEFORE dispatch
    lastFetchKeyRef.current = filterKey;
    isFetchingRef.current = true;

    console.log("[RoomsListing] Fetching rooms with filters:", apiFilters);

    // Dispatch fetch
    // ✅ CRITICAL INSIGHT: apiFilters is SAFE to use without being in dependencies
    //
    // WHY? apiFilters useMemo depends on: [JSON.stringify(appliedFilters), sortBy, nextCursor]
    // filterKey useMemo depends on: [appliedFilters, sortBy] (excludes nextCursor)
    //
    // INVARIANT: When filterKey changes → either appliedFilters or sortBy changed
    //           → apiFilters MUST have changed too (same parent dependencies)
    //
    // nextCursor is NOT in filterKey because:
    // - Cursor changes frequently during infinite scroll (not a filter change)
    // - We don't want to re-fetch first page when cursor updates
    // - When user changes filters, we reset nextCursor=undefined anyway
    //
    // RESULT: filterKey captures all meaningful filter changes
    //         apiFilters auto-updates when filterKey updates
    //         No infinite loop from object reference changes
    dispatch(fetchRooms(apiFilters)).finally(() => {
      isFetchingRef.current = false;
    });
  }, [filterKey, dispatch]); // ✅ FIX #4: Only stable string dependency + dispatch

  /* =============================
     INFINITE SCROLL OBSERVER SETUP
  ============================== */
  useEffect(() => {
    // ✅ Append initial rooms when Redux rooms update
    if (rooms.length > 0) {
      setAllRooms((prev) => {
        if (prev.length === 0) {
          // First fetch: use all rooms
          return rooms;
        }
        // Subsequent fetches: rooms already appended in fetchNextPage
        return prev;
      });

      // Determine if more data exists
      if (meta?.total && rooms.length >= meta.total) {
        setHasMore(false);
      } else if (rooms.length < 20) {
        // Less than limit means we hit the end
        setHasMore(false);
      }
    }
  }, [rooms, loading.fetch, meta]);

  /* =============================
     INTERSECTION OBSERVER for sentinel
     ✅ FIX #3: Don't depend on fetchNextPage to prevent re-setup
  ============================== */
  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Use closure to capture current state values
        if (
          entry.isIntersecting &&
          hasMore &&
          !loadingMore &&
          !loading.fetch &&
          !isFetchingRef.current
        ) {
          console.log("[RoomsListing] Sentinel visible - fetching next page");
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loading.fetch]); // ✅ Removed fetchNextPage from deps

  // ✅ DEBUG: Log state changes
  useEffect(() => {
    console.log("[RoomsListing] State updated:", {
      allRoomsCount: allRooms.length,
      initialRoomsCount: rooms.length,
      isLoading: loading.fetch,
      isLoadingMore: loadingMore,
      hasMore,
      hasError: !!meta?.total === false,
      totalFromMeta: meta?.total,
      firstRoomId: allRooms[0]?.id || "N/A",
    });
  }, [allRooms, rooms, loading.fetch, loadingMore, hasMore, meta]);

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
              onChange={(e) => handleSortChange(e.target.value)}
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
            {loading.fetch && allRooms.length === 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[300px] rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse"
                  />
                ))}
              </div>
            ) : allRooms.length ? (
              <div>
                <VirtualizedGrid
                  items={allRooms}
                  renderItem={(room) => <RoomCard room={room} />}
                  columns={3}
                  estimateSize={400}
                  overscan={5}
                  className="px-0"
                  containerClassName="px-0"
                />

                {/* ✅ SENTINEL DIV for infinite scroll */}
                <div ref={sentinelRef} className="py-8 text-center">
                  {loadingMore && (
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold/30 border-t-gold"></div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Loading more...
                      </span>
                    </div>
                  )}
                  {!hasMore && allRooms.length > 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No more properties to load
                    </p>
                  )}
                </div>
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
