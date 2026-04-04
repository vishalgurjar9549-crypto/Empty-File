// src/hooks/useCitySectionData.ts
/**
 * ✅ REUSABLE HOOK FOR CITY SECTIONS
 * 
 * Provides:
 * - Lazy fetch on demand
 * - Data isolation per city
 * - Proper loading/error states
 * - Automatic refetch capability
 */

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCitySectionRooms } from "../store/slices/homeSections.slice";

interface UseCitySectionDataProps {
  city: string;
  autoFetch?: boolean; // Fetch on mount
}

export function useCitySectionData({
  city,
  autoFetch = true,
}: UseCitySectionDataProps) {
  const dispatch = useAppDispatch();
  
  // ✅ Get city-specific data only
  const cityData = useAppSelector(
    (state) => state.homeSections.cityRails[city] ?? {
      rooms: [],
      meta: null,
      loading: false,
      error: null,
    }
  );

  useEffect(() => {
    if (autoFetch && cityData.rooms.length === 0 && !cityData.loading) {
      dispatch(fetchCitySectionRooms(city));
    }
  }, [autoFetch, city, cityData.rooms.length, cityData.loading, dispatch]);

  return {
    rooms: cityData.rooms,
    loading: cityData.loading,
    error: cityData.error,
    meta: cityData.meta,
    refetch: () => dispatch(fetchCitySectionRooms(city)),
  };
}