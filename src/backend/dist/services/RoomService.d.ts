import { IRoomRepository } from '../repositories/interfaces';
import { Room, UpdateRoomInput, RoomFilters } from '../models/Room';
export declare class RoomService {
    private roomRepository;
    private cloudinaryService;
    constructor(roomRepository: IRoomRepository);
    getAllRooms(filters: RoomFilters, requesterRole?: string): Promise<{
        rooms: Room[];
        total: number;
        page: number;
        limit: number;
        hasNextPage: boolean;
        nextCursor?: string;
    }>;
    getRoomById(id: string, requesterRole?: string): Promise<Room>;
    /**
     * Create room - accepts single object with ownerId included
     * This matches the RoomController's call signature
     */
    createRoom(roomData: any): Promise<Room>;
    /**
     * Resolve or create owner by phone number.
     * Used during property import/creation when ownerPhone is provided.
     *
     * Flow:
     * 1. If user exists by phone → return their ID
     * 2. If not → create TEMP user:
     *    - email: temp_{phone}@app.com
     *    - password: hashed dummy password (user must claim account)
     *    - role: OWNER
     *    - emailVerified: false
     * 3. Return the resolved user ID
     */
    private resolveOrCreateOwnerByPhone;
    updateRoom(id: string, ownerId: string, input: UpdateRoomInput, requesterRole?: string): Promise<Room>;
    deleteRoom(roomId: string, userId: string): Promise<void>;
    toggleRoomStatus(id: string, ownerId: string): Promise<Room>;
    getOwnerRooms(ownerId: string): Promise<Room[]>;
    /**
     * Search rooms with role-aware visibility enforcement.
     * TENANT/public → only APPROVED + isActive rooms returned.
     * OWNER/ADMIN/AGENT → unrestricted search.
     */
    search(filters: any, requesterRole?: string): Promise<Room[]>;
}
//# sourceMappingURL=RoomService.d.ts.map