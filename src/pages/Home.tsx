import { useEffect } from "react";

import {
  Shield,
  Star,
  Clock,
  MapPin,
  Users,
  Wallet,

} from "lucide-react";

import { Hero } from "../components/Hero";
import { FeaturedRooms } from "../components/FeaturedRooms";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loadCities } from "../store/slices/metadata.slice";
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
  const dispatch = useAppDispatch();
  const cities = useAppSelector((state) => state.metadata?.cities ?? []);

  useEffect(() => {
    if (cities.length === 0) {
      dispatch(loadCities());
    }
  }, [dispatch, cities.length]);

  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-black transition-colors duration-500">
      {/* Hero */}
      <Hero />

      {/* Premium Collection Showcase */}
      <StayCollectionShowcase/>

      <WhatsNewProperties />
      {/* ============================== */}
      {/* Popular Cities */}
      {/* ============================== */}
     
     <PopularCitiesScroller cities={cities} />

      {/* ============================== */}
      {/* Trust / Highlights */}
      {/* ============================== */}
      {/* <section className="relative py-14 md:py-20 border-y border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6">
            {trustItems.map((item, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-5 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <item.icon className="w-5 h-5" />
                </div>

                <p className="font-semibold text-sm sm:text-[15px] text-slate-900 dark:text-white">
                  {item.label}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

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