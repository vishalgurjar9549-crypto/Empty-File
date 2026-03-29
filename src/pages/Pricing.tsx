import React, { useEffect, useState, createElement } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, X, Crown, MapPin, Phone, Shield, Sparkles, Zap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPricing, fetchCurrentSubscription } from '../store/slices/subscription.slice';
import { loadCities } from '../store/slices/metadata.slice';
import { showToast } from '../store/slices/ui.slice';
import { createOrder, verifyPayment } from '../api/subscription.api';
import { PlanName } from '../types/subscription.types';
// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}
export default function Pricing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const urlCity = searchParams.get('city');
  // ✅ FIXED: Robust city initialization - reject undefined/null/empty strings
  const [selectedCity, setSelectedCity] = useState(() => {
    if (urlCity && urlCity !== 'undefined' && urlCity !== 'null' && urlCity.trim() !== '') {
      return urlCity;
    }
    return 'bangalore'; // Safe default
  });
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const {
    pricing,
    current: currentSubscription,
    subscriptions,
    loading
  } = useAppSelector((state) => state.subscription);
  const {
    cities
  } = useAppSelector((state) => state.metadata);
  const {
    user,
    authStatus
  } = useAppSelector((state) => state.auth);
  // Load cities on mount
  useEffect(() => {
    if (cities.length === 0) {
      dispatch(loadCities());
    }
  }, [dispatch, cities.length]);
  // Load pricing when city changes
  useEffect(() => {
    // ✅ FIXED: Comprehensive city validation before API call
    if (selectedCity && selectedCity !== 'undefined' && selectedCity !== 'null' && selectedCity.trim() !== '') {
      dispatch(fetchPricing(selectedCity));
    }
  }, [dispatch, selectedCity]);
  // Load current subscription on mount
  useEffect(() => {
    if (authStatus === 'AUTHENTICATED') {
      dispatch(fetchCurrentSubscription());
    }
  }, [dispatch, authStatus]);
  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  // ✅ BUSINESS RULE: Differentiate FREE vs PAID plan handling
  const handleUpgrade = async (plan: PlanName, price: number) => {
    if (authStatus !== 'AUTHENTICATED') {
      navigate('/auth/login', {
        state: {
          from: `/pricing?city=${selectedCity}`
        }
      });
      return;
    }
    // ✅ FREE plan guard - never trigger payment
    if (plan === 'FREE') {
      return;
    }
    // ✅ PART 2: Validate city before payment
    if (!selectedCity || selectedCity === 'undefined') {
      dispatch(showToast({
        message: 'Please select a valid city',
        type: 'error'
      }));
      return;
    }
    // ✅ Check if Razorpay is loaded
    if (!razorpayLoaded || !window.Razorpay) {
      dispatch(showToast({
        message: 'Payment system is loading. Please try again in a moment.',
        type: 'error'
      }));
      return;
    }
    setProcessingPlan(plan);
    try {
      console.log('Creating Razorpay order...', {
        plan,
        city: selectedCity
      });
      // ✅ CORRECT PAYLOAD: Only plan and city (backend calculates amount)
      const orderData = await createOrder({
        plan,
        city: selectedCity
      });
      console.log('Razorpay order created:', orderData);
      // Step 2: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Homilivo',
        description: `${plan} Plan - ${selectedCity}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          console.log('Payment successful:', response);
          try {
            // Step 3: Verify payment — this also upgrades subscription atomically
            const verifyResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (!verifyResult.success) {
              throw new Error(verifyResult.message || 'Payment verification failed');
            }
            dispatch(showToast({
              message: `Successfully upgraded to ${plan} plan!`,
              type: 'success'
            }));
            await dispatch(fetchCurrentSubscription());
          } catch (error: any) {
            console.error('Payment verification failed:', error);
            dispatch(showToast({
              message: error.message || 'Payment verification failed',
              type: 'error'
            }));
          } finally {
            setProcessingPlan(null);
          }
        },
        modal: {
          ondismiss: function () {
            console.log('Payment cancelled by user');
            setProcessingPlan(null);
            dispatch(showToast({
              message: 'Payment cancelled',
              type: 'error'
            }));
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#1E293B'
        }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      setProcessingPlan(null);
      dispatch(showToast({
        message: error.response?.data?.message || error.message || 'Failed to initiate payment',
        type: 'error'
      }));
    }
  };
  // ✅ Determine if plan is current — checks ALL city subscriptions
  const isCurrentPlan = (plan: string) => {
    // Check multi-city subscriptions array first
    if (subscriptions.length > 0) {
      if (plan === 'FREE') {
        // FREE is current only if no subscription exists for this city
        return !subscriptions.some((sub: any) => sub.city?.toLowerCase() === selectedCity?.toLowerCase());
      }
      return subscriptions.some((sub: any) => sub.plan === plan && sub.city?.toLowerCase() === selectedCity?.toLowerCase());
    }
    // Fallback to single current subscription
    if (!currentSubscription) return plan === 'FREE';
    if (plan === 'FREE') return currentSubscription.plan === 'FREE';
    return currentSubscription.plan === plan && currentSubscription.city === selectedCity;
  };
  // Get plan badge info
  const getPlanBadge = (planName: string) => {
    if (planName === 'FREE') {
      return {
        text: 'Free Forever',
        icon: Sparkles,
        color: 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
      };
    }
    if (planName === 'GOLD') {
      return {
        text: 'Most Popular',
        icon: Zap,
        color: 'bg-gold/5 dark:bg-gold/10 text-gold-dark dark:text-gold border border-gold/20 dark:border-gold/30'
      };
    }
    if (planName === 'PLATINUM') {
      return {
        text: 'Best Value',
        icon: Crown,
        color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
      };
    }
    return null;
  };
  return <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20 pb-20 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy dark:text-white font-playfair mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-6">
            Choose the perfect plan for your house hunting journey in
          </p>

          {/* City Selector */}
          <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-5 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <MapPin className="w-4 h-4 text-gold" />
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="bg-transparent text-navy dark:text-white font-semibold text-base outline-none cursor-pointer">

              {cities.map((city) => <option key={city.id} value={city.id} className="dark:bg-slate-800">

                  {city.name}
                </option>)}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && !pricing ? <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 animate-pulse">

                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-4"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-6"></div>
                <div className="space-y-3 mb-8">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="h-11 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>)}
          </div> : Array.isArray(pricing) && pricing.length > 0 ? <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
            {pricing.map((plan) => {
          const planName = plan.plan;
          const isCurrent = isCurrentPlan(planName);
          const isGold = planName === 'GOLD';
          const isPlatinum = planName === 'PLATINUM';
          const badge = getPlanBadge(planName);
          return <div key={planName} className={`
                    relative bg-white dark:bg-slate-800 rounded-xl border transition-all duration-200 flex flex-col
                    ${isGold ? 'border-gold/40 dark:border-gold/50 shadow-lg shadow-gold/5 md:scale-105 z-10' : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md dark:shadow-black/20'}
                  `}>

                  <div className="p-8 flex flex-col flex-1">
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-6">
                      {badge && <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${badge.color}`}>

                          <badge.icon className="w-3 h-3" />
                          {badge.text}
                        </div>}

                      {isCurrent && <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Active
                        </div>}
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-xl font-bold text-navy dark:text-white font-playfair mb-4">
                      {planName}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-semibold text-slate-600 dark:text-slate-400">
                        ₹
                      </span>
                      <span className="text-5xl font-bold text-navy dark:text-white tracking-tight">
                        {plan.price}
                      </span>
                      {plan.price > 0 && <span className="text-base text-slate-500 dark:text-slate-400 font-medium">
                          /month
                        </span>}
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                      {plan.price === 0 ? 'Perfect to get started' : `Full access in ${cities.find((c) => c.id === selectedCity)?.name || selectedCity}`}
                    </p>

                    {/* Features */}
                    <ul className="space-y-4 mb-8 flex-1">
                      {Array.isArray(plan.features) && plan.features.map((feature, i) => <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">

                            <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isGold ? 'text-gold' : isPlatinum ? 'text-purple-600 dark:text-purple-400' : 'text-navy dark:text-white'}`} />


                            <span className="leading-relaxed">{feature}</span>
                          </li>)}

                      {planName === 'FREE' && <>
                          <li className="flex items-start gap-3 text-sm text-slate-400 dark:text-slate-500">
                            <X className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">
                              Owner Contact Details
                            </span>
                          </li>
                          <li className="flex items-start gap-3 text-sm text-slate-400 dark:text-slate-500">
                            <X className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">
                              Exact Map Location
                            </span>
                          </li>
                        </>}
                    </ul>

                    {/* CTA Button */}
                    <button onClick={() => handleUpgrade(planName, plan.price)} className={`
                        w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200
                        ${isCurrent ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed' : isGold ? 'bg-gold text-white hover:bg-gold-dark shadow-md hover:shadow-lg' : isPlatinum ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg' : 'bg-navy dark:bg-slate-200 text-white dark:text-navy hover:bg-navy/90 dark:hover:bg-white shadow-md hover:shadow-lg'}
                        ${processingPlan === planName ? 'opacity-50 cursor-wait' : ''}
                      `}>

                      {processingPlan === planName ? 'Processing...' : isCurrent ? 'Current Plan' : planName === 'FREE' ? 'Free Forever' : 'Upgrade Now'}
                    </button>
                  </div>
                </div>;
        })}
          </div> : <div className="text-center py-20 mb-16">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-navy dark:text-white mb-2">
              No plans available
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Please select a city to view pricing plans.
            </p>
          </div>}

        {/* Trust Section */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-navy/5 dark:bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-navy dark:text-white" />
            </div>
            <h3 className="font-semibold text-navy dark:text-white text-base mb-2">
              Secure Payment
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              100% secure payment processing via Razorpay with bank-grade
              encryption
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-gold/10 dark:bg-gold/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-gold" />
            </div>
            <h3 className="font-semibold text-navy dark:text-white text-base mb-2">
              Instant Activation
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Get immediate access to owner contacts and property details after
              payment
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-navy dark:text-white text-base mb-2">
              Premium Support
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Dedicated 1-to-1 support team available for Platinum members
            </p>
          </div>
        </div>
      </div>
    </div>;
}