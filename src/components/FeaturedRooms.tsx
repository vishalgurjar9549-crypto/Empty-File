import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RoomCard } from './RoomCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRooms } from '../store/slices/rooms.slice';
import { ArrowRight } from 'lucide-react';
export function FeaturedRooms() {
  const dispatch = useAppDispatch();
  const {
    rooms,
    loading
  } = useAppSelector((state) => state.rooms);
  useEffect(() => {
    // Fetch rooms sorted by popularity (views + rating)
    dispatch(fetchRooms({
      sort: 'popular',
      onlyActive: 'true',
      limit: 6
    }));
  }, [dispatch]);
  if (loading.fetch && rooms.length === 0) {
    return <section className="py-16 md:py-24 lg:py-32 px-4 sm:px-6 bg-white dark:bg-slate-950 relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="space-y-4 w-full max-w-2xl">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
              <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
              <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm h-[420px] animate-pulse">

                <div className="h-64 bg-slate-200 dark:bg-slate-800"></div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  </div>
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl mt-4"></div>
                </div>
              </div>)}
          </div>
        </div>
      </section>;
  }
  if (rooms.length === 0) return null;
  return <section className="py-16 md:py-24 lg:py-32 px-4 sm:px-6 bg-white dark:bg-slate-950 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-gold font-bold tracking-widest uppercase text-xs mb-3 block">
              Exclusive Collections
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-navy dark:text-white mb-4 md:mb-6 leading-tight">
              Featured Premium Listings
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
              Hand-picked accommodations offering the best balance of luxury,
              prime location, and vibrant community.
            </p>
          </div>

          <Link to="/rooms" className="hidden md:flex items-center gap-2 text-navy dark:text-white font-semibold hover:text-gold transition-colors group whitespace-nowrap">

            <span>View All Properties</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {rooms.slice(0, 3).map((room) => <RoomCard key={room.id} room={room} />)}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-10 md:hidden">
          <Link to="/rooms" className="inline-flex items-center gap-2 px-8 py-4 bg-navy dark:bg-white text-white dark:text-navy font-semibold rounded-xl hover:bg-gold dark:hover:bg-slate-200 transition-all duration-300 shadow-lg w-full sm:w-auto justify-center">

            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>;
}