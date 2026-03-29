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
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  assignment: {
    id: string;
    assignmentNotes: string | null;
    assignedAt: string;
    isActive: boolean;
  };
}
export interface AgentTenantView {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  createdAt: string;
  assignment: {
    id: string;
    reason: string | null;
    assignedAt: string;
    isActive: boolean;
  };
}
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
export interface NotificationView {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  payload: NotificationPayload | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}
export interface NotificationsResponse {
  data: NotificationView[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
    unreadCount: number;
  };
}

// Agent's own notes (for tracking created notes)
export interface AgentNote {
  id: string;
  propertyId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}