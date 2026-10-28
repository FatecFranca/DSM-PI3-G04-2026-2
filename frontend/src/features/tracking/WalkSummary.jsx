import { CheckCircle2, Clock, Route, Wallet, Lock, BadgeCheck, MessageSquareQuote } from 'lucide-react';
import LiveMap from './LiveMap';
import ReviewForm from '../reviews/ReviewForm';
import { StatusBadge, Stars } from '../../components/common/Badge';
import { Avatar } from '../../components/common/SmartImage';
import Button from '../../components/common/Button';
import { BOOKING_STATUS as S } from '../bookings/bookingStateMachine';
import { walkerPayout } from '../payments/paymentSplit';
import { formatBRL, formatDuration, formatKm, firstName } from '../../utils/format';
import { formatDateLong, formatTime } from '../../utils/dates';

/**
 * End-of-walk summary for both sides. Finishing the walk releases the second half
 * of the payment; the tutor can then review (independent from payment).
 */
export default function WalkSummary({ live, perspective = 'owner', className = '' }) {
  const { booking } = live;
  const { walker, pet } = booking;
  const released = booking.payment.status === 'released';
  const durationMin = booking.tracking.startedAt && booking.tracking.endedAt ? Math.max(booking.duration, Math.round((booking.tracking.endedAt - booking.tracking.startedAt) / 60000)) : booking.duration;
  const shownDuration = Math.min(durationMin, booking.duration * 3);

  return (
    <div className={`space-y-5 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-600">
          <CheckCircle2 size={24} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-bold leading-tight">{pet?.name} chegou em casa</h2>
          <p className="text-sm text-ink-600">
            {formatDateLong(booking.date)} · com {firstName(walker?.name)}
            {booking.tracking.endedAt ? ` · finalizado às ${formatTime(booking.tracking.endedAt)}` : ''}
          </p>
        </div>
      </div>

      <div className="h-44 overflow-hidden rounded-2xl border border-sand-200">
        <LiveMap live={live} interactive={false} showRecenter={false} />
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {[
          { icon: Clock, label: 'Duração', value: formatDuration(shownDuration) },
          { icon: Route, label: 'Distância', value: formatKm(booking.tracking.distanceKm) },
          { icon: Wallet, label: perspective === 'walker' ? 'Seu ganho' : 'Valor', value: formatBRL(perspective === 'walker' ? booking.walkerEarnings : booking.price) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-cream-100 p-3">
            <dt className="flex items-center gap-1 text-[12px] text-ink-600">
              <s.icon size={13} aria-hidden="true" /> {s.label}
            </dt>
            <dd className="mt-0.5 text-[15px] font-bold">{s.value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-[13px] text-ink-600">Rota: {booking.tracking.routeSummary}</p>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sand-200 p-4">
        <div className="flex items-center gap-2.5">
          {released ? <BadgeCheck size={20} className="text-success-600" aria-hidden="true" /> : <Lock size={20} className="text-gold-700" aria-hidden="true" />}
          <div>
            <p className="text-sm font-semibold">{released ? '100% repassado ao dog walker' : 'Metade repassada, metade retida'}</p>
            <p className="text-[12px] text-ink-600">{released ? '50% na confirmação do passeio e 50% ao finalizar' : 'O restante é liberado quando o passeio é finalizado'}</p>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {booking.status === S.COMPLETED && perspective === 'owner' ? (
        <div className="rounded-2xl border border-sand-200 bg-white p-4">
          <ReviewForm booking={booking} />
        </div>
      ) : null}

      {booking.status === S.COMPLETED && perspective === 'walker' ? (
        <p className="rounded-2xl bg-gold-50 p-4 text-sm text-ink-900">Pagamento 100% liberado: {formatBRL(walkerPayout(booking).first)} na confirmação e {formatBRL(walkerPayout(booking).second)} agora. {firstName(booking.owner?.name)} ainda pode avaliar o passeio.</p>
      ) : null}

      {booking.review ? (
        <figure className="rounded-2xl bg-cream-100 p-4">
          <div className="flex items-center gap-2">
            <MessageSquareQuote size={18} className="text-accent-ink" aria-hidden="true" />
            <Stars value={booking.review.rating} />
          </div>
          {booking.review.comment ? <blockquote className="mt-2 text-[15px] leading-relaxed">“{booking.review.comment}”</blockquote> : null}
          <figcaption className="mt-2 flex items-center gap-2 text-[13px] text-ink-600">
            <Avatar src={booking.owner?.avatar} name={booking.owner?.name} size={22} /> {booking.owner?.name}
          </figcaption>
        </figure>
      ) : null}

      {perspective === 'owner' && walker ? (
        <Button variant="secondary" fullWidth to={`/dog-walkers/${walker.id}?pet=${booking.petId}&duracao=${booking.duration}`}>
          Contratar de novo
        </Button>
      ) : (
        <Button variant="secondary" fullWidth to="/dog-walker/ganhos">
          Ver ganhos
        </Button>
      )}
    </div>
  );
}
