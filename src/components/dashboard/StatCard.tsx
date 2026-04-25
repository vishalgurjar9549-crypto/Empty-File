export function StatCard({ icon, label, value, hint, onClick, badge }) {
  const Comp = onClick ? 'button' : 'div';
  
  return (
    <Comp
      onClick={onClick}
      className={`ds-fadein stat-card w-full text-left relative overflow-hidden ${onClick ? '' : 'pointer-events-none'}`}
      type={onClick ? 'button' : undefined}
    >
      {/* Subtle corner glow */}
      <div 
        className="absolute top-[-30px] right-[-30px] w-[90px] h-[90px] rounded-full pointer-events-none stat-card-glow"
      />

      {/* Icon */}
      <div className="stat-icon flex-shrink-0">
        {icon}
      </div>

      {/* Content: value, label, hint */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="font-extrabold text-[clamp(18px,2.4vw,26px)] leading-none">
          {value}
        </div>
        <div className="text-sm text-[var(--color-text-secondary)]">
          {label}
        </div>
        {hint && (
          <div className="text-2xs text-[var(--color-gold)] font-medium mt-1">
            {hint}
          </div>
        )}
      </div>

      {/* Badge positioned on the right */}
      {badge && (
        <div className="flex-shrink-0 ml-auto">
          {badge}
        </div>
      )}
    </Comp>
  );
}
