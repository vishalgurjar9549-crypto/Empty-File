export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="py-16 md:py-20 px-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[var(--color-gold-soft)] border border-[var(--color-gold-border)] mb-6 md:mb-8 text-[var(--color-gold)]">
        {icon}
      </div>
      <h3 className="text-heading-lg mb-2 md:mb-3">
        {title}
      </h3>
      <p className="text-base text-[var(--color-text-secondary)] max-w-sm mx-auto mb-6 md:mb-8">
        {description}
      </p>
      {action}
    </div>
  );
}