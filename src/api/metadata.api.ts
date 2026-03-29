import axiosInstance from './axios';
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
export const fetchCities = async (): Promise<City[]> => {
  const response = await axiosInstance.get('/metadata/cities');
  return response.data.data;
};
export const fetchAllCities = async (): Promise<CityBasic[]> => {
  const response = await axiosInstance.get('/metadata/cities/all');
  return response.data.data;
};
export const fetchAmenities = async (): Promise<string[]> => {
  const response = await axiosInstance.get('/metadata/amenities');
  return response.data.data;
};