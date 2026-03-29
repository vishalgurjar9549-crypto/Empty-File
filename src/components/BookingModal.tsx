import React, { useEffect, useState, lazy } from 'react';
import { X, Calendar, User, Phone, CheckCircle, Mail, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createBooking } from '../store/slices/bookings.slice';
import { generateIdempotencyKey } from '../api/bookings.api';
import { Room } from '../types/api.types';
import { Button } from './ui/Button';
interface BookingModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}
export function BookingModal({
  room,
  isOpen,
  onClose
}: BookingModalProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    loading
  } = useAppSelector((state) => state.bookings);
  const {
    user,
    authStatus
  } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idempotencyKey, setIdempotencyKey] = useState<string>(generateIdempotencyKey());

  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = 'hidden';
  //     setIdempotencyKey(generateIdempotencyKey());
  //   } else {
  //     document.body.style.overflow = '';
  //   }
  //   return () => {
  //     document.body.style.overflow = '';
  //   };
  // }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // store original value
    const originalOverflow = document.body.style.overflow;

    // lock scroll
    document.body.style.overflow = 'hidden';

    // your existing logic
    setIdempotencyKey(generateIdempotencyKey());
    return () => {
      // restore original value safely
      document.body.style.overflow = originalOverflow || 'auto';
    };
  }, [isOpen]);
  useEffect(() => {
    if (authStatus === 'AUTHENTICATED' && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [authStatus, user]);
  if (!isOpen) return null;
  if (authStatus === 'INITIALIZING') {
    return <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 dark:border-slate-700 border-t-navy dark:border-t-white mx-auto mb-4"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verifying your session…
          </p>
        </div>
      </div>;
  }
  if (authStatus === 'UNAUTHENTICATED') {
    return <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="auth-required-title">
        <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300">
          {/* Safe-area aware padding bottom on mobile */}
          <div className="p-6 sm:p-8" style={{
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))'
        }}>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gold/10 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <LogIn className="w-7 h-7 sm:w-8 sm:h-8 text-gold dark:text-white" />
              </div>

              <h3 id="auth-required-title" className="text-xl sm:text-2xl font-playfair font-bold text-navy dark:text-white mb-3">
                Sign In Required
              </h3>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-7">
                Please sign in to book a visit for this property. It only takes a minute!
              </p>

              <div className="space-y-3">
                <Button variant="primary" size="lg" fullWidth onClick={() => {
                onClose();
                navigate('/auth/login', {
                  state: {
                    from: `/rooms/${room.id}`
                  }
                });
              }}>
                  Sign In to Continue
                </Button>
                <Button variant="outline" size="md" fullWidth onClick={onClose}>
                  Cancel
                </Button>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-5">
                Don't have an account?{' '}
                <button onClick={() => {
                onClose();
                navigate('/auth/register');
              }} className="text-gold font-medium hover:underline">
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>;
  }
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleaned = formData.phone.replace(/\D/g, '');
      if (cleaned.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      } else if (!/^[6-9]\d{9}$/.test(cleaned)) {
        newErrors.phone = 'Enter a valid Indian mobile number';
      }
    }
    if (!formData.date) {
      newErrors.date = 'property visit date is required';
    } else {
      const selected = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const bookingData = {
      roomId: room.id,
      tenantName: formData.name,
      tenantEmail: formData.email,
      tenantPhone: formData.phone,
      moveInDate: formData.date,
      message: formData.message,
      idempotencyKey
    };
    dispatch(createBooking(bookingData)).then((action) => {
      if (createBooking.fulfilled.match(action)) {
        setIdempotencyKey(generateIdempotencyKey());
        setStep('success');
      }
    });
  };
  const handleClose = () => {
    setStep('form');
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      date: '',
      message: ''
    });
    setErrors({});
    onClose();
  };
  return <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
      <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={handleClose} />

      {/*
      Key mobile fixes:
      - Removed p-3 on the outer wrapper (was causing left/right gaps that could cause overflow)
      - w-full on mobile ensures full-width flush sheet
      - max-h uses dvh (dynamic viewport height) with fallback for better mobile browser support
      - sm:mx-4 adds side margin only on sm+ so the card doesn't touch screen edges on small phones
      */}
      <div className="relative w-full sm:mx-4 sm:max-w-lg max-h-[92dvh] max-h-[92vh] bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300">
        {step === 'form' ? <>
            {/* Header */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 id="booking-modal-title" className="text-lg sm:text-xl font-playfair font-bold text-navy dark:text-white">
                  Book Your Visit
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Schedule a visit in 30 seconds
                </p>
              </div>
              <button onClick={handleClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Close modal">
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 min-h-0">
              {/* Room Summary Card */}
              <div className="mb-5 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 flex gap-3">
                <img src={room.images[0]} alt={room.title} className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-navy dark:text-white truncate text-sm">
                    {room.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {room.location}
                  </p>
                  <p className="text-gold font-bold mt-1 text-sm">
                    ₹{room.pricePerMonth.toLocaleString()}/mo
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/*
              On mobile, stack the name/phone grid to single column.
              grid-cols-1 by default, md:grid-cols-2 only kicks in at 768px+.
              Most phones are <768px so they'll see stacked fields — no overflow.
              */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input type="text" value={formData.name} onChange={(e) => setFormData({
                    ...formData,
                    name: e.target.value
                  })} className={`w-full h-11 pl-9 pr-3 text-sm bg-white dark:bg-slate-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all dark:text-white ${errors.name ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-600'}`} placeholder="John Doe" />
                    </div>
                    {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                        {errors.name}
                      </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input type="tel" value={formData.phone} onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({
                      ...formData,
                      phone: onlyDigits
                    });
                  }} inputMode="numeric" className={`w-full h-11 pl-9 pr-3 text-sm bg-white dark:bg-slate-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all dark:text-white ${errors.phone ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-600'}`} placeholder="9876543210" />
                    </div>
                    {errors.phone && <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                        {errors.phone}
                      </p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input type="email" value={formData.email} onChange={(e) => setFormData({
                  ...formData,
                  email: e.target.value
                })} className={`w-full h-11 pl-9 pr-3 text-sm bg-white dark:bg-slate-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all dark:text-white ${errors.email ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-600'}`} placeholder="john@example.com" disabled />
                  </div>
                  {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {errors.email}
                    </p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Preferred Visit Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input type="date" value={formData.date} onChange={(e) => setFormData({
                  ...formData,
                  date: e.target.value
                })} min={new Date().toISOString().split('T')[0]} className={`w-full h-11 pl-9 pr-3 text-sm bg-white dark:bg-slate-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all dark:text-white ${errors.date ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-600'}`} />
                  </div>
                  {errors.date && <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {errors.date}
                    </p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Message (Optional)
                  </label>
                  <textarea value={formData.message} onChange={(e) => setFormData({
                ...formData,
                message: e.target.value
              })} rows={3} className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all resize-none dark:text-white" placeholder="Any specific requirements or questions..." />
                </div>
              </form>
            </div>

            {/* Sticky CTA footer — safe-area aware */}
            <div className="flex-shrink-0 px-4 sm:px-6 pt-3 pb-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800" style={{
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))'
        }}>
              <Button onClick={handleSubmit} variant="primary" size="lg" fullWidth loading={loading} className="min-h-[48px]">
                Book Visit
              </Button>
            </div>
          </> : <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center h-full min-h-[360px] sm:min-h-[400px]" style={{
        paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))'
      }}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-5 animate-in zoom-in duration-300">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-playfair font-bold text-navy dark:text-white mb-3">
              Request Sent!
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-7 max-w-xs mx-auto">
              The owner has been notified. You will receive a confirmation call
              shortly on{' '}
              <span className="font-semibold text-navy dark:text-white">
                {formData.phone}
              </span>
              .
            </p>
            <Button variant="primary" size="lg" onClick={handleClose} className="min-w-[180px] sm:min-w-[200px]">
              Close
            </Button>
          </div>}
      </div>
    </div>;
}