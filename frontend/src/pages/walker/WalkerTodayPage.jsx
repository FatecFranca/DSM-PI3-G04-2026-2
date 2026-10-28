import { Link, useNavigate } from 'react-router-dom';
import { Navigation, MapPin, Clock, Inbox, ChevronRight, ShieldAlert, Wallet, CalendarDays, Info, Hourglass, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import SmartImage, { Avatar } from '../../components/common/SmartImage';
import { Card, SectionHeader } from '../../components/common/Layout';
import EmptyState from '../../components/feedback/EmptyState';
import { SafetyAlert } from '../../components/cards/PetSafetyCard';
import { useActingWalker, useCurrentUser } from '../../hooks/useAccount';
import { useWalkerBookings } from '../../hooks/useBookings';
import { useBookingActions } from '../../features/bookings/useBookingActions';
import { walkerNextAction, isLive, BOOKING_STATUS as S, STATUS_META } from '../../features/bookings/bookingStateMachine';
import { byStartAsc } from '../../features/bookings/bookingSelectors';
import { isVerified } from '../../features/walkers/walkerSelectors';
import { walkerPayout, PAYMENT_STATUS as P } from '../../features/payments/paymentSplit';
import { formatBRL, firstName } from '../../utils/format';
import { todayISO, formatDateLong, formatRelativeDay } from '../../utils/dates';

export default function WalkerTodayPage() {
  const user = useCurrentUser();
  const walker = useActingWalker();
  const bookings = useWalkerBookings();
  const { advance } = useBookingActions();
  const navigate = useNavigate();

  if (!walker) {
    return <EmptyState icon={Info} title="Perfil de dog walker não encontrado" description="Configure seu perfil profissional para começar a receber solicitações." action={<Button to="/dog-walker/perfil">Configurar perfil</Button>} />;
  }

  const today = todayISO();
  const todays = bookings.all
    .filter((b) => b.date === today && (b.status === S.PAID || b.status === S.ACCEPTED || isLive(b.status) || b.status === S.COMPLETED))
    .sort(byStartAsc);
  const liveWalk = bookings.live[0];
  const upcoming = [...bookings.confirmed, ...bookings.awaitingPayment].filter((b) => b.date > today).sort(byStartAsc).slice(0, 4);

  // Day totals only count walks the tutor already paid (see paymentSplit for the 50/50 rule)
  const paidToday = todays.filter((b) => b.payment?.status && b.payment.status !== P.NONE);
  const dayTotal = paidToday.reduce((n, b) => n + b.walkerEarnings, 0);
  const dayReleased = paidToday.reduce((n, b) => n + walkerPayout(b).released, 0);
  const dayRetained = paidToday.reduce((n, b) => n + walkerPayout(b).retained, 0);

  const goOnTheWay = (booking) => {
    if (advance(booking.id, S.ON_THE_WAY, 'walker', 'A caminho', `${firstName(booking.owner?.name)} foi avisado.`)) navigate(`/dog-walker/passeio/${booking.id}`);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold first-letter:uppercase text-accent-ink">{formatDateLong(today)}</p>
          <h1 className="mt-0.5 text-[26px] font-bold leading-tight tracking-tight md:text-[32px]">Bom trabalho, {firstName(walker.name)}</h1>
        </div>
        <Button to="/dog-walker/agenda" variant="secondary" size="sm" icon={CalendarDays} className="hidden sm:inline-flex">
          Agenda
        </Button>
      </header>

      {!isVerified(walker) ? (
        <div className="flex gap-3 rounded-2xl border border-gold-500/40 bg-gold-50 p-4">
          <ShieldAlert size={22} className="shrink-0 text-gold-800" aria-hidden="true" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-ink-900">Seu perfil ainda não está verificado</p>
            <p className="mt-0.5 text-ink-600">Perfis sem verificação de identidade e antecedentes não exibem o selo e aparecem com menos destaque nas buscas.</p>
            <Link to="/dog-walker/perfil#verificacao" className="mt-1.5 inline-flex items-center gap-1 font-semibold text-gold-800 underline-offset-4 hover:underline">
              Enviar documentos <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : null}

      {liveWalk ? (
        <Link to={`/dog-walker/passeio/${liveWalk.id}`} className="flex items-center gap-3.5 rounded-3xl bg-ink-900 p-4 text-white shadow-float transition hover:bg-black">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-500 text-ink-900">
            <Navigation size={22} aria-hidden="true" />
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-gold-400 ring-2 ring-ink-900" />
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-gold-400">Passeio em andamento</p>
            <p className="truncate font-semibold">
              {liveWalk.pet?.name} · {STATUS_META[liveWalk.status].label}
            </p>
            <p className="text-[13px] text-white/70">
              {Math.round(liveWalk.tracking.walkProgress * 100)}% da rota · você recebe {formatBRL(liveWalk.walkerEarnings)}
              {walkerPayout(liveWalk).retained ? ` (${formatBRL(walkerPayout(liveWalk).retained)} ao finalizar)` : ''}
            </p>
          </div>
          <ChevronRight size={22} aria-hidden="true" />
        </Link>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Wallet} label="Ganhos do dia" value={formatBRL(dayTotal)} hint={`${paidToday.length} ${paidToday.length === 1 ? 'passeio confirmado' : 'passeios confirmados'}`} highlight />
        <Stat icon={CheckCircle2} label="Já recebido hoje" value={formatBRL(dayReleased)} hint="50% de cada passeio confirmado" />
        <Stat icon={Hourglass} label="A receber hoje" value={formatBRL(dayRetained)} hint="Entra ao finalizar cada passeio" />
        <Link to="/dog-walker/solicitacoes" className="group rounded-2xl border border-sand-200 bg-white p-4 transition hover:border-ink-900/30">
          <div className="flex items-center justify-between">
            <Inbox size={18} className="text-accent-ink" aria-hidden="true" />
            <ChevronRight size={16} className="text-ink-400 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{bookings.requests.length}</p>
          <p className="text-[13px] text-ink-600">{bookings.requests.length === 1 ? 'Solicitação nova' : 'Solicitações novas'}</p>
        </Link>
      </div>

      <section>
        <SectionHeader title="Programação de hoje" subtitle={todays.length ? `${todays.length} ${todays.length === 1 ? 'compromisso' : 'compromissos'}` : undefined} />
        {todays.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Nenhum passeio para hoje" description="Mantenha sua agenda atualizada para receber novas solicitações." action={<Button to="/dog-walker/agenda" variant="secondary">Abrir agenda</Button>} />
        ) : (
          <ol className="relative space-y-4">
            {todays.map((b) => (
              <li key={b.id}>
                <ScheduleItem booking={b} onGo={() => goOnTheWay(b)} />
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <SectionHeader title="Próximos compromissos" actionTo="/dog-walker/agenda" actionLabel="Agenda" />
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sand-200 bg-white/60 p-5 text-sm text-ink-600">Sem passeios confirmados nos próximos dias.</p>
        ) : (
          <Card className="divide-y divide-sand-200">
            {upcoming.map((b) => (
              <Link key={b.id} to={`/dog-walker/solicitacoes/${b.id}`} className="flex items-center gap-3 p-3.5 hover:bg-cream-50/60">
                <SmartImage src={b.pet?.photo} alt={b.pet?.name} className="h-11 w-11 rounded-xl" rounded="rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">
                    {b.pet?.name} <span className="font-normal text-ink-600">· {firstName(b.owner?.name)}</span>
                  </p>
                  <p className="text-[13px] text-ink-600">
                    {formatRelativeDay(b.date)} às {b.time} · {b.duration} min
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold">{formatBRL(b.walkerEarnings)}</span>
                  <StatusBadge status={b.status} size="xs" />
                </div>
              </Link>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint, highlight }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? 'border-ink-900 bg-ink-900 text-white' : 'border-sand-200 bg-white'}`}>
      <Icon size={18} className={highlight ? 'text-gold-400' : 'text-accent-ink'} aria-hidden="true" />
      <p className="mt-2 truncate text-2xl font-bold">{value}</p>
      <p className={`text-[13px] ${highlight ? 'text-white/80' : 'text-ink-600'}`}>{label}</p>
      {hint ? <p className={`mt-0.5 text-[11px] leading-snug ${highlight ? 'text-white/60' : 'text-ink-400'}`}>{hint}</p> : null}
    </div>
  );
}

/** What the walker gets for one walk, split by installment */
function PayoutLine({ booking }) {
  const { first, second } = walkerPayout(booking);
  const status = booking.payment?.status;
  return (
    <div className="text-sm leading-tight">
      <p>
        <span className="text-ink-600">Você recebe </span>
        <strong>{formatBRL(booking.walkerEarnings)}</strong>
        <span className="text-ink-600"> por este passeio</span>
      </p>
      <p className="mt-0.5 text-[12px] text-ink-600">
        {status === P.PARTIAL
          ? `${formatBRL(first)} já recebido · ${formatBRL(second)} ao finalizar`
          : status === P.RELEASED
            ? 'Valor total já recebido'
            : 'Metade entra quando o tutor pagar, metade ao finalizar'}
      </p>
    </div>
  );
}

function ScheduleItem({ booking, onGo }) {
  const { pet, owner } = booking;
  const next = walkerNextAction(booking.status);
  const live = isLive(booking.status);
  return (
    <article className={`overflow-hidden rounded-3xl border bg-white shadow-card ${live ? 'border-gold-500' : 'border-sand-200'}`}>
      <div className="flex gap-3.5 p-4">
        <div className="flex w-14 shrink-0 flex-col items-center">
          <span className="text-lg font-bold leading-none">{booking.time}</span>
          <span className="mt-1 text-[12px] text-ink-600">{booking.duration} min</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <SmartImage src={pet?.photo} alt={pet?.name} className="h-14 w-14 rounded-2xl" rounded="rounded-2xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[17px] font-bold">{pet?.name ?? 'Pet'}</h3>
                <StatusBadge status={booking.status} size="xs" />
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-600">
                <Avatar src={owner?.avatar} name={owner?.name} size={18} /> Tutor: {owner?.name}
              </p>
            </div>
          </div>
          <p className="mt-2.5 flex items-start gap-1.5 text-[13px] text-ink-900">
            <MapPin size={14} className="mt-0.5 shrink-0 text-ink-600" aria-hidden="true" /> {booking.address || 'Endereço a confirmar'}
          </p>
          {booking.notes ? <p className="mt-1.5 rounded-xl bg-cream-100 px-3 py-2 text-[13px] text-ink-600">“{booking.notes}”</p> : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pet?.health?.medication ? <Badge size="xs" tone="info">Medicação {pet.health.medicationTimes}</Badge> : null}
            {pet?.equipment?.muzzle && pet.equipment.muzzle !== 'nao' ? <Badge size="xs" tone="warning">Focinheira</Badge> : null}
            {pet?.reactivity && pet.reactivity !== 'nenhuma' ? <Badge size="xs" tone="danger">Reatividade {pet.reactivity}</Badge> : null}
          </div>
          <SafetyAlert pet={pet} className="mt-3" />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-sand-200 bg-cream-50/60 px-4 py-3">
        <PayoutLine booking={booking} />
        {live ? (
          <Button to={`/dog-walker/passeio/${booking.id}`} icon={Navigation}>
            Abrir passeio
          </Button>
        ) : next && booking.status === S.PAID ? (
          <Button onClick={onGo} icon={Navigation}>
            {next.label}
          </Button>
        ) : booking.status === S.ACCEPTED ? (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-600">
            <Clock size={14} aria-hidden="true" /> Aguardando pagamento do tutor
          </span>
        ) : (
          <Button to={`/dog-walker/solicitacoes/${booking.id}`} variant="secondary" size="sm">
            Detalhes
          </Button>
        )}
      </div>
    </article>
  );
}
