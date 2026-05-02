// ─── pages/dashboard/OwnerDashboard.tsx ──────────────────────
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Home,
  Inbox,
  Plus,
  Send,
  X,
  MessageSquare,
  Clock,
  CheckCircle2,
  Edit,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchOwnerSummary,
  fetchOwnerRooms,
  fetchOwnerBookings,
  fetchOwnerActivity,
} from "../../store/slices/owner.slice";
import { fetchUnreadCount } from "../../store/slices/notifications.slice";
import { toggleRoomStatus } from "../../store/slices/rooms.slice";
import { updateBookingStatus } from "../../store/slices/bookings.slice";
import { DashboardShell } from "../../components/dashboard/DashboardShell";
import { SectionCard } from "../../components/dashboard/SectionCard";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { RecentActivity } from "../../components/dashboard/RecentActivity";
import { OwnerPropertyCard } from "../../components/dashboard/OwnerPropertyCard";
import { AddPropertyModal } from "../../components/AddPropertyModal";
import { EditPropertyModal } from "../../components/EditPropertyModal";
import { BookingCard } from "../../components/owner/BookingCard";
import { BookingConfirmModal } from "../../components/owner/BookingConfirmModal";
import { ResubmitReviewWarningModal } from "../../components/ResubmitReviewWarningModal";
import { EmailVerificationModal } from "../../components/auth/EmailVerificationModal";
import { ListItemSkeleton } from "../../components/ui/Skeletons";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { showToast } from "../../store/slices/ui.slice";
import { updateUser, getCurrentUser } from "../../store/slices/auth.slice";
import { Room, Booking } from "../../types/api.types";
import FullscreenLoader from "../../components/ui/Loader"; // adjust path


function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const getStatusBadge = (room: Room) => {
  const status = (room.reviewStatus ?? "PENDING").toUpperCase();
  const dotIcon = (
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: "currentColor" }}
    ></span>
  );

  switch (status) {
    case "APPROVED":
      return (
        <StatusBadge variant="success" icon={dotIcon}>
          Approved
        </StatusBadge>
      );
    case "NEEDS_CORRECTION":
      return (
        <StatusBadge variant="warning" icon={dotIcon} animated>
          Needs Correction
        </StatusBadge>
      );
    case "REJECTED":
      return (
        <StatusBadge variant="error" icon={dotIcon}>
          Rejected
        </StatusBadge>
      );
    case "DRAFT":
      return (
        <StatusBadge variant="neutral" icon={dotIcon}>
          Draft
        </StatusBadge>
      );
    case "SUSPENDED":
      return (
        <StatusBadge variant="error" icon={dotIcon}>
          Suspended
        </StatusBadge>
      );
    case "PENDING":
    default:
      return (
        <StatusBadge variant="pending" icon={dotIcon} animateIcon>
          Under Review
        </StatusBadge>
      );
  }
};

