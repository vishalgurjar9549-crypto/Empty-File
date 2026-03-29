import React from 'react';
import { Calendar, Phone, Mail, Clock, CheckCircle, XCircle, User, MapPin, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Booking } from '../../types/api.types';
interface BookingCardProps {
  booking: Booking;
  propertyTitle: string;
  onApprove: (booking: Booking) => void;
  onReject: (booking: Booking) => void;
}
export function BookingCard({
  booking,
  propertyTitle,
  onApprove,
  onReject
}: BookingCardProps) {
  const isPending = booking.status === 'pending';
  const isApproved = booking.status === 'approved';
  const isRejected = booking.status === 'rejected';
  return <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-6 flex flex-col md:flex-row gap-6">
        {/* Left: Tenant & Property Info */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Header: Tenant Name & Verified Badge */}
          <div className="flex items-start justify-between md:justify-start md:gap-4">
            <div>
              <h3 className="text-lg font-bold text-navy dark:text-white font-playfair flex items-center gap-2">
                {booking.tenantName}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                Verified Tenant
              </div>
            </div>

            {/* Mobile Status Badge (visible only on small screens) */}
            <div className="md:hidden">
              <StatusBadge status={booking.status} />
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              {booking.tenantEmail}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              {booking.tenantPhone}
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-700 w-full" />

          {/* Property & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                  Property
                </p>
                <p className="font-medium text-navy dark:text-white line-clamp-1" title={propertyTitle}>

                  {propertyTitle}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gold/10 dark:bg-gold/20 rounded-lg text-gold">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                  Move-in Date
                </p>
                <p className="font-medium text-navy dark:text-white">
                  {new Date(booking.moveInDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                </p>
              </div>
            </div>
          </div>

          {/* Message (if any) */}
          {booking.message && <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-400 italic border border-slate-100 dark:border-slate-700/50">
              "{booking.message}"
            </div>}
        </div>

        {/* Right: Status & Actions */}
        <div className="flex flex-col justify-between items-end gap-6 min-w-[200px] border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700 pt-6 md:pt-0 md:pl-6">
          {/* Desktop Status Badge */}
          <div className="hidden md:block">
            <StatusBadge status={booking.status} />
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-3">
            {isPending ? <>
                <Button variant="primary" size="sm" fullWidth className="bg-green-600 hover:bg-green-700 text-white shadow-green-900/20 border-transparent" onClick={() => onApprove(booking)}>

                  Approve Request
                </Button>
                <Button variant="outline" size="sm" fullWidth className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20" onClick={() => onReject(booking)}>

                  Reject
                </Button>
              </> : <div className="w-full text-center py-2 text-sm text-slate-400 dark:text-slate-500 italic">
                {isApproved ? 'Booking approved' : 'Booking rejected'}
              </div>}

            <div className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
              Requested on {new Date(booking.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>;
}
function StatusBadge({
  status


}: {status: string;}) {
  const styles = {
    approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
  };
  const icons = {
    approved: <CheckCircle className="w-3.5 h-3.5" />,
    pending: <Clock className="w-3.5 h-3.5" />,
    rejected: <XCircle className="w-3.5 h-3.5" />
  };
  const labels = {
    approved: 'APPROVED',
    pending: 'PENDING',
    rejected: 'REJECTED'
  };
  const key = status as keyof typeof styles;
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[key] || styles.pending}`}>

      {icons[key]}
      {labels[key]}
    </span>;
}