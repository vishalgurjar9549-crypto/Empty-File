import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { roomsApi } from "../../api/rooms.api";
import { Room, RoomFilters, CreateRoomInput, UpdateRoomInput, PaginationMeta } from "../../types/api.types";
import { showToast } from "./ui.slice";
import { deduplicateAndMerge, countDuplicates } from "../../utils/roomDeduplicate";
import { roomsRequestTracker } from "../../utils/requestManagement";
import { ownerService } from "../../services";
type RejectedValue = string | { code?: string; message: string };
interface RoomsState {
  rooms: Room[];
  currentRoom: Room | null;
  meta: PaginationMeta | null;
  loading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;
}
const initialState: RoomsState = {
  rooms: [],
  currentRoom: null,
  meta: null,
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false
  },
  error: null
};

// Async thunks
export const fetchRooms = createAsyncThunk("rooms/fetchRooms", async (filters: RoomFilters | undefined, {
  rejectWithValue
}) => {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Thunk] fetchRooms called with filters:`, filters);
    }
    
    const response = await roomsApi.getRooms(filters);
    
    if (process.env.NODE_ENV === "development") {
      // ✅ DEBUG: Show what room types are in the response
      const roomTypesInResponse = [...new Set(response.rooms.map(r => r.roomType))];
      console.log(`[Thunk] fetchRooms API response:`, {
        roomsCount: response.rooms.length,
        firstRoomId: response.rooms[0]?.id,
        requestedRoomTypes: filters?.roomTypes,
        actualRoomTypesInResponse: roomTypesInResponse,
        isFiltered: filters?.roomTypes ? roomTypesInResponse.length <= filters.roomTypes.length : null,
        meta: response.meta,
        timestamp: new Date().toISOString()
      });
    }
    
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch rooms";
    if (process.env.NODE_ENV === "development") {
      console.error(`[Thunk] fetchRooms error:`, message, error);
    }
    return rejectWithValue(message);
  }
});
export const fetchRoomById = createAsyncThunk("rooms/fetchRoomById", async (id: string, {
  rejectWithValue
}) => {
  try {
    const room = await roomsApi.getRoomById(id);
    return room;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch room";
    return rejectWithValue(message);
  }
});
export const createRoom = createAsyncThunk("rooms/createRoom", async (data: CreateRoomInput, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const room = await roomsApi.createRoom(data);
    // ✅ NEW: Clear owner rooms cache after successful property creation
    // This ensures next fetchOwnerRooms() call gets fresh data instead of stale cache
    ownerService.clearOwnerRoomsCache();
    dispatch(showToast({
      message: "Property added successfully!",
      type: "success"
    }));
    return room;
  } catch (error: any) {
    const code = error.response?.data?.code;
    const message = error.response?.data?.message || "Failed to create room";

    // For EMAIL_VERIFICATION_REQUIRED, let UI drive the modal+retry UX.
    if (code !== 'EMAIL_VERIFICATION_REQUIRED') {
      dispatch(showToast({
        message,
        type: "error"
      }));
    }

    return rejectWithValue((code
      ? {
          code,
          message
        }
      : message) as RejectedValue);
  }
});
export const updateRoom = createAsyncThunk("rooms/updateRoom", async ({
  id,
  data



}: {id: string;data: UpdateRoomInput;}, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const room = await roomsApi.updateRoom(id, data);
    dispatch(showToast({
      message: "Property updated successfully!",
      type: "success"
    }));
    return room;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update room";
    dispatch(showToast({
      message,
      type: "error"
    }));
    return rejectWithValue(message);
  }
});
export const deleteRoom = createAsyncThunk("rooms/deleteRoom", async (id: string, {
  dispatch,
  rejectWithValue
}) => {
  try {
    await roomsApi.deleteRoom(id);
    dispatch(showToast({
      message: "Property deleted successfully!",
      type: "success"
    }));
    return id;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to delete room";
    dispatch(showToast({
      message,
      type: "error"
    }));
    return rejectWithValue(message);
  }
});
export const toggleRoomStatus = createAsyncThunk("rooms/toggleRoomStatus", async (id: string, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const room = await roomsApi.toggleRoomStatus(id);
    dispatch(showToast({
      message: "Room status updated!",
      type: "success"
    }));
    return room;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to toggle room status";
    dispatch(showToast({
      message,
      type: "error"
    }));
    return rejectWithValue(message);
  }
});

/**
 * ✅ CURSOR-BASED INFINITE SCROLL THUNK (SIMPLIFIED)
 * 
 * APPENDS results to existing rooms list instead of replacing.
 * 
 * Deduplication happens BEFORE returning to reducer:
 * - Thunk layer handles dedup logic
 * - Reducer stays minimal (just assigns state)
 * - No complex verification in reducer
 * 
 * USAGE:
 * - First call with filters (no cursor) → replaces rooms list
 * - Subsequent calls with cursor param → appends new rooms
 * - Resets cursor when filters/sort changes
 */
export const fetchRoomsWithCursor = createAsyncThunk(
  "rooms/fetchRoomsWithCursor",
  async (filters: RoomFilters | undefined, { getState, rejectWithValue }) => {
    try {
      // ✅ STEP 3: Log cursor before API call (for verification)
      if (process.env.NODE_ENV === "development") {
        console.debug(`[Cursor Pagination] Fetching with cursor:`, {
          cursor: filters?.cursor,
          page: filters?.page,
          limit: filters?.limit,
          city: filters?.city,
          sort: filters?.sort
        });
      }
      
      const response = await roomsApi.getRooms(filters);
      
      // ✅ STEP 3: Log API response meta (verify cursor received)
      if (process.env.NODE_ENV === "development") {
        console.debug(`[Cursor Pagination] API response meta:`, {
          nextCursor: response.meta?.nextCursor,
          hasNextPage: response.meta?.hasNextPage,
          page: response.meta?.page,
          limit: response.meta?.limit,
          total: response.meta?.total,
          returned: response.rooms.length
        });
      }
      
      // ✅ THUNK LAYER: Handle deduplication before returning
      // This keeps the reducer minimal
      const state = getState() as { rooms: RoomsState };
      const existingRooms = state.rooms.rooms;
      
      const duplicateCount = countDuplicates(existingRooms, response.rooms);
      
      // Log duplicates in development only
      if (process.env.NODE_ENV === "development" && duplicateCount > 0) {
        console.info(`[Pagination] ${duplicateCount} duplicate(s) detected, deduplicating`, {
          duplicates: duplicateCount,
          existing: existingRooms.length,
          incoming: response.rooms.length
        });
      }
      
      // Deduplicate at thunk layer
      const dedupedRooms = deduplicateAndMerge(existingRooms, response.rooms);
      
      // ✅ STEP 3: Verify dedup and append (not replace)
      if (process.env.NODE_ENV === "development") {
        console.debug(`[Cursor Pagination] Appended rooms:`, {
          beforeDedup: existingRooms.length + response.rooms.length,
          afterDedup: dedupedRooms.length,
          newRooms: dedupedRooms.length - existingRooms.length
        });
      }
      
      return {
        rooms: dedupedRooms,
        meta: response.meta
      };
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch more rooms";
      
      // Log error for debugging
      if (process.env.NODE_ENV === "development") {
        console.error(`[Cursor Pagination] Error:`, {
          message,
          status: error.response?.status,
          cursor: filters?.cursor
        });
      }
      
      return rejectWithValue(message);
    }
  }
);
const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // ✅ FIX: Add fetchRooms cases (MISSING BEFORE)
    builder.addCase(fetchRooms.pending, (state) => {
      state.loading.fetch = true;
      state.error = null;
    }).addCase(fetchRooms.fulfilled, (state, action) => {
      state.loading.fetch = false;
      const oldLength = state.rooms.length;
      const newLength = action.payload.rooms.length;
      
      // ✅ CRITICAL: Replace previous rooms list with NEW array reference
      // This ensures React detects the state change and re-renders
      state.rooms = action.payload.rooms;
      state.meta = action.payload.meta;
      
      // Verify replacement (development only)
      if (process.env.NODE_ENV === "development") {
        // ✅ DEBUG: Show what room types are being stored
        const roomTypesInStorage = [...new Set(state.rooms.map(r => r.roomType))];
        console.log(`[Reducer] fetchRooms.fulfilled:`, {
          oldLength,
          newLength,
          sameReference: oldLength === newLength && action.payload.rooms === state.rooms,
          newArrayRef: state.rooms === action.payload.rooms,
          firstRoomId: state.rooms[0]?.id,
          roomTypesStored: roomTypesInStorage,
          timestamp: new Date().toISOString()
        });
      }
    }).addCase(fetchRooms.rejected, (state, action) => {
      state.loading.fetch = false;
      state.error = action.payload as string;
      if (process.env.NODE_ENV === "development") {
        console.error(`[Reducer] fetchRooms.rejected:`, action.payload);
      }
    });

    // ✅ FIX: Add fetchRoomById cases (MISSING BEFORE)
    builder.addCase(fetchRoomById.pending, (state) => {
      state.loading.fetch = true;
      state.error = null;
    }).addCase(fetchRoomById.fulfilled, (state, action) => {
      state.loading.fetch = false;
      state.currentRoom = action.payload;
    }).addCase(fetchRoomById.rejected, (state, action) => {
      state.loading.fetch = false;
      state.error = action.payload as string;
    });

    // Create room
    builder.addCase(createRoom.pending, (state) => {
      state.loading.create = true;
      state.error = null;
    }).addCase(createRoom.fulfilled, (state, action) => {
      state.loading.create = false;
      state.rooms.unshift(action.payload);
    }).addCase(createRoom.rejected, (state, action) => {
      state.loading.create = false;
      const payload = action.payload as RejectedValue | undefined;
      state.error = typeof payload === 'string' ? payload : payload?.message || 'Failed to create room';
    });

    // Update room
    builder.addCase(updateRoom.pending, (state) => {
      state.loading.update = true;
      state.error = null;
    }).addCase(updateRoom.fulfilled, (state, action) => {
      state.loading.update = false;
      if (!action.payload) return;
      const index = state.rooms.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.rooms[index] = action.payload;
      }
      if (state.currentRoom?.id === action.payload.id) {
        state.currentRoom = action.payload;
      }
    }).addCase(updateRoom.rejected, (state, action) => {
      state.loading.update = false;
      state.error = action.payload as string;
    });

    // ✅ FIX: Add deleteRoom cases (MISSING BEFORE)
    builder.addCase(deleteRoom.pending, (state) => {
      state.loading.delete = true;
      state.error = null;
    }).addCase(deleteRoom.fulfilled, (state, action) => {
      state.loading.delete = false;
      state.rooms = state.rooms.filter((r) => r.id !== action.payload);
    }).addCase(deleteRoom.rejected, (state, action) => {
      state.loading.delete = false;
      state.error = action.payload as string;
    });

    // ✅ FIX: Add toggleRoomStatus cases (MISSING BEFORE)
    builder.addCase(toggleRoomStatus.pending, (state) => {
      state.loading.update = true;
      state.error = null;
    }).addCase(toggleRoomStatus.fulfilled, (state, action) => {
      state.loading.update = false;
      const index = state.rooms.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.rooms[index] = action.payload;
      }
    }).addCase(toggleRoomStatus.rejected, (state, action) => {
      state.loading.update = false;
      state.error = action.payload as string;
    });

    // ✅ CURSOR-BASED INFINITE SCROLL: APPEND MODE (SIMPLIFIED)
    // Deduplication already handled in thunk layer
    // Reducer just assigns the clean data
    builder.addCase(fetchRoomsWithCursor.pending, (state) => {
      state.loading.fetch = true;
      state.error = null;
    }).addCase(fetchRoomsWithCursor.fulfilled, (state, action) => {
      state.loading.fetch = false;
      
      // ✅ MINIMAL REDUCER: Just assign state
      // Dedup already done in thunk, so no verification needed
      state.rooms = action.payload.rooms;
      state.meta = action.payload.meta;
      
      // Optional: Log memory usage in development
      if (process.env.NODE_ENV === "development" && state.rooms.length > 40000) {
        console.warn(`[Pagination] Memory: ${state.rooms.length} rooms in state`, {
          sizeEstimate: `~${(state.rooms.length * 1.5).toFixed(0)}MB`
        });
      }
    }).addCase(fetchRoomsWithCursor.rejected, (state, action) => {
      state.loading.fetch = false;
      state.error = action.payload as string;
    });
  }
});
export const {
  clearCurrentRoom,
  clearError
} = roomsSlice.actions;
export default roomsSlice.reducer;