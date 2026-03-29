import { ChevronDown, Shield, Star, Zap } from "lucide-react";
import { SearchBar } from "./SearchBar";
export function Hero() {
  return <section className="relative flex flex-col items-center justify-center overflow-hidden bg-slate-900 pb-16 px-4">
      {/* Background Image with Parallax-like feel */}
      <div className="absolute inset-0 z-0" style={{
      backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-2a4d9fddace7?q=80&w=2070&auto=format&fit=crop")',
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900/90" />
      </div>

      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-navy/40 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <div className="relative z-20 container mx-auto px-4 sm:px-6 text-center max-w-5xl mb-8 md:mb-12">
        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse"></span>
          <span className="text-slate-200 text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase">
            Verified Homes • Trusted Owners{" "}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-white mb-6 md:mb-8 leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          Find Your Perfect <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-gold italic pr-2">
            Living Space
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 px-4">
          Discover curated PGs, shared apartments, and luxury homes.{" "}
          <br className="hidden md:block" />
          <span className="text-white font-medium"></span>
          Verified Owners.
        </p>

        {/* Search Bar Component */}
        <div className="w-full max-w-5xl mx-auto relative z-30 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <SearchBar />
        </div>

        {/* Trust Badges (Below Search) */}
        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 animate-in fade-in duration-1000 delay-500">
          {[{
          icon: Shield,
          text: "Verified Owners"
        }, {
          icon: Zap,
          text: "Instant Contact"
        }, {
          icon: Star,
          text: "Premium Listings"
        }].map((item, i) => <div key={i} className="flex items-center gap-2 text-slate-400">
              <div className="p-1.5 rounded-full bg-white/5 border border-white/10">
                <item.icon className="w-4 h-4 text-gold" />
              </div>
              <span className="text-sm font-medium">{item.text}</span>
            </div>)}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-slate-500 hidden sm:block">
        <ChevronDown className="w-6 h-6 opacity-50" />
      </div>
    </section>;
}