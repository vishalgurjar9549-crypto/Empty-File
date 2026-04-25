



// import { useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   Calendar,
//   Heart,
//   Search,
//   Crown
// } from 'lucide-react';

// import { useAppDispatch, useAppSelector } from '../../store/hooks';
// import { fetchTenantDashboardData } from '../../store/slices/tenantDashboard.slice';
// import {
//   fetchFavoritesWithDetails,
//   selectFavoriteRooms,
// } from '../../store/slices/favorites.slice';

// import { SubscriptionStatusCard } from '../../components/SubscriptionStatusCard';
// import { RoomCard } from '../../components/RoomCard';
// import { Button } from '../../components/ui/Button';
// import { EmptyState } from '../../components/ui/EmptyState';

// // NEW DESIGN SYSTEM
// import { DashboardShell } from '../../components/dashboard/DashboardShell';
// import { SectionCard } from '../../components/dashboard/SectionCard';
// import { TenantPlanCard } from '../../components/dashboard/TenantPlanCard';

// export function TenantDashboard() {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();

//   const { data, loading, error } = useAppSelector((s) => s.tenantDashboard);
//   const { user } = useAppSelector((s) => s.auth);
//   const favoriteRooms = useAppSelector(selectFavoriteRooms);

//   useEffect(() => {
//     dispatch(fetchTenantDashboardData());
//     dispatch(fetchFavoritesWithDetails(50));
//   }, [dispatch]);

//   if (loading && !data) return <div className="p-10">Loading...</div>;
//   if (error) return <div className="p-10 text-red-500">{error}</div>;
//   if (!data) return null;

//   const { bookings = [], subscriptions = [] } = data;

//   const activeSubscriptions = subscriptions.filter((s: any) => s?.isActive);
//   const currentSub = activeSubscriptions[0];

//   const viewCount = currentSub?.viewCount || 0;
//   const viewLimit = currentSub?.viewLimit || 10;
//   const percentUsed = Math.min((viewCount / viewLimit) * 100, 100);

//   return (
//     <DashboardShell
//       title="My Dashboard"
//       subtitle={`Welcome back, ${user?.name}`}
//       action={
//         <Link to="/rooms">
//           <Button>
//             <Search className="w-4 h-4 mr-2" /> Find Room
//           </Button>
//         </Link>
//       }
//     >

      

//       {/* MULTI PLAN */}
//       {activeSubscriptions.length > 1 && (
//         <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {activeSubscriptions.map((sub: any) => (
//             <TenantPlanCard key={sub.id} sub={sub} />
//           ))}
//         </div>
//       )}

//       {/* MAIN GRID */}
//       <div className="grid lg:grid-cols-3 gap-6">

//         {/* LEFT */}
//         <div className="space-y-6 lg:sticky top-24 h-fit">

//           {/* SUBSCRIPTIONS */}
//           <SectionCard>
//             <div className="p-5 space-y-3">
//               <h2 className="font-bold flex gap-2 items-center">
//                 <Crown className="w-5 h-5 text-yellow-500" /> Plans
//               </h2>

//               {activeSubscriptions.map((sub: any) => (
//                 <SubscriptionStatusCard key={sub.id} subscription={sub} />
//               ))}
//             </div>
//           </SectionCard>

//           {/* SAVED CLICK FIX */}
//           <SectionCard>
//             <div className="p-5 ">
//               <h2 className="font-bold mb-3 flex gap-2 items-center">
//                 <Heart className="w-5 h-5 text-red-500" /> Saved
//               </h2>

//               {favoriteRooms.length === 0 ? (
//                 <EmptyState title="No Saved" description="Save properties" />
//               ) : (
//                <div className="flex gap-4 overflow-x-auto pb-2">
//   {favoriteRooms.map((fav: any) => {
//     const room = fav.room || fav;
//     if (!room?.id) return null;

//     return (
//       <div
//         key={room.id}
//         onClick={() => navigate(`/rooms/${room.id}`)}
//         className="min-w-[220px] cursor-pointer"
//       >
//         <RoomCard room={room} compact />
//       </div>
//     );
//   })}
// </div>
//               )}
//             </div>
//           </SectionCard>

