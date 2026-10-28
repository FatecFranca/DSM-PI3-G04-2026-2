import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, StickyNote, KeyRound, ShieldCheck, Wallet, Route, Timer, Footprints, FlaskConical, ChevronRight, SearchX } from 'lucide-react';
import { PageTitle, Card, InfoRow, Divider } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, Rating, Stars, VerifiedBadge } from '../../components/common/Badge';
import SmartImage, { Avatar } from '../../components/common/SmartImage';
import EmptyState from '../../components/feedback/EmptyState';
import { SafetyAlert } from '../../components/cards/PetSafetyCard';
import BookingTimeline from '../../features/bookings/BookingTimeline';
import OwnerBookingActions from '../../features/bookings/OwnerBookingActions';
import ReviewForm from '../../features/reviews/ReviewForm';
import { useBooking } from '../../hooks/useBookings';
import { useCurrentUser } from '../../hooks/useAccount';
import { useActions } from '../../context/AppStore';
import { useToast } from '../../components/feedback/Toast';
import { STATUS_META, BOOKING_STATUS as S, walkerNextAction, isFinished } from '../../features/bookings/bookingStateMachine';
import { formatBRL, formatDuration, formatKm, firstName } from '../../utils/format';
import { formatDateLong, formatDateTime } from '../../utils/dates';
import { DOG_SIZE_LABEL } from '../../utils/constants';
import { OWNER_PAYMENT_META } from '../../features/payments/paymentSplit';

