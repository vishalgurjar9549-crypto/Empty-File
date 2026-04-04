import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

type BackendCity = {
  id: string | number;
  name: string;
  state?: string;
  totalListings?: number;
  image?: string;
};

type CityItem = {
  id: string | number;
  name: string;
  state?: string;
  image: string;
  totalListings?: number;
};

type PopularCitiesScrollerProps = {
  cities?: BackendCity[];
};

const DEMO_CITIES: CityItem[] = [
  {
    id: "agra",
    name: "Agra",
    state: "Uttar Pradesh",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "almaty",
    name: "Almaty",
    state: "Kazakhstan",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "azerbaijan",
    name: "Azerbaijan",
    state: "Baku",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "bangalore",
    name: "Bangalore",
    state: "Karnataka",
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "barot",
    name: "Barot",
    state: "Himachal Pradesh",
    image:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "bir",
    name: "Bir",
    state: "Himachal Pradesh",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "burwa",
    name: "Burwa",
    state: "Himachal Pradesh",
    image:
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "alleppey",
    name: "Alleppey",
    state: "Kerala",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "andamans",
    name: "Andamans",
    state: "Andaman & Nicobar",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "bali",
    name: "Bali",
    state: "Indonesia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "banikhet",
    name: "Banikhet",
    state: "Himachal Pradesh",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "bhor",
    name: "Bhor",
    state: "Maharashtra",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "bundi",
    name: "Bundi",
    state: "Rajasthan",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "chamba",
    name: "Chamba",
    state: "Himachal Pradesh",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
  },
];

function chunkIntoTwoRows(items: CityItem[]) {
  const row1: CityItem[] = [];
  const row2: CityItem[] = [];

  items.forEach((item, index) => {
    if (index % 2 === 0) row1.push(item);
    else row2.push(item);
  });

  return [row1, row2];
}

function mergeCitiesWithFallback(cities?: BackendCity[]): CityItem[] {
  const backendCities: CityItem[] =
    cities?.map((city, index) => ({
      id: city.id ?? city.name ?? `city-${index}`,
      name: city.name,
      state: city.state || "Popular destination",
      totalListings: city.totalListings,
      image:
        city.image ||
        DEMO_CITIES[index % DEMO_CITIES.length]?.image ||
        DEMO_CITIES[0].image,
    })) ?? [];

  const existingNames = new Set(
    backendCities.map((city) => city.name.trim().toLowerCase())
  );

  const fallbackCities = DEMO_CITIES.filter(
    (city) => !existingNames.has(city.name.trim().toLowerCase())
  );

  // Keep enough items so marquee looks full
  return [...backendCities, ...fallbackCities].slice(0, 16);
}

function CityPill({ city }: { city: CityItem }) {
  return (
    <Link
      to={`/rooms?city=${encodeURIComponent(city.name)}`}
      className="group shrink-0 rounded-[999px] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/30"
      aria-label={`Browse rooms in ${city.name}`}
    >
      <div className="w-[132px] sm:w-[148px] md:w-[160px]">
        {/* Oval image */}
        <div className="relative mx-auto h-[176px] w-[132px] sm:h-[196px] sm:w-[148px] md:h-[210px] md:w-[160px] overflow-hidden rounded-[999px] bg-slate-200 dark:bg-zinc-900 ring-1 ring-slate-200/80 dark:ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.10)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_18px_50px_rgba(0,0,0,0.18)] dark:group-hover:shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
          <img
            src={city.image}
            alt={city.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
        </div>

        {/* Text */}
        <div className="mt-3 text-center">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-amber-600 dark:group-hover:text-amber-300">
            {city.name}
          </h3>

          <p className="mt-1 flex items-center justify-center gap-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            <MapPin className="h-3.5 w-3.5 opacity-80" />
            <span className="truncate">{city.state || "Explore"}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

function InfiniteRow({
  items,
  direction = "left",
  rowRef,
}: {
  items: CityItem[];
  direction?: "left" | "right";
  rowRef: React.RefObject<HTMLDivElement>;
}) {
  const duplicated = [...items, ...items];

  return (
    <div className="overflow-hidden">
      <div
        ref={rowRef}
        className={`flex w-max gap-5 sm:gap-6 md:gap-7 will-change-transform ${
          direction === "left"
            ? "animate-city-marquee"
            : "animate-city-marquee-reverse"
        }`}
      >
        {duplicated.map((city, index) => (
          <CityPill key={`${city.id}-${index}`} city={city} />
        ))}
      </div>
    </div>
  );
}

export default function PopularCitiesScroller({
  cities,
}: PopularCitiesScrollerProps) {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  const mergedCities = useMemo(() => mergeCitiesWithFallback(cities), [cities]);

  const [row1, row2] = useMemo(
    () => chunkIntoTwoRows(mergedCities),
    [mergedCities]
  );

  const pauseAndScroll = (direction: "left" | "right") => {
    const amount = 420;

    [row1Ref.current, row2Ref.current].forEach((row) => {
      if (!row) return;

      row.style.animationPlayState = "paused";

      row.parentElement?.scrollBy({
        left: direction === "right" ? amount : -amount,
        behavior: "smooth",
      });

      setTimeout(() => {
        row.style.animationPlayState = "running";
      }, 1200);
    });
  };

  return (
    <section className="relative overflow-hidden py-8  bg-white dark:bg-[#050505]">
      {/* side fade */}
      {/* <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-[#050505] dark:via-[#050505]/90 dark:to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l from-white via-white/90 to-transparent dark:from-[#050505] dark:via-[#050505]/90 dark:to-transparent" /> */}

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10  flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
              Explore destinations
            </span>

            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Popular Cities to Live In
            </h2>

            <p className="mt-3 max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600 dark:text-zinc-400">
              Discover vibrant cities and peaceful escapes curated for modern
              living, travel, and long stays.
            </p>
          </div>

          {/* Desktop controls */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => pauseAndScroll("left")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              aria-label="Scroll cities left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => pauseAndScroll("right")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              aria-label="Scroll cities right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Rows */}
    <div className="relative">
  {/* side fade only for slider */}
  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-[#050505] dark:via-[#050505]/90 dark:to-transparent" />
  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l from-white via-white/90 to-transparent dark:from-[#050505] dark:via-[#050505]/90 dark:to-transparent" />

  <div className="space-y-8">
    <InfiniteRow items={row1} direction="left" rowRef={row1Ref} />
    <InfiniteRow items={row2} direction="right" rowRef={row2Ref} />
  </div>
</div>
      </div>
    </section>
  );
}