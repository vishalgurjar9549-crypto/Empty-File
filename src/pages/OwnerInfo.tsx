import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, TrendingUp, ShieldCheck, Users } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
export function OwnerInfo() {
  const navigate = useNavigate();
  const {
    user
  } = useAppSelector((state) => state.auth);
  const handleListProperty = () => {
    if (user) {
      // Logged-in user → go to dashboard where the List Property flow lives
      navigate('/tenant/dashboard');
    } else {
      navigate('/auth/register');
    }
  };
  return <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20 transition-colors duration-300">
      {/* Hero */}
      <div className="bg-navy text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-playfair mb-6">
            Maximize Your Rental Yields
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Join the fastest growing network of premium rental properties. We
            handle the hassle, you earn the returns.
          </p>
          <button onClick={handleListProperty} className="inline-block px-8 py-4 bg-gold text-navy font-bold rounded-full hover:bg-white transition-colors duration-300">

            List Your Property Now
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-12">
          {[{
          icon: TrendingUp,
          title: 'Higher Occupancy',
          desc: 'Our marketing reach ensures your property never stays empty for long.'
        }, {
          icon: ShieldCheck,
          title: 'Verified Tenants',
          desc: 'Rigorous background checks on every tenant for your peace of mind.'
        }, {
          icon: Users,
          title: 'Property Management',
          desc: 'From maintenance to rent collection, we handle end-to-end operations.'
        }].map((item, i) => <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg shadow-navy/5 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 text-center">

              <div className="w-16 h-16 bg-cream dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-navy dark:text-white mb-4">
                {item.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
            </div>)}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white dark:bg-slate-900 py-24 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-navy dark:text-white font-playfair text-center mb-16">
            How It Works
          </h2>
          <div className="space-y-12">
            {['Register and list your property details', 'Our team visits for verification and photography', 'Property goes live to thousands of seekers', 'Start earning monthly rent hassle-free'].map((step, i) => <div key={i} className="flex items-center gap-6">
                <div className="w-12 h-12 bg-navy dark:bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 p-6 bg-cream dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-lg font-medium text-navy dark:text-white">
                    {step}
                  </p>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
}