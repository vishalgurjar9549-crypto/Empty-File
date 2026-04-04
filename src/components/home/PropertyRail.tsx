import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PropertyRailCard } from "./PropertyRailCard";
import { PropertyRailSkeleton } from "./PropertyRailSkeleton";
import { PropertyRailSeeAllCard } from "./PropertyRailSeeAllCard";

type Property = {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  rating: number;
  image: string;
  demand?: {
    weeklyViews: number;
    weeklyContacts: number;
  };
};

type PropertyRailProps = {
  title: string;
  subtitle?: string;
  properties: Property[];
  loading?: boolean;
  viewAllLink?: string;
};

export function PropertyRail({
  title,
  subtitle,
  properties,
  loading = false,
  viewAllLink = "/rooms",
}: PropertyRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const gold = "rgba(212,175,55,0.9)";
  const goldSoft = "rgba(212,175,55,0.12)";
  const goldBorder = "rgba(212,175,55,0.2)";
  const dark = "#0d0b06";

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const amount = window.innerWidth < 640 ? window.innerWidth * 0.82 : 340;

    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const visibleProperties = properties.slice(0, 5);
  const previewImages = visibleProperties.slice(0, 3).map((p) => p.image);

  return (
    <section className="">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-5 md:mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2
              className="text-[1.8rem] sm:text-[2rem] md:text-[2.2rem] font-bold tracking-tight"
              style={{ color: dark }}
            >
              <span className="dark:text-white">{title}</span>
            </h2>

            <Link
              to={viewAllLink}
              className="hidden sm:inline-flex items-center justify-center h-11 w-11 rounded-full border transition-all duration-300 hover:scale-105"
              style={{
                borderColor: goldBorder,
                backgroundColor: goldSoft,
                color: dark,
              }}
            >
              <ArrowRight className="h-5 w-5 dark:text-white" />
            </Link>
          </div>

          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="h-11 w-11 rounded-full border grid place-items-center transition-all duration-300 hover:scale-105 shadow-sm bg-white dark:bg-white/10 dark:border-white/10"
            style={{
              borderColor: goldBorder,
            }}
          >
            <ChevronLeft className="h-5 w-5 text-slate-800 dark:text-white" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="h-11 w-11 rounded-full border grid place-items-center transition-all duration-300 hover:scale-105 shadow-sm bg-white dark:bg-white/10 dark:border-white/10"
            style={{
              borderColor: goldBorder,
            }}
          >
            <ChevronRight className="h-5 w-5 text-slate-800 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Rail */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="
            flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory
            hide-scrollbar pb-2
            [scrollbar-width:none] [-ms-overflow-style:none]
          "
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <PropertyRailSkeleton key={i} />
              ))
            : (
              <>
                {visibleProperties.map((property) => (
                  <PropertyRailCard key={property.id} property={property} />
                ))}

                <PropertyRailSeeAllCard
                  to={viewAllLink}
                  previewImages={previewImages}
                />
              </>
            )}
        </div>

        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent" />
      </div>
    </section>
  );
}
