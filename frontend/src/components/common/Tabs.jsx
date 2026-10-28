/** Segmented tabs; `items`: [{ id, label, count? }] */
export default function Tabs({ items, value, onChange, className = '', ariaLabel = 'Seções' }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={`flex gap-1 overflow-x-auto rounded-2xl bg-cream-100 p-1 no-scrollbar ${className}`}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`flex min-h-10 flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition ${
              active ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            {item.icon ? <item.icon size={16} aria-hidden="true" /> : null}
            {item.label}
            {item.count ? (
              <span className={`min-w-5 rounded-full px-1.5 text-[11px] leading-5 ${active ? 'bg-accent text-on-accent' : 'bg-sand-200 text-ink-600'}`}>{item.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Underlined tabs for page-level sections */
export function UnderlineTabs({ items, value, onChange, className = '' }) {
  return (
    <div role="tablist" className={`flex gap-6 overflow-x-auto border-b border-sand-200 no-scrollbar ${className}`}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`relative flex shrink-0 items-center gap-1.5 pb-3 pt-1 text-[15px] font-semibold transition ${active ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900'}`}
          >
            {item.label}
            {item.count ? <span className="rounded-full bg-accent px-1.5 text-[11px] leading-5 text-on-accent">{item.count}</span> : null}
            {active ? <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-ink-900" /> : null}
          </button>
        );
      })}
    </div>
  );
}
