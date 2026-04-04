import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Check,
  Shield,
  Wifi,
  Car,
  Coffee,
  Wind,
  Tv,
  Phone,
  Mail,
  Lock,
  Crown,
  Clock,
  CheckCircle2,
  ChevronRight,
  Share2,
  Heart,
  ArrowRight,
  Zap,
  X,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchRoomById, clearCurrentRoom } from "../store/slices/rooms.slice";
import {
  fetchVisibility,
  clearVisibility,
} from "../store/slices/subscription.slice";
import {
  fetchReviewsForRoom,
  fetchRatingStats,
  fetchUserReview,
  selectReviewsForRoom,
  selectRatingStatsForRoom,
  selectUserReviewForRoom,
} from "../store/slices/reviews.slice";
import {
  toggleFavorite,
  selectIsFavorited,
  selectIsToggling,
} from "../store/slices/favorites.slice";

import { BookingModal } from "../components/BookingModal";
import { RoomCard } from "../components/RoomCard";
import { SubscriptionGate } from "../components/SubscriptionGate";
import { SubscriptionUpgradeModal } from "../components/SubscriptionUpgradeModal";
import { UnlockProgressMeter } from "../components/UnlockProgressMeter";
import { PreLimitAlert } from "../components/PreLimitAlert";
import { DynamicMap } from "../components/DynamicMap";
import { RatingSummary } from "../components/RatingSummary";
import { ReviewForm } from "../components/ReviewForm";
import { ReviewList } from "../components/ReviewList";
import { Button } from "../components/ui/Button";
import { roomsApi } from "../api/rooms.api";
import {
  readContact,
  unlockContact,
  UnlockContactResponse,
} from "../api/contact.api";
import { DemandStats } from "../types/api.types";
import { showToast } from "../store/slices/ui.slice";
import { clearOtpRetryData, openOtpModal } from "../store/slices/otp.slice";
import { ShareModal } from "../components/ShareModal";
import { RoomDetailsSkeleton } from "../components/ui/RoomDetailsSkeleton";
import { PropertyImageGallery } from "../components/PropertyImageGallery";

const iconMap: Record<string, any> = {
  WiFi: Wifi,
  Parking: Car,
  Kitchen: Coffee,
  AC: Wind,
  TV: Tv,
};

function SectionCard({
  title,
  subtitle,
  children,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-4 px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="px-5 md:px-6 py-5">{children}</div>
    </section>
  );
}

function UnlockConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isUnlocking,
  todayContacts,
  remainingContacts,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isUnlocking: boolean;
  todayContacts: number;
  remainingContacts: number | null;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-confirm-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUnlocking) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl relative border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          disabled={isUnlocking}
          aria-label="Close unlock confirmation"
          className="absolute top-4 right-4 text-slate-500 hover:text-black dark:hover:text-white p-2 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2
          id="unlock-confirm-title"
          className="text-xl font-semibold text-slate-900 dark:text-white"
        >
          Confirm Unlock
        </h2>

        <div className="mt-5 space-y-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              🔥 {todayContacts} people already contacted
            </p>
          </div>

          {remainingContacts !== null && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                ⚠️ Only {remainingContacts} contacts left
              </p>
              {remainingContacts <= 3 && (
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mt-2">
                  🔥 Almost full — act fast before this property gets taken
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            fullWidth
            disabled={isUnlocking}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="primary"
            fullWidth
            disabled={isUnlocking}
          >
            {isUnlocking ? "Unlocking..." : "Confirm Unlock"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExitIntentModal({
  isOpen,
  onClose,
  onUnlock,
  todayContacts,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  todayContacts: number;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl relative border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          aria-label="Close exit intent modal"
          className="absolute top-4 right-4 text-slate-500 hover:text-black dark:hover:text-white p-2 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2
          id="exit-intent-title"
          className="text-xl font-semibold text-slate-900 dark:text-white"
        >
          Wait! This property is getting attention
        </h2>

        <div className="mt-5 space-y-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              🔥 {todayContacts} people already contacted
            </p>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Unlock now before it is gone.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={onClose} variant="secondary" fullWidth>
            Not Now
          </Button>
          <Button onClick={onUnlock} variant="primary" fullWidth>
            Unlock Contact
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    currentRoom: room,
    loading,
    rooms,
    error,
  } = useAppSelector((state) => state.rooms);

  const { user, authStatus } = useAppSelector((state) => state.auth);
  const { visibility } = useAppSelector((state) => state.subscription);
  const otpState = useAppSelector((state) => state.otp);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUnlockConfirmOpen, setIsUnlockConfirmOpen] = useState(false);
  const [isExitIntentOpen, setIsExitIntentOpen] = useState(false);
  const [contactData, setContactData] =
    useState<UnlockContactResponse | null>(null);
  const [contactLocked, setContactLocked] = useState<boolean | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [demandStats, setDemandStats] = useState<DemandStats | null>(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsSort, setReviewsSort] = useState<
    "latest" | "highest" | "lowest"
  >("latest");

  const reviewsState = useAppSelector(selectReviewsForRoom(id || ""));
  const statsState = useAppSelector(selectRatingStatsForRoom(id || ""));
  const userReviewState = useAppSelector(selectUserReviewForRoom(id || ""));

  const isFavorited = useAppSelector(selectIsFavorited(id || ""));
  const isTogglingFavorite = useAppSelector(selectIsToggling(id || ""));
  const hasShownExitIntentRef = useRef(false);
  const exitIntentBlockersRef = useRef({
    isUpgradeModalOpen: false,
    isUnlockConfirmOpen: false,
    isExitIntentOpen: false,
  });

  const similarRooms = useMemo(
    () =>
      rooms
        .filter((r) => r.city === room?.city && r.id !== room?.id && r.isActive)
        .slice(0, 3),
    [rooms, room?.city, room?.id]
  );

  const brokerageSavings = useMemo(
    () => (room ? Math.round(room.pricePerMonth * 0.5) : 0),
    [room?.pricePerMonth]
  );

  const viewCount = visibility?.viewCount || 0;
  const viewLimit = visibility?.viewLimit ?? 5;
  const finiteViewLimit =
    typeof visibility?.viewLimit === "number" ? visibility.viewLimit : null;
  const remainingContacts =
    finiteViewLimit !== null
      ? Math.max(finiteViewLimit - (visibility?.viewCount || 0), 0)
      : null;
  const usagePercent = viewLimit ? (viewCount / viewLimit) * 100 : 0;
  const displayTodayViews = Math.max(1, demandStats?.todayViews || 0);
  const displayTodayContacts = Math.max(1, demandStats?.todayContacts || 0);
  const isFreePlan = (visibility?.plan || "FREE") === "FREE";
  const isFreeLimitReached =
    isFreePlan && remainingContacts !== null && remainingContacts <= 0;
  const hasActivePlan =
    visibility?.planActive === true ||
    visibility?.plan === "GOLD" ||
    visibility?.plan === "PLATINUM";
  const shouldShowMultiPropertyPressure = isFreePlan && viewCount >= 5;
  const shouldShowActivityTimer =
    demandStats !== null &&
    (displayTodayContacts > 1 || displayTodayViews > 1);

  const getCtaText = useCallback(() => {
    if (isUnlocking) return "Unlocking...";
    if (remainingContacts !== null && remainingContacts <= 0) {
      return "Continue Without Limits";
    }
    return "Unlock now — high demand property";
  }, [isUnlocking, remainingContacts]);

  const getMicroSuccessMessage = useCallback(
    (newViewCount: number): { message: string; type: "success" | "info" } => {
      switch (newViewCount) {
        case 1:
          return {
            message: "Nice — you just contacted a verified owner.",
            type: "info",
          };
        case 3:
          return {
            message: "You're moving faster than most renters.",
            type: "info",
          };
        case 5:
          return {
            message: "You're on track to close a home soon.",
            type: "info",
          };
        default:
          return newViewCount % 2 === 0
            ? {
                message: "You're now connected directly with the owner.",
                type: "success",
              }
            : {
                message: "One step closer to your next home.",
                type: "info",
              };
      }
    },
    []
  );

  useEffect(() => {
    const retryData = (otpState as any).lastRetryData;
    if (retryData?.success && retryData?.data) {
      setContactData(retryData.data);
      setContactLocked(false);
      dispatch(clearOtpRetryData());
    }
  }, [otpState, dispatch]);

  useEffect(() => {
    if (!id) return;

    setContactData(null);
    setContactLocked(null);
    window.scrollTo(0, 0);

    dispatch(fetchRoomById(id));

    return () => {
      dispatch(clearCurrentRoom());
      dispatch(clearVisibility());
      setContactData(null);
      setContactLocked(null);
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (!room?.id || !room?.city || room.city === "undefined") return;

    dispatch(
      fetchVisibility({
        propertyId: room.id,
        city: room.city,
      })
    );
  }, [room?.id, room?.city, dispatch]);

  useEffect(() => {
    if (!room?.id || !room?.city || authStatus !== "AUTHENTICATED") return;

    dispatch(
      fetchVisibility({
        propertyId: room.id,
        city: room.city,
      })
    );
  }, [authStatus, room?.id, room?.city, dispatch]);

  useEffect(() => {
    if (!id) return;

    let isActive = true;
    setDemandStats(null);

    roomsApi
      .getDemandStats(id)
      .then((stats) => {
        if (isActive) {
          setDemandStats(stats);
        }
      })
      .catch(() => {
        if (isActive) {
          setDemandStats(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  const hydrateContact = useCallback(async () => {
    if (!room?.id) return;

    try {
      const result = await readContact(room.id);
      if (result.success && result.data) {
        setContactData(result.data);
        setContactLocked(false);
      }
    } catch (err) {
      console.debug("Contact hydration failed:", err);
    }
  }, [room?.id]);

  useEffect(() => {
    if (!room?.id) return;
    if (authStatus !== "AUTHENTICATED") return;
    if (!visibility) return;
    if (contactData !== null) return;

    const shouldHydrate = visibility.isUnlocked === true || hasActivePlan === true;

    if (shouldHydrate) {
      hydrateContact();
    }
  }, [room?.id, authStatus, visibility, contactData, hydrateContact, hasActivePlan]);

  useEffect(() => {
    hasShownExitIntentRef.current = false;
    setIsExitIntentOpen(false);
  }, [room?.id]);

  useEffect(() => {
    exitIntentBlockersRef.current = {
      isUpgradeModalOpen,
      isUnlockConfirmOpen,
      isExitIntentOpen,
    };
  }, [isUpgradeModalOpen, isUnlockConfirmOpen, isExitIntentOpen]);

  useEffect(() => {
    if (
      !room?.id ||
      contactData ||
      hasActivePlan ||
      visibility?.isUnlocked ||
      (authStatus === "AUTHENTICATED" && !visibility)
    ) {
      return;
    }

    const showExitIntent = () => {
      const blockers = exitIntentBlockersRef.current;
      if (
        hasShownExitIntentRef.current ||
        blockers.isUpgradeModalOpen ||
        blockers.isUnlockConfirmOpen ||
        blockers.isExitIntentOpen
      ) {
        return;
      }

      hasShownExitIntentRef.current = true;
      setIsExitIntentOpen(true);
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        showExitIntent();
      }
    };

    const handlePopState = () => {
      if (hasShownExitIntentRef.current) {
        return;
      }

      window.history.pushState(
        { roomExitIntentGuard: room.id },
        "",
        window.location.href,
      );
      showExitIntent();
    };

    window.history.pushState(
      { roomExitIntentGuard: room.id },
      "",
      window.location.href,
    );
    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [
    room?.id,
    contactData,
    hasActivePlan,
    visibility?.isUnlocked,
    authStatus,
    visibility,
  ]);

  useEffect(() => {
    if (!id) return;

    setReviewsPage(1);
    setReviewsSort("latest");

    dispatch(
      fetchReviewsForRoom({ roomId: id, page: 1, limit: 10, sort: "latest" })
    );
    dispatch(fetchRatingStats(id));

    if (authStatus === "AUTHENTICATED" && user?.userId) {
      dispatch(fetchUserReview(id));
    }
  }, [id, authStatus, user?.userId, dispatch]);

  const handleBookNow = useCallback(() => {
    if (authStatus !== "AUTHENTICATED") {
      navigate("/auth/login", {
        state: { from: `/rooms/${id}` },
      });
      return;
    }
    setIsBookingModalOpen(true);
  }, [authStatus, navigate, id]);

  const handleShare = useCallback(async () => {
    if (!room || !room.id) return;

    const shareUrl = `${window.location.origin}/rooms/${room.id}`;
    const shareTitle = room.title || "Check out this room";
    const shareText = `🏡 Check out this room in ${room.city}
₹${room.pricePerMonth?.toLocaleString?.() || room.pricePerMonth}/month • ${
      room.roomType
    }

No brokerage. Direct owner contact.

👉 ${shareUrl}`;

    try {
      const isMobileDevice = window.innerWidth < 768;

      if (isMobileDevice && navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl,
          });
          return;
        } catch (shareError: any) {
          if (shareError.name === "AbortError") return;
        }
      }

      setIsShareModalOpen(true);
    } catch (error) {
      dispatch(
        showToast({
          message: "Failed to open share options",
          type: "error",
        })
      );
    }
  }, [room, dispatch]);

  const handleToggleFavorite = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();

      if (authStatus !== "AUTHENTICATED") {
        dispatch(
          showToast({
            message: "Please log in to save favorites",
            type: "info",
          })
        );
        navigate("/auth/login", { state: { from: `/rooms/${id}` } });
        return;
      }

      if (!id || isTogglingFavorite) return;
      dispatch(toggleFavorite(id));
    },
    [authStatus, dispatch, navigate, id, isTogglingFavorite]
  );

  const performUnlockContact = useCallback(async () => {
    if (authStatus !== "AUTHENTICATED") {
      navigate("/auth/login", {
        state: { from: `/rooms/${id}` },
      });
      return;
    }

    if (!room) return;

    setIsUnlockConfirmOpen(false);
    setIsUnlocking(true);

    try {
      const result = await unlockContact(room.id);

      if (result.success && result.data) {
        setContactData(result.data);
        setContactLocked(false);

        if (result.meta?.alreadyUnlocked) {
          dispatch(
            showToast({
              message: "Owner details ready — reach out anytime.",
              type: "success",
            })
          );
        } else {
          const newViewCount = (visibility?.viewCount || 0) + 1;
          const reward = getMicroSuccessMessage(newViewCount);

          dispatch(showToast(reward));

          dispatch(
            fetchVisibility({
              propertyId: room.id,
              city: room.city,
            })
          );
        }
      } else if (result.error) {
        if (result.error.code === "PHONE_REQUIRED") {
          dispatch(
            openOtpModal({
              pendingRequest: {
                url: "/contacts/unlock",
                method: "POST",
                data: { roomId: room.id },
              } as any,
            })
          );
          setIsUnlocking(false);
          return;
        }

        if (result.error.code === "CONTACT_LIMIT_REACHED") {
          setIsUpgradeModalOpen(true);
        } else {
          dispatch(
            showToast({
              message: result.error.message,
              type: "error",
            })
          );
        }
      }
    } catch (err) {
      dispatch(
        showToast({
          message: "Failed to unlock contact",
          type: "error",
        })
      );
    } finally {
      setIsUnlocking(false);
    }
  }, [
    authStatus,
    navigate,
    id,
    room,
    visibility?.viewCount,
    dispatch,
    getMicroSuccessMessage,
  ]);

  const handleUnlockContact = useCallback(() => {
    if (authStatus !== "AUTHENTICATED") {
      navigate("/auth/login", {
        state: { from: `/rooms/${id}` },
      });
      return;
    }

    if (!room) return;
    if (isFreeLimitReached) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setIsExitIntentOpen(false);
    setIsUnlockConfirmOpen(true);
  }, [authStatus, navigate, id, room, isFreeLimitReached]);

  if (!id) return null;

  if (loading.fetch || (!room && id && !error)) {
    return <RoomDetailsSkeleton />;
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Property Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            The property you are looking for might have been removed or is
            temporarily unavailable.
          </p>
          <Link to="/rooms">
            <Button variant="primary">Browse All Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 pb-24 lg:pb-0">
      <BookingModal
        room={room}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        room={room}
      />

      <SubscriptionUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        city={room.city}
        currentPlan={visibility?.plan || "FREE"}
        propertyId={room.id}
        roomTitle={room.title}
        roomPrice={room.pricePerMonth}
        viewCount={visibility?.viewCount}
        viewLimit={visibility?.viewLimit}
        todayContacts={displayTodayContacts}
      />

      <UnlockConfirmModal
        isOpen={isUnlockConfirmOpen}
        onClose={() => setIsUnlockConfirmOpen(false)}
        onConfirm={performUnlockContact}
        isUnlocking={isUnlocking}
        todayContacts={displayTodayContacts}
        remainingContacts={remainingContacts}
      />

      <ExitIntentModal
        isOpen={isExitIntentOpen}
        onClose={() => setIsExitIntentOpen(false)}
        onUnlock={handleUnlockContact}
        todayContacts={displayTodayContacts}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 mb-5 text-sm text-slate-500 dark:text-slate-400">
          <Link
            to="/rooms"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Properties
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span>{room.city}</span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-slate-900 dark:text-white truncate max-w-[220px] font-medium">
            {room.title}
          </span>
        </div>

        {/* Mobile Actions */}
        <div className="flex justify-end gap-2 mb-4 md:hidden">
          <button
            className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              isFavorited
                ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Gallery */}
        <PropertyImageGallery
          images={room.images || []}
          title={room.title}
          isVerified={room.isVerified}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mt-8">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero */}
            <div className="pb-8 border-b border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {room.title}
                </h1>

                <div className="hidden md:flex gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                    className={`p-2.5 rounded-full transition-colors ${
                      isFavorited
                        ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-gold" />
                  {room.location}, {room.landmark}
                </span>

                <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />

                <span className="flex items-center gap-1.5 font-medium">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span className="text-slate-900 dark:text-white font-bold">
                    {room.rating}
                  </span>
                  <span className="underline underline-offset-4">
                    ({room.reviewsCount} reviews)
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs font-semibold uppercase tracking-wide border border-slate-200 dark:border-slate-700">
                  {room.roomType}
                </span>

                <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold uppercase tracking-wide border border-amber-200 dark:border-amber-500/20">
                  Ideal for {room.idealFor.join(", ")}
                </span>
              </div>
            </div>

            {/* About */}
            <SectionCard
              title="About this place"
              subtitle="Overview and property details"
            >
              <p className="text-base md:text-[15px] text-slate-600 dark:text-slate-300 leading-7">
                {room.description}
              </p>
            </SectionCard>

            {/* Amenities */}
            <SectionCard
              title="Amenities"
              subtitle="What this property offers"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities.map((amenity, i) => {
                  const Icon = iconMap[amenity] || Check;

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 px-4 py-3"
                    >
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <Icon className="w-4 h-4 text-gold" />
                      </div>
                      <span className="font-medium text-sm text-slate-700 dark:text-slate-200">
                        {amenity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Owner Contact */}
            <section id="contact-owner" className="scroll-mt-24">
              <SectionCard
                title="Owner Contact"
                subtitle="Unlock direct contact and exact location"
              >
                {contactData ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            Contact unlocked
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            You can now contact the owner directly
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-1 text-xs font-medium">
                        <Crown className="w-3.5 h-3.5" />
                        Premium Access
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                          Owner Name
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {contactData.ownerName}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                          Phone Number
                        </p>
                        <a
                          href={`tel:${contactData.ownerPhone}`}
                          className="font-semibold text-slate-900 dark:text-white hover:text-gold inline-flex items-center gap-2"
                        >
                          {contactData.ownerPhone}
                          <Phone className="w-4 h-4 opacity-60" />
                        </a>
                      </div>

                      <div className="sm:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                          Email Address
                        </p>
                        <a
                          href={`mailto:${contactData.ownerEmail}`}
                          className="font-semibold text-slate-900 dark:text-white hover:text-gold inline-flex items-center gap-2 break-all"
                        >
                          {contactData.ownerEmail}
                          <Mail className="w-4 h-4 opacity-60" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          icon: Zap,
                          title: "No Brokerage",
                          desc: `Save ~₹${brokerageSavings.toLocaleString()}`,
                        },
                        {
                          icon: CheckCircle2,
                          title: "Direct Owner",
                          desc: "Talk directly with the owner",
                        },
                        {
                          icon: Lock,
                          title: "Secure Access",
                          desc: "Protected and verified details",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4"
                        >
                          <item.icon className="w-5 h-5 text-gold mb-3" />
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    {demandStats && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            🔥 {displayTodayContacts} people contacted this owner
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            👀 {displayTodayViews} people viewed today
                          </p>
                        </div>
                      </div>
                    )}

                    {visibility && (
                      <div className="space-y-3">
                        <PreLimitAlert
                          viewCount={visibility.viewCount || 0}
                          viewLimit={visibility.viewLimit ?? 5}
                          userName={user?.name?.split(" ")[0]}
                          onUpgrade={() => setIsUpgradeModalOpen(true)}
                        />

                        <UnlockProgressMeter
                          viewCount={visibility.viewCount || 0}
                          viewLimit={visibility.viewLimit ?? 5}
                          city={room.city}
                          plan={visibility.plan}
                        />
                      </div>
                    )}

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-gold mt-0.5" />
                        <div>
                          {isFreeLimitReached ? (
                            <>
                              <p className="font-medium text-slate-900 dark:text-white">
                                🔥 This property is getting high interest
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                🚀 You&apos;ve used all free contacts
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                Unlock more to continue contacting owners.
                              </p>
                              <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mt-2">
                                This property is in demand — unlock more to continue
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-slate-900 dark:text-white">
                                Unlock now — high demand property
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Get exact location, verified owner contact, and skip
                                broker calls.
                              </p>
                              {remainingContacts !== null && (
                                <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mt-2">
                                  ⚠️ Only {remainingContacts} contacts left for this plan
                                </p>
                              )}
                              {remainingContacts !== null && remainingContacts <= 3 && (
                                <p className="text-sm font-medium text-rose-600 dark:text-rose-300 mt-2">
                                  🔥 Almost full — act fast before this property gets taken
                                </p>
                              )}
                            </>
                          )}
                          {demandStats && demandStats.todayContacts > 2 && (
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mt-2">
                              🔥 This property is getting contacted frequently. Don&apos;t miss out — unlock now.
                            </p>
                          )}
                          {shouldShowMultiPropertyPressure && (
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                              ⚠️ You&apos;ve explored multiple properties. Unlock contacts to start connecting now.
                            </p>
                          )}
                          {shouldShowActivityTimer && (
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                              ⏳ High activity — act within 24 hours
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button
                          onClick={
                            isFreeLimitReached
                              ? () => setIsUpgradeModalOpen(true)
                              : handleUnlockContact
                          }
                          disabled={isUnlocking}
                          variant="primary"
                          fullWidth
                          size="lg"
                        >
                          {isFreeLimitReached
                            ? "View Plans"
                            : isUnlocking
                            ? "Unlocking..."
                            : getCtaText()}
                        </Button>

                        <p className="mt-3 text-xs text-center text-slate-400 dark:text-slate-500">
                          Secure • Verified • Instant Access
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>
            </section>

            {/* Map */}
            <SectionCard
              title="Location"
              subtitle="See where this property is located"
            >
              <SubscriptionGate feature="map" city={room.city}>
                <DynamicMap
                  latitude={room.latitude}
                  longitude={room.longitude}
                  title={room.title}
                  location={room.location}
                  city={room.city}
                  isUnlocked={visibility?.canViewMap === true}
                />
              </SubscriptionGate>
            </SectionCard>
          </div>

          {/* RIGHT */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 space-y-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-yellow-500" />

                <div className="flex items-end gap-2 mb-6 mt-2">
                  <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    <span className="text-gold">₹</span>
                    {room.pricePerMonth.toLocaleString()}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium mb-1.5">
                    / month
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Fully Furnished</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Security Included</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Zero Brokerage
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleBookNow}
                  fullWidth
                  size="lg"
                  className="mb-4"
                >
                  Book a Visit
                </Button>

                <p className="text-center text-xs text-slate-400">
                  You won't be charged yet
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-5">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Verified Listing
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Physically verified by our team
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Fast Response
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Owner typically replies in 2 hrs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl space-y-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  Reviews & Ratings
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  See what previous tenants are saying about this property
                </p>
              </div>
            </div>

            {statsState.loaded && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-5 md:p-6">
                <RatingSummary
                  averageRating={statsState.stats?.averageRating || 0}
                  totalReviews={statsState.stats?.totalReviews || 0}
                  ratingDistribution={statsState.stats?.ratingDistribution}
                />
              </div>
            )}

            {authStatus === "AUTHENTICATED" && user && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-5 md:p-6">
                <ReviewForm
                  roomId={id || ""}
                  isLoggedIn={authStatus === "AUTHENTICATED"}
                  hasAlreadyReviewed={!!userReviewState.review}
                  onReviewSubmitted={() => {
                    dispatch(
                      fetchReviewsForRoom({
                        roomId: id || "",
                        page: 1,
                        limit: 10,
                      })
                    );
                    dispatch(fetchRatingStats(id || ""));
                  }}
                  onLoginRequired={() => navigate("/auth/login")}
                />
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-5 md:p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {reviewsState.total === 0
                    ? "No reviews yet"
                    : `${reviewsState.total} Reviews`}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Verified user experiences and ratings
                </p>
              </div>

              <ReviewList
                reviews={reviewsState.reviews}
                total={reviewsState.total}
                page={reviewsPage}
                pages={reviewsState.pages}
                loading={reviewsState.loading}
                sort={reviewsSort}
                onPageChange={(page) => {
                  setReviewsPage(page);
                  dispatch(
                    fetchReviewsForRoom({
                      roomId: id || "",
                      page,
                      limit: 10,
                      sort: reviewsSort,
                    })
                  );
                }}
                onSortChange={(sort) => {
                  setReviewsSort(sort);
                  setReviewsPage(1);
                  dispatch(
                    fetchReviewsForRoom({
                      roomId: id || "",
                      page: 1,
                      limit: 10,
                      sort,
                    })
                  );
                }}
              />
            </div>
          </div>
        </section>

        {/* Similar */}
        {similarRooms.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  Similar Properties Nearby
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  More listings in {room.city} you may like
                </p>
              </div>

              <Link
                to="/rooms"
                className="text-gold font-semibold hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarRooms.map((r) => (
                <RoomCard key={r.id} room={r} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-4 py-3 lg:hidden z-40 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            <span className="text-gold">₹</span>
            {room.pricePerMonth.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">per month</p>
        </div>

        <Button onClick={handleBookNow} size="md" className="px-6">
          Book Visit
        </Button>
      </div>
    </div>
  );
}
