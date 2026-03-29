import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Wallet, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadCities } from '../store/slices/metadata.slice';
export function SearchBar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cities = useAppSelector((state) => state.metadata?.cities ?? []);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  useEffect(() => {
    if (cities.length === 0) {
      dispatch(loadCities());
    }
  }, [dispatch, cities.length]);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (type) params.append('type', type);
    if (budget) params.append('budget', budget);
    navigate(`/rooms?${params.toString()}`);
  };
  return <form onSubmit={handleSearch} className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 max-w-5xl mx-auto flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch">

      {/* City Select */}
      <div className="flex-1 relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold transition-colors z-10 pointer-events-none">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
        <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-[52px] pl-12 pr-10 bg-white dark:bg-slate-800 rounded-xl border border-transparent focus:border-gold/30 focus:ring-2 focus:ring-gold/20 outline-none text-slate-700 dark:text-slate-200 font-medium appearance-none cursor-pointer transition-all shadow-sm text-sm sm:text-base" aria-label="Select City">

          <option value="">Select City</option>
          {cities.map((c) => <option key={c.id} value={c.id}>
              {c.name}
            </option>)}
        </select>
      </div>

      {/* Room Type Select */}
      <div className="flex-1 relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold transition-colors z-10 pointer-events-none">
          <Home className="w-5 h-5" />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full h-[52px] pl-12 pr-10 bg-white dark:bg-slate-800 rounded-xl border border-transparent focus:border-gold/30 focus:ring-2 focus:ring-gold/20 outline-none text-slate-700 dark:text-slate-200 font-medium appearance-none cursor-pointer transition-all shadow-sm text-sm sm:text-base" aria-label="Property Type">

          <option value="">Property Type</option>
          <option value="Single">Single Room</option>
          <option value="Shared">Shared Room</option>
          <option value="PG">PG</option>
          <option value="1BHK">1 BHK</option>
          <option value="2BHK">2 BHK</option>
        </select>
      </div>

      {/* Budget Select */}
      <div className="flex-1 relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold transition-colors z-10 pointer-events-none">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
        <select value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full h-[52px] pl-12 pr-10 bg-white dark:bg-slate-800 rounded-xl border border-transparent focus:border-gold/30 focus:ring-2 focus:ring-gold/20 outline-none text-slate-700 dark:text-slate-200 font-medium appearance-none cursor-pointer transition-all shadow-sm text-sm sm:text-base" aria-label="Budget Range">

          <option value="">Budget Range</option>
          <option value="0-10000">Under ₹10k</option>
          <option value="10000-20000">₹10k - ₹20k</option>
          <option value="20000-40000">₹20k - ₹40k</option>
          <option value="40000-100000">₹40k+</option>
        </select>
      </div>

      {/* Search Button */}
      <button type="submit" className="w-full md:w-auto px-8 h-[52px] bg-gradient-to-r from-gold to-yellow-600 text-navy font-bold rounded-xl hover:shadow-lg hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wide text-sm">

        <Search className="w-5 h-5" />
        <span>Search</span>
      </button>
    </form>;
}