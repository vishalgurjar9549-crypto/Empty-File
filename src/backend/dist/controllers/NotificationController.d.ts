import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
/**
 * NotificationController - In-App Notification API Endpoints
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ENDPOINTS:
 * ─────────────────────────────────────────────────────────────────────────────
 * GET    /api/notifications           → Get user's notifications (paginated)
 * GET    /api/notifications/unread    → Get unread count
 * PATCH  /api/notifications/:id/read  → Mark single notification as read
 * PATCH  /api/notifications/read-all  → Mark all notifications as read
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * AUTHORIZATION:
 * - All endpoints require authentication
 * - Users can only access their own notifications
 * - No cross-user data leakage
 *
 * SAFETY:
 * - Read-only operations (no mutations to core data)
 * - Failures return empty/zero rather than errors
 * - No access to Booking, Payment, Subscription data
 * ═══════════════════════════════════════════════════════════════════════════
 */
export declare class NotificationController {
    constructor();
    /**
     * GET /api/notifications
     *
     * Get all notifications for the authenticated user with pagination support.
     *
     * Query Params:
     * - unreadOnly: boolean (default: false) - Only return unread notifications
     * - page: number (default: 1) - Page number (1-indexed)
     * - pageSize: number (default: 20, max: 100) - Items per page
     *
     * Response:
     * - 200: Notifications retrieved successfully
     * - 401: Authentication required
     */
    getNotifications(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/notifications/unread
     *
     * Get the count of unread notifications for the authenticated user.
     * Lightweight endpoint for polling/badges.
     *
     * Response:
     * - 200: Count retrieved successfully
     * - 401: Authentication required
     */
    getUnreadCount(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/notifications/:id/read
     *
     * Mark a single notification as read.
     *
     * Path Params:
     * - id: Notification ID
     *
     * Response:
     * - 200: Notification marked as read
     * - 401: Authentication required
     * - 404: Notification not found
     */
    markAsRead(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/notifications/read-all
     *
     * Mark all notifications as read for the authenticated user.
     *
     * Response:
     * - 200: All notifications marked as read
     * - 401: Authentication required
     */
    markAllAsRead(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const notificationController: NotificationController;
//# sourceMappingURL=NotificationController.d.ts.map