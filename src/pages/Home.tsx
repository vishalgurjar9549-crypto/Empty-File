import React, { useEffect } from "react";
import { Hero } from "../components/Hero";
import { FeaturedRooms } from "../components/FeaturedRooms";
import { Shield, Star, Clock, MapPin, Users, Wallet, Quote, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loadCities } from "../store/slices/metadata.slice";
// City Images Map
const CITY_IMAGES: Record<string, string> = {
  Bangalore: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1000&auto=format&fit=crop",
  Mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1000&auto=format&fit=crop",
  Delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1000&auto=format&fit=crop",
  Pune: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=1000&auto=format&fit=crop",
  Hyderabad: "https://images.unsplash.com/photo-1551161242-b5af797b7233?q=80&w=851&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  Chennai: "https://images.unsplash.com/photo-1582510003544-4d00b7f0bd44?q=80&w=1000&auto=format&fit=crop",
  Kota: "https://images.unsplash.com/photo-1595435236218-8ac8bcd84426?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a290YSUyMHJhamFzdGhhbnxlbnwwfHwwfHx8MA%3D%3D",
  Jaipur: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amFpcHVyfGVufDB8fDB8fHww",
  default: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop"
};
export function Home() {
  const dispatch = useAppDispatch();
  const cities = useAppSelector((state) => state.metadata?.cities ?? []);
  useEffect(() => {
    if (cities.length === 0) {
      dispatch(loadCities());
    }
  }, [dispatch, cities.length]);
  return <div className="bg-white dark:bg-slate-950 transition-colors duration-300">
      <Hero />

      {/* Popular Cities Section - Premium Masonry/Grid Look */}
      <section className="py-16 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-gold font-bold tracking-widest uppercase text-xs mb-3 block">
              Explore Locations
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-navy dark:text-white mb-6 leading-tight">
              Most Popular Cities
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Find your perfect home in India's most vibrant and growing
              metropolitan hubs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {cities.map((city) => {
            const bgImage = CITY_IMAGES[city.name] || CITY_IMAGES["default"];
            return <Link key={city.id} to={`/rooms?city=${city.id}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-gold/30">
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{
                backgroundImage: `url(${bgImage})`
              }} />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent transition-opacity duration-300" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 text-left z-10">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-playfair font-bold text-white mb-1 group-hover:text-gold transition-colors">
                      {city.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="h-px w-8 bg-white/50 group-hover:w-12 group-hover:bg-gold transition-all duration-300" />
                      <p className="text-xs sm:text-sm text-slate-200 font-medium">
                        {city.totalListings} Listings
                      </p>
                    </div>
                  </div>
                </Link>;
          })}
          </div>
        </div>
      </section>

      {/* Trust Indicators - Clean & Minimal */}
      <section className="py-12 md:py-20 lg:py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 lg:gap-12">
            {[{
            icon: Shield,
            label: "Verified Owners",
            sub: "100% Safe"
          }, {
            icon: Star,
            label: "Premium Quality",
            sub: "Curated Rooms"
          }, {
            icon: Clock,
            label: "Instant Booking",
            sub: "No Waiting"
          }, {
            icon: MapPin,
            label: "Prime Locations",
            sub: "City Center"
          }, {
            icon: Users,
            label: "Community",
            sub: "Like-minded"
          }, {
            icon: Wallet,
            label: "Budget Friendly Brokerage",
            sub: "Direct Booking"
          }].map((item, i) => <div key={i} className="flex flex-col items-center text-center gap-4 group">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 text-navy dark:text-white group-hover:bg-navy group-hover:text-gold dark:group-hover:bg-white dark:group-hover:text-navy transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <item.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-navy dark:text-white text-sm sm:text-base mb-1">
                    {item.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                    {item.sub}
                  </p>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      <FeaturedRooms />

      {/* Testimonials - Premium Cards */}
      <section className="py-16 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-gold font-bold tracking-widest uppercase text-xs mb-3 block">
              Success Stories
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-navy dark:text-white mb-6 leading-tight">
              Loved by Residents
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {[{
            text: "I was skeptical about the 'zero brokerage' claim, but it's 100% real. Found a stunning 1BHK in Indiranagar within 48 hours. The verification process gave me total peace of mind.",
            author: "Priya Sharma",
            role: "Senior Product Designer",
            loc: "Bangalore"
          }, {
            text: "The quality of listings here is unmatched. Unlike other platforms where photos are misleading, Homilivo verifies everything. My studio in Cyber City is exactly as advertised.",
            author: "Rahul Verma",
            role: "Tech Lead",
            loc: "Gurgaon"
          }, {
            text: "Moving to Mumbai was daunting until I found this platform. Connected directly with a verified owner, signed the digital agreement, and moved in. Seamless experience from start to finish.",
            author: "Ananya Desai",
            role: "Marketing Manager",
            loc: "Mumbai"
          }].map((t, i) => <div key={i} className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 relative hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                <div className="absolute -top-6 left-8 sm:left-10 w-12 h-12 bg-navy text-gold flex items-center justify-center rounded-full shadow-lg border-4 border-white dark:border-slate-800">
                  <Quote className="w-5 h-5 fill-current" />
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-8 mt-6 relative z-10 leading-relaxed text-base sm:text-lg flex-1 italic">
                  "{t.text}"
                </p>

                <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-700 pt-6 mt-auto">
                  <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                    {t.author[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy dark:text-white text-base">
                      {t.author}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                      {t.role}, {t.loc}
                    </p>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Newsletter / Owner CTA - Luxury Gradient */}
      <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-navy dark:bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-slate-900 to-navy opacity-90" />
          <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(#C8A45D 1px, transparent 1px)",
          backgroundSize: "30px 30px"
        }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-6 md:mb-8 leading-tight">
            Unlock the True Value of <br />
            <span className="text-gold">Your Property</span>
          </h2>
          <p className="text-slate-300 mb-10 md:mb-12 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-light px-4">
            Join an exclusive network of owners earning steady, verified income.
            We handle the vetting, marketing, and management so you don't have
            to.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <Link to="/owners" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold to-yellow-600 text-white font-bold rounded-full hover:shadow-2xl hover:shadow-gold/20 hover:scale-105 transition-all duration-300 uppercase tracking-wider text-sm text-center">
              List Your Property
            </Link>
            <Link to="/contact" className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-full hover:bg-white hover:text-navy transition-all duration-300 uppercase tracking-wider text-sm text-center">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>;
}