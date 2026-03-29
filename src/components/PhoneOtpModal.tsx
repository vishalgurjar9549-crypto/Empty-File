// import  { useEffect, useState } from 'react';
// import { X, Phone, Shield, AlertCircle } from 'lucide-react';
// import { useAppDispatch, useAppSelector } from '../store/hooks';
// import { updatePhoneThunk, closeOtpModal, setPhone, clearError } from '../store/slices/otp.slice';
// import { Button } from './ui/Button';
// export function PhoneOtpModal() {
//   const dispatch = useAppDispatch();
//   const {
//     user
//   } = useAppSelector((state) => state.auth);
//   const {
//     isOpen,
//     phone,
//     loading,
//     error
//   } = useAppSelector((state) => state.otp);
//   const [phoneInput, setPhoneInput] = useState('');
//   const [phoneError, setPhoneError] = useState('');
//   // Initialize phone from user profile or state
//   useEffect(() => {
//   if (isOpen) {
//     // Lock scroll
//     document.body.style.overflow = 'hidden';
//   } else {
//     // Restore scroll
//     document.body.style.overflow = '';
//   }

//   // Cleanup when component unmounts
//   return () => {
//     document.body.style.overflow = '';
//   };
// }, [isOpen]);

//   useEffect(() => {
//     if (isOpen) {
//       const initialPhone = phone || user?.phone || '';
//       setPhoneInput(initialPhone);
//       setPhoneError('');
//       dispatch(clearError());
//     }
//   }, [isOpen, phone, user?.phone]);
//   if (!isOpen) return null;
//   const validatePhone = (phoneNumber: string): boolean => {
//     const cleaned = phoneNumber.replace(/\D/g, '');
//     if (cleaned.length !== 10) {
//       setPhoneError('Phone number must be exactly 10 digits');
//       return false;
//     }
//     if (!/^[6-9]\d{9}$/.test(cleaned)) {
//       setPhoneError('Enter a valid Indian mobile number');
//       return false;
//     }
//     setPhoneError('');
//     return true;
//   };
//   const handleSubmit = async () => {
//     if (!validatePhone(phoneInput)) return;
//     const cleaned = phoneInput.replace(/\D/g, '');
//     dispatch(setPhone(cleaned));
//     await dispatch(updatePhoneThunk(cleaned));
//   };
//   const handleClose = () => {
//     if (!loading) {
//       dispatch(closeOtpModal());
//     }
//   };
//   return<div className="fixed inset-0 z-[130] flex items-center justify-center p-4 overscroll-none" role="dialog" aria-modal="true" aria-labelledby="phone-modal-title">

//       {/* Backdrop */}
//       <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={handleClose} />

//       {/* Modal */}
//       <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-gold to-yellow-500 p-6 text-white relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>

//           <button onClick={handleClose} disabled={loading} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-full" aria-label="Close modal">

//             <X size={20} />
//           </button>

//           <div className="relative z-10">
//             <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
//               <Shield className="w-8 h-8 text-white" />
//             </div>
//             <h2 id="phone-modal-title" className="text-2xl font-playfair font-bold text-center mb-2">

//               Add Your Phone Number
//             </h2>
//             <p className="text-white/90 text-sm text-center">
//               Enter your phone number to continue
//             </p>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="p-6">
//           {/* Error Display */}
//           {(error || phoneError) && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
//               <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
//               <span>{error || phoneError}</span>
//             </div>}

//           {/* Phone Input */}
//           <div className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                 Phone Number *
//               </label>
//               <div className="relative">
//                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                 <input type="tel" value={phoneInput} onChange={(e) => {
//                 const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
//                 setPhoneInput(onlyDigits);
//                 setPhoneError('');
//               }} onKeyDown={(e) => {
//                 if (e.key === 'Enter' && phoneInput.length === 10) {
//                   handleSubmit();
//                 }
//               }} inputMode="numeric" className={`w-full h-12 pl-11 pr-4 text-base bg-white dark:bg-slate-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all dark:text-white ${phoneError ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-600'}`} placeholder="9876543210" disabled={loading} autoFocus />

