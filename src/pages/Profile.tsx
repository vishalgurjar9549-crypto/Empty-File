import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Crown,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  Save,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { profileApi } from '../api/profile.api';
import { updateUser } from '../store/slices/auth.slice';
import { fetchCurrentSubscription } from '../store/slices/subscription.slice';
import { showToast } from '../store/slices/ui.slice';

export function Profile() {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const {
    subscriptions,
    loading: subscriptionLoading,
  } = useAppSelector((state) => state.subscription);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    city?: string;
  }>({});

  // Theme tokens
  const gold = 'rgba(212,175,55,0.95)';
  const goldSoft = 'rgba(212,175,55,0.12)';
  const goldBorder = 'rgba(212,175,55,0.26)';

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || '',
      });

      if (user.role === 'tenant') {
        dispatch(fetchCurrentSubscription());
      }
    }
  }, [user, dispatch]);

  const validateForm = () => {
    const newErrors: {
      name?: string;
      phone?: string;
      city?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }

    setErrors(newErrors);

    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      const el = document.getElementById(firstErrorKey);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updatedUser = await profileApi.updateProfile(formData);
      dispatch(updateUser(updatedUser));
      dispatch(
        showToast({
          message: 'Profile updated successfully!',
          type: 'success',
        })
      );
      setIsEditing(false);
    } catch (error: any) {
      dispatch(
        showToast({
          message: error.message || 'Failed to update profile',
          type: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const paidSubscriptions = subscriptions.filter(
    (sub) => sub.plan !== 'FREE' && sub.isActive
  );

  const displaySubscriptions =
    paidSubscriptions.length > 0
      ? paidSubscriptions
      : subscriptions.filter((sub) => sub.isActive);

  const activePlan = displaySubscriptions?.[0];
  const activePlanName = activePlan?.plan || 'FREE';

  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    let score = 0;
    if (user.name) score += 25;
    if (user.email) score += 25;
    if (user.phone) score += 25;
    if (user.city) score += 25;
    return score;
  }, [user]);

  const joinedDate = useMemo(() => {
    return 'Member Account';
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-cream dark:bg-slate-950 flex items-center justify-center px-4 transition-colors duration-300">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <User className="h-6 w-6 text-slate-500 dark:text-slate-300" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Profile not available
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const getPlanStyles = (plan: string) => {
    if (plan === 'PLATINUM') {
      return {
        text: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-500/10',
        border: 'border-purple-200 dark:border-purple-800/50',
        glow: 'shadow-[0_0_0_1px_rgba(168,85,247,0.12),0_18px_50px_rgba(168,85,247,0.12)]',
      };
    }

    if (plan === 'GOLD') {
      return {
        text: 'text-yellow-700 dark:text-yellow-300',
        bg: 'bg-yellow-50 dark:bg-yellow-500/10',
        border: 'border-yellow-200 dark:border-yellow-700/40',
        glow: 'shadow-[0_0_0_1px_rgba(212,175,55,0.12),0_18px_50px_rgba(212,175,55,0.14)]',
      };
    }

    return {
      text: 'text-slate-700 dark:text-slate-300',
      bg: 'bg-slate-50 dark:bg-slate-800/80',
      border: 'border-slate-200 dark:border-slate-700',
      glow: 'shadow-[0_0_0_1px_rgba(148,163,184,0.08),0_18px_50px_rgba(15,23,42,0.08)]',
    };
  };

  const activePlanStyles = getPlanStyles(activePlanName);

  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 transition-colors duration-300">
      <div className="mx-auto w-full max-w-7xl  px-4 sm:px-6 lg:px-8 py-5 sm:py-6 md:py-8">
        {/* TOP HERO */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/50 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_28%)]" />
          <div className="relative p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 min-w-0">
                <div
                  className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-[26px] text-2xl sm:text-3xl font-bold text-slate-900 shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${gold} 0%, rgba(255,236,179,0.95) 100%)`,
                  }}
                >
                  {user.name?.[0]?.toUpperCase() || 'U'}
                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-slate-900">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/50 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      Account Overview
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${activePlanStyles.bg} ${activePlanStyles.border} ${activePlanStyles.text}`}
                    >
                      {(activePlanName === 'GOLD' || activePlanName === 'PLATINUM') && (
                        <Crown className="h-3.5 w-3.5" />
                      )}
                      {activePlanName} Plan
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold tracking-tight text-slate-900 dark:text-white break-words">
                    {user.name}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-2 capitalize">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      {user.role}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="truncate max-w-[240px] sm:max-w-none">{user.email}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 sm:grid-cols-3 gap-3 lg:w-auto lg:min-w-[420px]">
                <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Profile Score
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {profileCompletion}%
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Account Type
                  </p>
                  <p className="mt-2 text-base sm:text-lg font-semibold text-slate-900 dark:text-white capitalize">
                    {user.role}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 p-4 col-span-2 sm:col-span-1">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Status
                  </p>
                  <p className="mt-2 text-base sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    Verified
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="mt-5 sm:mt-6 grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6">
          {/* LEFT */}
          <div className="xl:col-span-8 space-y-5 sm:space-y-6">
            {/* PROFILE DETAILS */}
            <section className="rounded-[28px] border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_16px_50px_rgba(15,23,42,0.06)] overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/70 dark:border-slate-800 px-4 sm:px-6 md:px-7 py-4 sm:py-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Personal Information
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Manage your account details and contact information.
                  </p>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 text-sm font-semibold hover:scale-[1.02] transition-all duration-200"
                     style={{
                          background: `linear-gradient(135deg, ${gold} 0%, rgba(255,236,179,0.96) 100%)`,
                          boxShadow: `0 10px 30px ${goldSoft}`,
                        }}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="p-4 sm:p-6 md:p-7">
                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={<User className="h-5 w-5" />}
                      label="Full Name"
                      value={user.name || 'Not added'}
                    />
                    <InfoCard
                      icon={<Mail className="h-5 w-5" />}
                      label="Email Address"
                      value={user.email || 'Not added'}
                    />
                    <InfoCard
                      icon={<Phone className="h-5 w-5" />}
                      label="Phone Number"
                      value={user.phone || 'Not added'}
                    />
                    <InfoCard
                      icon={<MapPin className="h-5 w-5" />}
                      label="City"
                      value={user.city || 'Not added'}
                    />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        id="name"
                        label="Full Name *"
                        value={formData.name}
                        error={errors.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          setErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        placeholder="Enter your full name"
                      />

                      <InputField
                        id="phone"
                        label="Phone Number *"
                        type="tel"
                        value={formData.phone}
                        error={errors.phone}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, phone: onlyNums });
                          setErrors((prev) => ({ ...prev, phone: '' }));
                        }}
                        maxLength={10}
                        placeholder="Enter 10 digit number"
                      />

                      <div className="md:col-span-2">
                        <InputField
                          id="city"
                          label="City *"
                          value={formData.city}
                          error={errors.city}
                          onChange={(e) => {
                            setFormData({ ...formData, city: e.target.value });
                            setErrors((prev) => ({ ...prev, city: '' }));
                          }}
                          placeholder="Enter your city"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setErrors({});
                          setFormData({
                            name: user.name || '',
                            phone: user.phone || '',
                            city: user.city || '',
                          });
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-3 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-slate-900 transition-all duration-200 disabled:opacity-60 hover:scale-[1.01]"
                        style={{
                          background: `linear-gradient(135deg, ${gold} 0%, rgba(255,236,179,0.96) 100%)`,
                          boxShadow: `0 10px 30px ${goldSoft}`,
                        }}
                      >
                        <Save className="h-4 w-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* SUBSCRIPTIONS */}
            {user?.role === 'tenant' && (
              <section className="rounded-[28px] border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_16px_50px_rgba(15,23,42,0.06)] overflow-hidden">
                <div className="border-b border-slate-200/70 dark:border-slate-800 px-4 sm:px-6 md:px-7 py-4 sm:py-5">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Membership & Subscriptions
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Your active city plans and premium access details.
                  </p>
                </div>

                <div className="p-4 sm:p-6 md:p-7">
                  {subscriptionLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2].map((item) => (
                        <div
                          key={item}
                          className="h-44 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : displaySubscriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displaySubscriptions.map((subscription) => {
                        const isPlatinum = subscription.plan === 'PLATINUM';
                        const isGold = subscription.plan === 'GOLD';
                        const isFree = subscription.plan === 'FREE';

                        const styles = getPlanStyles(subscription.plan);

                        const cityName =
                          subscription.city.charAt(0).toUpperCase() +
                          subscription.city.slice(1);

                        const expiryDate = subscription.expiresAt
                          ? new Date(subscription.expiresAt).toLocaleDateString(
                              'en-IN',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              }
                            )
                          : null;

                        return (
                          <div
                            key={subscription.id}
                            className={`relative overflow-hidden rounded-[26px] border ${styles.border} ${styles.glow} bg-white dark:bg-slate-950/40`}
                          >
                            <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.9),transparent_30%)]" />
                            <div className="relative p-5 sm:p-6">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-2">
                                    Subscription Plan
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <h3
                                      className={`text-2xl font-playfair font-bold ${styles.text}`}
                                    >
                                      {subscription.plan}
                                    </h3>
                                    {(isPlatinum || isGold) && (
                                      <Crown
                                        className={`w-5 h-5 ${styles.text} fill-current`}
                                      />
                                    )}
                                  </div>
                                </div>

                                <div
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border ${styles.bg} ${styles.border} ${styles.text}`}
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  {cityName}
                                </div>
                              </div>

                              <div className="mt-5 grid grid-cols-2 gap-3">
                                <MiniStat
                                  icon={<CalendarDays className="h-4 w-4" />}
                                  label="Validity"
                                  value={expiryDate ? expiryDate : 'No expiry'}
                                />
                                <MiniStat
                                  icon={<ShieldCheck className="h-4 w-4" />}
                                  label="Status"
                                  value={subscription.isActive ? 'Active' : 'Inactive'}
                                />
                              </div>

                              <div className="mt-5">
                                <button
                                  onClick={() => {
                                    window.location.href = `/pricing?city=${subscription.city}`;
                                  }}
                                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.01]"
                                  style={{
                                    background:
                                      'linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)',
                                    color: '#fff',
                                  }}
                                >
                                  Upgrade / Change Plan
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                        <Crown className="h-6 w-6 text-slate-500 dark:text-slate-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        No active subscription
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        Upgrade your plan to unlock premium access and city-based
                        membership benefits.
                      </p>
                      <button
                        onClick={() => {
                          window.location.href = `/pricing${user.city ? `?city=${user.city}` : ''}`;
                        }}
                        className="mt-5 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-slate-900 transition-all hover:scale-[1.01]"
                        style={{
                          background: `linear-gradient(135deg, ${gold} 0%, rgba(255,236,179,0.96) 100%)`,
                        }}
                      >
                        Explore Plans
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="xl:col-span-4 space-y-5 sm:space-y-6">
            <section className="rounded-[28px] border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_16px_50px_rgba(15,23,42,0.06)] overflow-hidden">
              <div className="px-4 sm:px-6 py-5 border-b border-slate-200/70 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Account Summary
                </h3>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <SummaryRow label="Registered Email" value={user.email || 'Not added'} />
                <SummaryRow label="Phone" value={user.phone || 'Not added'} />
                <SummaryRow
                  label="City Preference"
                  value={user.city ? capitalize(user.city) : 'Not added'}
                />
                <SummaryRow label="Membership" value={activePlanName} />
                <SummaryRow label="Profile Completion" value={`${profileCompletion}%`} />
                <SummaryRow label="Account Label" value={joinedDate} />
              </div>
            </section>

            <section
              className="rounded-[28px] border backdrop-blur-xl overflow-hidden"
              style={{
                borderColor: goldBorder,
                background: `linear-gradient(180deg, rgba(212,175,55,0.10) 0%, rgba(255,255,255,0.88) 45%, rgba(255,255,255,0.96) 100%)`,
              }}
            >
              <div className="dark:hidden p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Premium Access</h3>
                    <p className="text-sm text-slate-600">Make your profile stronger</p>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600" />
                    Better trust & visibility across the platform
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600" />
                    Faster contact and improved listing access
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600" />
                    Premium plan benefits by selected city
                  </li>
                </ul>

                <button
                  onClick={() => {
                    window.location.href = `/pricing${user.city ? `?city=${user.city}` : ''}`;
                  }}
                  className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 transition-all hover:scale-[1.01]"
                  style={{
                    background: `linear-gradient(135deg, ${gold} 0%, rgba(255,236,179,0.96) 100%)`,
                  }}
                >
                  View Premium Plans
                </button>
              </div>

              <div className="hidden dark:block p-6 bg-[linear-gradient(180deg,rgba(212,175,55,0.10),rgba(15,23,42,0.92))]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Premium Access</h3>
                    <p className="text-sm text-slate-300">Make your profile stronger</p>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-slate-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400" />
                    Better trust & visibility across the platform
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400" />
                    Faster contact and improved listing access
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400" />
                    Premium plan benefits by selected city
                  </li>
                </ul>

                <button
                  onClick={() => {
                    window.location.href = `/pricing${user.city ? `?city=${user.city}` : ''}`;
                  }}
                  className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 transition-all hover:scale-[1.01]"
                  style={{
                    background: `linear-gradient(135deg, ${gold} 0%, rgba(255,236,179,0.96) 100%)`,
                  }}
                >
                  View Premium Plans
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- SMALL UI PARTS ---------- */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-4 sm:p-5 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 text-yellow-600 dark:text-yellow-400 border border-slate-200/70 dark:border-slate-700">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-1">
            {label}
          </p>
          <p className="text-sm sm:text-[15px] font-semibold text-slate-900 dark:text-white break-words">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({
  id,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`w-full rounded-2xl border px-4 py-3.5 text-sm sm:text-[15px] bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 outline-none
        ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
            : 'border-slate-200 dark:border-slate-700 focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-4 focus:ring-yellow-500/10'
        }`}
      />
      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-4">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-[0.16em]">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white break-words">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-right text-slate-900 dark:text-white break-words">
        {value}
      </span>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}