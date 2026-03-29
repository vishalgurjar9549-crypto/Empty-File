
import { Link } from 'react-router-dom';
import { Crown, MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
interface SubscriptionStatusCardProps {
  subscription: {
    id?: string;
    plan: string;
    city: string;
    startedAt?: string;
    expiresAt?: string | null;
    isActive?: boolean;
    canViewContact?: boolean;
    canViewMap?: boolean;
    hasCallSupport?: boolean;
  };
  compact?: boolean;
}
export function SubscriptionStatusCard({
  subscription,
  compact = false
}: SubscriptionStatusCardProps) {
  if (!subscription) return null;
  const plan = subscription.plan?.toUpperCase() || 'FREE';
  const isFree = plan === 'FREE';
  const isGold = plan === 'GOLD';
  const isPlatinum = plan === 'PLATINUM';
  // Derive visibility permissions from plan if not explicitly provided
  const canViewContact = subscription.canViewContact ?? (isGold || isPlatinum);
  const canViewMap = subscription.canViewMap ?? (isGold || isPlatinum);
  const hasCallSupport = subscription.hasCallSupport ?? isPlatinum;
  const planColor = isPlatinum ? 'text-purple-600 dark:text-purple-400' : isGold ? 'text-[#C8A45D]' : 'text-slate-600 dark:text-slate-300';
  const bgColor = isPlatinum ? 'bg-purple-50 dark:bg-purple-900/20' : isGold ? 'bg-[#C8A45D]/10 dark:bg-[#C8A45D]/20' : 'bg-slate-50 dark:bg-slate-700/50';
  const borderColor = isPlatinum ? 'border-purple-200 dark:border-purple-800' : isGold ? 'border-[#C8A45D]/30 dark:border-[#C8A45D]/30' : 'border-slate-200 dark:border-slate-600';
  const cityName = subscription.city ? subscription.city.charAt(0).toUpperCase() + subscription.city.slice(1) : 'All Cities';
  const expiryDate = subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : null;
  return <div className={`bg-white dark:bg-slate-800 rounded-2xl border ${borderColor} overflow-hidden shadow-sm`}>

      <div className={`p-6 ${compact ? 'py-4' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Current Plan
            </p>
            <div className="flex items-center gap-2">
              <h3 className={`text-2xl font-playfair font-bold ${planColor}`}>
                {plan}
              </h3>
              {isPlatinum && <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400 fill-current" />}
              {isGold && <Crown className="w-5 h-5 text-[#C8A45D] fill-current" />}
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${bgColor} ${planColor}`}>

            <MapPin className="w-3 h-3" />
            {cityName}
          </div>
        </div>

        {!compact && <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              {canViewContact ? <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" /> : <AlertCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
              <span>Owner Contact Details</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              {canViewMap ? <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" /> : <AlertCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
              <span>Exact Map Location</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              {hasCallSupport ? <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" /> : <AlertCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
              <span>1-to-1 Call Support</span>
            </div>
          </div>}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {expiryDate ? `Expires on ${expiryDate}` : 'No expiry'}
          </div>

          {isFree && <Link to={`/pricing?city=${subscription.city || ''}`} className="text-sm font-bold text-[#1E293B] dark:text-white hover:text-[#C8A45D] dark:hover:text-[#C8A45D] transition-colors">

              Upgrade Plan →
            </Link>}
        </div>
      </div>
    </div>;
}