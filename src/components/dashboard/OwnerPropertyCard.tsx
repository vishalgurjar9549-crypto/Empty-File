import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock3,
  Edit,
  Eye,
  FileText,
  Home,
  MapPin,
  MessageSquare,
  Power,
} from "lucide-react";
import { Room } from "../../types/api.types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPropertyNotes } from "../../store/slices/owner.slice";
import { PropertyNotesSection } from "../owner/PropertyNotesSection";

type OwnerPropertyCardProps = {
  room: Room;
  statusBadge: ReactNode;
  onEdit: (room: Room) => void;
  onToggleStatus: (id: string) => void;
  onViewFeedback: (room: Room) => void;
  isToggling: boolean;
};

export function OwnerPropertyCard({
  room,
  statusBadge,
  onEdit,
  onToggleStatus,
  onViewFeedback,
  isToggling,
}: OwnerPropertyCardProps) {
  const dispatch = useAppDispatch();
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  
  // ✅ CRITICAL FIX: Call useAppSelector at top level (not in event handler)
  const { notesLoading, propertyNotes } = useAppSelector(
    (state) => state.owner
  );

  const needsCorrection =
    room.reviewStatus?.toUpperCase() === "NEEDS_CORRECTION";

  const primaryImage = useMemo(
    () =>
      room.images?.[0] ||
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    [room.images],
  );

  const weeklyViews = room.demand?.weeklyViews ?? 0;
  const weeklyContacts = room.demand?.weeklyContacts ?? room.contactCount ?? 0;

  // ✅ CRITICAL FIX: Fetch notes ONLY on explicit user action (click handler)
  // RULE: UI toggle MUST happen FIRST, then check conditions for API
  // This ensures immediate UI feedback and prevents render-triggered fetching
  const handleViewNotesClick = () => {
    // STEP 1: ALWAYS toggle UI first (immediate feedback - no delay)
    const newOpenState = !isNotesOpen;
    console.debug(`[OwnerPropertyCard] Toggling notes panel for ${room.id}: ${isNotesOpen} → ${newOpenState}`);
    setIsNotesOpen(newOpenState);

    // STEP 2: If closing, don't call API
    if (!newOpenState) {
      console.debug(`[OwnerPropertyCard] Closing notes panel for ${room.id}, no API call`);
      return;
    }

    // STEP 3: Opening - check conditions to prevent duplicate API calls
    // ✅ Using state from top-level useAppSelector (not calling inside handler)
    
    // Guard 1: Don't dispatch if already loading
    if (notesLoading[room.id]) {
      console.debug(`[OwnerPropertyCard] Notes already loading for ${room.id}, skipping API call`);
      return;
    }

    // Guard 2: Don't dispatch if already cached
    if (propertyNotes[room.id]) {
      console.debug(`[OwnerPropertyCard] Notes already cached for ${room.id} (${propertyNotes[room.id].length} notes), using cache`);
      return;
    }

    // STEP 4: Fetch notes only if not loading and not cached
    console.debug(`[OwnerPropertyCard] Fetching notes for property: ${room.id}`);
    dispatch(fetchPropertyNotes(room.id));
  };

  const compactMetric = (
    label: string,
    value: ReactNode,
    icon?: ReactNode,
  ) => (
    <div className="compact-metric">
      <div className="compact-metric-label">
        {icon}
        {label}
      </div>
      <div className="compact-metric-value">
        {value}
      </div>
    </div>
  );

  // ✅ STEP 3: Get clear status message based on reviewStatus + isActive
  const getStatusMessage = (): string => {
    const status = (room.reviewStatus ?? "PENDING").toUpperCase();
    
    switch (status) {
      case "PENDING":
        return "Your property is under review. We'll notify you once it's approved.";
      case "APPROVED":
        if (room.isActive) {
          return "Your property is live and visible to tenants.";
        } else {
          return "Your property is approved but currently hidden. Activate it to make it live.";
        }
      case "NEEDS_CORRECTION":
        return "Your property needs updates. Please review admin feedback and resubmit.";
      case "REJECTED":
        return "Your property was not approved. Please update details and submit again.";
      default:
        return "";
    }
  };

  return (
    <div
      className={`owner-property-card-compact ${needsCorrection ? 'owner-property-card-needs-correction' : ''}`}
    >
      {needsCorrection && (
        <div className="property-alert-banner">
          <AlertCircle className="w-[14px] h-[14px] flex-shrink-0" />
          <span>
            This listing needs corrections before it can perform at its best.
          </span>
        </div>
      )}

      <div className="owner-property-card-grid">
        <div className="property-card-image-wrapper">
          <img
            src={primaryImage}
            alt={room.title}
          />
        </div>

        <div className="min-w-0">
          <div className="property-card-header">
            <h3
              className="owner-property-card-title"
              title={room.title}
            >
              {room.title}
            </h3>

            <div className="property-card-header-status">{statusBadge}</div>
          </div>

          {/* ✅ STEP 3: Clear status message under title */}
          <p style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            marginTop: 4,
            marginBottom: 8,
            lineHeight: 1.4,
          }}>
            {getStatusMessage()}
          </p>

          <div className="property-location-row">
            <MapPin className="w-[13px] h-[13px] flex-shrink-0" />
            <span title={room.location}>
              {room.location}
            </span>
            <span className="opacity-45">•</span>
            <Home className="w-[13px] h-[13px] flex-shrink-0" />
            <span className="whitespace-nowrap">{room.roomType}</span>
          </div>
        </div>

        <div className="owner-property-card-state-row" style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {compactMetric(
            "Rent",
            <>
              ₹{room.pricePerMonth.toLocaleString()}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginLeft: 2,
                }}
              >
                /mo
              </span>
            </>,
          )}
        </div>

        <div className="owner-property-card-stats-row" style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {compactMetric(
            "Views",
            weeklyViews.toLocaleString(),
            <Eye style={{ width: 12, height: 12 }} />,
          )}
          {compactMetric(
            "Contacts",
            weeklyContacts.toLocaleString(),
            <MessageSquare style={{ width: 12, height: 12 }} />,
          )}
        </div>

        <div className="owner-property-card-actions" style={{ marginTop: 8 }}>
          {/* ✅ STEP 5: Urgent NEEDS_CORRECTION button with highlight */}
          {needsCorrection && (
            <button
              onClick={() => onViewFeedback(room)}
              style={{
                flex: "1 1 140px",
                minHeight: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 10px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(249, 115, 22, 0.25)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 28px rgba(249, 115, 22, 0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px rgba(249, 115, 22, 0.25)";
              }}
            >
              <MessageSquare style={{ width: 14, height: 14 }} />
              Fix & Resubmit
            </button>
          )}
          

          {/* ✅ STEP 4: REJECTED state */}
          {!needsCorrection && room.reviewStatus?.toUpperCase() === "REJECTED" && (
            <button
              onClick={() => onEdit(room)}
              style={{
                flex: "1 1 140px",
                minHeight: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 10px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(239, 68, 68, 0.25)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 28px rgba(239, 68, 68, 0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px rgba(239, 68, 68, 0.25)";
              }}
            >
              <Edit style={{ width: 14, height: 14 }} />
              Edit & Resubmit
            </button>
          )}

          {/* ✅ STEP 4: Approve + Activate toggle */}
          {room.reviewStatus?.toUpperCase() === "APPROVED" && (
            <button
              onClick={() => !isToggling && onToggleStatus(room.id)}
              disabled={isToggling}
              title={
                isToggling
                  ? "Updating..."
                  : room.isActive
                  ? "Deactivate property"
                  : "Activate property to go live"
              }
              style={{
                flex: "1 1 140px",
                minHeight: 36,
                borderRadius: 12,
                border: `1px solid ${
                  room.isActive
                    ? "rgba(16,185,129,0.3)"
                    : "rgba(239,68,68,0.3)"
                }`,
                background: room.isActive
                  ? "rgba(16,185,129,0.08)"
                  : "rgba(239,68,68,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                color: room.isActive ? "#10b981" : "#ef4444",
                cursor: isToggling ? "not-allowed" : "pointer",
                opacity: isToggling ? 0.6 : 1,
                fontWeight: 700,
                fontSize: 12,
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                if (!isToggling) {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              <Power style={{ width: 14, height: 14 }} />
              {room.isActive ? "Deactivate" : "Activate"}
            </button>
          )}

          {/* ✅ STEP 4: PENDING state - disable actions */}
          {room.reviewStatus?.toUpperCase() === "PENDING" && (
            <div style={{
              flex: "1 1 140px",
              minHeight: 36,
              borderRadius: 12,
              border: "1px solid rgba(201, 168, 76, 0.2)",
              background: "rgba(201, 168, 76, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              color: "var(--color-text-secondary)",
              fontSize: 12,
              fontWeight: 600,
            }}>
              <Clock3 style={{ width: 14, height: 14 }} />
              Under Review
            </div>
          )}

          {/* ✅ Always show Edit button (for REJECTED/APPROVED states) */}
          {room.reviewStatus?.toUpperCase() !== "PENDING" && !needsCorrection && room.reviewStatus?.toUpperCase() !== "REJECTED" && (
            <button
              onClick={() => onEdit(room)}
              style={{
                flex: "1 1 96px",
                minHeight: 36,
                borderRadius: 12,
                border: "1px solid var(--gold-border)",
                background: "var(--gold-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                color: "var(--gold)",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12,
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              <Edit style={{ width: 14, height: 14 }} />
              Edit
            </button>
          )}
        </div>

        <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
          {/* ✅ DIVIDER: Clear visual separation */}
          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, var(--gold-border), transparent)",
              marginBottom: 10,
            }}
          />
          
          {/* ✅ NOTES TOGGLE BUTTON: Improved UX */}
          <button
            type="button"
            onClick={handleViewNotesClick}
            aria-expanded={isNotesOpen}
            style={{
              width: "100%",
              minHeight: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 12,
              border: isNotesOpen ? "1px solid var(--gold)" : "1px solid var(--gold-border)",
              background: isNotesOpen ? "rgba(255,215,0,0.06)" : "transparent",
              color: isNotesOpen ? "var(--gold)" : "var(--text-primary)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              transition: "all 0.22s ease",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText style={{ width: 15, height: 15, color: "var(--gold)" }} />
              {isNotesOpen ? "Hide Property Notes" : "View Property Notes"}
            </span>
            {isNotesOpen ? (
              <ChevronUp style={{ width: 15, height: 15, color: "var(--gold)", flexShrink: 0, transition: "transform 0.22s ease" }} />
            ) : (
              <ChevronDown style={{ width: 15, height: 15, color: "var(--gold)", flexShrink: 0, transition: "transform 0.22s ease" }} />
            )}
          </button>
        </div>
      </div>

      {/* ✅ NOTES SECTION: Improved UX with better spacing and animation */}
      <div
        aria-hidden={!isNotesOpen}
        style={{
          maxHeight: isNotesOpen ? 2000 : 0,
          overflow: "hidden",
          transition: "max-height 240ms cubic-bezier(0.4, 0, 0.2, 1)",
          visibility: isNotesOpen ? "visible" : "hidden",
          pointerEvents: isNotesOpen ? "auto" : "none",
        }}
      >
        <div
          style={{
            borderTop: "1px solid var(--gold-border)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.008) 100%)",
            padding: "16px 12px",
          }}
        >
          <PropertyNotesSection
            propertyId={room.id}
            propertyTitle={room.title}
            embedded
            autoFetch={false}
          />
        </div>
      </div>
    </div>
  );
}
