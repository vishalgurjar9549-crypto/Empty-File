import React, { useEffect, useRef, useState } from 'react';
import { X, Phone, User, MapPin, Wallet, AlertCircle, Loader } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { showToast } from '../store/slices/ui.slice';
import { createAssistedOrder, verifyAssistedPayment, createAssistedRequest } from '../api/assisted.api';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface AssistedServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormStep = 'form' | 'success';

interface FormData {
  name: string;
  phone: string;
  city: string;
  budget: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  city?: string;
  budget?: string;
}

const SUPPORT_PHONE_NUMBER = '918209595522';
const AMOUNT = 50000; // ₹500
const CITIES = ['Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Chennai', 'Pune', 'Kolkata', 'Jaipur'];

const sanitizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 10);

export function AssistedServiceModal({ isOpen, onClose }: AssistedServiceModalProps) {
  const dispatch = useAppDispatch();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const { user, authStatus } = useAppSelector((state) => state.auth);
  const { loading: subscriptionLoading } = useAppSelector((state) => state.subscription);

  const [step, setStep] = useState<FormStep>('form');
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    phone: sanitizePhone(user?.phone || ''),
    city: '',
    budget: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const htmlElement = document.documentElement;
    const originalOverflow = htmlElement.style.overflow;
    const originalPaddingRight = htmlElement.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    htmlElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      htmlElement.style.paddingRight = scrollbarWidth + 'px';
    }

    setTimeout(() => firstInputRef.current?.focus(), 100);

    return () => {
      htmlElement.style.overflow = originalOverflow || '';
      htmlElement.style.paddingRight = originalPaddingRight || '';
    };
  }, [isOpen]);

  // Handle backdrop click
  useEffect(() => {
    if (!isOpen) return;

    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    };

    window.addEventListener('mousedown', handleBackdropClick);
    return () => window.removeEventListener('mousedown', handleBackdropClick);
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.phone || formData.phone.length !== 10) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (!formData.city) {
      newErrors.city = 'Please select a city';
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setFormData((prev) => ({
        ...prev,
        [name]: sanitizePhone(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    if (authStatus !== 'AUTHENTICATED') {
      dispatch(
        showToast({
          message: 'Please log in to request assistance',
          type: 'error',
        })
      );
      return;
    }

    if (!razorpayLoaded || !window.Razorpay) {
      dispatch(
        showToast({
          message: 'Payment system is loading. Please try again in a moment.',
          type: 'error',
        })
      );
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create order - ✅ NEW: Using dedicated assisted service API
      const orderData = await createAssistedOrder({
        city: formData.city,
      });

      console.log(`📦 Assisted order created: ${orderData.orderId} for ₹${orderData.amount / 100}`);
const requestPayload = {
  name: formData.name.trim(),
  phone: formData.phone.trim(),
  city: formData.city.trim(),
  budget: formData.budget ? Number(formData.budget) : undefined,
};

      // Step 2: Open Razorpay with proper async handler
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: AMOUNT,
        currency: 'INR',
        name: 'Homilivo',
        description: 'Assisted Property Service Booking',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            console.log('Payment successful, verifying...', response.razorpay_payment_id);

            // Step 3: Verify payment - ✅ NEW: Using dedicated assisted service API
            const verifyResult = await verifyAssistedPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verifyResult.success) {
              throw new Error(verifyResult.message || 'Payment verification failed');
            }

            console.log('Payment verified, creating assisted request...');
console.log("🚀 FINAL PAYLOAD:", {
  ...requestPayload,
  paymentId: response.razorpay_payment_id,
  orderId: response.razorpay_order_id,
});
            // Step 4: Create assisted service request - ✅ NEW: Pass actual paymentId, not frontend amount
            const assistedResponse = await createAssistedRequest({
              name: requestPayload.name,
phone: requestPayload.phone,
city: requestPayload.city,
budget: requestPayload.budget,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            });

            if (!assistedResponse.success) {
              throw new Error(assistedResponse.message || 'Failed to create request');
            }

            console.log('Request created, showing success...');

            // Step 5: Update UI to success state
            setStep('success');
            setIsProcessing(false);

            // Step 6: Show success toast
            dispatch(
              showToast({
                message: 'Request submitted! Our expert will contact you shortly.',
                type: 'success',
              })
            );

            // Step 7: Open WhatsApp after state update
            setTimeout(() => {
              const whatsappMessage = 'Hi, I just booked assisted property service. Please help me find a property.';
              const encodedMessage = encodeURIComponent(whatsappMessage);
              const whatsappLink = `https://wa.me/${SUPPORT_PHONE_NUMBER}?text=${encodedMessage}`;
              window.open(whatsappLink, '_blank', 'noopener,noreferrer');
            }, 300);
          } catch (error: any) {
            console.error('Post-payment processing error:', error);

            // Error handling with WhatsApp fallback
            const errorMessage = error.message || 'Error processing your request';
            dispatch(
              showToast({
                message: errorMessage,
                type: 'error',
              })
            );

            // Fallback: Still offer WhatsApp contact despite error
            const shouldFallback = confirm(
              'We had an issue processing your request, but your payment was successful. Would you like to continue on WhatsApp to speak with our experts?'
            );

            if (shouldFallback) {
              const whatsappMessage = 'Hi, I just attempted to book assisted property service. Please help me complete the process.';
              const encodedMessage = encodeURIComponent(whatsappMessage);
              const whatsappLink = `https://wa.me/${SUPPORT_PHONE_NUMBER}?text=${encodedMessage}`;
              window.open(whatsappLink, '_blank', 'noopener,noreferrer');
              setStep('success');
            }

            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            dispatch(
              showToast({
                message: 'Payment cancelled. Your request was not submitted.',
                type: 'error',
              })
            );
          },
        },
        prefill: {
          name: user?.name || formData.name,
          email: user?.email || '',
          contact: formData.phone,
        },
        theme: {
          color: '#1E293B',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      setIsProcessing(false);
      dispatch(
        showToast({
          message:
            error.response?.data?.message ||
            error.message ||
            'Failed to initiate payment',
          type: 'error',
        })
      );
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      name: user?.name || '',
      phone: sanitizePhone(user?.phone || ''),
      city: '',
      budget: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="relative mx-4 w-full max-w-md rounded-[24px] border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-900 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-navy dark:text-white font-playfair">
            Request Assistance
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {step === 'form' ? (
            <>
              {/* Info Box */}
              <div className="mb-6 rounded-[16px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  ₹500 payment is adjustable in your final deal. Our experts will help you negotiate.
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-navy dark:text-white mb-1.5">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    disabled={isProcessing}
                    className="w-full px-4 py-2.5 rounded-[12px] border border-slate-300/80 dark:border-slate-600/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-navy dark:text-white mb-1.5">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    disabled={isProcessing}
                    className="w-full px-4 py-2.5 rounded-[12px] border border-slate-300/80 dark:border-slate-600/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-navy dark:text-white mb-1.5">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    City
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    className="w-full px-4 py-2.5 rounded-[12px] border border-slate-300/80 dark:border-slate-600/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <option value="">Select a city</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.city}</p>
                  )}
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-navy dark:text-white mb-1.5">
                    <Wallet className="h-4 w-4 inline mr-2" />
                    Monthly Budget (Optional)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="e.g., 50000"
                    disabled={isProcessing}
                    className="w-full px-4 py-2.5 rounded-[12px] border border-slate-300/80 dark:border-slate-600/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  {errors.budget && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.budget}</p>
                  )}
                </div>
              </div>

              {/* Price Summary */}
              <div className="mt-6 rounded-[16px] bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Service Fee</span>
                  <span className="font-semibold text-navy dark:text-white">₹500</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Adjustable based on final deal
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || subscriptionLoading}
                className="w-full mt-6 rounded-[14px] bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 active:scale-95 dark:from-amber-500 dark:to-orange-500 dark:hover:from-amber-600 dark:hover:to-orange-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isProcessing || subscriptionLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Proceed to Payment
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <button
                onClick={handleClose}
                disabled={isProcessing || subscriptionLoading}
                className="w-full mt-2 rounded-[14px] border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-3 font-medium text-slate-700 dark:text-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </>
          ) : (
            // Success Step
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-2xl font-bold text-navy dark:text-white font-playfair mb-2">
                Request Submitted!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Payment successful. Your request is now active.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                Our experts will contact you shortly via WhatsApp.
              </p>

              {/* Next Steps */}
              <div className="w-full rounded-[16px] bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 p-4 mb-6 text-left">
                <p className="font-semibold text-blue-900 dark:text-blue-200 mb-3">What's next:</p>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                  <li>✓ You've been upgraded to Platinum Plan</li>
                  <li>✓ Check WhatsApp for expert contact</li>
                  <li>✓ Share your preferences</li>
                </ul>
              </div>

              <button
                onClick={handleClose}
                className="w-full rounded-[14px] bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
