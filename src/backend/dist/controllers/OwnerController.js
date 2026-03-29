"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerController = void 0;
class OwnerController {
    constructor(ownerService) {
        this.ownerService = ownerService;
        // Bind all methods to preserve 'this' context
        this.getSummary = this.getSummary.bind(this);
        this.getMyRooms = this.getMyRooms.bind(this);
        this.getMyBookings = this.getMyBookings.bind(this);
    }
    /**
     * Get owner dashboard summary
     * GET /api/owners/me/summary
     */
    async getSummary(req, res) {
        try {
            const ownerId = req.user?.userId;
            if (!ownerId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const summary = await this.ownerService.getOwnerSummary(ownerId);
            return res.json({
                success: true,
                data: summary
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch owner summary'
            });
        }
    }
    /**
     * Get owner's rooms/properties
     * GET /api/owners/me/rooms
     */
    async getMyRooms(req, res) {
        try {
            const ownerId = req.user?.userId;
            if (!ownerId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const rooms = await this.ownerService.getOwnerRooms(ownerId);
            return res.json({
                success: true,
                data: rooms
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch owner rooms'
            });
        }
    }
    /**
     * Get owner's bookings
     * GET /api/owners/me/bookings
     */
    async getMyBookings(req, res) {
        try {
            const ownerId = req.user?.userId;
            if (!ownerId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const bookings = await this.ownerService.getOwnerBookings(ownerId);
            return res.json({
                success: true,
                data: bookings
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch owner bookings'
            });
        }
    }
}
exports.OwnerController = OwnerController;
//# sourceMappingURL=OwnerController.js.map