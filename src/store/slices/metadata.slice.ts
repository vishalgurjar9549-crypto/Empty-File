import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCities, fetchAllCities, fetchAmenities, City, CityBasic } from '../../api/metadata.api';
import { Amenity } from '../../constants/amenities.config';

interface MetadataState {
  cities: City[];
  allCities: CityBasic[];
  // ✅ REFACTORED: Amenities now store full Amenity objects with structure
  amenities: Amenity[];
  loading: boolean;
  citiesLoading: boolean;  // ✅ CRITICAL: Separate loading state for cities
  amenitiesLoading: boolean;  // ✅ CRITICAL: Separate loading state for amenities
  error: string | null;
}

const initialState: MetadataState = {
  cities: [],
  allCities: [],
  amenities: [],
  loading: false,
  citiesLoading: false,
  amenitiesLoading: false,
  error: null
};

export const loadCities = createAsyncThunk('metadata/loadCities', async () => {
  return await fetchCities();
});

export const loadAllCities = createAsyncThunk('metadata/loadAllCities', async () => {
  return await fetchAllCities();
});

export const loadAmenities = createAsyncThunk('metadata/loadAmenities', async () => {
  return await fetchAmenities();
});

const metadataSlice = createSlice({
  name: 'metadata',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ✅ CRITICAL: Use separate loading states per operation
    builder.addCase(loadCities.pending, (state) => {
      state.citiesLoading = true;
    }).addCase(loadCities.fulfilled, (state, action) => {
      state.citiesLoading = false;
      state.cities = action.payload;
    }).addCase(loadCities.rejected, (state, action) => {
      state.citiesLoading = false;
      state.error = action.error.message || 'Failed to load cities';
    }).addCase(loadAllCities.pending, (state) => {
      state.loading = true;
    }).addCase(loadAllCities.fulfilled, (state, action) => {
      state.loading = false;
      state.allCities = action.payload;
    }).addCase(loadAllCities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to load all cities';
    }).addCase(loadAmenities.pending, (state) => {
      state.amenitiesLoading = true;
    }).addCase(loadAmenities.fulfilled, (state, action) => {
      state.amenitiesLoading = false;
      // ✅ REFACTORED: Store full amenity objects
      state.amenities = action.payload;
    }).addCase(loadAmenities.rejected, (state, action) => {
      state.amenitiesLoading = false;
      state.error = action.error.message || 'Failed to load amenities';
    });
  }
});

export default metadataSlice.reducer;