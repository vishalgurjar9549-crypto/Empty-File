import React from 'react';
import { X, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Booking } from '../../types/api.types';
interface BookingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: Booking | null;
  action: 'approve' | 'reject';
  propertyTitle: string;
  loading: boolean;
}
export function BookingConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  booking,
  action,
  propertyTitle,
  loading
}: BookingConfirmModalProps) {
  if (!isOpen || !booking) return null;
  const isApprove = action === 'approve';
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/20 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isApprove ? 'border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10' : 'border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10'} flex justify-between items-center`}>

          <h3 className={`text-lg font-bold font-playfair flex items-center gap-2 ${isApprove ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>

            {isApprove ? <>
                <CheckCircle className="w-5 h-5" />
                Confirm Approval
              </> : <>
                <AlertTriangle className="w-5 h-5" />
                Reject Booking?
              </>}
          </h3>
          <button onClick={onClose} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500" disabled={loading}>

            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-3 border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Tenant</span>
              <span className="font-medium text-navy dark:text-white">
                {booking.tenantName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                Property
              </span>
              <span className="font-medium text-navy dark:text-white text-right truncate max-w-[200px]">
                {propertyTitle}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                Move-in
              </span>
              <span className="font-medium text-navy dark:text-white">
                {new Date(booking.moveInDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {!isApprove && <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                This action cannot be undone. The tenant will be notified
                immediately that their request was declined.
              </p>
            </div>}

          {isApprove && <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to approve this booking? The tenant will be
              notified and the property will be marked as booked.
            </p>}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="flex-1">

            Cancel
          </Button>
          <Button variant={isApprove ? 'primary' : 'danger'} onClick={onConfirm} loading={loading} className={`flex-1 ${isApprove ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20' : ''}`}>

            {isApprove ? 'Approve Booking' : 'Reject Booking'}
          </Button>
        </div>
      </div>
    </div>;
}