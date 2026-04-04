import axiosInstance from './axios';
import { cachedFetch } from '../utils/apiCache';

export interface City {
  id: string;
  name: string;
  state: string;
  totalListings: number;
}

export interface CityBasic {
  id: string;
  name: string;
  state: string;
}

// ✅ CACHED API CALLS: Prevent duplicate requests within 5 minutes
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const fetchCities = async (): Promise<City[]> => {
  return cachedFetch('metadata:cities', async () => {
    const response = await axiosInstance.get('/metadata/cities');
    return response.data.data;
  }, CACHE_TTL);
};

export const fetchAllCities = async (): Promise<CityBasic[]> => {
  return cachedFetch('metadata:allCities', async () => {
    const response = await axiosInstance.get('/metadata/cities/all');
    return response.data.data;
  }, CACHE_TTL);
};

export const fetchAmenities = async (): Promise<string[]> => {
  return cachedFetch('metadata:amenities', async () => {
    const response = await axiosInstance.get('/metadata/amenities');
    return response.data.data;
  }, CACHE_TTL);
};