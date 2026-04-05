import { Sparkles, Home, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

// Format number for display (e.g., 1234 -> "1.2K+")
const formatStatNumber = (num: number): string => {
  if (num >= 1000) {
    const thousands = num / 1000;
    return thousands.toFixed(1).replace(/\.0+$/, "") + "K+";
  }
  return num + "+";
};

export function StayCollectionShowcase() {
  // ✅ STEP 3: Get stats from Redux instead of direct API call
  const { platform: stats, loading: isLoading, error: isError } = useAppSelector((state) => state.stats);

  const gold = "rgba(212,175,55,0.9)";
  const goldMid = "rgba(212,175,55,0.5)";
  const goldSoft = "rgba(212,175,55,0.12)";
  const goldBorder = "rgba(212,175,55,0.2)";
  const dark = "#0d0b06";

  // Get display value based on state
  const getDisplayValue = (value: number | undefined): string => {
    if (isLoading) return "...";
    if (isError || value === undefined) return "—";
    return formatStatNumber(value);
  };

  // ✅ Build stats display data - ONLY REAL STATS
  // Note: "Verified" stat removed as it's not calculable from real backend data
  // Backend only provides: totalProperties, totalCities, totalOwners
  const statsData = stats ? [
    { icon: Home, value: getDisplayValue(stats.totalProperties), label: "Homes" },
    { icon: MapPin, value: getDisplayValue(stats.totalCities), label: "Cities" },
  ] : [
    { icon: Home, value: getDisplayValue(undefined), label: "Homes" },
    { icon: MapPin, value: getDisplayValue(undefined), label: "Cities" },
  ];

  return (
    <section className="w-full ">
      <div
        className="relative overflow-hidden rounded-2xl w-full mx-auto"
        style={{
          maxWidth: 1200,
          background: "linear-gradient(135deg, #0f0c08, #1a1409)",
          border: `1px solid ${goldBorder}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)`,
        }}
      >
        {/* Top gold line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{ background: `linear-gradient(90deg, transparent, ${goldMid}, ${gold}, ${goldMid}, transparent)` }}
        />

        {/* Dot texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(rgba(212,175,55,1) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 p-5 sm:p-7 lg:p-8">

          {/* LEFT — brand + text */}
          <div className="flex-[2] min-w-0 flex flex-col gap-3 text-center sm:text-left">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 self-center sm:self-start rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.25em]"
              style={{ background: goldSoft, border: `1px solid ${goldBorder}`, color: gold }}
            >
              <Sparkles className="h-2.5 w-2.5" />
              Homilivo Selections
            </div>

            {/* Heading */}
            <div>
              <h2
                className="text-xl sm:text-2xl lg:text-[26px] font-bold leading-snug"
                style={{ color: "#f0e6c8", fontFamily: "Georgia, serif" }}
              >
                Premium{" "}
                <span style={{ color: gold }}>homes & palaces</span>{" "}
                to rent or buy
              </h2>
              <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed max-w-md" style={{ color: "rgba(240,230,200,0.45)" }}>
                Verified properties across India — curated for comfort, elegance, and lasting value.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-center sm:justify-start gap-5">
              {statsData.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3 shrink-0" style={{ color: goldMid }} />
                  <span className="text-[13px] font-bold" style={{ color: gold }}>
                    {value}
                  </span>
                  <span className="text-[11px]" style={{ color: "rgba(240,230,200,0.35)" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-1">
              <Link
                to="/rooms"
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[13px] font-bold transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                style={{ background: gold, color: dark }}
              >
                Browse Properties
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:bg-white/5"
                style={{ border: `1px solid ${goldBorder}`, color: "rgba(212,175,55,0.75)", background: "transparent" }}
              >
                How It Works
              </Link>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="hidden sm:block w-px self-stretch" style={{ background: goldBorder }} />
          <div className="block sm:hidden w-full h-px" style={{ background: goldBorder }} />

          {/* RIGHT — removed hardcoded cards, using CTAs only */}
          <div className="flex sm:flex-col gap-2.5 w-full sm:w-auto">
            <div className="text-sm text-slate-600 dark:text-slate-400" style={{ color: "rgba(240,230,200,0.6)" }}>
              <p className="mb-3 italic">Real properties from verified owners across India</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}