/**
 * NOTIFY: Agent Property Assigned
 *
 * Call this AFTER AdminAssignmentService.assignPropertyToAgent() succeeds.
 *
 * @param assignmentId - The created/reactivated assignment ID
 * @param adminId - The admin who performed the assignment
 */
export declare function notifyAgentPropertyAssigned(assignmentId: string, adminId: string): Promise<void>;
/**
 * NOTIFY: Agent Property Unassigned
 *
 * Call this AFTER AdminAssignmentService.unassignPropertyFromAgent() succeeds.
 *
 * @param agentId - The agent who was unassigned
 * @param propertyId - The property they were unassigned from
 * @param adminId - The admin who performed the unassignment
 */
export declare function notifyAgentPropertyUnassigned(agentId: string, propertyId: string, adminId: string): Promise<void>;
/**
 * NOTIFY: Agent Tenant Assigned
 *
 * Call this AFTER AdminAssignmentService.assignTenantToAgent() succeeds.
 *
 * @param assignmentId - The created/reactivated assignment ID
 * @param adminId - The admin who performed the assignment
 */
export declare function notifyAgentTenantAssigned(assignmentId: string, adminId: string): Promise<void>;
/**
 * NOTIFY: Agent Tenant Unassigned
 *
 * Call this AFTER AdminAssignmentService.unassignTenantFromAgent() succeeds.
 *
 * @param agentId - The agent who was unassigned
 * @param tenantId - The tenant they were unassigned from
 * @param adminId - The admin who performed the unassignment
 */
export declare function notifyAgentTenantUnassigned(agentId: string, tenantId: string, adminId: string): Promise<void>;
/**
 * NOTIFY: Property Note Created
 *
 * Call this AFTER PropertyNoteService.createPropertyNote() succeeds.
 *
 * @param noteId - The created note ID
 * @param propertyId - The property the note was added to
 * @param authorId - The user who created the note
 * @param authorRole - The role of the author (ADMIN or AGENT)
 */
export declare function notifyPropertyNoteCreated(noteId: string, propertyId: string, authorId: string, authorRole: string): Promise<void>;
export declare const notificationIntegration: {
    notifyAgentPropertyAssigned: typeof notifyAgentPropertyAssigned;
    notifyAgentPropertyUnassigned: typeof notifyAgentPropertyUnassigned;
    notifyAgentTenantAssigned: typeof notifyAgentTenantAssigned;
    notifyAgentTenantUnassigned: typeof notifyAgentTenantUnassigned;
    notifyPropertyNoteCreated: typeof notifyPropertyNoteCreated;
};
//# sourceMappingURL=NotificationIntegration.d.ts.map