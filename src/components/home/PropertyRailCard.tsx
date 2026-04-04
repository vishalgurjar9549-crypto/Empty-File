// components/home/PropertyRailCard.tsx

import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";

type PropertyRailCardProps = {
  property: {
    id: string;
    title: string;
    location: string;
    city: string;
    price: number;
    nights?: number;
    rating: number;
    image: string;
    isGuestFavorite?: boolean;
    demand?: {
      weeklyViews: number;
      weeklyContacts: number;
    };
  };
};

export function PropertyRailCard({ property }: PropertyRailCardProps) {
  const gold = "rgba(212,175,55,0.9)";
  const goldSoft = "rgba(212,175,55,0.12)";
  const goldBorder = "rgba(212,175,55,0.2)";
  const dark = "#0d0b06";
  const weeklyViews = Math.max(1, property.demand?.weeklyViews || 0);
  const weeklyContacts = Math.max(1, property.demand?.weeklyContacts || 0);

  return (
    <Link
      to={`/rooms/${property.id}`}
      className="group block snap-start shrink-0 w-[78vw] xs:w-[72vw] sm:w-[320px] md:w-[340px] lg:w-[300px] xl:w-[320px]"
    >
      <div className="">
        {/* Image */}
        <div className="relative overflow-hidden rounded-[24px] bg-slate-100 dark:bg-slate-900 aspect-[4/3]">
          <img
            src={property.image}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 opacity-80" />

          {/* Guest favourite
          {property.isGuestFavorite && (
            <div
              className="absolute left-3 top-3 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold backdrop-blur-md border shadow-sm"
              style={{
                backgroundColor: "rgba(255,255,255,0.88)",
                borderColor: goldBorder,
                color: dark,
              }}
            >
              Guest favourite
            </div>
          )} */}

          {/* Wishlist */}
          <button
            type="button"
            className="absolute right-3 top-3 h-11 w-11 rounded-full grid place-items-center backdrop-blur-md border transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "rgba(15,23,42,0.18)",
              borderColor: "rgba(255,255,255,0.28)",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-6 w-6 text-white stroke-[2.2]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[17px] sm:text-[18px] font-semibold tracking-tight text-slate-900 dark:text-white line-clamp-1">
              {property.title}
            </h3>

            <div className="flex items-center gap-1 shrink-0 text-sm font-medium text-slate-800 dark:text-slate-200">
              <Star className="h-4 w-4 fill-current" style={{ color: gold }} />
              <span>{property.rating.toFixed(2).replace(/\.00$/, "")}</span>
            </div>
          </div>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
            {property.location}
          </p>

          {property.demand && (
            <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400 line-clamp-1">
              👀 {weeklyViews} this week • 🔥 {weeklyContacts} contacts
            </p>
          )}

          <p className="mt-1 text-[15px] text-slate-800 dark:text-slate-200">
            <span className="font-semibold">
              ₹{property.price.toLocaleString("en-IN")}
            </span>
          </p>

          <div
            className="mt-3 h-px w-full"
            style={{ backgroundColor: goldSoft }}
          />
        </div>
      </div>
    </Link>
  );
}
