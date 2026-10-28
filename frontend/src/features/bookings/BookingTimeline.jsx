import { Check, X } from 'lucide-react';
import { MAIN_FLOW, STATUS_META, isClosed, flowIndex } from './bookingStateMachine';
import { formatDateTime } from '../../utils/dates';

/**
 * Vertical status timeline. Shows the main lifecycle with reached steps checked,
 * and the alternative final state (recusado/expirado/cancelado) when applicable.
 */
export default function BookingTimeline({ booking, compact = false }) {
  const reachedAt = Object.fromEntries((booking.history || []).map((h) => [h.status, h.at]));
  const closed = isClosed(booking.status);
  const current = closed ? Math.max(...(booking.history || []).map((h) => flowIndex(h.status))) : flowIndex(booking.status);
  const steps = compact ? MAIN_FLOW.filter((s, i) => i <= current + 1) : MAIN_FLOW;

  return (
    <ol className="relative space-y-0" aria-label="Etapas do passeio">
      {steps.map((status, i) => {
        const done = i <= current;
        const isCurrent = i === current && !closed;
        return (
          <li key={status} className="relative flex gap-3 pb-4 last:pb-0">
            {i < steps.length - 1 || closed ? <span className={`absolute left-[11px] top-6 h-[calc(100%-16px)] w-0.5 ${i < current ? 'bg-accent' : 'bg-sand-200'}`} aria-hidden="true" /> : null}
            <span
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                done ? 'bg-accent text-on-accent' : 'border-2 border-sand-200 bg-white'
              } ${isCurrent ? 'ring-4 ring-accent/20' : ''}`}
            >
              {done ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : null}
            </span>
            <div className="min-w-0 -mt-0.5">
              <p className={`text-[15px] ${done ? 'font-semibold text-ink-900' : 'text-ink-400'}`}>{STATUS_META[status].label}</p>
              {reachedAt[status] && done ? <p className="text-[12px] text-ink-600">{formatDateTime(reachedAt[status])}</p> : null}
            </div>
          </li>
        );
      })}
      {closed ? (
        <li className="relative flex gap-3">
          <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger-600 text-white">
            <X size={14} strokeWidth={3} aria-hidden="true" />
          </span>
          <div className="-mt-0.5">
            <p className="text-[15px] font-semibold text-danger-600">{STATUS_META[booking.status].label}</p>
            {reachedAt[booking.status] ? <p className="text-[12px] text-ink-600">{formatDateTime(reachedAt[booking.status])}</p> : null}
          </div>
        </li>
      ) : null}
    </ol>
  );
}
