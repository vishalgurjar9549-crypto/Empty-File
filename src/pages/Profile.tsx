import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Crown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { profileApi } from '../api/profile.api';
import { updateUser } from '../store/slices/auth.slice';
import { fetchCurrentSubscription } from '../store/slices/subscription.slice';
import { showToast } from '../store/slices/ui.slice';
export function Profile() {
  const dispatch = useAppDispatch();
  const {
    user
  } = useAppSelector((state) => state.auth);
  const {
    subscriptions,
    loading: subscriptionLoading
  } = useAppSelector((state) => state.subscription);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    city?: string;
  }>({});
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone || '',
        city: user.city || ''
      });
      // Fetch subscriptions for tenants
      if (user.role === 'tenant') {
        dispatch(fetchCurrentSubscription());
      }
    }
  }, [user, dispatch]);
  if (!user) {
    return <div className="min-h-screen bg-cream dark:bg-slate-950 pt-16 md:pt-20 flex items-center justify-center transition-colors duration-300">
        <p className="text-slate-600 dark:text-slate-400">
          Please log in to view your profile.
        </p>
      </div>;
  }
  const validateForm = () => {
    const newErrors: any = {};
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

    // scroll to first error
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      const el = document.getElementById(firstErrorKey);
      el?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
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
      dispatch(showToast({
        message: 'Profile updated successfully!',
        type: 'success'
      }));
      setIsEditing(false);
    } catch (error: any) {
      dispatch(showToast({
        message: error.message || 'Failed to update profile',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };
  // Filter subscriptions: Show PAID plans only, or all if no paid plans exist
  const paidSubscriptions = subscriptions.filter((sub) => sub.plan !== 'FREE' && sub.isActive);
  const displaySubscriptions = paidSubscriptions.length > 0 ? paidSubscriptions : subscriptions.filter((sub) => sub.isActive);
  return <div className="min-h-screen bg-cream dark:bg-slate-950 pt-16 md:pt-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Active Subscriptions - Show for tenants */}
        {user?.role === 'tenant' && displaySubscriptions.length > 0 && <div className="mb-8 space-y-4">
            <h2 className="text-xl font-bold text-navy dark:text-white font-playfair mb-4">
              Active Subscriptions
            </h2>
            {displaySubscriptions.map((subscription) => {
          const isPlatinum = subscription.plan === 'PLATINUM';
          const isGold = subscription.plan === 'GOLD';
          const isFree = subscription.plan === 'FREE';
          const planColor = isPlatinum ? 'text-purple-600 dark:text-purple-400' : isGold ? 'text-gold' : 'text-slate-600 dark:text-slate-300';
          const bgColor = isPlatinum ? 'bg-purple-50 dark:bg-purple-900/20' : isGold ? 'bg-gold/10 dark:bg-gold/20' : 'bg-slate-50 dark:bg-slate-700/50';
          const borderColor = isPlatinum ? 'border-purple-200 dark:border-purple-800' : isGold ? 'border-gold/30 dark:border-gold/30' : 'border-slate-200 dark:border-slate-600';
          const cityName = subscription.city.charAt(0).toUpperCase() + subscription.city.slice(1);
          const expiryDate = subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : null;
          return <div key={subscription.id} className={`bg-white dark:bg-slate-800 rounded-2xl border ${borderColor} overflow-hidden shadow-sm`}>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Subscription Plan
                        </p>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-2xl font-playfair font-bold ${planColor}`}>

                            {subscription.plan}
                          </h3>
                          {(isPlatinum || isGold) && <Crown className={`w-5 h-5 ${planColor} fill-current`} />}
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${bgColor} ${planColor}`}>

                        <MapPin className="w-3 h-3" />
                        {cityName}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {expiryDate ? `Expires on ${expiryDate}` : 'No expiry'}
                      </div>

                      {/* Upgrade / Change Plan */}
                      <button onClick={() => {
                  window.location.href = `/pricing?city=${subscription.city}`;
                }} className="px-4 py-2 text-xs font-semibold rounded-lg
      bg-navy dark:bg-slate-200 text-white dark:text-navy
      hover:bg-gold dark:hover:bg-white hover:text-navy
      transition-all duration-200 shadow-sm">









                        Upgrade / Change Plan
                      </button>
                    </div>
                  </div>
                </div>;
        })}
          </div>}

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="bg-navy p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-navy text-2xl font-bold">
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold font-playfair">
                  {user.name}
                </h1>
                <p className="text-slate-300 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!isEditing ? <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <Mail className="w-5 h-5 text-gold" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                      Email
                    </p>
                    <p className="text-navy dark:text-white font-medium">
                      {user.email}
                    </p>
                  </div>
                </div>

                {user.phone && <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Phone className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                        Phone
                      </p>
                      <p className="text-navy dark:text-white font-medium">
                        {user.phone}
                      </p>
                    </div>
                  </div>}

                {user.city && <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                        City
                      </p>
                      <p className="text-navy dark:text-white font-medium capitalize">
                        {user.city}
                      </p>
                    </div>
                  </div>}

                <button onClick={() => setIsEditing(true)} className="w-full py-3 bg-navy dark:bg-slate-200 text-white dark:text-navy font-semibold rounded-lg hover:bg-gold dark:hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2">

                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div> : <form onSubmit={handleSubmit} className="space-y-5">

  {/* NAME */}
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
      Full Name *
    </label>
    <input id="name" type="text" value={formData.name} onChange={(e) => {
                setFormData({
                  ...formData,
                  name: e.target.value
                });
                setErrors((prev) => ({
                  ...prev,
                  name: ''
                }));
              }} className={`w-full px-4 py-3 rounded-lg outline-none border 
      ${errors.name ? 'border-red-500 focus:ring-2 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:border-gold'} 
      bg-slate-50 dark:bg-slate-700 dark:text-white`} />
    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
  </div>

  {/* PHONE */}
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
      Phone *
    </label>
    <input id="phone" type="tel" maxLength={10} value={formData.phone} onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, '');
                setFormData({
                  ...formData,
                  phone: onlyNums
                });
                setErrors((prev) => ({
                  ...prev,
                  phone: ''
                }));
              }} className={`w-full px-4 py-3 rounded-lg outline-none border 
      ${errors.phone ? 'border-red-500 focus:ring-2 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:border-gold'} 
      bg-slate-50 dark:bg-slate-700 dark:text-white`} />
    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
  </div>

  {/* CITY */}
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
      City *
    </label>
    <input id="city" type="text" value={formData.city} onChange={(e) => {
                setFormData({
                  ...formData,
                  city: e.target.value
                });
                setErrors((prev) => ({
                  ...prev,
                  city: ''
                }));
              }} className={`w-full px-4 py-3 rounded-lg outline-none border 
      ${errors.city ? 'border-red-500 focus:ring-2 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:border-gold'} 
      bg-slate-50 dark:bg-slate-700 dark:text-white`} />
    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
  </div>

  {/* ACTION BUTTONS */}
  <div className="flex gap-4 pt-4">
    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:border-navy dark:hover:border-white hover:text-navy dark:hover:text-white transition-colors">
      Cancel
    </button>

    <button type="submit" disabled={loading} className="flex-1 py-3 bg-navy dark:bg-slate-200 text-white dark:text-navy font-bold rounded-lg hover:bg-gold dark:hover:bg-white transition-colors duration-300 disabled:opacity-60">
      {loading ? 'Saving...' : 'Save Changes'}
    </button>
  </div>
          </form>}
          </div>
        </div>
      </div>
    </div>;
}