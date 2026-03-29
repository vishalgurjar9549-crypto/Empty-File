import React, { useEffect, lazy, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Heart, CheckCircle, XCircle, AlertCircle, Search, Phone, Lock, ArrowRight, Crown,Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTenantDashboardData } from '../../store/slices/tenantDashboard.slice';
import { fetchFavoritesWithDetails, selectFavoriteRooms, selectFavoriteRoomsLoading } from '../../store/slices/favorites.slice';
import { SubscriptionStatusCard } from '../../components/SubscriptionStatusCard';
import { RoomCard } from '../../components/RoomCard';
import { Button } from '../../components/ui/Button';
export function TenantDashboard() {
  const dispatch = useAppDispatch();
  const {
    data,
    loading,
    error
  } = useAppSelector((state) => state.tenantDashboard);
  const {
    user
  } = useAppSelector((state) => state.auth);
  const favoriteRooms = useAppSelector(selectFavoriteRooms);
  const favoritesLoading = useAppSelector(selectFavoriteRoomsLoading);

  useEffect(() => {
    dispatch(fetchTenantDashboardData());
  }, [dispatch]);

  // Fetch favorites with full room details for Dashboard display
  useEffect(() => {
    dispatch(fetchFavoritesWithDetails(50));
  }, [dispatch]);
  // Loading State - Skeleton
  if (loading && !data) {
    return <div className="min-h-screen bg-[#FAFAF9] dark:bg-slate-950  pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-8" />
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6 animate-pulse" />
            <div className="space-y-4">
              {[1, 2].map((i) => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          </div>
        </div>
      </div>;
  }
  // Error State
  if (error) {
    return <div className="min-h-screen bg-[#FAFAF9] dark:bg-slate-950 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-[#1E293B] dark:text-white mb-2">
            Unable to load dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || 'Something went wrong. Please try again.'}
          </p>
          <Button onClick={() => dispatch(fetchTenantDashboardData())}>
            Retry
          </Button>
        </div>
      </div>;
  }
  if (!data) return null;
  const {
    bookings,
    subscriptions = []
  } = data;
  // Separate active vs expired subscriptions
  const activeSubscriptions = subscriptions.filter((s: any) => s.isActive);
  const hasActiveSubscriptions = activeSubscriptions.length > 0;
  return <div className="min-h-screen bg-[#FAFAF9] dark:bg-slate-950 pt-8 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-[#1E293B] dark:text-white">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your bookings and subscription
            </p>
          </div>
          <Link to="/rooms">
            <Button variant="primary" className="shadow-lg shadow-[#1E293B]/20">
              <Search className="w-4 h-4 mr-2" />
              Find a Room
            </Button>
          </Link>
        </div>

        {/* 1. MY BOOKINGS SECTION (Priority) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1E293B] dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#C8A45D]" />
              My Bookings
            </h2>
            {bookings.length > 0 && <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {bookings.length} Request{bookings.length !== 1 ? 's' : ''}
              </span>}
          </div>

          {bookings.length === 0 ? <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white mb-2">
                No bookings yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-6">
                You haven't sent any booking requests yet. Start exploring
                properties to find your next home.
              </p>
              <Link to="/rooms">
                <Button variant="outline">Browse Properties</Button>
              </Link>
            </div> : <div className="grid gap-4">
              {bookings.map((booking: any) => <div key={booking.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">

                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Property Image */}
                    <div className="w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {booking.room.images[0] ? <img src={booking.room.images[0]} alt={booking.room.title} loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <MapPin className="w-8 h-8" />
                        </div>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div>
                          <Link to={`/rooms/${booking.room.id}`} className="text-lg font-bold text-[#1E293B] dark:text-white hover:text-[#C8A45D] transition-colors line-clamp-1">

                            {booking.room.title}
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            {booking.room.city}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className={`
                            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 self-start
                            ${booking.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                            ${booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                            ${booking.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                          `}>

                          {booking.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                          {booking.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {booking.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                          {booking.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>
                              Move-in:{' '}
                              <span className="font-medium text-[#1E293B] dark:text-white">
                                {new Date(booking.moveInDate).toLocaleDateString()}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <span className="font-medium text-[#1E293B] dark:text-white">
                              ₹{booking.room.pricePerMonth.toLocaleString()}
                            </span>
                            <span>/ month</span>
                          </div>
                        </div>

                        {/* Owner Contact Logic */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Owner Details
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#1E293B] dark:text-white">
                              {booking.owner.name}
                            </span>
                            {booking.owner.phone ? <a href={`tel:${booking.owner.phone}`} className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium hover:underline">

                                <Phone className="w-3.5 h-3.5" />
                                {booking.owner.phone}
                              </a> : <Link to={`/pricing?city=${booking.room.city}`} className="flex items-center gap-1.5 text-slate-400 hover:text-[#C8A45D] transition-colors text-xs">

                                <Lock className="w-3 h-3" />
                                Upgrade to view
                              </Link>}
                          </div>
                        </div>
                      </div>

                      {/* Rejected State CTA */}
                      {booking.status === 'REJECTED' && <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                          <Link to={`/rooms?city=${booking.room.city}`}>
                            <Button size="sm" variant="outline" className="text-xs">

                              Browse Similar Properties in {booking.room.city}
                            </Button>
                          </Link>
                        </div>}
                    </div>
                  </div>
                </div>)}
            </div>}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 2. SUBSCRIPTION SECTION — MULTI-CITY */}
          <section className="lg:col-span-1">
            <h2 className="text-xl font-bold text-[#1E293B] dark:text-white mb-6 flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#C8A45D]" />
              {hasActiveSubscriptions ? 'Your Active Plans' : 'Subscription'}
            </h2>

            {hasActiveSubscriptions ? <div className="space-y-4">
                {activeSubscriptions.map((sub: any) => <SubscriptionStatusCard key={sub.id || `${sub.plan}-${sub.city}`} subscription={sub} />)}

                {/* Link to upgrade more cities */}
                <Link to="/pricing" className="block text-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#C8A45D] transition-colors py-2">

                  + Add subscription for another city
                </Link>
              </div> : <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-[#1E293B] dark:text-white mb-2">
                    Free Plan
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    You are currently on the free tier with limited access.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <XCircle className="w-4 h-4 text-slate-400" />
                    <span>Owner Contact Details</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <XCircle className="w-4 h-4 text-slate-400" />
                    <span>Exact Map Location</span>
                  </div>
                </div>

                <Link to="/pricing">
                  <Button fullWidth className="group">
                    Upgrade Now
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>}
          </section>

          {/* 3. SAVED PROPERTIES (FAVORITES) SECTION */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1E293B] dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                Saved Properties ❤️
              </h2>
              {favoriteRooms.length > 0 && <Link to="/rooms" className="text-sm font-medium text-[#C8A45D] hover:text-[#b8943d] transition-colors">

                  Browse More
                </Link>}
            </div>

            {favoritesLoading && favoriteRooms.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : favoriteRooms.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-700">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4 font-medium">
                  No saved properties yet
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                  Save your favorite properties to find them easily later
                </p>
                <Link to="/rooms">
                  <Button variant="outline" size="sm">
                    Browse Properties
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {favoriteRooms
                  .filter((fav) => fav && (fav.room || fav.id)) // Safety filter: ensure item exists and has room or is already a room
                  .map((favorite: any) => {
                    // Handle both formats: nested room object OR flat room object
                    const room = favorite.room || favorite;
                    
                    // Skip if room is invalid
                    if (!room?.id) return null;
                    
                    return (
                      <div key={room.id} className="h-full">
                        <RoomCard room={room} />
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>;
}