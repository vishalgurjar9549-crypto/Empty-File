import { Request, Response } from 'express';
import { RoomService } from '../services/RoomService';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class RoomController {
    private roomService;
    constructor(roomService: RoomService);
    createRoom(req: AuthRequest, res: Response): Promise<void>;
    getAllRooms(req: Request, res: Response): Promise<void>;
    getRoomById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateRoom(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteRoom(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getOwnerRooms(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    toggleRoomStatus(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=RoomController.d.ts.map