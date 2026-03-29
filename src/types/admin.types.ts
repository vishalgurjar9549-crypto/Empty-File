import { User, Room, ReviewStatus, FeedbackReason, FeedbackSeverity } from './api.types';
export type PropertyStatus = ReviewStatus; // Use the same type
export type UserStatus = 'active' | 'disabled';
export interface RequestCorrectionInput {
  reason: FeedbackReason;
  message: string;
  severity?: FeedbackSeverity;
}
export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalProperties: number;
  pendingApprovals: number;
  activeListings: number;
  totalBookings: number;
}
export interface ActivityLog {
  id: string;
  action: string;
  target: string; // "Property: Title" or "User: Name"
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

// Assignment Types
export interface PropertyAssignment {
  id: string;
  agentId: string;
  propertyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedBy: string;
  assignmentNotes: string | null;
  deactivatedAt: string | null;
  agent: {
    id: string;
    name: string;
    email: string;
  };
  property: {
    id: string;
    title: string;
    city: string;
    location: string;
  };
}
export interface TenantAssignment {
  id: string;
  agentId: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedBy: string;
  reason: string | null;
  deactivatedAt: string | null;
  agent: {
    id: string;
    name: string;
    email: string;
  };
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}
export interface AdminState {
  users: User[];
  properties: Room[];
  stats: AdminStats | null;
  recentActivity: ActivityLog[];
  // Assignment State
  propertyAssignments: PropertyAssignment[];
  tenantAssignments: TenantAssignment[];
  assignmentsLoading: boolean;
  assignmentsError: string | null;
  loading: boolean;
  error: string | null;
}