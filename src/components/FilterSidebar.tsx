import { useEffect, useState, memo, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, SlidersHorizontal } from "lucide-react";
import { useAppSelector } from "../store/hooks";
import {
  ROOM_TYPE_OPTIONS,
  GENDER_PREFERENCE_UI_OPTIONS,
  IDEAL_FOR_OPTIONS,
  BUDGET_RANGES,
} from "../constants/filterOptions";

interface FilterSidebarProps {
  filters: any;
  setFilters: (filters: any) => void;
  onApplyFilters: (filters: any) => void;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  resultCount?: number;
}

const MAX_RENT = 500_000;
const MIN_RENT = 0;

const normalizeCityValue = (name: string) => name.trim().toLowerCase();

/**
 * Custom hook to detect mobile viewport
 * Returns true if screen width < 1024px (lg breakpoint)
 */
function useMobileViewport() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : true,
  );

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsMobile(window.innerWidth < 1024);
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
}

function FilterSidebarComponent({
  filters,
  setFilters,
  onApplyFilters,
  isOpen,
  onClose,
  isLoading = false,
  resultCount = 0,
}: FilterSidebarProps) {
  const { cities } = useAppSelector((s) => s.metadata);
  const [local, setLocal] = useState(filters);
  const isMobile = useMobileViewport();

  useEffect(() => setLocal(filters), [filters]);

  /* Lock body scroll when mobile drawer is open */
  useEffect(() => {
    if (!isMobile) return; // Only for mobile
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  const activeCount = (() => {
    let n = 0;
    if (local.city) n++;
    if (local.minPrice || local.maxPrice) n++;
    if (local.roomType) n++;
    if (local.roomTypes?.length) n++;
    if (local.genderPreference && local.genderPreference !== "ANY") n++;
    if (local.idealFor?.length) n++;
    return n;
  })();

  const set = (key: string, value: any) =>
    setLocal((p: any) => ({ ...p, [key]: value }));

  const toggleInArray = (key: string, value: string) => {
    const arr: string[] = local[key] || [];
    set(
      key,
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    );
  };

  const handlePrice = (key: "minPrice" | "maxPrice", raw: string) => {
    let n = Math.max(MIN_RENT, Math.min(Number(raw) || 0, MAX_RENT));
    let u = { ...local, [key]: n };
    if (key === "minPrice" && local.maxPrice && n > local.maxPrice)
      u.maxPrice = n;
    if (key === "maxPrice" && local.minPrice && n < local.minPrice)
      u.minPrice = n;
    setLocal(u);
  };

  const applyFilters = () => {
    setFilters(local);
    onApplyFilters(local);
    onClose();
  };

  const clearAll = () => {
    const blank = {
      city: "",
      minPrice: "",
      maxPrice: "",
      roomType: "",
      roomTypes: [],
      genderPreference: "",
      idealFor: [],
    };
    setLocal(blank);
    setFilters(blank);
    onApplyFilters(blank);
  };

  /* ── Shared class helpers ── */
  const filterBtn = (active: boolean) =>
    `py-2.5 px-3 rounded-xl border-2 font-medium text-sm transition-all cursor-pointer text-left ${
      active
        ? "border-[rgba(212,175,55,0.7)] bg-[rgba(212,175,55,0.12)] text-[rgba(212,175,55,0.95)]"
        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-[rgba(212,175,55,0.4)]"
    }`;

  const sectionLabel =
    "mb-3 block text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500";

  /* ═══════════════════════════════════════════════════════════════════════════
     FILTER CONTENT COMPONENT (shared between mobile & desktop)
     ═══════════════════════════════════════════════════════════════════════════ */
  const FilterContent = useMemo(
    () => (
      <>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              className="h-4 w-4"
              style={{ color: "rgba(212,175,55,0.9)" }}
            />
            <h2
              className="text-base font-bold text-slate-800 dark:text-white tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Filters
            </h2>
            {activeCount > 0 && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
                style={{ background: "rgba(212,175,55,0.9)" }}
              >
                {activeCount}
              </span>
            )}
          </div>
          {/* Close button only on mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Scrollable filter content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-7">
          {/* Location */}
          <section>
            <label htmlFor="filter-city" className={sectionLabel}>
              Location
            </label>
            <div className="relative">
              <select
                id="filter-city"
                value={local.city || ""}
                onChange={(e) => set("city", e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 pr-9 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-[rgba(212,175,55,0.6)] focus:ring-2 focus:ring-[rgba(212,175,55,0.15)] cursor-pointer"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c.id} value={normalizeCityValue(c.name)}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </section>

          {/* Room Type */}
          <section>
            <span className={sectionLabel}>Room Type</span>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_TYPE_OPTIONS.map((t) => {
                const active =
                  (local.roomTypes || []).includes(t.value) ||
                  local.roomType === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => toggleInArray("roomTypes", t.value)}
                    className={filterBtn(active)}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Ideal For */}
          <section>
            <span className={sectionLabel}>Ideal For</span>
            <div className="space-y-2">
              {IDEAL_FOR_OPTIONS.map((o) => {
                const active = (local.idealFor || []).includes(o.value);
                return (
                  <button
                    key={o.value}
                    onClick={() => toggleInArray("idealFor", o.value)}
                    className={`w-full ${filterBtn(active)}`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Gender Preference */}
          <section>
            <span className={sectionLabel}>Gender Preference</span>
            <div className="space-y-2">
              {GENDER_PREFERENCE_UI_OPTIONS.map((g) => {
                const active = local.genderPreference === g.value;
                return (
                  <button
                    key={g.value}
                    onClick={() =>
                      set("genderPreference", active ? "" : g.value)
                    }
                    className={`w-full ${filterBtn(active)}`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Price Range */}
          <section>
            <span className={sectionLabel}>Price Range (₹)</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                min={MIN_RENT}
                max={MAX_RENT}
                step={500}
                value={local.minPrice ?? ""}
                onChange={(e) => handlePrice("minPrice", e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-[rgba(212,175,55,0.6)] focus:ring-2 focus:ring-[rgba(212,175,55,0.15)] placeholder:text-slate-400 transition"
              />
              <span className="text-slate-400 font-light">–</span>
              <input
                type="number"
                placeholder="Max"
                min={MIN_RENT}
                max={MAX_RENT}
                step={500}
                value={local.maxPrice ?? ""}
                onChange={(e) => handlePrice("maxPrice", e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-[rgba(212,175,55,0.6)] focus:ring-2 focus:ring-[rgba(212,175,55,0.15)] placeholder:text-slate-400 transition"
              />
            </div>
          </section>

          {/* Budget Presets */}
          <section>
            <span className={sectionLabel}>Budget Presets</span>
            <div className="space-y-2">
              {BUDGET_RANGES.map((r) => {
                const active =
                  local.minPrice === r.min && local.maxPrice === r.max;
                return (
                  <button
                    key={r.label}
                    onClick={() =>
                      setLocal((p: any) => ({
                        ...p,
                        minPrice: r.min,
                        maxPrice: r.max,
                      }))
                    }
                    className={`w-full ${filterBtn(active)}`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 bg-white dark:bg-[#100e09]">
          <button
            onClick={applyFilters}
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "rgba(212,175,55,0.9)",
              boxShadow: "0 4px 20px rgba(212,175,55,0.25)",
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Applying…
              </span>
            ) : resultCount > 0 ? (
              `Show ${resultCount} properties`
            ) : (
              "Apply Filters"
            )}
          </button>
          <button
            onClick={clearAll}
            disabled={isLoading}
            className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-white disabled:opacity-60"
          >
            Clear All
          </button>
        </div>
      </>
    ),
    [
      local,
      activeCount,
      isMobile,
      isLoading,
      resultCount,
      cities,
      applyFilters,
      clearAll,
      set,
      toggleInArray,
      handlePrice,
      filterBtn,
      sectionLabel,
    ],
  );

  /* ═══════════════════════════════════════════════════════════════════════════
     MOBILE VERSION: Portal-based full-screen overlay
     ═══════════════════════════════════════════════════════════════════════════ */
  const MobileDrawer =
    isMobile && isOpen
      ? createPortal(
          <>
            {/* Backdrop */}
            <div
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              aria-hidden
            />
            {/* Drawer */}
            <aside
              className="fixed inset-y-0 left-0 z-50 w-[min(300px,90vw)] flex flex-col bg-white dark:bg-[#100e09] border-r border-slate-200/70 dark:border-slate-800/60 shadow-2xl transition-transform duration-300 ease-in-out translate-x-0"
              style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              {FilterContent}
            </aside>
          </>,
          document.body,
        )
      : null;

  /* ═══════════════════════════════════════════════════════════════════════════
     DESKTOP VERSION: Inline sticky sidebar
     
     Note: Parent controls visibility with hidden lg:block wrapper
     This component renders the sidebar when !isMobile
     Parent controls WHERE and IF it's displayed
     ═══════════════════════════════════════════════════════════════════════════ */
  const DesktopSidebar = !isMobile ? (
    <aside
      /* ✅ CRITICAL FIX #4: Added h-full */
      /* - h-full: Inherit 100% height from parent sidebar wrapper */
      /* - Now FilterContent's flex-1 works properly on defined parent height */
      /* - Result: Content fills sidebar, scrolls internally, buttons always visible */
      className="h-full flex flex-col w-full rounded-2xl border border-slate-200/70 dark:border-slate-800/60 bg-white dark:bg-[#100e09]"
    >
      {FilterContent}
    </aside>
  ) : null;

  return (
    <>
      {MobileDrawer}
      {DesktopSidebar}
    </>
  );
}

export const FilterSidebar = memo(FilterSidebarComponent);
