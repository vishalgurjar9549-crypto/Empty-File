// src/store/slices/homeSections.slice.ts
/**
 * ✅ ISOLATED HOME SECTIONS STATE MANAGEMENT
 * 
 * Problem Fixed:
 * - Before: All sections shared global state.rooms, causing overwrites
 * - After: Each section has independent data store
 * 
 * Architecture:
 * - whatsNew: Latest rooms (GET /rooms?sort=latest&limit=10)
 * - featured: Most viewed rooms (GET /rooms?sort=most_viewed&limit=10)  
 * - cityRails: Per-city rooms (GET /rooms?city={city}&limit=10)
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { roomsApi } from "../../api/rooms.api";
import { Room, RoomFilters, PaginationMeta } from "../../types/api.types";

// ============================================================================
// TYPES
// ============================================================================

interface SectionState {
  rooms: Room[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}

interface CityRailsState {
  [cityName: string]: SectionState;
}

interface HomeSectionsState {
  whatsNew: SectionState;
  featured: SectionState;
  cityRails: CityRailsState;
  allCities: string[];
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialSectionState: SectionState = {
  rooms: [],
  meta: null,
  loading: false,
  error: null,
};

const initialState: HomeSectionsState = {
  whatsNew: { ...initialSectionState },
  featured: { ...initialSectionState },
  cityRails: {},
  allCities: [],
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * ✅ TASK 2: SEPARATE FETCH FOR WHAT'S NEW
 * 
 * GET /rooms?sort=latest&limit=10
 * Stores in homeSections.whatsNew only
 */
export const fetchWhatsNewSection = createAsyncThunk(
  "homeSections/fetchWhatsNew",
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomsApi.getRooms({
        sort: "latest",
        limit: 10,
      });
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch what's new";
      return rejectWithValue(message);
    }
  }
);

/**
 * ✅ TASK 2: SEPARATE FETCH FOR FEATURED
 * 
 * GET /rooms?sort=most_viewed&limit=10
 * Stores in homeSections.featured only
 */
export const fetchFeaturedSection = createAsyncThunk(
  "homeSections/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomsApi.getRooms({
        sort: "most_viewed",
        limit: 10,
      });
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch featured";
      return rejectWithValue(message);
    }
  }
);

/**
 * ✅ TASK 2: SEPARATE FETCH FOR CITY SECTIONS
 * 
 * GET /rooms?city={city}&limit=10
 * Stores in homeSections.cityRails[city] only
 */
export const fetchCitySectionRooms = createAsyncThunk(
  "homeSections/fetchCitySection",
  async (city: string, { rejectWithValue }) => {
    try {
      const response = await roomsApi.getRooms({
        city,
        limit: 10,
      });
      return {
        city,
        rooms: response.rooms,
        meta: response.meta,
      };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        `Failed to fetch rooms in ${city}`;
      return rejectWithValue({
        city,
        message,
      });
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const homeSectionsSlice = createSlice({
  name: "homeSections",
  initialState,
  reducers: {
    clearWhatsNewSection: (state) => {
      state.whatsNew = { ...initialSectionState };
    },
    clearFeaturedSection: (state) => {
      state.featured = { ...initialSectionState };
    },
    clearCitySection: (state, action: PayloadAction<string>) => {
      delete state.cityRails[action.payload];
    },
    clearAllSections: (state) => {
      state.whatsNew = { ...initialSectionState };
      state.featured = { ...initialSectionState };
      state.cityRails = {};
      state.allCities = [];
    },
  },
  extraReducers: (builder) => {
    // ========================================================================
    // WHAT'S NEW SECTION
    // ========================================================================
    builder
      .addCase(fetchWhatsNewSection.pending, (state) => {
        state.whatsNew.loading = true;
        state.whatsNew.error = null;
      })
      .addCase(fetchWhatsNewSection.fulfilled, (state, action) => {
        state.whatsNew.loading = false;
        state.whatsNew.rooms = action.payload.rooms;
        state.whatsNew.meta = action.payload.meta;
        state.whatsNew.error = null;
      })
      .addCase(fetchWhatsNewSection.rejected, (state, action) => {
        state.whatsNew.loading = false;
        state.whatsNew.error = action.payload as string;
      });

    // ========================================================================
    // FEATURED SECTION
    // ========================================================================
    builder
      .addCase(fetchFeaturedSection.pending, (state) => {
        state.featured.loading = true;
        state.featured.error = null;
      })
      .addCase(fetchFeaturedSection.fulfilled, (state, action) => {
        state.featured.loading = false;
        state.featured.rooms = action.payload.rooms;
        state.featured.meta = action.payload.meta;
        state.featured.error = null;
      })
      .addCase(fetchFeaturedSection.rejected, (state, action) => {
        state.featured.loading = false;
        state.featured.error = action.payload as string;
      });

    // ========================================================================
    // CITY SECTIONS (Dynamic)
    // ========================================================================
    builder
      .addCase(fetchCitySectionRooms.pending, (state, action) => {
        const city = action.meta.arg;
        
        // Initialize city if not exists
        if (!state.cityRails[city]) {
          state.cityRails[city] = { ...initialSectionState };
        }
        
        state.cityRails[city].loading = true;
        state.cityRails[city].error = null;
        
        // Track city
        if (!state.allCities.includes(city)) {
          state.allCities.push(city);
        }
      })
      .addCase(fetchCitySectionRooms.fulfilled, (state, action) => {
        const { city, rooms, meta } = action.payload;
        
        state.cityRails[city] = {
          rooms,
          meta,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchCitySectionRooms.rejected, (state, action) => {
        const payload = action.payload as { city: string; message: string };
        const city = payload.city;
        
        if (!state.cityRails[city]) {
          state.cityRails[city] = { ...initialSectionState };
        }
        
        state.cityRails[city].loading = false;
        state.cityRails[city].error = payload.message;
      });
  },
});

export const {
  clearWhatsNewSection,
  clearFeaturedSection,
  clearCitySection,
  clearAllSections,
} = homeSectionsSlice.actions;

export default homeSectionsSlice.reducer;