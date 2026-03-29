import axiosInstance from './axios';
import { ApiResponse, User, UpdateProfileInput } from '../types/api.types';
export const profileApi = {
  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>('/profile');
    return response.data.data;
  },
  // Update user profile
  updateProfile: async (data: UpdateProfileInput): Promise<User> => {
    const response = await axiosInstance.put<ApiResponse<User>>('/profile', data);
    return response.data.data;
  },
  // ✅ NEW: Update phone number (replaces OTP verification)
  updatePhone: async (phone: string): Promise<{
    success: boolean;
    data: {
      phone: string;
    };
    user: User;
  }> => {
    const response = await axiosInstance.post('/profile/phone', {
      phone
    });
    return response.data;
  }
};