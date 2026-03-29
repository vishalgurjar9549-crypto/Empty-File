import { NotificationType as PrismaNotificationType } from '@prisma/client';
/**
 * Notification Type Enum
 *
 * Re-exported from Prisma client for backward compatibility with existing code.
 * Maps to the NotificationType enum in schema.prisma.
 */
export declare const NotificationType: {
    readonly AGENT_PROPERTY_ASSIGNED: PrismaNotificationType;
    readonly AGENT_PROPERTY_UNASSIGNED: PrismaNotificationType;
    readonly AGENT_TENANT_ASSIGNED: PrismaNotificationType;
    readonly AGENT_TENANT_UNASSIGNED: PrismaNotificationType;
    readonly PROPERTY_NOTE_CREATED: PrismaNotificationType;
};
export type NotificationType = PrismaNotificationType;
export interface NotificationPayload {
    triggeredBy?: string;
    triggeredByName?: string;
    triggeredByRole?: string;
    propertyId?: string;
    propertyTitle?: string;
    propertyCity?: string;
    agentId?: string;
    agentName?: string;
    agentEmail?: string;
    tenantId?: string;
    tenantName?: string;
    tenantEmail?: string;
    ownerId?: string;
    ownerName?: string;
    noteId?: string;
    notePreview?: string;
    assignmentId?: string;
    assignmentNotes?: string;
    reason?: string;
}
export interface CreateNotificationInput {
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    payload?: NotificationPayload;
    referenceId?: string;
}
export interface NotificationView {
    id: string;
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    payload: NotificationPayload | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
}
export interface PaginatedNotifications {
    notifications: NotificationView[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
export declare class NotificationService {
    constructor();
    /**
     * EMIT NOTIFICATION
     *
     * Creates a single notification with database persistence.
     * Fire-and-forget with complete error isolation.
     *
     * @param input - Notification data
     * @returns Created notification or null on failure
     *
     * SAFETY:
     * - Wrapped in try-catch
     * - Failures logged but NEVER thrown
     * - Idempotent via unique constraint on (recipientId, type, referenceId)
     * - Duplicate attempts return existing notification (upsert behavior)
     */
    emit(input: CreateNotificationInput): Promise<NotificationView | null>;
    /**
     * EMIT BATCH NOTIFICATIONS
     *
     * Creates multiple notifications for different recipients.
     * Each notification is independent - one failure doesn't affect others.
     *
     * @param inputs - Array of notification data
     * @returns Array of created notifications (nulls for failures)
     *
     * SAFETY:
     * - Each notification processed independently
     * - Individual failures don't affect batch
     * - All errors isolated and logged
     */
    emitBatch(inputs: CreateNotificationInput[]): Promise<(NotificationView | null)[]>;
    /**
     * GET NOTIFICATIONS FOR USER
     *
     * Fetches notifications for a specific user.
     * Degrades gracefully on failure (returns empty array).
     *
     * @param recipientId - User ID
     * @param includeRead - Whether to include read notifications (default: true)
     * @returns Array of notifications (empty on failure)
     */
    getNotifications(recipientId: string, includeRead?: boolean): Promise<NotificationView[]>;
    /**
     * GET NOTIFICATIONS PAGINATED
     *
     * Fetches notifications with pagination support.
     * Degrades gracefully on failure.
     *
     * @param recipientId - User ID
     * @param page - Page number (1-indexed)
     * @param pageSize - Number of items per page
     * @param includeRead - Whether to include read notifications
     * @returns Paginated notifications (empty on failure)
     */
    getNotificationsPaginated(recipientId: string, page?: number, pageSize?: number, includeRead?: boolean): Promise<PaginatedNotifications>;
    /**
     * MARK NOTIFICATION AS READ
     *
     * @param notificationId - Notification ID
     * @param recipientId - User ID (for ownership verification)
     * @returns Updated notification or null
     */
    markAsRead(notificationId: string, recipientId: string): Promise<NotificationView | null>;
    /**
     * MARK ALL NOTIFICATIONS AS READ
     *
     * @param recipientId - User ID
     * @returns Number of notifications marked as read
     */
    markAllAsRead(recipientId: string): Promise<number>;
    /**
     * GET UNREAD COUNT
     *
     * @param recipientId - User ID
     * @returns Number of unread notifications (0 on failure)
     */
    getUnreadCount(recipientId: string): Promise<number>;
    private mapToView;
    /**
     * ON AGENT PROPERTY ASSIGNED
     *
     * Triggered when admin assigns an agent to a property.
     *
     * Recipients:
     * - AGENT: "You have been assigned to property X"
     * - OWNER: "Agent Y has been assigned to your property X"
     *
     * @param data - Assignment details
     */
    onAgentPropertyAssigned(data: {
        assignmentId: string;
        agentId: string;
        agentName: string;
        agentEmail: string;
        propertyId: string;
        propertyTitle: string;
        propertyCity: string;
        ownerId: string;
        ownerName: string;
        assignedBy: string;
        assignedByName: string;
        assignmentNotes?: string;
    }): Promise<void>;
    /**
     * ON AGENT PROPERTY UNASSIGNED
     *
     * Triggered when admin unassigns an agent from a property.
     *
     * Recipients:
     * - AGENT: "You have been unassigned from property X"
     * - OWNER: "Agent Y has been unassigned from your property X"
     */
    onAgentPropertyUnassigned(data: {
        assignmentId: string;
        agentId: string;
        agentName: string;
        propertyId: string;
        propertyTitle: string;
        propertyCity: string;
        ownerId: string;
        ownerName: string;
        unassignedBy: string;
        unassignedByName: string;
    }): Promise<void>;
    /**
     * ON AGENT TENANT ASSIGNED
     *
     * Triggered when admin assigns an agent to a tenant.
     *
     * Recipients:
     * - AGENT: "You have been assigned to tenant X"
     * - TENANT: "Agent Y has been assigned to assist you"
     */
    onAgentTenantAssigned(data: {
        assignmentId: string;
        agentId: string;
        agentName: string;
        agentEmail: string;
        tenantId: string;
        tenantName: string;
        tenantEmail: string;
        assignedBy: string;
        assignedByName: string;
        reason?: string;
    }): Promise<void>;
    /**
     * ON AGENT TENANT UNASSIGNED
     *
     * Triggered when admin unassigns an agent from a tenant.
     *
     * Recipients:
     * - AGENT: "You have been unassigned from tenant X"
     * - TENANT: "Agent Y is no longer assigned to assist you"
     */
    onAgentTenantUnassigned(data: {
        assignmentId: string;
        agentId: string;
        agentName: string;
        tenantId: string;
        tenantName: string;
        unassignedBy: string;
        unassignedByName: string;
    }): Promise<void>;
    /**
     * ON PROPERTY NOTE CREATED
     *
     * Triggered when admin or agent creates a property note.
     *
     * Recipients:
     * - OWNER: "A new note has been added to your property X"
     * - TENANT (if assigned): "A new note has been added to property X"
     *
     * NOTE: The author (admin/agent) does NOT receive a notification.
     */
    onPropertyNoteCreated(data: {
        noteId: string;
        propertyId: string;
        propertyTitle: string;
        propertyCity: string;
        ownerId: string;
        ownerName: string;
        authorId: string;
        authorName: string;
        authorRole: string;
        notePreview: string;
        assignedTenantIds?: string[];
    }): Promise<void>;
    /**
     * GET TENANTS ASSIGNED TO PROPERTY
     *
     * Finds all tenants who should receive notifications for a property:
     * 1. Tenants with approved bookings for the property
     * 2. Tenants assigned to agents who are assigned to the property
     *
     * @param propertyId - Property ID
     * @returns Array of tenant IDs
     */
    getAssignedTenantsForProperty(propertyId: string): Promise<string[]>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=NotificationService.d.ts.map