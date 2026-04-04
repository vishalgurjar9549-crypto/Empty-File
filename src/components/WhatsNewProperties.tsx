import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useEffect } from 'react';
import { fetchRooms } from '../store/slices/rooms.slice';

// 🎨 Theme Colors
const gold = "rgba(212,175,55,0.9)";
const goldMid = "rgba(212,175,55,0.5)";
const goldSoft = "rgba(212,175,55,0.12)";
const goldBorder = "rgba(212,175,55,0.2)";
const dark = "#0d0b06";

// Fallback image
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400&auto=format&fit=crop";

// ✅ Safe image resolver for different backend shapes
const getRoomImage = (room: any) => {
  if (!room) return FALLBACK_IMAGE;

  // images: ["url1", "url2"]
  if (Array.isArray(room.images) && typeof room.images[0] === 'string') {
    return room.images[0];
  }

  // images: [{ url: "..." }]
  if (Array.isArray(room.images) && room.images[0]?.url) {
    return room.images[0].url;
  }

  // imageUrls: ["..."]
  if (Array.isArray(room.imageUrls) && room.imageUrls[0]) {
    return room.imageUrls[0];
  }

  // photos: [{ url: "..." }]
  if (Array.isArray(room.photos) && room.photos[0]?.url) {
    return room.photos[0].url;
  }

  // direct fields
  if (room.thumbnail) return room.thumbnail;
  if (room.coverImage) return room.coverImage;
  if (room.image) return room.image;
  if (room.photo) return room.photo;

  return FALLBACK_IMAGE;
};

export function WhatsNewProperties() {
  const dispatch = useAppDispatch();
  const { rooms } = useAppSelector((state) => state.rooms);

  useEffect(() => {
    if (!rooms.length) {
      dispatch(fetchRooms({ limit: 10 }));
    }
  }, [dispatch, rooms.length]);

  // Map backend → UI
  const mappedRooms = rooms.map((room) => ({
    id: room.id,
    title: room.title || room.name || "Untitled Property",
    subtitle:
      room.location ||
      [room.city, room.state].filter(Boolean).join(', ') ||
      "Explore this stay",
    image: getRoomImage(room),
    slug: `/rooms/${room.id}`,
    badge: 'New',
  }));

  const items = mappedRooms.length ? mappedRooms : [];

  return (
    <section className="px-4 sm:py-4 lg:py-8 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex justify-between items-end mb-6 sm:mb-8 gap-4">
          <div>
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: goldMid }}
            >
              Fresh Picks
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              What’s New
            </h2>

            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Newly launched and spotlight stays worth checking out.
            </p>
          </div>

          <Link
            to="/rooms"
            className="hidden md:flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: gold }}
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Scroll Row */}
        <div className="relative">
          <div
            className="
              flex gap-3 sm:gap-4 overflow-x-auto pb-2
              snap-x snap-mandatory
              scroll-smooth
              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {items.map((item) => (
              <Link
                key={item.id}
                to={item.slug}
                className="
                  group relative shrink-0 snap-start overflow-hidden rounded-2xl
                  transition-all duration-300 hover:-translate-y-1
                  w-[260px] sm:w-[280px] lg:w-[300px]
                  h-[300px] sm:h-[320px] lg:h-[340px]
                  bg-slate-100 dark:bg-[#0d0b06]
                  border border-slate-200/80 dark:border-white/10
                  shadow-sm hover:shadow-xl dark:hover:shadow-black/30
                "
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />

                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.38), rgba(0,0,0,0.08))',
                  }}
                />

                {/* Soft top shading */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/10 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 z-10 p-4 sm:p-5">
                  {/* Badge */}
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 backdrop-blur-md"
                    style={{
                      background: goldSoft,
                      color: gold,
                      border: `1px solid ${goldBorder}`,
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    {item.badge}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-semibold text-white leading-tight line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-white/75 mt-2 line-clamp-2 max-w-[92%]">
                    {item.subtitle}
                  </p>

                  {/* CTA - FIXED */}
                  <div className="mt-4">
                    <span
                      className="
                        inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold
                        transition-all duration-300 group-hover:translate-x-1
                        backdrop-blur-md
                      "
                      style={{
                        background: "rgba(212,175,55,0.16)",
                        color: gold,
                        border: `1px solid ${goldBorder}`,
                        boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
                      }}
                    >
                      Book Now
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* subtle gold ring */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{ boxShadow: `inset 0 0 0 1px ${goldBorder}` }}
                />
              </Link>
            ))}
          </div>

          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent dark:from-slate-950" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-slate-950" />
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 md:hidden">
          <Link
            to="/rooms"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-300 hover:opacity-90"
            style={{
              background: gold,
              color: dark,
            }}
          >
            Explore all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}