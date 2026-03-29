"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const NotificationService_1 = require("../services/NotificationService");
const logger_1 = require("../utils/logger");
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
class NotificationController {
    constructor() {
        // Bind methods to preserve 'this' context
        this.getNotifications = this.getNotifications.bind(this);
        this.getUnreadCount = this.getUnreadCount.bind(this);
        this.markAsRead = this.markAsRead.bind(this);
        this.markAllAsRead = this.markAllAsRead.bind(this);
    }
    // ==========================================================================
    // GET NOTIFICATIONS
    // ==========================================================================
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
    async getNotifications(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            // Parse query params
            const unreadOnly = req.query.unreadOnly === 'true';
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
            logger_1.logger.info(`[NotificationController] GET /notifications for ${userId} (page: ${page}, pageSize: ${pageSize}, unreadOnly: ${unreadOnly})`);
            const result = await NotificationService_1.notificationService.getNotificationsPaginated(userId, page, pageSize, !unreadOnly);
            return res.status(200).json({
                success: true,
                data: result.notifications,
                meta: {
                    total: result.total,
                    page: result.page,
                    pageSize: result.pageSize,
                    hasMore: result.hasMore,
                    unreadCount: result.notifications.filter((n) => !n.isRead).length
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`[NotificationController] Error getting notifications:`, error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get notifications'
            });
        }
    }
    // ==========================================================================
    // GET UNREAD COUNT
    // ==========================================================================
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
    async getUnreadCount(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            logger_1.logger.info(`[NotificationController] GET /notifications/unread for ${userId}`);
            const count = await NotificationService_1.notificationService.getUnreadCount(userId);
            return res.status(200).json({
                success: true,
                data: {
                    unreadCount: count
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`[NotificationController] Error getting unread count:`, error);
            // Graceful degradation - return 0 instead of error
            return res.status(200).json({
                success: true,
                data: {
                    unreadCount: 0
                }
            });
        }
    }
    // ==========================================================================
    // MARK AS READ
    // ==========================================================================
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
    async markAsRead(req, res) {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            logger_1.logger.info(`[NotificationController] PATCH /notifications/${id}/read for ${userId}`);
            const notification = await NotificationService_1.notificationService.markAsRead(id, userId);
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: notification,
                message: 'Notification marked as read'
            });
        }
        catch (error) {
            logger_1.logger.error(`[NotificationController] Error marking as read:`, error);
            return res.status(500).json({
                success: false,
                message: 'Failed to mark notification as read'
            });
        }
    }
    // ==========================================================================
    // MARK ALL AS READ
    // ==========================================================================
    /**
     * PATCH /api/notifications/read-all
     *
     * Mark all notifications as read for the authenticated user.
     *
     * Response:
     * - 200: All notifications marked as read
     * - 401: Authentication required
     */
    async markAllAsRead(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            logger_1.logger.info(`[NotificationController] PATCH /notifications/read-all for ${userId}`);
            const count = await NotificationService_1.notificationService.markAllAsRead(userId);
            return res.status(200).json({
                success: true,
                data: {
                    markedAsRead: count
                },
                message: `${count} notifications marked as read`
            });
        }
        catch (error) {
            logger_1.logger.error(`[NotificationController] Error marking all as read:`, error);
            return res.status(500).json({
                success: false,
                message: 'Failed to mark notifications as read'
            });
        }
    }
}
exports.NotificationController = NotificationController;
// Export singleton instance
exports.notificationController = new NotificationController();
//# sourceMappingURL=NotificationController.js.map