const PAYMENT_INFO = OWNER_PAYMENT_META;

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const booking = useBooking(bookingId);
  const user = useCurrentUser();

  if (!booking || booking.ownerId !== user?.id) {
    return (
      <div className="mx-auto max-w-xl">
        <PageTitle title="Passeio" back="/tutor/passeios" />
        <EmptyState icon={SearchX} title="Passeio não encontrado" description="Ele pode ter sido removido ou pertence a outra conta." action={<Button to="/tutor/passeios">Ver meus passeios</Button>} />
      </div>
    );
  }

  const { walker, pet } = booking;
  const meta = STATUS_META[booking.status];
  const payment = PAYMENT_INFO[booking.payment?.status] ?? PAYMENT_INFO.none;
  const showCode = [S.PAID, S.ON_THE_WAY].includes(booking.status);

  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title={`Passeio de ${pet?.name ?? 'pet'}`} subtitle={meta.ownerHint} back="/tutor/passeios" actions={<StatusBadge status={booking.status} size="md" />} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {showCode ? (
            <Card className="border-accent-ink/30 bg-accent-soft p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-on-accent">
                  <KeyRound size={24} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-600">Código de retirada</p>
                  <p className="mt-0.5 text-4xl font-extrabold tracking-[0.3em] text-ink-900" aria-label={`Código ${booking.pickupCode.split('').join(' ')}`}>{booking.pickupCode}</p>
                  <p className="mt-2 text-sm text-ink-900">Informe este código a {firstName(walker?.name)} na hora de entregar {pet?.name}. É assim que a retirada é confirmada.</p>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Walker */}
          <Card className="p-4 sm:p-5">
            <Link to={`/dog-walkers/${walker?.id}`} className="flex items-center gap-4 rounded-2xl">
              <Avatar src={walker?.avatar} name={walker?.name} size={56} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-ink-600">Dog walker</p>
                <p className="truncate text-lg font-bold">{walker?.name ?? 'Profissional indisponível'}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <Rating value={walker?.rating} count={walker?.reviewsCount} />
                  <VerifiedBadge walker={walker} size="xs" />
                </div>
              </div>
              <ChevronRight size={20} className="text-ink-400" aria-hidden="true" />
            </Link>
          </Card>

          {/* Pet + schedule */}
          <Card className="p-4 sm:p-5">
            <Link to={`/tutor/pets/${pet?.id}`} className="flex items-center gap-4">
              <SmartImage src={pet?.photo} alt={pet?.name} className="h-16 w-16 rounded-2xl" rounded="rounded-2xl" />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">{pet?.name ?? 'Pet removido'}</p>
                {pet ? <p className="text-sm text-ink-600">{pet.breed} · {DOG_SIZE_LABEL[pet.size]} · {pet.weightKg} kg</p> : null}
              </div>
              <ChevronRight size={20} className="text-ink-400" aria-hidden="true" />
            </Link>
            <SafetyAlert pet={pet} className="mt-4" />
            <Divider className="my-4" />
            <div className="grid sm:grid-cols-2 sm:gap-x-6">
              <InfoRow icon={CalendarDays} label="Data"><span className="inline-block first-letter:uppercase">{formatDateLong(booking.date)}</span></InfoRow>
              <InfoRow icon={Clock} label="Horário e duração">{booking.time} · {formatDuration(booking.duration)}</InfoRow>
              <InfoRow icon={MapPin} label="Retirada" className="sm:col-span-2">{booking.address}</InfoRow>
              {booking.notes ? <InfoRow icon={StickyNote} label="Suas observações" className="sm:col-span-2">{booking.notes}</InfoRow> : null}
            </div>
          </Card>

          {/* Walk summary */}
          {isFinished(booking.status) ? (
            <Card className="p-4 sm:p-5">
              <h2 className="mb-3 text-lg font-bold">Resumo do passeio</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <Stat icon={Timer} label="Duração" value={formatDuration(booking.tracking.elapsedMin || booking.duration)} />
                <Stat icon={Footprints} label="Distância" value={formatKm(booking.tracking.distanceKm)} />
                <Stat icon={Wallet} label="Valor" value={formatBRL(booking.price)} />
              </div>
              <p className="mt-4 flex items-start gap-2 text-sm text-ink-600">
                <Route size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {booking.tracking.routeSummary}
              </p>
            </Card>
          ) : null}

          {/* Review */}
          {booking.status === S.COMPLETED ? (
            <Card className="p-4 sm:p-5">
              <ReviewForm booking={booking} />
            </Card>
          ) : booking.review ? (
            <Card className="p-4 sm:p-5">
              <h2 className="text-lg font-bold">Sua avaliação</h2>
              <div className="mt-2 flex items-center gap-2">
                <Stars value={booking.review.rating} />
                <span className="text-[13px] text-ink-600">{formatDateTime(booking.review.at)}</span>
              </div>
              {booking.review.comment ? <p className="mt-2 text-[15px] leading-relaxed">“{booking.review.comment}”</p> : null}
            </Card>
          ) : null}

          <Card className="p-4 sm:p-5">
            <h2 className="mb-4 text-lg font-bold">Etapas</h2>
            <BookingTimeline booking={booking} />
          </Card>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Card className="p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-ink-600">Total</span>
              <span className="text-2xl font-extrabold">{formatBRL(booking.price)}</span>
            </div>
            <div className="mt-3 flex items-start gap-3 rounded-2xl bg-cream-100 p-3.5">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-success-600" aria-hidden="true" />
              <div>
                <Badge tone={payment.tone} size="xs">{payment.label}</Badge>
                <p className="mt-1.5 text-[13px] leading-snug text-ink-600">{payment.text}</p>
              </div>
            </div>
            <div className="mt-4">
              <OwnerBookingActions booking={booking} layout="detail" />
            </div>
          </Card>
          <DemoPanel booking={booking} />
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-cream-100 px-2 py-3">
      <Icon size={18} className="mx-auto text-accent-ink" aria-hidden="true" />
      <p className="mt-1 text-[15px] font-bold">{value}</p>
      <p className="text-[12px] text-ink-600">{label}</p>
    </div>
  );
}

/** Presenter shortcut: performs the walker's next step so the flow can be tested end to end */
function DemoPanel({ booking }) {
  const actions = useActions();
  const toast = useToast();
  const next = walkerNextAction(booking.status);
  if (!next) return null;

  const run = () => {
    try {
      if (next.requiresCode) actions.confirmPickup(booking.id, booking.pickupCode);
      else actions.transitionBooking(booking.id, next.to, 'walker');
      toast.success(`Demonstração: ${STATUS_META[next.to].label}`);
    } catch (error) {
      toast.error('Não foi possível avançar', error.message);
    }
  };

  return (
    <div className="rounded-3xl border border-dashed border-gold-700/50 bg-gold-50 p-4">
      <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-gold-800">
        <FlaskConical size={14} aria-hidden="true" /> Demonstração
      </p>
      <p className="mt-1 text-[13px] text-ink-600">Simule a próxima ação do dog walker sem trocar de modo.</p>
      <Button variant="gold" size="sm" className="mt-3" fullWidth onClick={run}>
        {next.requiresCode ? 'Cheguei e confirmar código' : next.label}
      </Button>
    </div>
  );
}