//               </div>
//               <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
//                 Enter 10-digit Indian mobile number
//               </p>
//             </div>

//             <Button onClick={handleSubmit} disabled={loading || phoneInput.length !== 10} loading={loading} variant="primary" size="lg" fullWidth>

//               Continue
//             </Button>
//           </div>

//           {/* Security Notice */}
//           <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-start gap-3">
//             <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
//             <div className="text-xs text-blue-900 dark:text-blue-300">
//               <p className="font-medium mb-1">Why do we need your phone?</p>
//               <p className="text-blue-700 dark:text-blue-400">
//                 Your phone number helps us ensure secure access and enables
//                 property owners to contact you about bookings.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>;
// }

import { useEffect, useState } from 'react';
import { X, Phone, Shield, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updatePhoneThunk, closeOtpModal, setPhone, clearError } from '../store/slices/otp.slice';
import { Button } from './ui/Button';
export function PhoneOtpModal() {
  const dispatch = useAppDispatch();
  const {
    user
  } = useAppSelector((state) => state.auth);
  const {
    isOpen,
    phone,
    loading,
    error
  } = useAppSelector((state) => state.otp);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // 🔒 Lock body scroll
  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     document.body.style.overflow = '';
  //   }

  //   return () => {
  //     document.body.style.overflow = '';
  //   };
  // }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;

    // store previous overflow
    const originalOverflow = document.body.style.overflow;

    // lock scroll
    document.body.style.overflow = 'hidden';
    return () => {
      // restore previous value safely
      document.body.style.overflow = originalOverflow || 'auto';
    };
  }, [isOpen]);

  // ⌨️ Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        dispatch(closeOtpModal());
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, loading, dispatch]);

  // 🔁 Initialize phone input
  useEffect(() => {
    if (isOpen) {
      const initialPhone = phone || user?.phone || '';
      setPhoneInput(initialPhone);
      setPhoneError('');
      dispatch(clearError());
    }
  }, [isOpen, phone, user?.phone, dispatch]);
  if (!isOpen) return null;
  const validatePhone = (phoneNumber: string): boolean => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setPhoneError('Enter a valid Indian mobile number');
      return false;
    }
    setPhoneError('');
    return true;
  };
  const handleSubmit = async () => {
    if (!validatePhone(phoneInput)) return;
    const cleaned = phoneInput.replace(/\D/g, '');
    dispatch(setPhone(cleaned));
    await dispatch(updatePhoneThunk(cleaned));
  };
  const handleClose = () => {
    if (!loading) {
      dispatch(closeOtpModal());
    }
  };
  return <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 overscroll-none" role="dialog" aria-modal="true" aria-labelledby="phone-modal-title">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()} // ✅ stop click bubbling
    >
        {/* Header */}
        <div className="bg-gradient-to-r from-gold to-yellow-500 p-6 text-white relative overflow-hidden">
          <button onClick={handleClose} disabled={loading} className="absolute top-4 right-4 text-white/80 hover:text-white p-2.5 rounded-full">
            <X size={20} />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-1">
              Add Your Phone Number
            </h2>
            <p className="text-sm text-white/90">
              Enter your phone number to continue
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {(error || phoneError) && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <span>{error || phoneError}</span>
            </div>}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number *
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input type="tel" value={phoneInput} onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhoneInput(onlyDigits);
                setPhoneError('');
              }} onKeyDown={(e) => {
                if (e.key === 'Enter' && phoneInput.length === 10) {
                  handleSubmit();
                }
              }} className={`w-full h-12 pl-11 pr-4 border rounded-xl text-black ${phoneError ? 'border-red-300' : 'border-slate-300'}`} placeholder="9876543210" disabled={loading} />
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={loading || phoneInput.length !== 10} loading={loading} fullWidth>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>;
}