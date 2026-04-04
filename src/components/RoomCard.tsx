import React, { useCallback } from 'react';
import { MapPin, Star, ArrowRight, CheckCircle, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Room } from '../types/api.types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleFavorite, selectIsFavorited, selectIsToggling } from '../store/slices/favorites.slice';
import { showToast } from '../store/slices/ui.slice';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({
  room
}: RoomCardProps) {
  // ✅ SAFETY GUARD: If room is undefined or null, render nothing
  if (!room) {
    return null;
  }

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // ✅ Safe property access with defaults
  const roomId = room?.id || '';
  const title = room?.title || 'No Title';
  const description = room?.description || '';
  const image = room?.images?.[0] || '/placeholder.png';
  const price = room?.pricePerMonth || 0;
  const location = room?.location || room?.city || 'Unknown Location';
  const rating = room?.rating || 0;
  const roomType = room?.roomType || 'Room';
  const amenities = room?.amenities || [];
  const isPopular = room?.isPopular || false;
  const isVerified = room?.isVerified || false;
  const weeklyViews = Math.max(1, room?.demand?.weeklyViews || 0);
  const weeklyContacts = Math.max(1, room?.demand?.weeklyContacts || 0);
  
  // Redux State
  const { authStatus } = useAppSelector((state) => state.auth);
  const isFavorited = useAppSelector(selectIsFavorited(roomId));
  const isToggling = useAppSelector(selectIsToggling(roomId));

  // ✅ Handle favorite toggle
  const handleFavoriteClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // ✅ Check authentication
    if (authStatus !== 'AUTHENTICATED') {
      dispatch(showToast({
        message: '📋 Please log in to save favorites',
        type: 'info'
      }));
      navigate('/auth/login', {
        state: { from: `/rooms/${room.id}` }
      });
      return;
    }

    // ✅ Toggle favorite (optimistic update)
    dispatch(toggleFavorite(room.id));
  }, [authStatus, room.id, dispatch, navigate]);

  return <Link to={`/rooms/${roomId}`} className="block h-full group focus:outline-none focus:ring-2 focus:ring-gold/50 rounded-2xl">

      <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-black/40 hover:shadow-xl hover:shadow-navy/10 dark:hover:shadow-black/60 transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

          {/* Price Tag - Floating Glass Pill */}
          <div className="absolute bottom-3 left-3 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-lg">
            <span className="font-playfair font-bold text-white text-lg">
              ₹{price.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-200 font-medium uppercase tracking-wider ml-1">
              / Mo
            </span>
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isPopular && <div className="bg-gold text-navy px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-navy" /> Popular
              </div>}
            {isVerified && <div className="bg-navy/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg flex items-center gap-1 border border-white/10">
                <CheckCircle className="w-3 h-3 text-green-400" /> Verified
              </div>}
          </div>

          {/* Favorite Button - Now Has Functional Logic */}
          <button 
            onClick={handleFavoriteClick}
            disabled={isToggling}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold ${
              isFavorited
                ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 focus-visible:ring-offset-slate-900'
                : 'bg-black/20 text-white hover:bg-white hover:text-red-500 focus-visible:ring-offset-slate-100'
            } ${isToggling ? 'opacity-60' : ''}`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 transition-transform ${isFavorited ? 'fill-current' : ''} ${isToggling ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span className="truncate max-w-[150px]">{location}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
              <Star className="w-3 h-3 text-gold fill-gold" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {rating}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-playfair font-bold mb-2 text-navy dark:text-white group-hover:text-gold transition-colors duration-300 line-clamp-1" title={title}>

            {title}
          </h3>

          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
            {description}
          </p>

          {room?.demand && <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 truncate">
              👀 {weeklyViews} views this week
              {` • `}
              🔥 {weeklyContacts} contacts
            </p>}

          <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-4" />

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium rounded-md border border-slate-200 dark:border-slate-700">
              {roomType}
            </span>
            {amenities.slice(0, 2).map((amenity, i) => <span key={i} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium rounded-md border border-slate-200 dark:border-slate-700">

                {amenity}
              </span>)}
            {amenities.length > 2 && <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-medium rounded-md border border-slate-200 dark:border-slate-700">
                +{amenities.length - 2}
              </span>}
          </div>

          {/* Action Button */}
          <div className="w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-navy dark:text-white font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-navy group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-navy transition-all duration-300">
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>;
}