export function OwnerDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const {
    summary,
    myRooms,
    myBookings,
    activity,
    activityLoading,
    loading,
    pendingBookingUpdates,
  } = useAppSelector((s) => s.owner);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
  const [postVerifyAction, setPostVerifyAction] = useState<null | (() => void)>(
    null,
  );
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [activeTab, setActiveTab] = useState<"properties" | "bookings">(
    "properties",
  );
  const [viewingFeedback, setViewingFeedback] = useState<Room | null>(null);
  const [resubmitModal, setResubmitModal] = useState<{
    isOpen: boolean;
    room: Room | null;
  }>({ isOpen: false, room: null });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
    action: "approve" | "reject";
  }>({ isOpen: false, booking: null, action: "approve" });
  const [togglingIds, setTogglingIds] = useState<string[]>([]);
  const [isResubmitting, setIsResubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchOwnerSummary());
    dispatch(fetchOwnerRooms());
    dispatch(fetchOwnerBookings());
    dispatch(fetchOwnerActivity());
    dispatch(fetchUnreadCount());

    // ✅ IMPROVED: Debounce focus handler to prevent rapid re-fetches
    // The thunk itself has a ACTIVITY_STALE_MS guard, but debouncing prevents
    // unnecessary dispatch calls on rapid window focus/blur events
    let focusTimeoutId: NodeJS.Timeout;
    const FOCUS_DEBOUNCE_MS = 500;

    const refetchActivityOnFocus = () => {
      clearTimeout(focusTimeoutId);
      focusTimeoutId = setTimeout(() => {
        dispatch(fetchOwnerActivity());
      }, FOCUS_DEBOUNCE_MS);
    };

    window.addEventListener("focus", refetchActivityOnFocus);

    return () => {
      window.removeEventListener("focus", refetchActivityOnFocus);
      clearTimeout(focusTimeoutId);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!viewingFeedback?.adminFeedback) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    const originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [viewingFeedback]);

  if (!user) return null;

  const pendingBookings = useMemo(
    () => myBookings.filter((b) => b.status === "pending").length,
    [myBookings],
  );
  const needsCorrectionCount = useMemo(
    () =>
      myRooms.filter(
        (r) => r.reviewStatus?.toUpperCase() === "NEEDS_CORRECTION",
      ).length,
    [myRooms],
  );

  const openAddPropertyFlow = () => {
    if (!user.emailVerified) {
      setPostVerifyAction(() => () => setIsAddModalOpen(true));
      setIsEmailVerificationOpen(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleEmailVerificationSuccess = () => {
    dispatch(updateUser({ emailVerified: true } as any));
    dispatch(getCurrentUser());
    setIsEmailVerificationOpen(false);
    const action = postVerifyAction;
    setPostVerifyAction(null);
    action?.();
  };

  // const handleToggleStatus = (id: string) => { dispatch(toggleRoomStatus(id)).then(() => dispatch(fetchOwnerRooms())); };
  const handleToggleStatus = async (id: string) => {
    if (togglingIds.includes(id)) return; // prevent spam

    setTogglingIds((prev) => [...prev, id]);

    try {
      await dispatch(toggleRoomStatus(id));
      dispatch(fetchOwnerRooms());
    } finally {
      setTogglingIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const initiateBookingAction = (
    booking: Booking,
    action: "approve" | "reject",
  ) => {
    setConfirmModal({ isOpen: true, booking, action });
  };

  const handleConfirmBookingAction = () => {
    if (!confirmModal.booking) return;
    const { id } = confirmModal.booking;
    const statusToSet =
      confirmModal.action === "approve" ? "approved" : "rejected";
    setConfirmModal((p) => ({ ...p, isOpen: false }));
    dispatch(updateBookingStatus({ id, data: { status: statusToSet } })).then(
      (result) => {
        if (updateBookingStatus.fulfilled.match(result)) {
          setTimeout(() => {
            dispatch(fetchOwnerBookings());
            dispatch(fetchOwnerSummary());
          }, 1200);
        } else dispatch(fetchOwnerBookings());
      },
    );
  };

  const openResubmitModal = (room: Room) =>
    setResubmitModal({ isOpen: true, room });
  // const handleResubmit = (_roomId: string) => { dispatch(fetchOwnerRooms()); setResubmitModal({ isOpen: false, room: null }); setViewingFeedback(null); };

  const handleResubmit = async (roomId: string) => {
    const roomToResubmit = myRooms.find((r) => r.id === roomId);
    if (!roomToResubmit) return;

    setIsResubmitting(true);

    // Close ALL modals immediately
    setResubmitModal({ isOpen: false, room: null });
    setViewingFeedback(null);
    setEditingRoom(null); // ← this was missing, was being set to open EditPropertyModal

    // Smoother UX delay
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Just refresh data — property card will show updated status naturally
    dispatch(fetchOwnerRooms());
    dispatch(fetchOwnerSummary());

    setIsResubmitting(false);
  };

  return (
    <>
      {isResubmitting && (
        <FullscreenLoader message="Resubmitting your property for review..." />
      )}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          dispatch(fetchOwnerRooms());
          dispatch(fetchOwnerSummary());
        }}
        onEmailVerificationRequired={(retry) => {
          setPostVerifyAction(() => retry);
          setIsEmailVerificationOpen(true);
        }}
      />
      <EmailVerificationModal
        isOpen={isEmailVerificationOpen}
        email={user.email}
        onSuccess={handleEmailVerificationSuccess}
        onClose={() => {
          setIsEmailVerificationOpen(false);
          setPostVerifyAction(null);
        }}
        onError={(err) => dispatch(showToast({ message: err, type: "error" }))}
      />

      {/* {editingRoom && <EditPropertyModal isOpen={!!editingRoom} onClose={() => { setEditingRoom(null); dispatch(fetchOwnerRooms()); dispatch(fetchOwnerSummary()); }} room={editingRoom} />} */}

      {editingRoom && (
        <EditPropertyModal
          isOpen={!!editingRoom}
          onClose={() => {
            setEditingRoom(null);
            dispatch(fetchOwnerRooms());
            dispatch(fetchOwnerSummary());
          }}
          room={editingRoom}
          // 🔥 detect resubmit mode
          forcePendingResubmission={
            editingRoom.reviewStatus === "PENDING" &&
            editingRoom.isActive === false
          }
        />
      )}

      <ResubmitReviewWarningModal
        isOpen={resubmitModal.isOpen}
        onClose={() => setResubmitModal({ isOpen: false, room: null })}
        onEdit={() => {
          if (resubmitModal.room) {
            setResubmitModal({ isOpen: false, room: null });
            setViewingFeedback(null);
            setEditingRoom(resubmitModal.room);
          }
        }}
        onConfirm={() => {
          if (resubmitModal.room) handleResubmit(resubmitModal.room.id);
        }}
        propertyTitle={resubmitModal.room?.title || ""}
      />
      <BookingConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((p) => ({ ...p, isOpen: false }))}
        onConfirm={handleConfirmBookingAction}
        booking={confirmModal.booking}
        action={confirmModal.action}
        propertyTitle={
          confirmModal.booking
            ? myRooms.find((r) => r.id === confirmModal.booking?.roomId)
                ?.title || "Unknown Property"
            : ""
        }
        loading={
          confirmModal.booking
            ? pendingBookingUpdates.includes(confirmModal.booking.id)
            : false
        }
      />

      {/* ── Admin Feedback Modal - Production Quality ── */}
      {viewingFeedback?.adminFeedback && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal-container">
            {/* ✅ STEP 1: Modal Header - Clear visual hierarchy */}
            <div className="modal-header">
              <div className="modal-icon">
                <MessageSquare className="modal-icon-orange w-5 h-5" />
              </div>
              <div className="modal-title-section">
                <div className="modal-title">Admin Feedback</div>
                <div className="modal-subtitle">{viewingFeedback.title}</div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setViewingFeedback(null)}
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ✅ STEP 3: Modal Body - Scrollable content area */}
            <div className="modal-body">
              {/* ✅ STEP 2: Severity badges section - Top priority indicator */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span
                  className={
                    viewingFeedback.adminFeedback.severity === "major"
                      ? "severity-badge-major"
                      : "severity-badge-minor"
                  }
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {viewingFeedback.adminFeedback.reasonLabel}
                </span>
                {viewingFeedback.adminFeedback.severity && (
                  <span className="severity-label-badge">
                    {viewingFeedback.adminFeedback.severity} issue
                  </span>
                )}
              </div>

              {/* ✅ STEP 2: Admin message - Visually dominant main content */}
              <div className="admin-message-card">
                <div className="admin-message-label">Admin Message</div>
                <p className="admin-message-text">
                  {viewingFeedback.adminFeedback.message}
                </p>
              </div>

              {/* ✅ STEP 2: Next steps - Clear action items */}
              <div className="next-steps-card">
                <div className="next-steps-label">Next Steps</div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "0" }}
                >
                  {[
                    "Review the feedback carefully",
                    "Edit your property to fix the issues",
                    "Resubmit for review when ready",
                  ].map((step, i) => (
                    <div key={i} className="next-steps-item">
                      <CheckCircle2 className="next-steps-item-icon" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ STEP 2: Metadata - Secondary info */}
              <div className="metadata-row">
                <span className="metadata-item">
                  <Clock className="w-3 h-3" />
                  {new Date(
                    viewingFeedback.adminFeedback.createdAt,
                  ).toLocaleString()}
                </span>
                {viewingFeedback.adminFeedback.adminName && (
                  <span style={{ fontSize: "12px" }}>
                    by {viewingFeedback.adminFeedback.adminName}
                  </span>
                )}
              </div>
            </div>

            {/* ✅ STEP 4: Modal Footer - Fixed action buttons */}
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setViewingFeedback(null);
                  setEditingRoom(viewingFeedback);
                }}
              >
                <Edit className="w-3.5 h-3.5" /> Edit Property
              </button>
              <button
                className="btn-primary"
                onClick={() => openResubmitModal(viewingFeedback)}
              >
                <Send className="w-3.5 h-3.5" /> Resubmit
              </button>
            </div>
          </div>
        </div>
      )}

      <DashboardShell
        title={`${getGreeting()}, ${user.name.split(" ")[0]}`}
        subtitle="Manage your rental properties, Visits and performance"
        action={
          <div className="flex items-center gap-3 justify-end w-full">
            {/* ✅ Add New Property Button */}
            <button onClick={openAddPropertyFlow} className="btn-add-property">
              <Plus style={{ width: 17, height: 17 }} /> Add New Property
            </button>
            {/* ✅ Notification Icon - Aligned Right with Add Property */}
            {/* <NotificationBadgeEnhanced /> */}
          </div>
        }
      >
        {/* Needs correction banner */}
        {needsCorrectionCount > 0 && (
          <div className="alert-banner">
            <div className="alert-icon">
              <AlertCircle className="w-full h-full" />
            </div>
            <div className="alert-content">
              <div className="alert-title">
                Action required on {needsCorrectionCount}{" "}
                {needsCorrectionCount === 1 ? "property" : "properties"}
              </div>
              <div className="alert-description">
                Our admin team has sent feedback on some listings. Review and
                fix them to keep them live.
              </div>
            </div>
          </div>
        )}

        {/* Main Section */}
        <SectionCard>
          {/* Premium Header */}
          <div
            style={{
              padding: "14px 16px 12px",
              borderBottom: "1px solid var(--gold-border)",
              background:
                "linear-gradient(180deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02))",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Your Portfolio
                </h3>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  Manage listings, review corrections, and track Visits
                  activity in one place.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    padding: "7px 10px",
                    borderRadius: 10,
                    border: "1px solid var(--gold-border)",
                    background: "var(--surface)",
                    minWidth: 96,
                  }}
                >
                  <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                    Properties
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>
                    {myRooms.length}
                  </div>
                </div>

                <div
                  style={{
                    padding: "7px 10px",
                    borderRadius: 10,
                    border: "1px solid var(--gold-border)",
                    background: "var(--surface)",
                    minWidth: 96,
                  }}
                >
                  <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                    Visits
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>
                    {myBookings.length}
                  </div>
                </div>

                <div
                  style={{
                    padding: "7px 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(249,115,22,0.25)",
                    background: "rgba(249,115,22,0.08)",
                    minWidth: 112,
                  }}
                >
                  <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                    Needs Attention
                  </div>
                  <div
                    style={{ fontSize: 15, fontWeight: 800, color: "#f97316" }}
                  >
                    {needsCorrectionCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Better Tabs */}
            <div
              style={{
                marginTop: 10,
                display: "inline-flex",
                gap: 6,
                padding: 4,
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--gold-border)",
                backdropFilter: "blur(12px)",
                width: "100%",
                maxWidth: 460,
              }}
            >
              {(["properties", "bookings"] as const).map((tab) => {
                const active = activeTab === tab;
                const label =
                  tab === "properties"
                    ? `Properties (${myRooms.length})`
                    : `Visits (${myBookings.length})`;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-button ${active ? "active" : ""}`}
                  >
                    {label}
                    {tab === "properties" && needsCorrectionCount > 0 && (
                      <span className="tab-badge" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          {activeTab === "properties" ? (
            loading.rooms ? (
              <div style={{ padding: "16px 18px" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <ListItemSkeleton />
                  </div>
                ))}
              </div>
            ) : myRooms.length > 0 ? (
              <div style={{ padding: "10px 12px", display: "grid", gap: 8 }}>
                {myRooms.map((room) => (
                  <OwnerPropertyCard
                    key={room.id}
                    room={room}
                    statusBadge={getStatusBadge(room)}
                    onEdit={setEditingRoom}
                    onToggleStatus={handleToggleStatus}
                    onViewFeedback={setViewingFeedback}
                    isToggling={togglingIds.includes(room.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Home style={{ width: 32, height: 32 }} />}
                title="No properties yet"
                description="Start by adding your first rental listing. It only takes a few minutes."
                action={
                  <button
                    onClick={openAddPropertyFlow}
                    style={{
                      padding: "11px 28px",
                      borderRadius: 12,
                      border: "none",
                      background: "var(--gold)",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      color: "#000",
                    }}
                  >
                    Add Your First Property
                  </button>
                }
              />
            )
          ) : loading.bookings ? (
            <div style={{ padding: "16px 18px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <ListItemSkeleton />
                </div>
              ))}
            </div>
          ) : myBookings.length > 0 ? (
            <div
              style={{
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {myBookings.map((booking) => {
                const room = myRooms.find((r) => r.id === booking.roomId);
                return (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    propertyTitle={room?.title || "Unknown Property"}
                    onApprove={(b) => initiateBookingAction(b, "approve")}
                    onReject={(b) => initiateBookingAction(b, "reject")}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Inbox style={{ width: 32, height: 32 }} />}
              title="No booking requests yet"
              description="When tenants book your properties, they will appear here."
              action={
                <div
                  style={{
                    marginTop: 8,
                    padding: "14px 20px",
                    background: "var(--gold-soft)",
                    border: "1px solid var(--gold-border)",
                    borderRadius: 14,
                    maxWidth: 360,
                    margin: "8px auto 0",
                  }}
                >
                  <p style={{ fontSize: 13, margin: 0 }}>
                    <strong style={{ color: "var(--gold)" }}>Pro Tip:</strong>{" "}
                    Verified properties usually get more booking requests.
                  </p>
                </div>
              }
            />
          )}
        </SectionCard>

        <RecentActivity activity={activity} loading={activityLoading} />
      </DashboardShell>
    </>
  );
}
