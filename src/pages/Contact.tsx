import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Contact() {
  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 transition-colors duration-300">
      <section className="py-6 md:py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 sm:space-y-7 lg:space-y-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-navy dark:text-white font-playfair leading-tight text-center">
              Get in Touch
            </h1>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-navy dark:text-white mb-6">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-navy/5 dark:bg-white/10 rounded-full flex items-center justify-center text-navy dark:text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Email Us
                    </p>
                    <p className="font-medium text-navy dark:text-white">
                      hello@kangaroorooms.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-navy/5 dark:bg-white/10 rounded-full flex items-center justify-center text-navy dark:text-white">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Call Us
                    </p>
                    <p className="font-medium text-navy dark:text-white">
                      +91 80 1234 5678
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-navy/5 dark:bg-white/10 rounded-full flex items-center justify-center text-navy dark:text-white">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Visit Us
                    </p>
                    <p className="font-medium text-navy dark:text-white">
                      123, 4th Block, Koramangala, Bangalore
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-6">
              Send us a Message
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 outline-none focus:border-gold dark:text-white" />

              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input type="email" className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 outline-none focus:border-gold dark:text-white" />

              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Message
                </label>
                <textarea rows={4} className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 outline-none focus:border-gold dark:text-white">
                </textarea>
              </div>
              <button className="w-full py-3 bg-navy dark:bg-slate-200 text-white dark:text-navy font-bold rounded-lg hover:bg-gold dark:hover:bg-white transition-colors">
                Send Message
              </button>
            </form>
          </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}