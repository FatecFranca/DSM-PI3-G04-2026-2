import { Link } from 'react-router-dom';
import { CalendarDays, Clock, ChevronRight } from 'lucide-react';
import SmartImage, { Avatar } from '../common/SmartImage';
import { StatusBadge } from '../common/Badge';
import { STATUS_META } from '../../features/bookings/bookingStateMachine';
import { formatBRL, firstName } from '../../utils/format';
import { formatRelativeDay } from '../../utils/dates';

/**
 * Compact booking summary.
 * perspective="owner" shows the walker; perspective="walker" shows the tutor.
 * `actions` renders status-specific buttons below the summary.
 */
export default function BookingCard({ booking, perspective = 'owner', to, actions, className = '' }) {
  const { walker, pet, owner } = booking;
  const meta = STATUS_META[booking.status];
  const counterpart = perspective === 'owner' ? walker : owner;
  return (
    <article className={`animate-fade-up overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card ${className}`}>
      <Link to={to} className="flex gap-3.5 p-3.5 transition hover:bg-cream-50/60 sm:p-4">
        <div className="relative shrink-0">
          <SmartImage src={pet?.photo} alt={pet?.name ?? 'Pet'} className="h-[76px] w-[76px] rounded-2xl" rounded="rounded-2xl" />
          <Avatar src={counterpart?.avatar} name={counterpart?.name} size={30} ring className="absolute -bottom-1.5 -right-1.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-ink-900">
              {pet?.name ?? 'Pet removido'} <span className="font-normal text-ink-600">com {firstName(counterpart?.name) || '—'}</span>
            </h3>
            <ChevronRight size={18} className="mt-0.5 shrink-0 text-ink-400" aria-hidden="true" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-ink-600">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={13} aria-hidden="true" /> {formatRelativeDay(booking.date)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={13} aria-hidden="true" /> {booking.time} · {booking.duration} min
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <StatusBadge status={booking.status} size="xs" />
            <span className="text-sm font-semibold text-ink-900">{formatBRL(perspective === 'walker' ? booking.walkerEarnings : booking.price)}</span>
          </div>
          <p className="mt-1.5 text-[13px] text-ink-600">{perspective === 'owner' ? meta?.ownerHint : meta?.walkerHint}</p>
        </div>
      </Link>
      {actions ? <div className="flex flex-wrap gap-2 border-t border-sand-200 bg-cream-50/50 px-3.5 py-3 sm:px-4">{actions}</div> : null}
    </article>
  );
}
