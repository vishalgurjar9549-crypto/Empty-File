export interface AssignmentResult {
    id: string;
    agentId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    assignedBy: string;
    reactivated: boolean;
}
export interface PropertyAssignmentResult extends AssignmentResult {
    propertyId: string;
    assignmentNotes: string | null;
    property: {
        id: string;
        title: string;
        city: string;
    };
    agent: {
        id: string;
        name: string;
        email: string;
    };
}
export interface TenantAssignmentResult extends AssignmentResult {
    tenantId: string;
    reason: string | null;
    tenant: {
        id: string;
        name: string;
        email: string;
    };
    agent: {
        id: string;
        name: string;
        email: string;
    };
}
export declare class ValidationError extends Error {
    constructor(message: string);
}
export declare class NotFoundError extends Error {
    constructor(message: string);
}
export declare class AdminAssignmentService {
    constructor();
    /**
     * ASSIGN PROPERTY TO AGENT
     *
     * Creates a new assignment or reactivates an existing inactive one.
     *
     * @param agentId - User ID (must have AGENT role)
     * @param propertyId - Room ID
     * @param assignedBy - Admin user ID performing the assignment
     * @param notes - Optional assignment notes
     *
     * VALIDATION:
     * - agentId must exist and have AGENT role
     * - propertyId must exist
     * - If active assignment exists, returns it (idempotent)
     * - If inactive assignment exists, reactivates it
     *
     * AUDITABILITY:
     * - assignedBy is recorded
     * - createdAt/updatedAt timestamps maintained
     * - deactivatedAt cleared on reactivation
     */
    assignPropertyToAgent(agentId: string, propertyId: string, assignedBy: string, notes?: string): Promise<PropertyAssignmentResult>;
    /**
     * UNASSIGN PROPERTY FROM AGENT
     *
     * Soft-deletes an assignment by setting isActive = false.
     *
     * @param agentId - User ID
     * @param propertyId - Room ID
     *
     * SAFETY:
     * - NO hard delete - only sets isActive = false
     * - Records deactivatedAt timestamp
     * - Idempotent - returns success even if already inactive
     */
    unassignPropertyFromAgent(agentId: string, propertyId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * ASSIGN TENANT TO AGENT
     *
     * Creates a new assignment or reactivates an existing inactive one.
     *
     * @param agentId - User ID (must have AGENT role)
     * @param tenantId - User ID (must have TENANT role)
     * @param assignedBy - Admin user ID performing the assignment
     * @param reason - Optional reason for assignment
     *
     * VALIDATION:
     * - agentId must exist and have AGENT role
     * - tenantId must exist and have TENANT role
     * - If active assignment exists, returns it (idempotent)
     * - If inactive assignment exists, reactivates it
     */
    assignTenantToAgent(agentId: string, tenantId: string, assignedBy: string, reason?: string): Promise<TenantAssignmentResult>;
    /**
     * UNASSIGN TENANT FROM AGENT
     *
     * Soft-deletes an assignment by setting isActive = false.
     *
     * @param agentId - User ID
     * @param tenantId - User ID
     *
     * SAFETY:
     * - NO hard delete - only sets isActive = false
     * - Records deactivatedAt timestamp
     * - Idempotent - returns success even if already inactive
     */
    unassignTenantFromAgent(agentId: string, tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * GET ALL PROPERTY ASSIGNMENTS
     *
     * Returns all property assignments (active and inactive) for admin view.
     */
    getPropertyAssignments(filters?: {
        agentId?: string;
        propertyId?: string;
        isActive?: boolean;
    }): Promise<({
        agent: {
            id: string;
            email: string;
            name: string;
        };
        property: {
            city: string;
            id: string;
            title: string;
            location: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        propertyId: string;
        agentId: string;
        assignedBy: string;
        assignmentNotes: string | null;
        deactivatedAt: Date | null;
    })[]>;
    /**
     * GET ALL TENANT ASSIGNMENTS
     *
     * Returns all tenant assignments (active and inactive) for admin view.
     */
    getTenantAssignments(filters?: {
        agentId?: string;
        tenantId?: string;
        isActive?: boolean;
    }): Promise<({
        tenant: {
            id: string;
            email: string;
            phone: string | null;
            name: string;
        };
        agent: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        tenantId: string;
        agentId: string;
        assignedBy: string;
        deactivatedAt: Date | null;
    })[]>;
}
export declare const adminAssignmentService: AdminAssignmentService;
//# sourceMappingURL=AdminAssignmentService.d.ts.map