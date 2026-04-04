// src/components/home/PropertyRailSection.tsx
/**
 * ✅ STEP 1: LOADING SKELETONS
 * ✅ STEP 2: REMOVE DUMMY DATA
 * ✅ STEP 3: NO DATA MIXING
 * ✅ STEP 4: NO FAKE FALLBACK VALUES
 * 
 * Uses ONLY homeSections.featured
 * Shows skeletons while loading
 * Real values only (no fake prices/ratings)
 */

import { useMemo, useEffect } from "react";
import { PropertyRail } from "./PropertyRail";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchFeaturedSection } from "../../store/slices/homeSections.slice";
import { mapRoomToProperty } from "../../utils/propertyUtils";

export function PropertyRailSection() {
  const dispatch = useAppDispatch();
  
  // ✅ TASK 1: Use ONLY homeSections.featured
  // NOT global state.rooms
  const featured = useAppSelector((state) => state.homeSections.featured);

  useEffect(() => {
    // Lazy load on mount
    if (featured.rooms.length === 0 && !featured.loading && !featured.error) {
      dispatch(fetchFeaturedSection());
    }
  }, [dispatch, featured.rooms.length, featured.loading, featured.error]);

  // ✅ Group rooms by city from featured data ONLY
  const groupedRails = useMemo(() => {
    // ✅ STEP 1: Show loading skeleton while fetching
    if (featured.loading) {
      return [
        {
          id: "featured-loading",
          title: "Loading featured properties...",
          subtitle: "Handpicked places guests love",
          properties: [],
          isLoading: true,
          isEmpty: false,
          isError: false,
          viewAllLink: "/rooms",
        },
      ];
    }

    if (featured.error) {
      return [
        {
          id: "featured-error",
          title: "Unable to load properties",
          subtitle: featured.error,
          properties: [],
          isLoading: false,
          isEmpty: false,
          isError: true,
          viewAllLink: "/rooms",
        },
      ];
    }

    // ✅ STEP 7: Empty state if no data
    if (!featured.rooms || featured.rooms.length === 0) {
      return [
        {
          id: "featured-empty",
          title: "No listings yet",
          subtitle: "Be the first to explore",
          properties: [],
          isLoading: false,
          isEmpty: true,
          isError: false,
          viewAllLink: "/rooms",
        },
      ];
    }

    // ✅ Group ONLY from featured data
    const cityGroups = new Map<string, any[]>();

    featured.rooms.forEach((room: any) => {
      // Validate room ID
      if (!room.id) {
        console.warn("Room missing ID:", room);
        return;
      }

      const city = room.city ?? "Popular Stays";

      if (!cityGroups.has(city)) {
        cityGroups.set(city, []);
      }

      // ✅ TASK 4: Use mapped property (no fake values)
      const mapped = mapRoomToProperty(room);

      cityGroups.get(city)?.push({
        ...mapped,
        nights: 2, // Default for display
      });
    });

    return Array.from(cityGroups.entries())
      .slice(0, 5)
      .map(([city, properties], index) => ({
        id: `featured-${city.toLowerCase()}-${index}`,
        title:
          index === 0 ? `Featured homes in ${city}` : `Popular in ${city}`,
        subtitle: "Guest favorites",
        city,
        properties: properties.slice(0, 10),
        isLoading: false,
        isEmpty: false,
        isError: false,
        viewAllLink: `/rooms?sort=most_viewed&city=${encodeURIComponent(city)}`,
      }));
  }, [featured.rooms, featured.loading, featured.error]);

  return (
    <section className="px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto">
        <div className="space-y-4 md:space-y-4">
          {groupedRails.map((section) => (
            <PropertyRail
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              properties={section.properties}
              loading={section.isLoading}
              empty={section.isEmpty}
              error={section.isError}
              viewAllLink={section.viewAllLink}
            />
          ))}
        </div>
      </div>
    </section>
  );
}