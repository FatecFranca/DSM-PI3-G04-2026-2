export default function Spinner({ size = 18, className = '' }) {
  return (
    <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" role="status" aria-label="Carregando">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-sand-200/60 ${className}`} aria-hidden="true" />;
}

export function PageLoader({ label = 'Carregando…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink-600">
      <Spinner size={28} className="text-accent-ink" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
