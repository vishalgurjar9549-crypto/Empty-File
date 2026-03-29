/**
 * Property data visible to agents
 * Intentionally excludes: bookings, payments, sensitive owner data
 */
export interface AgentPropertyView {
    id: string;
    title: string;
    city: string;
    location: string;
    landmark: string;
    pricePerMonth: number;
    roomType: string;
    reviewStatus: string;
    isActive: boolean;
    images: string[];
    createdAt: Date;
    owner: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
    };
    assignment: {
        id: string;
        assignmentNotes: string | null;
        assignedAt: Date;
        isActive: boolean;
    };
}
/**
 * Tenant data visible to agents
 * Intentionally excludes: bookings, payments, subscriptions
 */
export interface AgentTenantView {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    city: string | null;
    createdAt: Date;
    assignment: {
        id: string;
        reason: string | null;
        assignedAt: Date;
        isActive: boolean;
    };
}
export declare class AgentService {
    constructor();
    /**
     * GET ASSIGNED PROPERTIES
     *
     * Fetches all properties assigned to a specific agent.
     *
     * @param agentId - The authenticated agent's user ID
     * @returns Array of properties with owner info and assignment metadata
     *
     * SECURITY:
     * - Filters by agentId (agent sees only their assignments)
     * - Filters by isActive=true (only active assignments)
     * - NO include on bookings (blocked)
     * - NO include on payments (blocked)
     * - Returns empty array if no assignments (no error thrown)
     */
    getAssignedProperties(agentId: string): Promise<AgentPropertyView[]>;
    /**
     * GET ASSIGNED TENANTS
     *
     * Fetches all tenants assigned to a specific agent.
     *
     * @param agentId - The authenticated agent's user ID
     * @returns Array of tenants with assignment metadata
     *
     * SECURITY:
     * - Filters by agentId (agent sees only their assignments)
     * - Filters by isActive=true (only active assignments)
     * - NO include on bookings (blocked)
     * - NO include on payments (blocked)
     * - NO include on tenantSubscription (blocked)
     * - Returns empty array if no assignments (no error thrown)
     */
    getAssignedTenants(agentId: string): Promise<AgentTenantView[]>;
}
export declare const agentService: AgentService;
//# sourceMappingURL=AgentService.d.ts.map