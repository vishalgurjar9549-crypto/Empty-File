import axiosInstance from './axios';
export interface SendOtpRequest {
  phone: string;
}
export interface SendOtpResponse {
  success: boolean;
  message: string;
}
export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}
export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: {
    phoneVerified: boolean;
    phoneVerifiedAt: string;
  };
}

/**
 * Send OTP to user's phone number
 */
export const sendOtp = async (phone: string): Promise<SendOtpResponse> => {
  const response = await axiosInstance.post<SendOtpResponse>('/auth/phone/send-otp', {
    phone
  });
  return response.data;
};

/**
 * Verify OTP code
 */
export const verifyOtp = async (phone: string, otp: string): Promise<VerifyOtpResponse> => {
  const response = await axiosInstance.post<VerifyOtpResponse>('/auth/phone/verify-otp', {
    phone,
    otp
  });
  return response.data;
};
export const otpApi = {
  sendOtp,
  verifyOtp
};