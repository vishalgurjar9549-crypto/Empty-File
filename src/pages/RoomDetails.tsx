import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Check, Shield, Wifi, Car, Coffee, Wind, Tv, Phone, Mail, Lock, Crown, Clock, CheckCircle2, ChevronRight, Share2, Heart, ArrowRight, Zap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRoomById, clearCurrentRoom } from '../store/slices/rooms.slice';
import { fetchVisibility, clearVisibility } from '../store/slices/subscription.slice';
import { fetchReviewsForRoom, fetchRatingStats, fetchUserReview, selectReviewsForRoom, selectRatingStatsForRoom, selectUserReviewForRoom } from '../store/slices/reviews.slice';
import { toggleFavorite, selectIsFavorited, selectIsToggling } from '../store/slices/favorites.slice';
import { BookingModal } from '../components/BookingModal';
import { RoomCard } from '../components/RoomCard';
import { SubscriptionGate } from '../components/SubscriptionGate';
import { SubscriptionUpgradeModal } from '../components/SubscriptionUpgradeModal';
import { UnlockProgressMeter } from '../components/UnlockProgressMeter';
import { PreLimitAlert } from '../components/PreLimitAlert';
import { MomentumBanner } from '../components/MomentumBanner';
import { DynamicMap } from '../components/DynamicMap';
import { RatingSummary } from '../components/RatingSummary';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewList } from '../components/ReviewList';
import { Button } from '../components/ui/Button';
import { readContact, unlockContact, UnlockContactResponse } from '../api/contact.api';
import { showToast } from '../store/slices/ui.slice';
import { clearOtpRetryData } from '../store/slices/otp.slice';
import { openOtpModal } from '../store/slices/otp.slice';
import { ShareModal } from '../components/ShareModal';
const iconMap: Record<string, any> = {
  WiFi: Wifi,
  Parking: Car,
  Kitchen: Coffee,
  AC: Wind,
  TV: Tv
};
export function RoomDetails() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // Redux State
  const {
    currentRoom: room,
    loading,
    rooms,
    error
  } = useAppSelector((state) => state.rooms);
  const {
    user,
    authStatus
  } = useAppSelector((state) => state.auth);
  const {
    visibility
  } = useAppSelector((state) => state.subscription);
  // Local State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [contactData, setContactData] = useState<UnlockContactResponse | null>(null);
  const [contactLocked, setContactLocked] = useState<boolean | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsSort, setReviewsSort] = useState<'latest' | 'highest' | 'lowest'>('latest');

  // ✅ Redux State - Reviews
  const reviewsState = useAppSelector(selectReviewsForRoom(id || ''));
  const statsState = useAppSelector(selectRatingStatsForRoom(id || ''));
  const userReviewState = useAppSelector(selectUserReviewForRoom(id || ''));

  // ✅ Redux State - Favorites
  const isFavorited = useAppSelector(selectIsFavorited(id || ''));
  const isTogglingFavorite = useAppSelector(selectIsToggling(id || ''));

  // Derived State - Memoized to prevent unnecessary recalculations
  const similarRooms = useMemo(() => 
    rooms.filter((r) => r.city === room?.city && r.id !== room?.id && r.isActive).slice(0, 3),
    [rooms, room?.city, room?.id]
  );
  const brokerageSavings = useMemo(() => 
    room ? Math.round(room.pricePerMonth * 0.5) : 0,
    [room?.pricePerMonth]
  );
  const viewCount = visibility?.viewCount || 0;
  const viewLimit = visibility?.viewLimit || 10;
  const usagePercent = viewLimit ? viewCount / viewLimit * 100 : 0;
  // ✅ OPTIMIZATION: Memoize CTA text calculation
  const getCtaText = useCallback(() => {
    if (isUnlocking) return 'Unlocking...';
    if (usagePercent >= 80) return 'Continue Your Search Without Limits';
    if (user?.name && viewCount >= 3) return `${user.name.split(' ')[0]}, Get This Owner's Contact`;
    return 'Contact Owner Instantly — No Broker';
  }, [isUnlocking, usagePercent, user?.name, viewCount]);

  // ✅ OPTIMIZATION: Memoize success message calculation
  const getMicroSuccessMessage = useCallback((newViewCount: number): {
    message: string;
    type: 'success' | 'info';
  } => {
    switch (newViewCount) {
      case 1:
        return {
          message: 'Nice — you just contacted a verified owner.',
          type: 'info'
        };
      case 3:
        return {
          message: "You're moving faster than most renters.",
          type: 'info'
        };
      case 5:
        return {
          message: "You're on track to close a home soon.",
          type: 'info'
        };
      default:
        return newViewCount % 2 === 0 ? {
          message: "You're now connected directly with the owner.",
          type: 'success'
        } : {
          message: 'One step closer to your next home.',
          type: 'info'
        };
    }
  }, []);
  const otpState = useAppSelector((state) => state.otp);
  useEffect(() => {
    const retryData = (otpState as any).lastRetryData;
    if (retryData?.success && retryData?.data) {
      setContactData(retryData.data);
      setContactLocked(false);

      // ✅ IMPORTANT: clear it after using
      dispatch(clearOtpRetryData());
    }
  }, [otpState, dispatch]);

  // ✅ OPTIMIZATION: Combined reset + parallel API fetch
  // When room ID changes, reset state AND fetch room + visibility in PARALLEL
  useEffect(() => {
    if (!id) return;

    // Reset local state
    setContactData(null);
    setContactLocked(null);
    setActiveImageIndex(0);
    window.scrollTo(0, 0);

    // 🚀 PARALLEL FETCH: Fetch room data
    // Note: We fetch room first without city, then visibility will be triggered
    // by the room data when it arrives
    dispatch(fetchRoomById(id));

    // Cleanup function
    return () => {
      dispatch(clearCurrentRoom());
      dispatch(clearVisibility());
      setContactData(null);
      setContactLocked(null);
    };
  }, [id, dispatch]);

  // ✅ OPTIMIZATION: Separate effect for visibility that runs immediately after room data
  // This allows visibility to fetch as soon as room.id + room.city are available
  // Previously, this was blocked by sequential rendering
  useEffect(() => {
    if (!room?.id || !room?.city || room.city === 'undefined') return;

    // Fetch visibility data in parallel with any other operations
    dispatch(fetchVisibility({
      propertyId: room.id,
      city: room.city
    }));
  }, [room?.id, room?.city, dispatch]);

  // ✅ AUTHENTICATION: Re-fetch visibility when user logs in
  // When user authenticates, we need fresh visibility data to check subscription status
  useEffect(() => {
    if (!room?.id || !room?.city || authStatus !== 'AUTHENTICATED') return;

    // User just logged in - refresh visibility to check plan status
    dispatch(fetchVisibility({
      propertyId: room.id,
      city: room.city
    }));
  }, [authStatus, room?.id, room?.city, dispatch]);

  // ✅ CONDITIONAL CONTACT HYDRATION: Fetch contact for already-unlocked properties or paid users
  // This replaces the old "auto-fetch contact on every page load" with a smarter approach:
  // Only fetch if:
  //   1. User is authenticated
  //   2. Room is loaded
  //   3. Visibility is loaded (so we know if unlocked or has plan)
  //   4. Contact is not already fetched (contactData is null but should be fetched)
  //   5. User's unlock status or plan is active
  const hydrateContact = useCallback(async () => {
    if (!room?.id) return;

    try {
      const result = await readContact(room.id);
      if (result.success && result.data) {
        setContactData(result.data);
        setContactLocked(false);
      }
    } catch (err) {
      // Silently fail - contact will show lock UI, user can unlock manually
      console.debug('Contact hydration failed:', err);
    }
  }, [room?.id]);

  useEffect(() => {
    // Guard: Only hydrate if conditions are met
    if (!room?.id) return;
    if (authStatus !== 'AUTHENTICATED') return;
    if (!visibility) return; // Waiting for visibility to load
    if (contactData !== null) return; // Already hydrated

    // Only hydrate if user has already unlocked this property OR has active plan
    const shouldHydrate = visibility.isUnlocked === true || visibility.planActive === true;

    if (shouldHydrate) {
      hydrateContact();
    }
  }, [room?.id, authStatus, visibility, contactData, hydrateContact]);

  // ✅ FETCH REVIEWS: Load reviews and stats when room becomes available
  // Reviews are independent of subscription status - everyone can see them
  // But only logged-in users can submit reviews
  useEffect(() => {
    if (!id) return;

    // Reset reviews page when room changes
    setReviewsPage(1);
    setReviewsSort('latest');

    // Fetch reviews, stats, and user's review (if logged in)
    dispatch(fetchReviewsForRoom({ roomId: id, page: 1, limit: 10, sort: 'latest' }));
    dispatch(fetchRatingStats(id));

    if (authStatus === 'AUTHENTICATED' && user?.userId) {
      dispatch(fetchUserReview(id));
    }
  }, [id, authStatus, user?.userId, dispatch]);

  // ✅ OPTIMIZATION: Memoize click handlers
  const handleBookNow = useCallback(() => {
    if (authStatus !== 'AUTHENTICATED') {
      navigate('/auth/login', {
        state: {
          from: `/rooms/${id}`
        }
      });
      return;
    }
    setIsBookingModalOpen(true);
  }, [authStatus, navigate, id]);

  // ✅ OPTIMIZATION: Memoize share handler
  // Dependencies: [room] only - better closure capture for room data
  const handleShare = useCallback(async () => {
    // ✅ GUARD #1: Room must be loaded before sharing
    if (!room || !room.id) {
      console.warn('Share failed: Room data not loaded');
      return;
    }

    const shareUrl = `${window.location.origin}/rooms/${room.id}`;
    const shareTitle = room.title || 'Check out this room';
    const shareText = `🏡 Check out this room in ${room.city}
₹${room.pricePerMonth?.toLocaleString?.() || room.pricePerMonth}/month • ${room.roomType}

No brokerage. Direct owner contact.

👉 ${shareUrl}`;

    try {
      // ✅ MOBILE OPTIMIZATION: Use native Web Share API on mobile devices only
      // Detect mobile: window.innerWidth < 768 (Tailwind's md breakpoint)
      const isMobileDevice = window.innerWidth < 768;
      
      if (isMobileDevice && navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
          });
          return; // Success - user shared via native interface
        } catch (shareError: any) {
          // ✅ Mobile user cancelled or error occurred
          // If AbortError (user cancelled), exit gracefully
          if (shareError.name === 'AbortError') {
            return;
          }
          // Other errors fall through to ShareModal fallback
          console.debug('Mobile Web Share API failed, using ShareModal:', shareError);
        }
      }

      // ✅ DEFAULT: Open ShareModal for all other cases
      // - Desktop users (always)
      // - Mobile users without Web Share API support
      // - Mobile users where Web Share API failed
      setIsShareModalOpen(true);

    } catch (error) {
      console.error('Share handler error:', error);
      dispatch(showToast({
        message: 'Failed to open share options',
        type: 'error'
      }));
    }
  }, [room, dispatch]);

