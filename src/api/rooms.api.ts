import axiosInstance from './axios';
import { ApiResponse, Room, RoomFilters, CreateRoomInput, UpdateRoomInput, PaginationMeta, DemandStats } from '../types/api.types';
import { assertValidParam } from '../utils/apiGuard';
export const roomsApi = {
  // Get all rooms with filters and pagination
  getRooms: async (filters?: RoomFilters): Promise<{
    rooms: Room[];
    meta: PaginationMeta;
  }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    // Ensure limit defaults to 10 if not specified
    if (!params.has('limit')) {
      params.append('limit', '10');
    }
    const response = await axiosInstance.get<ApiResponse<Room[]>>('/rooms', {
      params
    });
    return {
      rooms: response.data.data,
      meta: response.data.meta || {
        page: 1,
        limit: 20,
        total: response.data.data.length
      }
    };
  },
  // Get room by ID
  getRoomById: async (id: string): Promise<Room> => {
    assertValidParam(id, 'roomId');
    const response = await axiosInstance.get<ApiResponse<Room>>(`/rooms/${id}`);
    return response.data.data;
  },
  getDemandStats: async (id: string): Promise<DemandStats> => {
    assertValidParam(id, 'roomId');
    const response = await axiosInstance.get<ApiResponse<DemandStats>>(`/rooms/${id}/demand-stats`);
    return response.data.data;
  },
  // Create new room (owner only)
  createRoom: async (data: CreateRoomInput): Promise<Room> => {
    const response = await axiosInstance.post<ApiResponse<Room>>('/rooms', data);
    return response.data.data;
  },
  // Update room (owner only)
  updateRoom: async (id: string, data: UpdateRoomInput): Promise<Room> => {
    assertValidParam(id, 'roomId');
    const response = await axiosInstance.put<ApiResponse<Room>>(`/rooms/${id}`, data);
    return response.data.data;
  },
  // Delete room (owner only)
  deleteRoom: async (id: string): Promise<void> => {
    assertValidParam(id, 'roomId');
    await axiosInstance.delete(`/rooms/${id}`);
  },
  // Toggle room active status (owner only)
  toggleRoomStatus: async (id: string): Promise<Room> => {
    assertValidParam(id, 'roomId');
    const response = await axiosInstance.patch<ApiResponse<Room>>(`/rooms/${id}/status`);
    return response.data.data;
  }
};
