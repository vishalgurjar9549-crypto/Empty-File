import { Clock, Crown } from "lucide-react";
 
export function TenantPlanCard({ sub }: { sub: any }) {
  const isPlatinum = sub.plan === "PLATINUM";
  
  return (
    <div 
      className={`dashboard-card p-5 ${
        isPlatinum 
          ? 'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5' 
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Crown 
            className="w-5 h-5" 
            style={{ color: isPlatinum ? '#a855f7' : 'var(--color-gold)' }}
          />
          <span 
            className="font-bold text-lg"
            style={{ color: isPlatinum ? '#a855f7' : 'var(--color-gold)' }}
          >
            {sub.plan}
          </span>
        </div>
        <span className="badge text-xs">
          {sub.city}
        </span>
      </div>
      {sub.expiresAt && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <Clock className="w-4 h-4 flex-shrink-0" />
          Expires {new Date(sub.expiresAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}