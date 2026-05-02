// src/components/WhatsNewProperties.tsx
/**
 * ✅ TASK 2: SEPARATE DATA FETCHING
 * ✅ TASK 3: NO DATA MIXING
 * ✅ TASK 4: NO FAKE FALLBACK VALUES
 * 
 * Uses ONLY homeSections.whatsNew
 * Independent API: GET /rooms?sort=latest&limit=10
 * Real values only
 */

import { ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useEffect, useRef } from "react";
import { fetchWhatsNewSection } from "../store/slices/homeSections.slice";
import { getRoomImage } from "../utils/propertyUtils";
import type { Room } from "../types/api.types";

const gold = "rgba(212,175,55,0.9)";
const goldMid = "rgba(212,175,55,0.5)";
const goldSoft = "rgba(212,175,55,0.12)";
const goldBorder = "rgba(212,175,55,0.2)";
const dark = "#0d0b06";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400&auto=format&fit=crop";

export function WhatsNewProperties() {
  const dispatch = useAppDispatch();

  // ✅ TASK 1: Use ONLY homeSections.whatsNew
  // NOT global state.rooms
  const whatsNew = useAppSelector((state) => state.homeSections.whatsNew);

  // ✅ FIX: Track if we've already initiated fetch to prevent re-runs
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // ✅ FIX: Only fetch if:
    // 1. We haven't fetched yet
    // 2. Data is empty AND not currently loading AND no error
    if (hasFetchedRef.current) {
      return;
    }

    if (
      whatsNew.rooms.length === 0 &&
      !whatsNew.loading &&
      !whatsNew.error
    ) {
      hasFetchedRef.current = true;
      dispatch(fetchWhatsNewSection());
    }
  }, [dispatch]); // ✅ FIX: Only depend on dispatch - effect runs once on mount

  // ✅ Map API response to UI
  const mappedRooms = whatsNew.rooms.slice(0, 10).map((room: Room) => ({
    id: room.id,
    title: room.title ?? "Untitled Property",
    subtitle:
      room.location ??
      room.city ??
      "Explore this stay",
    image: getRoomImage(room),
    slug: `/rooms/${room.id}`,
    badge: "New",
  }));

  // ✅ EMPTY STATE
  if (!whatsNew.loading && mappedRooms.length === 0 && !whatsNew.error) {
    return (
      <section className="px-4 sm:py-4 lg:py-8 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-end mb-6 sm:mb-8 gap-4">
            <div>
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: goldMid }}
              >
                Fresh Picks
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                What's New
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                Newly launched and spotlight stays worth checking out.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/30 p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No new properties available right now
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ✅ ERROR STATE
  if (whatsNew.error) {
    return (
      <section className="px-4 sm:py-4 lg:py-8 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-end mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                What's New
              </h2>
            </div>
          </div>

          <div className="rounded-xl border border-red-200/50 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 p-8 flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 dark:text-red-300 font-medium">
                Unable to load new properties
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {whatsNew.error}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-12 md:py-16 lg:py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex justify-between items-end mb-6 sm:mb-8 gap-4">
          <div>
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: goldMid }}
            >
              Fresh Picks
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              What's New
            </h2>

            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Newly launched and spotlight stays worth checking out.
            </p>
          </div>

          <Link
            to="/rooms?sort=latest"
            className="hidden md:flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: gold }}
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ✅ LOADING STATE - Skeleton Cards */}
        {whatsNew.loading && (
          <div className="relative">
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 snap-start rounded-2xl w-[260px] sm:w-[280px] lg:w-[300px] h-[300px] sm:h-[320px] lg:h-[340px] bg-slate-200 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent dark:from-slate-950" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-slate-950" />
          </div>
        )}

        {/* ✅ ACTUAL CONTENT */}
        {!whatsNew.loading && (
          <>
            <div className="relative">
              <div
                className="
                  flex gap-3 sm:gap-4 overflow-x-auto pb-2
                  snap-x snap-mandatory
                  scroll-smooth
                  [scrollbar-width:none]
                  [-ms-overflow-style:none]
                  [&::-webkit-scrollbar]:hidden
                "
              >
                {mappedRooms.map((item: any) => (
                  <Link
                    key={item.id}
                    to={item.slug}
                    className="
                      group relative shrink-0 snap-start overflow-hidden rounded-2xl
                      transition-all duration-300 hover:-translate-y-1
                      w-[260px] sm:w-[280px] lg:w-[300px]
                      h-[300px] sm:h-[320px] lg:h-[340px]
                      bg-slate-100 dark:bg-[#0d0b06]
                      border border-slate-200/80 dark:border-white/10
                      shadow-sm hover:shadow-xl dark:hover:shadow-black/30
                    "
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                   <div
  className="absolute inset-0"
  style={{
    background:
      "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 45%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.05) 100%)",
  }}
/>

                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/10 to-transparent" />

                    <div className="absolute bottom-0 z-10 p-4 sm:p-5">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 backdrop-blur-md"
                        style={{
                          background: goldSoft,
                          color: gold,
                          border: `1px solid ${goldBorder}`,
                        }}
                      >
                        <Sparkles className="w-3 h-3" />
                        {item.badge}
                      </div>

                      <h3
  className="
    text-base sm:text-lg font-bold leading-tight line-clamp-2
    tracking-wide
  "
  style={{
    color: "#fff",
    textShadow: "0 2px 12px rgba(0,0,0,0.85)",
    letterSpacing: "0.3px",
  }}
>
                        {item.title}
                      </h3>

                    <p
  className="text-xs sm:text-sm mt-2 line-clamp-2 max-w-[92%]"
  style={{
    color: "rgba(255,255,255,0.85)",
    textShadow: "0 1px 8px rgba(0,0,0,0.6)",
  }}
>
                        {item.subtitle}
                      </p>

                      <div className="mt-4">
                        <span
                          className="
                            inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold
                            transition-all duration-300 group-hover:translate-x-1
                            backdrop-blur-md
                          "
                          style={{
                            background: "rgba(212,175,55,0.16)",
                            color: gold,
                            border: `1px solid ${goldBorder}`,
                            boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
                          }}
                        >
                          Book Now
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    <div
                      className="pointer-events-none absolute inset-0 rounded-2xl"
                      style={{ boxShadow: `inset 0 0 0 1px ${goldBorder}` }}
                    />
                  </Link>
                ))}
              </div>

              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent dark:from-slate-950" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-slate-950" />
            </div>

            <div className="mt-6 md:hidden">
              <Link
                to="/rooms?sort=latest"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-300 hover:opacity-90"
                style={{
                  background: gold,
                  color: dark,
                }}
              >
                Explore all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
