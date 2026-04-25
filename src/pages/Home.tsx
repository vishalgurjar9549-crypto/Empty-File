import { useEffect } from "react";

import {
  Shield,
  Star,
  Clock,
  MapPin,
  Users,
  Wallet,
  Flame,

} from "lucide-react";

import { Hero } from "../components/Hero";
import { FeaturedRooms } from "../components/FeaturedRooms";
import { useAppSelector } from "../store/hooks";
import { StayCollectionShowcase } from "../components/StayCollectionShowcase";
import PopularCitiesScroller from "../components/PopularCitiesScroller";
import { WhatsNewProperties } from "../components/WhatsNewProperties";
import GrowWithSection from "../components/home/GrowWithSection";
import Testimonials from "../components/home/Testimonials";

// ==============================
// City Images
// ==============================
// const CITY_IMAGES: Record<string, string> = {
//   Bangalore:
//     "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1000&auto=format&fit=crop",
//   Mumbai:
//     "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1000&auto=format&fit=crop",
//   Delhi:
//     "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1000&auto=format&fit=crop",
//   Pune:
//     "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=1000&auto=format&fit=crop",
//   Hyderabad:
//     "https://images.unsplash.com/photo-1551161242-b5af797b7233?q=80&w=851&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//   Chennai:
//     "https://images.unsplash.com/photo-1582510003544-4d00b7f0bd44?q=80&w=1000&auto=format&fit=crop",
//   Kota:
//     "https://images.unsplash.com/photo-1595435236218-8ac8bcd84426?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a290YSUyMHJhamFzdGhhbnxlbnwwfHwwfHx8MA%3D%3D",
//   Jaipur:
//     "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amFpcHVyfGVufDB8fDB8fHww",
//   default:
//     "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop",
// };

// ==============================
// Trust Features
// ==============================
const trustItems = [
  {
    icon: Shield,
    label: "Verified Owners",
    sub: "100% Safe",
  },
  {
    icon: Star,
    label: "Premium Quality",
    sub: "Curated Rooms",
  },
  {
    icon: Clock,
    label: "Instant Booking",
    sub: "No Waiting",
  },
  {
    icon: MapPin,
    label: "Prime Locations",
    sub: "City Center",
  },
  {
    icon: Users,
    label: "Community Living",
    sub: "Like-minded",
  },
  {
    icon: Wallet,
    label: "Zero Brokerage",
    sub: "Direct Booking",
  },
];

// ==============================
// Testimonials
// ==============================


// ==============================
// Home Page
// ==============================
export function Home() {
  const cities = useAppSelector((state) => state.metadata?.cities ?? []);
  const citiesLoading = useAppSelector((state) => state.metadata?.loading ?? false);

  // ✅ Cities are already loaded globally at App.tsx initialization
  // No need for duplicate loading here

  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-black transition-colors duration-500">
      {/* Hero */}
      <Hero />

      {/* Premium Collection Showcase */}
      <StayCollectionShowcase/>

      <WhatsNewProperties />
      
      {/* ============================== */}
      {/* STEP 5: Trust Signal */}
      {/* ============================== */}
      <section className="relative py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Trust Signal Text */}
          <div className="flex items-center justify-center gap-2 mb-8 text-center">
            <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
            <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
              🔥 People are actively searching in your city
            </p>
          </div>

          {/* Popular Cities */}
          <PopularCitiesScroller cities={cities} isLoading={citiesLoading} />
        </div>
      </section>

      {/* Featured Rooms */}
      <FeaturedRooms />

      {/* ============================== */}
      {/* Testimonials */}
      {/* ============================== */}
      <Testimonials />

      {/* ============================== */}
      {/* CTA / Owner Section */}
      {/* ============================== */}
      <GrowWithSection/>
    </div>
  );
}