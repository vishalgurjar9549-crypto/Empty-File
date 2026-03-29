import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  IndianRupee,
  Edit,
  Power,
  Plus,
  Clock,
  Home,
  Inbox,
  AlertCircle,
  Send,
  X,
  Crown,
  Eye,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchOwnerSummary,
  fetchOwnerRooms,
  fetchOwnerBookings,
} from "../store/slices/owner.slice";
import { toggleRoomStatus } from "../store/slices/rooms.slice";
import { updateBookingStatus } from "../store/slices/bookings.slice";
import { fetchCurrentSubscription } from "../store/slices/subscription.slice";
import { AddPropertyModal } from "../components/AddPropertyModal";
import { EditPropertyModal } from "../components/EditPropertyModal";
import { PropertyNotesSection } from "../components/owner/PropertyNotesSection";
import { BookingCard } from "../components/owner/BookingCard";
import { BookingConfirmModal } from "../components/owner/BookingConfirmModal";
import { Room, Booking } from "../types/api.types";
import { Link } from "react-router-dom";
import { ResubmitReviewWarningModal } from "../components/ResubmitReviewWarningModal";
import { EmailVerificationModal } from "../components/auth/EmailVerificationModal";
import { showToast } from "../store/slices/ui.slice";
import { updateUser, getCurrentUser } from "../store/slices/auth.slice";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
export function Dashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { summary, myRooms, myBookings, loading, pendingBookingUpdates } =
    useAppSelector((state) => state.owner);
  const { current: currentSub, subscriptions } = useAppSelector(
    (state) => state.subscription,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
  const [postVerifyAction, setPostVerifyAction] = useState<null | (() => void)>(
    null,
  );
  const [isUpgradeConfirmOpen, setIsUpgradeConfirmOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [activeTab, setActiveTab] = useState<"properties" | "bookings">(
    "properties",
  );
  const [viewingFeedback, setViewingFeedback] = useState<Room | null>(null);
  const [resubmitModal, setResubmitModal] = useState<{
    isOpen: boolean;
    room: Room | null;
  }>({
    isOpen: false,
    room: null,
  });
  // Booking Confirmation State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
    action: "approve" | "reject";
  }>({
    isOpen: false,
    booking: null,
    action: "approve",
  });
  const userRole = user?.role?.toUpperCase();
  useEffect(() => {
    if (userRole === "OWNER") {
      dispatch(fetchOwnerSummary());
      dispatch(fetchOwnerRooms());
      dispatch(fetchOwnerBookings());
    } else if (userRole === "TENANT") {
      dispatch(fetchCurrentSubscription());
    }
  }, [dispatch, userRole]);
  if (!user) return null;

  const openAddPropertyFlow = () => {
    if (!user.emailVerified) {
      setPostVerifyAction(() => () => setIsAddModalOpen(true));
      setIsEmailVerificationOpen(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleEmailVerificationSuccess = () => {
    // Optimistically update immediately for UI gating, then sync from backend.
    dispatch(
      updateUser({
        emailVerified: true,
      } as any),
    );
    dispatch(getCurrentUser());

    setIsEmailVerificationOpen(false);
    const action = postVerifyAction;
    setPostVerifyAction(null);
    action?.();
  };

  const handleEmailVerificationClose = () => {
    setIsEmailVerificationOpen(false);
    setPostVerifyAction(null);
  };

  // TENANT DASHBOARD
  if (userRole === "TENANT") {
    const primarySubscription =
      subscriptions.length > 0 ? subscriptions[0] : currentSub;
    const plan = primarySubscription?.plan || "FREE";
    const city = primarySubscription?.city || null;
    const viewCount = currentSub?.viewCount || 0;
    const viewLimit = currentSub?.viewLimit || 10;
    const percentUsed = (viewCount / viewLimit) * 100;
    const expiresAt = primarySubscription?.expiresAt || currentSub?.expiresAt;
    return (
      <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20 transition-colors duration-300">
        {/* AddPropertyModal available to TENANT — backend auto-upgrades role on first create */}
        <AddPropertyModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onEmailVerificationRequired={(retry) => {
            setPostVerifyAction(() => retry);
            setIsEmailVerificationOpen(true);
          }}
        />

        <EmailVerificationModal
          isOpen={isEmailVerificationOpen}
          email={user.email}
          onSuccess={handleEmailVerificationSuccess}
          onClose={handleEmailVerificationClose}
          onError={(error) => {
            dispatch(
              showToast({
                message: error,
                type: "error",
              }),
            );
          }}
        />

        {/* Upgrade Confirmation Modal */}
        {isUpgradeConfirmOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
              onClick={() => setIsUpgradeConfirmOpen(false)}
            />

            <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Home className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-2xl font-bold text-navy dark:text-white font-playfair text-center mb-3">
                Become a Property Owner
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6 leading-relaxed">
                Listing your first property will upgrade your account to{" "}
                <span className="font-semibold text-navy dark:text-white">
                  Owner
                </span>
                . You'll gain access to the owner dashboard, booking management,
                and earnings tracking.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsUpgradeConfirmOpen(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsUpgradeConfirmOpen(false);
                    setIsAddModalOpen(true);
                  }}
                  className="flex-1 py-3 bg-navy dark:bg-white text-white dark:text-navy rounded-xl hover:bg-gold dark:hover:bg-slate-100 transition-colors font-semibold text-sm shadow-lg shadow-navy/20"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-playfair">
              Tenant Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Welcome back, {user.name}
            </p>
          </div>

          {/* Multi-City Subscriptions */}
          {subscriptions.length > 1 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-navy dark:text-white font-playfair mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold" />
                Your Active Plans
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {subscriptions.map((sub: any) => (
                  <div
                    key={sub.id || `${sub.plan}-${sub.city}`}
                    className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Crown
                          className={`w-5 h-5 ${
                            sub.plan === "PLATINUM"
                              ? "text-purple-500"
                              : "text-gold"
                          }`}
                        />

                        <span
                          className={`text-lg font-bold ${
                            sub.plan === "PLATINUM"
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-gold"
                          }`}
                        >
                          {sub.plan}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full capitalize">
                        {sub.city}
                      </span>
                    </div>
                    {sub.expiresAt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires {new Date(sub.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription Status Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-navy/5 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-navy to-navy-light p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-6 h-6 text-gold" />
                    <h2 className="text-2xl font-bold">{plan} Plan</h2>
                  </div>
                  <p className="text-white/80 text-sm sm:text-base">
                    {city
                      ? `Active in ${city}`
                      : "Browse properties with limited access"}
                    {subscriptions.length > 1
                      ? ` (+${subscriptions.length - 1} more)`
                      : ""}
                  </p>
                </div>
                {plan === "FREE" && (
                  <Link
                    to="/pricing"
                    className="px-6 py-3 bg-gold text-navy font-bold rounded-xl hover:bg-yellow-500 transition-colors shadow-lg text-center sm:text-left"
                  >
                    Upgrade Now
                  </Link>
                )}
              </div>
            </div>

            <div className="p-6">
              {plan === "FREE" ? (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Property Views
                      </span>
                      <span className="text-sm font-bold text-navy dark:text-white">
                        {viewCount} / {viewLimit}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          percentUsed >= 100
                            ? "bg-red-500"
                            : percentUsed >= 80
                            ? "bg-orange-500"
                            : "bg-navy"
                        }`}
                        style={{
                          width: `${Math.min(percentUsed, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {viewLimit - viewCount > 0
                        ? `${viewLimit - viewCount} free views remaining`
                        : "Upgrade to view more properties"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Eye className="w-5 h-5 text-navy dark:text-white mb-2" />
                      <p className="text-sm font-medium text-navy dark:text-white">
                        {viewLimit} Free Views
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        First {viewLimit} properties
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-500 mb-2" />
                      <p className="text-sm font-medium text-navy dark:text-white">
                        Limited Contact
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Upgrade to view owner details
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Crown className="w-5 h-5 text-gold mb-2" />
                      <p className="text-sm font-medium text-navy dark:text-white">
                        Upgrade Anytime
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Starting at ₹99/month
                      </p>
                    </div>
                  </div>
                  {viewCount >= viewLimit && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-orange-900 dark:text-orange-300 mb-1">
                            You've reached your free limit
                          </p>
                          <p className="text-sm text-orange-700 dark:text-orange-400">
                            Upgrade to GOLD or PLATINUM to continue viewing
                            properties and access owner contact details.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Eye className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                      <p className="text-sm font-medium text-navy dark:text-white">
                        Unlimited Views
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Browse all properties
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                      <p className="text-sm font-medium text-navy dark:text-white">
                        Full Contact Access
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        View all owner details
                      </p>
                    </div>
                    {plan === "PLATINUM" && (
                      <div className="p-4 bg-gold/10 dark:bg-gold/20 rounded-lg">
                        <Crown className="w-5 h-5 text-gold mb-2" />
                        <p className="text-sm font-medium text-navy dark:text-white">
                          Call Support
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          1-to-1 assistance
                        </p>
                      </div>
                    )}
                  </div>
                  {expiresAt && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-300">
                        <Clock className="w-4 h-4" />
                        <span>
                          Plan expires on{" "}
                          {new Date(expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/rooms"
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
            >
              <Home className="w-8 h-8 text-navy dark:text-white mb-4 group-hover:text-gold transition-colors" />
              <h3 className="text-xl font-bold text-navy dark:text-white mb-2">
                Browse Properties
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Find your perfect rental home in {user.city || "your city"}
              </p>
            </Link>

            <Link
              to="/pricing"
              className="bg-gradient-to-br from-navy to-navy-light p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group text-white"
            >
              <Crown className="w-8 h-8 text-gold mb-4" />
              <h3 className="text-xl font-bold mb-2">View Plans</h3>
              <p className="text-white/80">
                Upgrade for unlimited access and premium features
              </p>
            </Link>

            {/* List Property CTA for Tenants */}
            <button
              onClick={() => setIsUpgradeConfirmOpen(true)}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:scale-[1.02] transition-all duration-200 group text-left"
            >
              <Plus className="w-8 h-8 text-navy dark:text-white mb-4 group-hover:text-gold transition-colors" />
              <h3 className="text-xl font-bold text-navy dark:text-white mb-2">
                List Your Property
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Have a property to rent? List it and start earning
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }
  // OWNER DASHBOARD
  const handleToggleStatus = (id: string) => {
    dispatch(toggleRoomStatus(id)).then(() => {
      dispatch(fetchOwnerRooms());
    });
  };
  const initiateBookingAction = (
    booking: Booking,
    action: "approve" | "reject",
  ) => {
    setConfirmModal({
      isOpen: true,
      booking,
      action,
    });
  };
  const handleConfirmBookingAction = () => {
    if (!confirmModal.booking) return;
    const { id } = confirmModal.booking;
    const { action } = confirmModal;
    const statusToSet = action === "approve" ? "approved" : "rejected";
    setConfirmModal((prev) => ({
      ...prev,
      isOpen: false,
    }));
    dispatch(
      updateBookingStatus({
        id,
        data: {
          status: statusToSet,
        },
      }),
    ).then((result) => {
      if (updateBookingStatus.fulfilled.match(result)) {
        setTimeout(() => {
          dispatch(fetchOwnerBookings());
          dispatch(fetchOwnerSummary());
        }, 2000);
      } else {
        dispatch(fetchOwnerBookings());
      }
    });
  };
  // const handleResubmit = (roomId: string) => {
  //   dispatch(fetchOwnerRooms());
  //   setViewingFeedback(null);
  // };
  const openResubmitModal = (room: Room) => {
    setResubmitModal({
      isOpen: true,
      room,
    });
  };

  const handleResubmit = (roomId: string) => {
    // TODO:
    // Replace this later with your actual API / redux action
    // Example:
    // dispatch(resubmitRoomForReview(roomId)).then(() => { ... })

    dispatch(fetchOwnerRooms());

    setResubmitModal({
      isOpen: false,
      room: null,
    });

    setViewingFeedback(null);
  };

  const getStatusBadge = (room: Room) => {
    const status = (room.reviewStatus ?? "PENDING").toUpperCase();
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Approved
          </span>
        );
      case "NEEDS_CORRECTION":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Needs Correction
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Rejected
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Draft
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Suspended
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Under Review
          </span>
        );
    }
  };
  const needsCorrectionCount = myRooms.filter(
    (r) => r.reviewStatus?.toUpperCase() === "NEEDS_CORRECTION",
  ).length;
  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20 transition-colors duration-300 overflow-y-auto">
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
        onClose={handleEmailVerificationClose}
        onError={(error) => {
          dispatch(
            showToast({
              message: error,
              type: "error",
            }),
          );
        }}
      />

      {editingRoom && (
        <EditPropertyModal
          isOpen={!!editingRoom}
          onClose={() => {
            setEditingRoom(null);
            dispatch(fetchOwnerRooms());
          }}
          room={editingRoom}
        />
      )}

      <ResubmitReviewWarningModal
        isOpen={resubmitModal.isOpen}
        onClose={() =>
          setResubmitModal({
            isOpen: false,
            room: null,
          })
        }
        onEdit={() => {
          if (resubmitModal.room) {
            setResubmitModal({
              isOpen: false,
              room: null,
            });
            setViewingFeedback(null);
            setEditingRoom(resubmitModal.room);
          }
        }}
        onConfirm={() => {
          if (resubmitModal.room) {
            handleResubmit(resubmitModal.room.id);
          }
        }}
        propertyTitle={resubmitModal.room?.title || ""}
      />

      <BookingConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
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

      {/* Feedback Modal */}
      {viewingFeedback && viewingFeedback.adminFeedback && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl shadow-navy/20 dark:shadow-black/40 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-playfair">
                      Admin Feedback
                    </h3>
                    <p className="text-orange-100 text-sm mt-0.5 truncate max-w-[260px]">
                      {viewingFeedback.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingFeedback(null)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    viewingFeedback.adminFeedback.severity === "major"
                      ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                      : "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  {viewingFeedback.adminFeedback.reasonLabel}
                </div>
                {viewingFeedback.adminFeedback.severity && (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md ${
                      viewingFeedback.adminFeedback.severity === "major"
                        ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {viewingFeedback.adminFeedback.severity} issue
                  </span>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border-l-4 border-orange-400">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Admin Message
                </p>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-sm">
                  {viewingFeedback.adminFeedback.message}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(
                    viewingFeedback.adminFeedback.createdAt,
                  ).toLocaleString()}
                </div>
                {viewingFeedback.adminFeedback.adminName && (
                  <span>by {viewingFeedback.adminFeedback.adminName}</span>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2.5">
                  Next Steps
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Review the feedback carefully",
                    "Edit your property to fix the issues",
                    "Resubmit for review when ready",
                  ].map((step, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-5 pb-5 flex gap-3 shrink-0">
              <button
                onClick={() => {
                  setViewingFeedback(null);
                  setEditingRoom(viewingFeedback);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Property
              </button>
              {/* <button
                onClick={() => handleResubmit(viewingFeedback.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-navy dark:bg-white text-white dark:text-navy font-semibold rounded-xl hover:bg-navy/90 dark:hover:bg-slate-100 transition-colors text-sm shadow-lg shadow-navy/20"
              >
                <Send className="w-4 h-4" />
                Resubmit for Review
              </button> */}
              <button
                onClick={() => openResubmitModal(viewingFeedback)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-navy dark:bg-white text-white dark:text-navy font-semibold rounded-xl hover:bg-navy/90 dark:hover:bg-slate-100 transition-colors text-sm shadow-lg shadow-navy/20"
              >
                <Send className="w-4 h-4" />
                Resubmit for Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-1"> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-6 md:pt-6 md:pb-8">
        {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"> */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
          <div>
            {/* <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-playfair"> */}
            <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-playfair leading-tight">
              {getGreeting()}, {user.name.split(" ")[0]} 👋
            </h1>
            {/* <p className="text-slate-500 dark:text-slate-400 mt-1"> */}
            <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm sm:text-base">
              Manage your properties and bookings
            </p>
          </div>
          <button
            onClick={openAddPropertyFlow}
            className="flex items-center gap-2 px-6 py-3 bg-navy dark:bg-slate-200 text-white dark:text-navy rounded-xl hover:bg-gold dark:hover:bg-white transition-all duration-200 font-semibold shadow-lg shadow-navy/20 dark:shadow-black/20 w-full md:w-auto justify-center"
          >
            <Plus className="w-5 h-5" /> Add New Property
          </button>
        </div>

        {needsCorrectionCount > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 border-l-4 border-l-orange-500 p-5 rounded-xl mb-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-orange-900 dark:text-orange-300 mb-1">
                  Action Required on {needsCorrectionCount}{" "}
                  {needsCorrectionCount === 1 ? "Property" : "Properties"}
                </h3>
                <p className="text-orange-700 dark:text-orange-400 text-sm mb-3">
                  Our admin team has sent feedback on some of your listings.
                  Please review and make the necessary corrections.
                </p>
                {/* <button onClick={() => setActiveTab('properties')} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-700 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors">

                  View Properties <ChevronRight className="w-4 h-4" />
                </button> */}
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10">
          <button onClick={() => setActiveTab('properties')} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-left hover:shadow-md hover:border-navy/20 dark:hover:border-slate-500 hover:-translate-y-0.5 transition-all duration-200 group">

            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-navy dark:group-hover:text-white transition-colors" />
            </div>
            <p className="text-2xl font-bold text-navy dark:text-white mb-1">
              {summary?.totalRooms || 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Total Properties
            </p>
          </button>

          <button onClick={() => setActiveTab('bookings')} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-left hover:shadow-md hover:border-navy/20 dark:hover:border-slate-500 hover:-translate-y-0.5 transition-all duration-200 group">

            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                {myBookings.filter((b) => b.status === 'pending').length > 0 && <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                    {myBookings.filter((b) => b.status === 'pending').length}{' '}
                    new
                  </span>}
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-navy dark:group-hover:text-white transition-colors" />
              </div>
            </div>
            <p className="text-2xl font-bold text-navy dark:text-white mb-1">
              {summary?.totalLeads || 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Total Leads
            </p>
          </button>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold/10 dark:bg-gold/20 text-gold rounded-xl">
                <IndianRupee className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-navy dark:text-white mb-1">
              ₹{(summary?.totalEarnings || 0).toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Total Earnings
            </p>
          </div>
        </div> */}
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 mb-6">
          <button
            onClick={() => setActiveTab("properties")}
            className="bg-white dark:bg-slate-800 p-3 sm:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-left hover:shadow-md hover:border-navy/20 dark:hover:border-slate-500 hover:-translate-y-0.5 transition-all duration-200 group min-h-[110px] sm:min-h-[140px] flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 dark:text-slate-600 group-hover:text-navy dark:group-hover:text-white transition-colors mt-1" />
            </div>

            <div className="mt-3">
              <p className="text-xl sm:text-3xl font-bold text-navy dark:text-white leading-none">
                {summary?.totalRooms || 0}
              </p>
              <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1.5 sm:mt-2 leading-snug">
                Total Properties
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className="bg-white dark:bg-slate-800 p-3 sm:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-left hover:shadow-md hover:border-navy/20 dark:hover:border-slate-500 hover:-translate-y-0.5 transition-all duration-200 group min-h-[110px] sm:min-h-[140px] flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="flex items-center gap-1">
                {myBookings.filter((b) => b.status === "pending").length >
                  0 && (
                  <span className="hidden sm:inline px-2 py-0.5 text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full whitespace-nowrap">
                    {myBookings.filter((b) => b.status === "pending").length}{" "}
                    new
                  </span>
                )}
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 dark:text-slate-600 group-hover:text-navy dark:group-hover:text-white transition-colors" />
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xl sm:text-3xl font-bold text-navy dark:text-white leading-none">
                {summary?.totalLeads || 0}
              </p>
              <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1.5 sm:mt-2 leading-snug">
                Total Leads
              </p>
            </div>
          </button>

          <div className="bg-white dark:bg-slate-800 p-3 sm:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 min-h-[110px] sm:min-h-[140px] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="p-2 sm:p-3 bg-gold/10 dark:bg-gold/20 text-gold rounded-xl">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 mt-1" />
            </div>

            <div className="mt-3">
              <p className="text-xl sm:text-3xl font-bold text-navy dark:text-white leading-none truncate">
                ₹{(summary?.totalEarnings || 0).toLocaleString()}
              </p>
              <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1.5 sm:mt-2 leading-snug">
                Total Earnings
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="border-b border-slate-100 dark:border-slate-700 flex p-1.5 gap-1.5 bg-slate-50 dark:bg-slate-900/50">
            <button
              onClick={() => setActiveTab("properties")}
              className={`flex-1 px-4 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 relative ${
                activeTab === "properties"
                  ? "bg-white dark:bg-slate-800 text-navy dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              My Properties ({myRooms.length})
              {needsCorrectionCount > 0 && (
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex-1 px-4 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 ${
                activeTab === "bookings"
                  ? "bg-white dark:bg-slate-800 text-navy dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Booking Requests ({myBookings.length})
            </button>
          </div>

          {activeTab === "properties" ? (
            myRooms.length > 0 ? (
              <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {myRooms.map((room) => {
                  const needsCorrection =
                    room.reviewStatus?.toUpperCase() === "NEEDS_CORRECTION";
                  return (
                    <div
                      key={room.id}
                      className={
                        needsCorrection
                          ? "bg-orange-50/40 dark:bg-orange-900/10"
                          : ""
                      }
                    >
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors">
                        {/* Image & Title */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img
                              src={
                                room.images[0] ||
                                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1600"
                              }
                              alt=""
                              loading="lazy"
                              className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                            />

                            {needsCorrection && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                                <AlertCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-navy dark:text-white truncate text-sm">
                              {room.title}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {room.roomType} · {room.location}
                            </p>
                          </div>
                        </div>

                        {/* Price & Status (Mobile/Desktop) */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
                          <div className="font-semibold text-navy dark:text-white text-sm">
                            ₹{room.pricePerMonth.toLocaleString()}
                            <span className="text-xs font-normal text-slate-400">
                              /mo
                            </span>
                          </div>
                          <div>{getStatusBadge(room)}</div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 justify-end">
                          {needsCorrection ? (
                            <button
                              onClick={() => setViewingFeedback(room)}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm shadow-orange-200 dark:shadow-orange-900/30"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              View Feedback
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingRoom(room)}
                                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Edit property"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(room.id)}
                                className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border transition-all duration-200 ${
                                  room.isActive
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800"
                                    : "bg-red-50 text-red-600 border-red-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 dark:hover:border-emerald-800"
                                }`}
                                title={
                                  room.isActive
                                    ? "Deactivate property"
                                    : "Activate property"
                                }
                                aria-label={
                                  room.isActive
                                    ? "Deactivate property"
                                    : "Activate property"
                                }
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <PropertyNotesSection
                        propertyId={room.id}
                        propertyTitle={room.title}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Home className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-navy dark:text-white mb-2 font-playfair">
                  No properties yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto text-sm">
                  Start by adding your first rental listing. It only takes a few
                  minutes!
                </p>
                <button
                  onClick={openAddPropertyFlow}
                  className="px-6 py-3 bg-navy dark:bg-slate-200 text-white dark:text-navy font-semibold rounded-xl hover:bg-gold dark:hover:bg-white transition-colors"
                >
                  Add Your First Property
                </button>
              </div>
            )
          ) : myBookings.length > 0 ? (
            <div className="p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/20 min-h-[400px]">
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
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Inbox className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-navy dark:text-white mb-2 font-playfair">
                No booking requests yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
                When tenants book your properties, they will appear here.
              </p>
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl max-w-sm mx-auto border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-bold">Pro Tip:</span> Verified
                  properties get 3x more bookings. Make sure your listings are
                  complete!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