//         </div>

//         {/* RIGHT */}
//         <div className="lg:col-span-2">

//           <SectionCard>
//             <div className="p-5">

//               <div className="flex justify-between mb-4">
//                 <h2 className="font-bold flex gap-2 items-center">
//                   <Calendar className="w-5 h-5" /> My Bookings
//                 </h2>
//                 <span className="text-sm text-slate-500">
//                   {bookings.length}
//                 </span>
//               </div>

//               {bookings.length === 0 ? (
//                 <EmptyState
//                   title="No Bookings"
//                   description="Explore rooms to get started"
//                 />
//               ) : (
//                 <div className="space-y-4 max-h-[70vh] overflow-y-auto">
//                   {bookings.map((b: any) => {
//                     const room = b.room;
//                     if (!room?.id) return null;

//                     return (
//                       <div
//                         key={b.id}
//                         onClick={() => navigate(`/rooms/${room.id}`)}
//                         className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
//                       >
//                         <img
//                           src={room.images?.[0]}
//                           className="w-24 h-20 object-cover rounded"
//                         />

//                         <div className="flex-1">
//                           <p className="font-semibold">{room.title}</p>
//                           <p className="text-sm text-slate-500">
//                             {room.city}
//                           </p>

//                           <div className="flex justify-between mt-2">
//                             <span>₹{room.pricePerMonth}</span>

//                             <span
//                               className={`text-xs px-2 py-1 rounded ${
//                                 b.status === 'confirmed'
//                                   ? 'bg-green-200 text-green-800'
//                                   : b.status === 'cancelled'
//                                   ? 'bg-red-200 text-red-800'
//                                   : 'bg-yellow-200 text-yellow-800'
//                               }`}
//                             >
//                               {b.status}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}

//             </div>
//           </SectionCard>

//         </div>
//       </div>

//     </DashboardShell>
//   );
// }

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Heart,
  Search,
  Crown,
  MapPin,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTenantDashboardData } from "../../store/slices/tenantDashboard.slice";
import {
  fetchFavoritesWithDetails,
  selectFavoriteRooms,
} from "../../store/slices/favorites.slice";

import { SubscriptionStatusCard } from "../../components/SubscriptionStatusCard";
import { EmptyState } from "../../components/ui/EmptyState";

// ── Status pill config ─────────────────────────────────────────────────────────
const STATUS_PILL: Record<
  string,
  { light: string; dark: string }
