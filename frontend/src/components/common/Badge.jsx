import { ShieldCheck, Star, ShieldAlert, Clock3 } from 'lucide-react';
import { STATUS_META } from '../../features/bookings/bookingStateMachine';
import { isVerified } from '../../features/walkers/walkerSelectors';
import { formatRating, formatNumber } from '../../utils/format';

const TONES = {
  neutral: 'bg-cream-100 text-ink-600 ring-sand-200',
  accent: 'bg-accent-soft text-accent-ink ring-transparent',
  wine: 'bg-wine-50 text-wine-500 ring-wine-100',
  gold: 'bg-gold-50 text-gold-800 ring-gold-100',
  success: 'bg-success-50 text-success-600 ring-transparent',
  warning: 'bg-gold-50 text-gold-800 ring-gold-100',
  danger: 'bg-danger-50 text-danger-600 ring-transparent',
  info: 'bg-info-50 text-info-600 ring-transparent',
  live: 'bg-ink-900 text-white ring-transparent',
  white: 'bg-white/95 text-ink-900 ring-transparent shadow-sm',
};

export default function Badge({ tone = 'neutral', icon: Icon, children, className = '', size = 'sm' }) {
  const sizes = { xs: 'text-[11px] px-2 py-0.5 gap-1', sm: 'text-xs px-2.5 py-1 gap-1.5', md: 'text-sm px-3 py-1.5 gap-1.5' };
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full font-medium ring-1 ring-inset ${TONES[tone]} ${sizes[size]} ${className}`}>
      {Icon ? <Icon size={size === 'md' ? 15 : 13} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function StatusBadge({ status, size = 'sm', className = '' }) {
  const meta = STATUS_META[status];
  if (!meta) return null;
  return (
    <Badge tone={meta.tone} size={size} className={className}>
      {meta.tone === 'live' ? (
        <span className="relative mr-0.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500" />
        </span>
      ) : null}
      {meta.label}
    </Badge>
  );
}

/** Only renders the verified seal when BOTH identity and background are verified in the data */
export function VerifiedBadge({ walker, size = 'sm', showPending = false }) {
  if (isVerified(walker)) return <Badge tone="success" icon={ShieldCheck} size={size}>Verificado</Badge>;
  if (!showPending) return null;
  const pending = walker?.verification?.identity === 'pending' || walker?.verification?.background === 'pending';
  return pending ? <Badge tone="warning" icon={Clock3} size={size}>Verificação em análise</Badge> : <Badge tone="neutral" icon={ShieldAlert} size={size}>Não verificado</Badge>;
}

export function Rating({ value, count, size = 'sm', className = '' }) {
  const text = size === 'lg' ? 'text-base' : 'text-sm';
  if (!count && !value) return <span className={`${text} text-ink-600 ${className}`}>Novo</span>;
  return (
    <span className={`inline-flex items-center gap-1 ${text} ${className}`}>
      <Star size={size === 'lg' ? 18 : 14} className="fill-ink-900 text-ink-900" aria-hidden="true" />
      <span className="font-semibold">{formatRating(value)}</span>
      {count != null ? <span className="text-ink-600">({formatNumber(count)})</span> : null}
    </span>
  );
}

export function Stars({ value = 0, size = 16 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= Math.round(value) ? 'fill-gold-500 text-gold-500' : 'fill-sand-200 text-sand-200'} aria-hidden="true" />
      ))}
    </span>
  );
}
