import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCities, fetchAllCities, fetchAmenities, City, CityBasic } from '../../api/metadata.api';
interface MetadataState {
  cities: City[];
  allCities: CityBasic[];
  amenities: string[];
  loading: boolean;
  error: string | null;
}
const initialState: MetadataState = {
  cities: [],
  allCities: [],
  amenities: [],
  loading: false,
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
    builder.addCase(loadCities.pending, (state) => {
      state.loading = true;
    }).addCase(loadCities.fulfilled, (state, action) => {
      state.loading = false;
      state.cities = action.payload;
    }).addCase(loadCities.rejected, (state, action) => {
      state.loading = false;
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
      state.loading = true;
    }).addCase(loadAmenities.fulfilled, (state, action) => {
      state.loading = false;
      state.amenities = action.payload;
    }).addCase(loadAmenities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to load amenities';
    });
  }
});
export default metadataSlice.reducer;