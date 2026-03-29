import axiosInstance from './axios';
import { ApiResponse, OwnerSummary, Room, Booking, PropertyNote } from '../types/api.types';
import { assertValidParam } from '../utils/apiGuard';
export const ownerApi = {
  // Get owner dashboard summary
  getSummary: async (): Promise<OwnerSummary> => {
    const response = await axiosInstance.get<ApiResponse<OwnerSummary>>('/owners/me/summary');
    return response.data.data;
  },
  // Get owner's rooms
  getMyRooms: async (): Promise<Room[]> => {
    const response = await axiosInstance.get<ApiResponse<Room[]>>('/owners/me/rooms');
    return response.data.data;
  },
  // Get owner's bookings
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await axiosInstance.get<ApiResponse<Booking[]>>('/owners/me/bookings');
    return response.data.data;
  },
  // Get property notes (read-only)
  getPropertyNotes: async (propertyId: string): Promise<PropertyNote[]> => {
    assertValidParam(propertyId, 'propertyId');
    const response = await axiosInstance.get<ApiResponse<PropertyNote[]>>(`/properties/${propertyId}/notes`);
    return response.data.data;
  }
};