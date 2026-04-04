import axiosInstance from './axios';
import { ApiResponse } from '../types/api.types';

export interface PlatformStats {
  totalProperties: number;
  totalCities: number;
  totalOwners: number;
}

export const statsApi = {
  // Get platform statistics
  getPlatformStats: async (): Promise<PlatformStats> => {
    const response = await axiosInstance.get<ApiResponse<PlatformStats>>('/stats');
    return response.data.data;
  },
};