if(isShareModalOpen){
  return(
    <ShareModal
  isOpen={isShareModalOpen}
  onClose={() => setIsShareModalOpen(false)}
  room={room}
/>
  )
}

  // ✅ OPTIMIZATION: Memoize unlock handler
  const handleUnlockContact = useCallback(async () => {
    // 🔐 If not logged in → redirect
    if (authStatus !== 'AUTHENTICATED') {
      navigate('/auth/login', {
        state: {
          from: `/rooms/${id}`
        }
      });
      return;
    }
    if (!room) return;
    setIsUnlocking(true);
    try {
      const result = await unlockContact(room.id);

      // ✅ SUCCESS CASE
      if (result.success && result.data) {
        setContactData(result.data);
        setContactLocked(false);
        if (result.meta?.alreadyUnlocked) {
          dispatch(showToast({
            message: 'Owner details ready — reach out anytime.',
            type: 'success'
          }));
        } else {
          const newViewCount = (visibility?.viewCount || 0) + 1;
          const reward = getMicroSuccessMessage(newViewCount);
          dispatch(showToast(reward));
          // ✅ OPTIMIZATION: Refresh visibility data after unlock
          dispatch(fetchVisibility({
            propertyId: room.id,
            city: room.city
          }));
        }
      }

      // ❌ ERROR CASE
      else if (result.error) {
        // 🟡 PHONE NOT ADDED → open OTP modal with retry request
        if (result.error.code === 'PHONE_REQUIRED') {
          dispatch(openOtpModal({
            pendingRequest: {
              url: '/contacts/unlock',
              method: 'POST',
              data: {
                roomId: room.id
              }
            } as any
          }));
          setIsUnlocking(false);
          return;
        }

        // 🔴 LIMIT REACHED → upgrade modal
        if (result.error.code === 'CONTACT_LIMIT_REACHED') {
          setIsUpgradeModalOpen(true);
        } else {
          dispatch(showToast({
            message: result.error.message,
            type: 'error'
          }));
        }
      }
    } catch (err) {
      dispatch(showToast({
        message: 'Failed to unlock contact',
        type: 'error'
      }));
    } finally {
      setIsUnlocking(false);
    }
  }, [authStatus, navigate, id, room, visibility?.viewCount, room?.city, dispatch, getMicroSuccessMessage]);
  // ✅ OPTIMIZATION: Don't block entire page on loading
  // Show error only if we definitively can't load the room
  if (error || (!loading.fetch && !room && id)) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-slate-950 ">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-navy dark:text-white mb-2">
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
      </div>;
  }
  
  // ✅ If no room ID provided, return null (early guard)
  if (!id || !room) return null;
  return <div className="min-h-screen bg-white dark:bg-slate-950 p-2 transition-colors duration-300">
      <BookingModal room={room} isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />


      <SubscriptionUpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} city={room.city} currentPlan={visibility?.plan || 'FREE'} roomTitle={room.title} roomPrice={room.pricePerMonth} viewCount={visibility?.viewCount} viewLimit={visibility?.viewLimit} />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <Link to="/rooms" className="hover:text-navy dark:hover:text-white transition-colors">

            Properties
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="capitalize hover:text-navy dark:hover:text-white transition-colors cursor-pointer">
            {room.city}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-navy dark:text-white truncate max-w-[200px] font-semibold">
            {room.title}
          </span>
        </div>

        {/* Header Actions (Mobile) */}
        <div className="flex justify-end gap-2 mb-4 md:hidden">
          <button className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={handleShare}> 
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              if (authStatus !== 'AUTHENTICATED') {
                dispatch(showToast({ message: '📋 Please log in to save favorites', type: 'info' }));
                navigate('/auth/login', { state: { from: `/rooms/${id}` } });
                return;
              }
              dispatch(toggleFavorite(id || ''));
            }}
            disabled={isTogglingFavorite}
            className={`p-2.5 rounded-full transition-colors ${
              isFavorited
                ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500'
            } ${isTogglingFavorite ? 'opacity-60' : ''}`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* 1. IMAGE GALLERY */}
        <div className="mb-8 md:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-sm">
            {/* Main Image */}
            <div className="md:col-span-8 h-full relative group">
              <img src={room.images?.[activeImageIndex] || room.images?.[0]} alt={room.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer" loading="lazy" />

              {room.isVerified && <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm z-10">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-bold text-navy dark:text-white uppercase tracking-wider">
                    Verified
                  </span>
                </div>}
            </div>

            {/* Side Images (Desktop) */}
            <div className="hidden md:grid md:col-span-4 grid-rows-2 gap-4 h-full">
              {room.images.slice(1, 3).map((img, idx) => <div key={idx} className="relative h-full overflow-hidden group cursor-pointer" onClick={() => setActiveImageIndex(idx + 1)}>

                  <img src={img} alt={`${room.title} ${idx + 2}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>)}
            </div>
          </div>

          {/* Thumbnails (Mobile Scroll) */}
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2 md:hidden no-scrollbar">
            {room.images.map((img, idx) => <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-gold ring-2 ring-gold/20' : 'border-transparent opacity-70'}`}>

                <img src={img} className="w-full h-full object-cover" loading="lazy" />

              </button>)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
          {/* LEFT COLUMN (Content) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Title Block */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-8">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-navy dark:text-white leading-tight">
                  {room.title}
                </h1>
                {/* Desktop Actions */}
                <div className="hidden md:flex gap-2">
                  <button 
                    onClick={handleShare}
                    className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 active:scale-95"
                    title="Share this room"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if (authStatus !== 'AUTHENTICATED') {
                        dispatch(showToast({ message: '📋 Please log in to save favorites', type: 'info' }));
                        navigate('/auth/login', { state: { from: `/rooms/${id}` } });
                        return;
                      }
                      dispatch(toggleFavorite(id || ''));
                    }}
                    disabled={isTogglingFavorite}
                    className={`p-2.5 rounded-full transition-colors active:scale-95 ${
                      isFavorited
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500'
                    } ${isTogglingFavorite ? 'opacity-60' : ''}`}
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 mb-6">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-gold" />
                  {room.location}, {room.landmark}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />
                <span className="flex items-center gap-1.5 font-medium">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span className="text-navy dark:text-white font-bold">
                    {room.rating}
                  </span>
                  <span className="underline decoration-slate-300 underline-offset-4">
                    ({room.reviewsCount} reviews)
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 bg-navy/5 dark:bg-white/10 text-navy dark:text-white rounded-lg text-xs font-bold uppercase tracking-wider border border-navy/10 dark:border-white/10">
                  {room.roomType}
                </span>
                <span className="px-3 py-1.5 bg-gold/10 text-yellow-700 dark:text-gold rounded-lg text-xs font-bold uppercase tracking-wider border border-gold/20">
                  Ideal for {room.idealFor.join(', ')}
                </span>
              </div>
            </div>

            {/* About Section */}
            <section>
              <h3 className="text-xl md:text-2xl font-bold text-navy dark:text-white mb-4 font-playfair">
                About this place
              </h3>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                {room.description}
              </p>
            </section>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

            {/* Amenities Grid */}
            <section>
              <h3 className="text-xl md:text-2xl font-bold text-navy dark:text-white mb-6 font-playfair">
                What this place offers
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                {room.amenities.map((amenity, i) => {
                const Icon = iconMap[amenity] || Check;
                return <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 group">

                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-gold/10 transition-colors">
                        <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-gold transition-colors" />
                      </div>
                      <span className="font-medium">{amenity}</span>
                    </div>;
              })}
              </div>
            </section>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

            {/* Owner Contact Section */}
            <section className="scroll-mt-24" id="contact-owner">
              <h3 className="text-xl md:text-2xl font-bold text-navy dark:text-white mb-6 font-playfair">
                Owner Contact Details
              </h3>

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300">
                {contactData /* UNLOCKED STATE */ ? <div className="bg-white dark:bg-slate-800 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-navy dark:text-white">
                          Unlocked Successfully
                        </h3>
                        <p className="text-sm text-slate-500">
                          You can now contact the owner directly.
                        </p>
                      </div>
                      <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-yellow-700 dark:text-gold text-xs font-bold rounded-full border border-gold/20">
                        <Crown className="w-3.5 h-3.5" /> Premium Access
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">
                          Owner Name
                        </p>
                        <p className="text-lg font-bold text-navy dark:text-white">
                          {contactData.ownerName}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">
                          Phone Number
                        </p>
                        <a href={`tel:${contactData.ownerPhone}`} className="text-lg font-bold text-navy dark:text-white hover:text-gold transition-colors flex items-center gap-2">

                          {contactData.ownerPhone || 'Not available'}
                          <Phone className="w-4 h-4 opacity-50" />
                        </a>
                      </div>
                      <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">
                          Email Address
                        </p>
                        <a href={`mailto:${contactData.ownerEmail}`} className="text-lg font-bold text-navy dark:text-white hover:text-gold transition-colors flex items-center gap-2">

                          {contactData.ownerEmail}
                          <Mail className="w-4 h-4 opacity-50" />
                        </a>
                      </div>
                    </div>
                  </div> : <div className="relative bg-white dark:bg-slate-800">
                    <div className="h-1.5 w-full bg-gradient-to-r from-gold via-yellow-400 to-gold" />
                    <div className="p-6 md:p-10">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-600 shadow-lg">
                              <span className="text-3xl md:text-4xl select-none filter blur-[6px]">
                                👤
                              </span>
                            </div>
                            <div className="absolute bottom-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm">
                              ONLINE
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg md:text-xl font-bold text-navy dark:text-white filter blur-[4px] select-none">
                                R***** S*****
                              </h3>
                              <Shield className="w-5 h-5 text-green-500 fill-current" />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Clock className="w-4 h-4 text-gold" />
                              <span>
                                Typically replies in{' '}
                                <span className="font-bold text-navy dark:text-white">
                                  2 hrs
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                        {[{
                      icon: Zap,
                      label: 'Zero Brokerage',
                      sub: `Save ~₹${brokerageSavings.toLocaleString()}`,
                      color: 'text-green-600',
                      bg: 'bg-green-100'
                    }, {
                      icon: CheckCircle2,
                      label: 'Direct Access',
                      sub: 'Connect with owner',
                      color: 'text-blue-600',
                      bg: 'bg-blue-100'
                    }, {
                      icon: Lock,
                      label: 'Privacy Safe',
                      sub: 'Secure connection',
                      color: 'text-purple-600',
                      bg: 'bg-purple-100'
                    }].map((item, i) => <div key={i} className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center">

                            <div className={`w-10 h-10 ${item.bg} dark:bg-opacity-20 rounded-full flex items-center justify-center mb-3 ${item.color} dark:text-opacity-90`}>

                              <item.icon className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-navy dark:text-white text-sm mb-1">
                              {item.label}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {item.sub}
                            </p>
                          </div>)}
                      </div>

                      <div className="text-center max-w-md mx-auto">
                        {visibility && <PreLimitAlert viewCount={visibility.viewCount || 0} viewLimit={visibility.viewLimit || 10} userName={user?.name?.split(' ')[0]} onUpgrade={() => setIsUpgradeModalOpen(true)} />}
                        {visibility && <MomentumBanner viewCount={visibility.viewCount || 0} userName={user?.name} />}
                        {visibility && <UnlockProgressMeter viewCount={visibility.viewCount || 0} viewLimit={visibility.viewLimit || 10} city={room.city} plan={visibility.plan} />}

                        <h4 className="text-lg md:text-xl font-bold text-navy dark:text-white mb-2 font-playfair mt-6">
                          Unlock Exact Location & Owner Contact
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                          Upgrade to premium to view the exact map location and
                          connect directly with the owner.
                        </p>
                        <Button onClick={handleUnlockContact} disabled={isUnlocking} variant="primary" fullWidth size="lg" className="shadow-lg shadow-gold/20">

                          {isUnlocking ? 'Unlocking...' : getCtaText()}
                        </Button>

                        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
                          <Shield className="w-3 h-3" />Secure • Instant
                          Access • Verified Owner
                        </p>
                      </div>
                    </div>
                  </div>}
              </div>
            </section>

            {/* Map Section */}
            {/* ✅ OPTIMIZATION: Only render map if user has map access (paid or unlocked)
                The map component will lazy-load Mapbox only when needed */}
            <section>
              <h3 className="text-xl md:text-2xl font-bold text-navy dark:text-white mb-6 font-playfair">
                Where you'll be
              </h3>
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
            </section>
          </div>

          {/* RIGHT COLUMN (Sticky Booking Card) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-black/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-yellow-500" />

                <div className="flex items-end gap-2 mb-6 mt-2">
                  <span className="text-4xl font-bold text-navy dark:text-white tracking-tight">
                    <span className="text-gold">₹</span>
                    {room.pricePerMonth.toLocaleString()}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium mb-1.5">
                    / month
                  </span>
                </div>

                <div className="space-y-4 mb-8">
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
                    <span className="font-bold text-navy dark:text-white">
                      Zero Brokerage
                    </span>
                  </div>
                </div>

                <Button onClick={handleBookNow} fullWidth size="lg" className="mb-4 shadow-lg shadow-gold/20">

                  Book a Visit
                </Button>

                <p className="text-center text-xs text-slate-400">
                  You won't be charged yet
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-navy dark:text-white">
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
                      <p className="text-sm font-bold text-navy dark:text-white">
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

        {/* ⭐ REVIEWS & RATINGS SECTION */}
        <section className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white mb-12 font-playfair">
            Guest Reviews
          </h2>

          {/* Rating Summary */}
          {statsState.loaded && (
            <RatingSummary
              averageRating={statsState.stats?.averageRating || 0}
              totalReviews={statsState.stats?.totalReviews || 0}
              ratingDistribution={statsState.stats?.ratingDistribution}
            />
          )}

          {/* Review Form - Only show if user hasn't reviewed yet */}
          {authStatus === 'AUTHENTICATED' && user && (
            <ReviewForm
              roomId={id || ''}
              isLoggedIn={authStatus === 'AUTHENTICATED'}
              hasAlreadyReviewed={!!userReviewState.review}
              onReviewSubmitted={() => {
                // Refetch reviews after successful submission
                dispatch(fetchReviewsForRoom({ roomId: id || '', page: 1, limit: 10 }));
                dispatch(fetchRatingStats(id || ''));
              }}
              onLoginRequired={() => navigate('/auth/login')}
            />
          )}

          {/* Reviews List */}
          <div>
            <h3 className="text-lg font-bold text-navy dark:text-white mb-6">
              {reviewsState.total === 0 ? 'No reviews yet' : `All Reviews (${reviewsState.total})`}
            </h3>
            <ReviewList
              reviews={reviewsState.reviews}
              total={reviewsState.total}
              page={reviewsPage}
              pages={reviewsState.pages}
              loading={reviewsState.loading}
              sort={reviewsSort}
              onPageChange={(page) => {
                setReviewsPage(page);
                dispatch(fetchReviewsForRoom({ roomId: id || '', page, limit: 10, sort: reviewsSort }));
              }}
              onSortChange={(sort) => {
                setReviewsSort(sort);
                setReviewsPage(1);
                dispatch(fetchReviewsForRoom({ roomId: id || '', page: 1, limit: 10, sort }));
              }}
            />
          </div>
        </section>

        {/* Similar Rooms */}
        {similarRooms.length > 0 && <div className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-playfair">
                Similar Properties Nearby
              </h2>
              <Link to="/rooms" className="text-gold font-bold hover:underline flex items-center gap-1">

                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {similarRooms.map((r) => <RoomCard key={r.id} room={r} />)}
            </div>
          </div>}
      </div>

      {/* MOBILE BOTTOM BAR (Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-10  lg:hidden z-40 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-bottom">
        <div>
          <p className="text-lg font-bold text-navy dark:text-white">
            <span className="text-gold">₹</span>
            {room.pricePerMonth.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">per month</p>
        </div>
        <Button onClick={handleBookNow} size="md" className="px-6 shadow-md">
          Book Visit
        </Button>
      </div>
    </div>;
}