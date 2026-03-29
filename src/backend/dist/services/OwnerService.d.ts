import { PrismaRoomRepository } from '../repositories/PrismaRoomRepository';
import { PrismaBookingRepository } from '../repositories/PrismaBookingRepository';
export declare class OwnerService {
    private roomRepository;
    private bookingRepository;
    constructor(roomRepository: PrismaRoomRepository, bookingRepository: PrismaBookingRepository);
    /**
     * Get owner dashboard summary with stats
     */
    getOwnerSummary(ownerId: string): Promise<{
        totalRooms: number;
        activeRooms: number;
        totalLeads: number;
        totalEarnings: number;
    }>;
    /**
     * Get all rooms owned by this owner
     */
    getOwnerRooms(ownerId: string): Promise<import("../models/Room").Room[]>;
    /**
     * Get all bookings for owner's properties
     */
    getOwnerBookings(ownerId: string): Promise<import("../models/Booking").Booking[]>;
}
//# sourceMappingURL=OwnerService.d.ts.map