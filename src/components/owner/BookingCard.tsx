import {
  Calendar,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { Button } from "../ui/Button";
import { Booking } from "../../types/api.types";

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
  onReject,
}: BookingCardProps) {
  const isPending = booking.status === "pending";
  const isApproved = booking.status === "approved";

  return (
    <div className="group relative bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-[2px]">
      {/* subtle gold glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-gold/5 via-transparent to-gold/5 pointer-events-none" />

      <div className="p-4 sm:p-6 flex flex-col gap-5">
        {/* HEADER */}
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white font-playfair">
              {booking.tenantName}
            </h3>

            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              Verified Tenant
            </div>
          </div>

          <StatusBadge status={booking.status} />
        </div>

        {/* CONTACT */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="truncate">{booking.tenantEmail}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            {booking.tenantPhone}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="h-px bg-slate-200 dark:bg-slate-800" />

        {/* PROPERTY + DATE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoBlock
            icon={<MapPin className="w-4 h-4" />}
            label="Property"
            value={propertyTitle}
          />

          <InfoBlock
            icon={<Calendar className="w-4 h-4" />}
            label="Visit-in"
            value={new Date(booking.moveInDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          />
        </div>

        {/* MESSAGE */}
        {booking.message && (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm italic text-slate-600 dark:text-slate-400">
            “{booking.message}”
          </div>
        )}

        {/* ACTION SECTION */}
        {/* <div className="flex flex-col gap-3 pt-2">

          {isPending ? (
            <>
              <Button
                variant="primary"
                fullWidth
                className="bg-gold hover:bg-gold/90 text-black font-semibold shadow-lg"
                onClick={() => onApprove(booking)}
              >
                Approve Booking
              </Button>

              <Button
                variant="outline"
                fullWidth
                className="border-slate-300 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                onClick={() => onReject(booking)}
              >
                Reject
              </Button>
            </>
          ) : (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-2">
              {isApproved ? "Booking approved" : "Booking rejected"}
            </div>
          )}

          <div className="text-xs text-center text-slate-400 dark:text-slate-500">
            Requested on{" "}
            {new Date(booking.createdAt).toLocaleDateString()}
          </div>
        </div> */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          {isPending ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="primary"
                className="w-full sm:w-auto px-5 bg-gold hover:bg-gold/90 text-black font-semibold shadow-lg"
                onClick={() => onApprove(booking)}
              >
                Approve
              </Button>

              <Button
                variant="outline"
                className="
    w-full sm:w-auto px-5
    border-red-200 text-red-600
    hover:bg-red-50 hover:border-red-300

    dark:border-red-900/40 
    dark:text-red-400 
    dark:hover:bg-red-900/20

    transition-all
  "
                onClick={() => onReject(booking)}
              >
                Reject
              </Button>
            </div>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400 italic">
              {isApproved ? "Visit approved" : "Visit rejected"}
            </div>
          )}

          <div className="text-xs text-slate-400 dark:text-slate-500 sm:text-right">
            Requested on {new Date(booking.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------ SUB COMPONENTS ------------------ */

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-gold/10 text-gold">{icon}</div>

      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map = {
    approved: {
      label: "Approved",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      style: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    pending: {
      label: "Pending",
      icon: <Clock className="w-3.5 h-3.5" />,
      style: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
    rejected: {
      label: "Rejected",
      icon: <XCircle className="w-3.5 h-3.5" />,
      style: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
  };

  const item = map[status as keyof typeof map] || map.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${item.style}`}
    >
      {item.icon}
      {item.label}
    </span>
  );
}
