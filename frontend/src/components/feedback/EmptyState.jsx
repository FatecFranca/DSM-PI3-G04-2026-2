export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center rounded-3xl border border-dashed border-sand-200 bg-white/60 px-6 py-12 text-center ${className}`}>
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
          <Icon size={26} aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-ink-600">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
