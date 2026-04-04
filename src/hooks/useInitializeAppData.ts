/**
 * useInitializeAppData
 * 
 * Single-source hook for initializing common app data
 * Ensures each API is called only ONCE per app load
 * 
 * Loads:
 * - Cities (for city selection)
 * - Amenities (for property listings)
 * - Platform stats (for homepage display)
 * 
 * Usage in App.tsx:
 * useInitializeAppData();
 */

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadCities, loadAmenities } from '../store/slices/metadata.slice';
import { fetchPlatformStats } from '../store/slices/stats.slice';

// Prevent multiple initializations
let hasInitialized = false;

export function useInitializeAppData() {
  const dispatch = useAppDispatch();
  const initCountRef = useRef(0);
  const { cities, amenities } = useAppSelector(state => state.metadata);
  const { platform: stats } = useAppSelector(state => state.stats);

  useEffect(() => {
    initCountRef.current++;

    // Only initialize once per app lifecycle
    if (hasInitialized) {
      console.debug('[App Init] Already initialized, skipping');
      return;
    }

    // ✅ STEP 1: Load critical app data
    if (cities.length === 0) {
      console.debug('[App Init] Loading cities');
      dispatch(loadCities());
    }

    if (amenities.length === 0) {
      console.debug('[App Init] Loading amenities');
      dispatch(loadAmenities());
    }

    // ✅ STEP 3: Load platform stats
    if (!stats) {
      console.debug('[App Init] Loading platform stats');
      dispatch(fetchPlatformStats());
    }

    hasInitialized = true;
    console.debug(`[App Init] Complete (mount count: ${initCountRef.current})`);
  }, []); // Empty dependency array - run only once
}

/**
 * Reset initialization flag (useful for testing/debugging)
 */
export function resetAppInitialization() {
  hasInitialized = false;
  console.debug('[App Init] Reset');
}
