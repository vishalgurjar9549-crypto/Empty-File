import axiosInstance from './axios';
import { ApiResponse, AuthResponse, RegisterInput, LoginInput, User } from '../types/api.types';

export interface CheckPhoneResponse {
  exists: boolean;
  isTemp: boolean;
}

export const authApi = {
  // Register new user
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },
  // Login user
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  },
  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },
  // Check if phone exists and if account is temp
  checkPhone: async (phone: string): Promise<CheckPhoneResponse> => {
    const response = await axiosInstance.post<ApiResponse<CheckPhoneResponse>>('/auth/check-phone', { phone });
    return response.data.data;
  },
  // Claim temp account with phone + email + password
  claimAccount: async (phone: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/claim-account', {
      phone,
      email,
      password
    });
    return response.data.data;
  },
  // Login with phone (for existing, non-temp accounts)
  loginPhone: async (phone: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login-phone', { phone });
    return response.data.data;
  },
  // Request password reset via email
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return response.data.data;
  },
  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data.data;
  },
  // Validate reset token (check if valid before showing form)
  validateResetToken: async (token: string): Promise<{ valid: boolean; email?: string }> => {
    const response = await axiosInstance.post<ApiResponse<{ valid: boolean; email?: string }>>('/auth/validate-reset-token', { token });
    return response.data.data;
  }
};