> = {
  confirmed: {
    light: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dark:  "dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  },
  cancelled: {
    light: "bg-red-50 text-red-600 border border-red-200",
    dark:  "dark:bg-red-950/60 dark:text-red-400 dark:border-red-800",
  },
  pending: {
    light: "bg-amber-50 text-amber-700 border border-amber-200",
    dark:  "dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  },
};

function statusPillClass(status: string) {
  const s = STATUS_PILL[status];
  if (!s) return "bg-neutral-100 text-neutral-500 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700";
  return `${s.light} ${s.dark}`;
}

export function TenantDashboard() {
  const dispatch    = useAppDispatch();
  const navigate    = useNavigate();

  const { data, loading, error } = useAppSelector((s) => s.tenantDashboard);
  const { user }                 = useAppSelector((s) => s.auth);
  const favoriteRooms            = useAppSelector(selectFavoriteRooms);

  const [showAllBookings, setShowAllBookings] = useState(false);
  const [showAllSaved,    setShowAllSaved]    = useState(false);

  useEffect(() => {
    dispatch(fetchTenantDashboardData());
    dispatch(fetchFavoritesWithDetails(50));
  }, [dispatch]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading && !data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d0b06]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <p className="text-[10px] tracking-[0.2em] uppercase text-amber-500 dark:text-amber-400">
            Loading
          </p>
        </div>
      </div>
    );

  if (error)  return <div className="p-10 text-red-500">{error}</div>;
  if (!data)  return null;

  const { bookings = [], subscriptions = [] } = data;
  const activeSubscriptions = subscriptions.filter((s: any) => s?.isActive);
  const visibleBookings     = showAllBookings ? bookings : bookings.slice(0, 4);
  const visibleSaved        = showAllSaved    ? favoriteRooms : favoriteRooms.slice(0, 4);

  // ── Shared class helpers ───────────────────────────────────────────────────
  // Card wrapper
  const card =
    "rounded-2xl p-4 border " +
    "bg-amber-50/40 border-amber-200/60 " +
    "dark:bg-amber-500/[0.04] dark:border-amber-400/20";

  // Section header icon badge
  const iconBadge =
    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 " +
    "bg-amber-100 dark:bg-amber-400/10";

  // Count badge
  const countBadge =
    "text-[10px] font-semibold px-2 py-0.5 rounded-full " +
    "bg-amber-100 text-amber-700 border border-amber-200 " +
    "dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20";

  // "Show more" button
  const moreBtn =
    "mt-3 w-full text-xs flex items-center justify-center gap-1 " +
    "text-amber-400/60 dark:text-amber-500/50 bg-transparent border-none cursor-pointer";

  // Inner room / booking card
  const innerCard =
    "rounded-xl border transition-all duration-200 " +
    "bg-amber-50/60 border-amber-200/50 hover:-translate-y-0.5 " +
    "dark:bg-amber-500/[0.06] dark:border-amber-400/20";

  return (
    <div className="m-2">
      <div className="min-h-screen text-neutral-800 dark:text-slate-100">

        {/* ── Hero greeting ──────────────────────────────────────────────── */}
        <div className="relative mb-6 rounded-2xl p-4 sm:p-5 overflow-hidden bg-amber-50/70 border border-amber-200/70 dark:bg-amber-400/[0.08] dark:border-amber-400/20">
          {/* Soft glow blob */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none bg-amber-300/10 dark:bg-amber-400/5 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-1 text-amber-600 dark:text-amber-400">
                Tenant Dashboard
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                Hey, {user?.name?.split(" ")[0]} 👋
              </h1>
              <p className="text-xs sm:text-sm mt-0.5 text-amber-600/60 dark:text-amber-400/50">
                Here's what's happening with your rentals.
              </p>
            </div>

            <Link to="/rooms">
              <button className="flex items-center gap-2 text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-xl transition-all bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-[#0d0b06]">
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Find Room</span>
              </button>
            </Link>
          </div>
        </div>

        {/* ── Quick stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Bookings",     value: bookings.length            },
            { label: "Saved",        value: favoriteRooms.length       },
            { label: "Active Plans", value: activeSubscriptions.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center rounded-xl p-3 sm:p-4 bg-amber-50/70 border border-amber-200/60 dark:bg-amber-400/[0.08] dark:border-amber-400/20"
            >
              <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stat.value}
              </p>
              <p className="text-[10px] sm:text-[11px] mt-0.5 uppercase tracking-widest text-amber-500/60 dark:text-amber-400/45">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Main 3-col layout ──────────────────────────────────────────── */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.6fr_1fr] gap-4">

          {/* ── COL 1 · SAVED ─────────────────────────────────────────── */}
          <div className={`order-3 lg:order-1 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={iconBadge}>
                  <Heart className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-sm font-semibold text-neutral-800 dark:text-white">
                  Saved Rooms
                </h2>
              </div>
              <span className={countBadge}>{favoriteRooms.length}</span>
            </div>

            {favoriteRooms.length === 0 ? (
              <EmptyState title="Nothing saved yet" description="Heart rooms you like" />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {visibleSaved.map((fav: any) => {
                  const room = fav.room || fav;
                  if (!room?.id) return null;
                  return (
                    <div
                      key={room.id}
                      onClick={() => navigate(`/rooms/${room.id}`)}
                      className={`group cursor-pointer overflow-hidden ${innerCard}`}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={room.images?.[0]}
                          alt={room.title}
                          className="w-full h-24 lg:h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <span className="absolute bottom-2 left-2 text-xs font-bold flex items-center gap-0.5 text-amber-400">
                          <IndianRupee className="w-3 h-3" />
                          {room.pricePerMonth}
                          <span className="font-normal text-white/60">/mo</span>
                        </span>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium line-clamp-1 text-neutral-800 dark:text-slate-200">
                          {room.title}
                        </p>
                        <p className="text-[10px] flex items-center gap-0.5 mt-0.5 text-amber-600/60 dark:text-amber-400/45">
                          <MapPin className="w-2.5 h-2.5" />
                          {room.city}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {favoriteRooms.length > 4 && (
              <button className={moreBtn} onClick={() => setShowAllSaved((p) => !p)}>
                {showAllSaved ? (
                  <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
                ) : (
                  <><ChevronDown className="w-3.5 h-3.5" /> {favoriteRooms.length - 4} more saved</>
                )}
              </button>
            )}
          </div>

          {/* ── COL 2 · BOOKINGS ──────────────────────────────────────── */}
          <div id="bookings" className={`order-1 lg:order-2 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={iconBadge}>
                  <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-sm font-semibold text-neutral-800 dark:text-white">
                  Bookings
                </h2>
              </div>
              <span className={countBadge}>{bookings.length}</span>
            </div>

            {bookings.length === 0 ? (
              <EmptyState title="No bookings yet" description="Start exploring rooms nearby" />
            ) : (
              <div className="space-y-3">
                {visibleBookings.map((b: any) => {
                  const room = b.room;
                  if (!room?.id) return null;
                  return (
                    <div
                      key={b.id}
                      onClick={() => navigate(`/rooms/${room.id}`)}
                      className={`group flex gap-3 p-3 cursor-pointer ${innerCard}`}
                    >
                      <div className="relative w-[72px] h-[60px] flex-shrink-0 rounded-lg overflow-hidden">
                        <img
                          src={room.images?.[0]}
                          alt={room.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1 text-neutral-900 dark:text-white">
                          {room.title}
                        </p>
                        <p className="text-[11px] flex items-center gap-1 mt-0.5 text-amber-600/60 dark:text-amber-400/45">
                          <MapPin className="w-2.5 h-2.5" />
                          {room.city}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-bold flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                            <IndianRupee className="w-3 h-3" />
                            {room.pricePerMonth}
                            <span className="font-normal text-amber-500/50 dark:text-amber-400/40">/mo</span>
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusPillClass(b.status)}`}>
                            {b.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center self-center">
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-all duration-200 text-amber-400/30 dark:text-amber-400/25" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {bookings.length > 4 && (
              <button
                className={moreBtn}
                onClick={() => {
                  setShowAllBookings((p) => !p);
                  setTimeout(() => {
                    document.getElementById("bookings")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              >
                {showAllBookings ? (
                  <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
                ) : (
                  <><ChevronDown className="w-3.5 h-3.5" /> View all {bookings.length} bookings</>
                )}
              </button>
            )}
          </div>

          {/* ── COL 3 · PLAN ──────────────────────────────────────────── */}
          <div className={`order-2 lg:order-3 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={iconBadge}>
                  <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-sm font-semibold text-neutral-800 dark:text-white">
                  Your Plan
                </h2>
              </div>
              {activeSubscriptions.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  Active
                </span>
              )}
            </div>

            {activeSubscriptions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 bg-amber-100 dark:bg-amber-400/10">
                  <Crown className="w-6 h-6 text-amber-400/50 dark:text-amber-400/35" />
                </div>
                <p className="text-sm font-medium text-neutral-800 dark:text-white">
                  No active plan
                </p>
                <p className="text-xs mt-1 mb-5 text-amber-600/50 dark:text-amber-400/40">
                  Upgrade to unlock premium features
                </p>
                <Link to="/plans">
                  <button className="text-xs font-semibold px-5 py-2 rounded-xl transition-all bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20 dark:hover:bg-amber-400/20">
                    View Plans
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSubscriptions.map((sub: any) => (
                  <SubscriptionStatusCard key={sub.id} subscription={sub} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}