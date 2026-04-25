
export function SectionCard({ children, className = '' }) {
  return (
    <div className={`section-card ${className}`}>
      {children}
    </div>
  );
}
 