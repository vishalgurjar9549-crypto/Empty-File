import { Phone, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { AssistedServiceModal } from './AssistedServiceModal';
import { useAppSelector } from '../store/hooks';

export function AssistedServiceSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authStatus } = useAppSelector((state) => state.auth);

  const handleRequestClick = () => {
    if (authStatus !== 'AUTHENTICATED') {
      // Redirect to login or show login prompt
      window.location.href = '/auth/login?redirect=/pricing';
      return;
    }
    setIsModalOpen(true);
  };

  const features = [
    'Personalized property search',
    'Verified options only',
    'Visit & negotiation support',
    'Optional agreement assistance (+₹3000)',
  ];

  return (
    <>
      <section className="mb-16">
        <div className="rounded-[32px] border border-amber-200/50 dark:border-amber-900/30 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-800/50 dark:via-slate-900/50 dark:to-slate-800/30 backdrop-blur-xl overflow-hidden shadow-lg">
          {/* Main Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-8 lg:p-10">
            {/* LEFT: Content */}
            <div className="flex flex-col justify-center">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100/60 dark:bg-amber-900/30 px-3 py-1 w-fit">
                <Phone className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Premium Service
                </span>
              </div>

              {/* Title */}
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-navy dark:text-white font-playfair leading-tight">
                Let Our Experts Find Your Perfect Property
              </h2>

              {/* Subtitle */}
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Skip the search — our team will help you find, negotiate, and finalize your rental.
              </p>

              {/* Features List */}
              <div className="mt-8 space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: CTA Box */}
            <div className="flex flex-col justify-center">
              <div className="rounded-[24px] border border-amber-300/60 dark:border-amber-900/40 bg-white/90 dark:bg-slate-800/80 backdrop-blur-md shadow-xl p-6 sm:p-8">
                {/* Price Label */}
                <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                  Get Started From
                </p>

                {/* Price */}
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-bold text-navy dark:text-white font-playfair">
                    ₹500
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    onwards
                  </span>
                </div>

                {/* Price Note */}
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  Fully adjustable in final deal
                </p>

                {/* Divider */}
                <div className="my-6 h-px bg-gradient-to-r from-amber-200/20 to-orange-200/20 dark:from-amber-900/20 dark:to-orange-900/20" />

                {/* CTA Button */}
                <button
                  onClick={handleRequestClick}
                  className="w-full rounded-[16px] bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 active:scale-95 dark:from-amber-500 dark:to-orange-500 dark:hover:from-amber-600 dark:hover:to-orange-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Request Assistance
                </button>

                {/* Footer Note */}
                <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400">
                  Submit details to proceed with payment
                </p>
              </div>

              {/* Additional Trust Info */}
              <div className="mt-6 flex items-center gap-2 justify-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ✓ No commitments
                </span>
                <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Quick response
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <AssistedServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
