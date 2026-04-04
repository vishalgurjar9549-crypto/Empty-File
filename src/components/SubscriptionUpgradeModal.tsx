import React, { useEffect, useState, useRef, createElement } from 'react';
import { X, CheckCircle2, Shield, Zap, Crown, ArrowRight, Eye, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { upgradeSubscription, fetchPricing, clearPricing } from '../store/slices/subscription.slice';
import { showToast } from '../store/slices/ui.slice';
import axiosInstance from '../api/axios';
import { subscriptionApi } from '../api/subscription.api';
import { Button } from './ui/Button';
interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: string;
  currentPlan: string;
  propertyId?: string;
  roomTitle?: string;
  roomPrice?: number;
  viewCount?: number;
  viewLimit?: number | null;
  todayContacts?: number;
}
const PLAN_NAMES = {
  GOLD: 'Gold',
  PLATINUM: 'Platinum'
};
/** Skeleton placeholder while pricing loads */
const PriceSkeleton = () => <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse inline-block" />;
export const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({
  isOpen,
  onClose,
  city,
  currentPlan,
  propertyId,
  roomTitle,
  roomPrice,
  viewCount,
  viewLimit,
  todayContacts = 0
}) => {
  const dispatch = useAppDispatch();
  const {
    user
  } = useAppSelector((state) => state.auth);
  const {
    pricing,
    pricingCity,
    loading: subscriptionLoading,
    error: subscriptionError
  } = useAppSelector((state) => state.subscription);
  
  const [selectedPlan, setSelectedPlan] = useState<'GOLD' | 'PLATINUM'>('GOLD');
  const [isProcessing, setIsProcessing] = useState(false);
  // ─── FIX 1: Normalize city ONCE at the top ────────────────────────────
  const normalizedCity = city?.toLowerCase().trim() || '';
  // ─── City display name (capitalize first letter) ──────────────────────
  const cityDisplayName = normalizedCity ? normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1) : '';
  // ─── STEP 4: Reset modal state when city changes ──────────────────────
  const prevCityRef = useRef(normalizedCity);
  useEffect(() => {
    if (normalizedCity && normalizedCity !== prevCityRef.current) {
      setSelectedPlan('GOLD');
      setIsProcessing(false);
      prevCityRef.current = normalizedCity;
    }
  }, [normalizedCity]);
  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     document.body.style.overflow = '';
  //   }
  //   return () => {
  //     document.body.style.overflow = '';
  //   };
  // }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;

    // store previous overflow
    const originalOverflow = document.body.style.overflow;

    // lock scroll
    document.body.style.overflow = 'hidden';
    return () => {
      // restore previous value safely
      document.body.style.overflow = originalOverflow || 'auto';
    };
  }, [isOpen]);
  // ─── FIX 2: Fetch pricing — compare normalized cities ─────────────────
  useEffect(() => {
    if (!isOpen || !normalizedCity) return;
    // Always fetch if cached pricing doesn't match this city
    if (pricingCity !== normalizedCity) {
      dispatch(fetchPricing(normalizedCity));
    }
  }, [isOpen, normalizedCity, pricingCity, dispatch]);
  useEffect(() => {
    if (!isOpen) return;
    void subscriptionApi.trackConversionEvent({
      type: 'PLAN_VIEW',
      propertyId,
      city: normalizedCity || city,
      source: roomTitle ? 'property_upgrade_modal' : 'subscription_upgrade_modal'
    }).catch(() => undefined);
  }, [isOpen, propertyId, normalizedCity, city, roomTitle]);
  if (!isOpen) return null;
  // ─── FIX 3: Derive prices — ONLY from city-matched pricing ───────────
  const isCityMatch = pricingCity === normalizedCity;
  const cityPricing = isCityMatch && Array.isArray(pricing) ? pricing : [];
  const goldPricing = cityPricing.find((p) => p.plan === 'GOLD') || null;
  const platinumPricing = cityPricing.find((p) => p.plan === 'PLATINUM') || null;
  const goldPrice = goldPricing?.price;
  const platinumPrice = platinumPricing?.price;
  // Pricing is loaded ONLY when city matches AND both prices exist
  const isPricingLoaded = isCityMatch && goldPrice !== undefined && platinumPrice !== undefined;
  // ─── FIX 4: Detect error state — city matched but no pricing returned ─
  const isPricingLoading = subscriptionLoading && !isPricingLoaded;
  const isPricingError = !subscriptionLoading && isCityMatch && cityPricing.length === 0;
  // ─── Remaining unlocks — ONLY for FREE plan ───────────────────────────
  const isFree = currentPlan === 'FREE';
  const isUnlimitedPlan = viewLimit === null || viewLimit === undefined;
  const remaining = isFree && !isUnlimitedPlan && viewLimit != null && viewCount != null ? Math.max(0, viewLimit - viewCount) : null;
  const displayTodayContacts = Math.max(1, todayContacts || 0);
  // Calculate brokerage savings anchor
  const brokerageSavings = roomPrice ? Math.round(roomPrice * 0.5) : 15000;
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  // ─── Payment handler — uses normalizedCity throughout ─────────────────
  const handleUpgrade = async () => {
    try {
      setIsProcessing(true);
      // Block payment if pricing doesn't match city
      if (!normalizedCity || !isPricingLoaded) {
        dispatch(showToast({
          message: !normalizedCity ? 'City is required' : 'Pricing not loaded yet',
          type: 'error'
        }));
        setIsProcessing(false);
        return;
      }
      void subscriptionApi.trackConversionEvent({
        type: 'PLAN_PURCHASE_CLICK',
        propertyId,
        city: normalizedCity,
        plan: selectedPlan,
        source: roomTitle ? 'property_upgrade_modal' : 'subscription_upgrade_modal'
      }).catch(() => undefined);
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        dispatch(showToast({
          message: 'Failed to load payment gateway',
          type: 'error'
        }));
        setIsProcessing(false);
        return;
      }
      // ✅ City locked to property — always send normalized city
      const orderResponse = await dispatch(upgradeSubscription({
        plan: selectedPlan,
        city: normalizedCity
      })).unwrap();
      if (!orderResponse.orderId) {
        throw new Error('Failed to create order');
      }
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID!,
        amount: orderResponse.amount,
        currency: 'INR',
        name: 'Room Rental Platform',
        description: `${PLAN_NAMES[selectedPlan]} Plan - ${cityDisplayName}`,
        order_id: orderResponse.orderId,
        handler: async (response: any) => {
          try {
            const verifyResponse = await axiosInstance.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyResponse.data.success) {
              dispatch(showToast({
                message: 'Subscription upgraded successfully!',
                type: 'success'
              }));
              onClose();
              window.location.reload();
            } else {
              throw new Error(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (error: any) {
            dispatch(showToast({
              message: error.response?.data?.message || error.message || 'Payment verification failed',
              type: 'error'
            }));
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#C8A45D'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            dispatch(showToast({
              message: 'Payment cancelled',
              type: 'info'
            }));
          }
        }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Upgrade error:', error);
      dispatch(showToast({
        message: error.message || 'Failed to initiate payment',
        type: 'error'
      }));
      setIsProcessing(false);
    }
  };
  // ─── Retry handler for error state ────────────────────────────────────
  const handleRetryPricing = () => {
    if (normalizedCity) {
      dispatch(fetchPricing(normalizedCity));
    }
  };
  return <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
        {/* Header with Value Stack */}
        <div className="bg-[#1E293B] p-6 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>

          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-full" disabled={isProcessing}>

            <X size={20} />
          </button>

          <div className="relative z-10">
            {roomTitle && <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-gold border border-gold/20">
                <Shield className="w-3 h-3" />
                Verified Property
              </div>}

            <h2 className="text-2xl font-playfair font-bold mb-2 leading-tight">
              {user?.name ? `${user.name.split(' ')[0]}, you` : 'You'} were
              about to contact the owner
            </h2>

            {roomTitle && <p className="text-slate-300 text-sm mb-6 line-clamp-1">
                of <span className="text-white font-medium">{roomTitle}</span>
              </p>}

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-green-500/20 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm font-medium">
                  Save approx.{' '}
                  <span className="text-gold font-bold">
                    ₹{brokerageSavings.toLocaleString()}
                  </span>{' '}
                  in brokerage
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 bg-green-500/20 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm font-medium">
                  Talk directly to verified owners
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 bg-green-500/20 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm font-medium">
                  Get responses 2x faster
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="p-6 overflow-y-auto">
          {/* City-bound header */}
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Plans for {cityDisplayName}
          </p>

          {todayContacts > 2 && <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
              <Zap className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <p className="text-sm text-rose-800 dark:text-rose-300">
                🔥 This property is getting contacted frequently. Don&apos;t miss
                out — unlock now.
              </p>
            </div>}

          {/* Remaining unlocks — ONLY for FREE plan */}
          {remaining !== null && isFree && <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              {remaining > 0 ? <p className="text-sm text-amber-800 dark:text-amber-300">
                  You have <span className="font-bold">{remaining}</span> free
                  unlock{remaining !== 1 ? 's' : ''} remaining in{' '}
                  {cityDisplayName}
                </p> : <p className="text-sm text-amber-800 dark:text-amber-300">
                  🚀 You&apos;ve used your free contacts. This property is in
                  demand — unlock more to continue.
                </p>}
            </div>}

          {todayContacts > 2 && <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              🔥 {displayTodayContacts} people already contacted this owner.
            </p>}

          {/* Loading state with city-specific message */}
          {isPricingLoading && <div className="mb-4 text-center py-2">
              <p className="text-xs text-slate-400 dark:text-slate-500 animate-pulse">
                Loading plans for {cityDisplayName}...
              </p>
            </div>}

          {/* FIX 4: Error fallback — no infinite skeleton */}
          {isPricingError && <div className="mb-4 flex items-center gap-2 px-3 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Pricing unavailable for {cityDisplayName}
                </p>
              </div>
              <button onClick={handleRetryPricing} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex-shrink-0">

                Retry
              </button>
            </div>}

          <div className="space-y-4">
            {/* Gold Plan */}
            <div className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${selectedPlan === 'GOLD' ? 'border-gold bg-gold/5 dark:bg-gold/10 shadow-md shadow-gold/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`} onClick={() => setSelectedPlan('GOLD')}>

              {selectedPlan === 'GOLD' && <div className="absolute -top-3 right-4 bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                  Most Popular
                </div>}

              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${selectedPlan === 'GOLD' ? 'bg-gold text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>

                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Gold Plan
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {isPricingLoaded ? `₹${goldPrice!.toLocaleString()}` : <PriceSkeleton />}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 ml-9">
                Unlimited property views & owner contacts
              </p>
            </div>

            {/* Platinum Plan */}
            <div className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${selectedPlan === 'PLATINUM' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md shadow-purple-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`} onClick={() => setSelectedPlan('PLATINUM')}>

              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${selectedPlan === 'PLATINUM' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>

                    <Crown className="w-4 h-4 fill-current" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Platinum Plan
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {isPricingLoaded ? `₹${platinumPrice!.toLocaleString()}` : <PriceSkeleton />}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 ml-9">
                Unlimited views + Priority Support + Relationship Manager
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 shrink-0">
          <Button onClick={handleUpgrade} disabled={isProcessing || !isPricingLoaded} fullWidth size="lg" className="bg-[#1E293B] hover:bg-[#0F172A] text-white shadow-xl shadow-navy/20 mb-3 group">

            {isProcessing ? 'Processing...' : !isPricingLoaded ? 'Loading...' : <span className="flex items-center gap-2">
                Continue Your Search Without Limits{' '}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>}
          </Button>

          <div className="flex items-center justify-center gap-4 flex-wrap text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">
            <span>Cancel Anytime</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Secure Payment</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>No Hidden Fees</span>
          </div>
        </div>
      </div>
    </div>;
};
