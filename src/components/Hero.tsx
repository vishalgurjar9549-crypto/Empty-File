import { ChevronDown, Shield, Star, Zap } from "lucide-react";
import { SearchBar } from "./SearchBar";

const trustItems = [
  { icon: Shield, text: "Verified Owners" },
  { icon: Zap, text: "Instant Contact" },
  { icon: Star, text: "Premium Listings" },
];

export function Hero() {
   const gold = "rgba(212,175,55,0.9)";
  return (
    <section className="relative overflow-visible ">

      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1600596542815-2a4d9fddace7?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Light mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-slate-50 dark:hidden" />

        {/* Dark mode */}
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/95" />
      </div>

      {/* Content */}
      <div className="relative z-20 min-h-dvh md:min-h-[85vh] flex flex-col items-center justify-center px-4 text-center max-w-6xl mx-auto">

        {/* Badge */}
        <div className="mb-6 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md text-xs tracking-widest uppercase text-slate-600 dark:text-slate-300">
          Verified Homes • Trusted Owners
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
          Find Your Perfect{" "}
          <span style={{ color: gold }}>
            Rental Living Space
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-slate-600 dark:text-slate-300 max-w-xl">
          Discover curated PGs, apartments, and homes with verified owners.
        </p>

        {/* Search */}
        <div className="relative z-30 mt-10 w-full">
          <SearchBar />
        </div>

        {/* Trust row */}
        <div className="relative z-10 mt-8 flex flex-wrap gap-4 justify-center">
          {trustItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md text-sm text-slate-600 dark:text-slate-300"
            >
              <item.icon className="w-4 h-4 text-amber-500" />
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400">
        <ChevronDown className="animate-bounce" />
      </div>
    </section>
  );
}