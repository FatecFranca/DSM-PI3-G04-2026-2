import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, MessageCircle, AlertTriangle, Navigation, Check, X, StickyNote, Info, UserRound } from 'lucide-react';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/SmartImage';
import { ConfirmDialog } from '../../components/common/Modal';
import { Card, InfoRow, PageTitle } from '../../components/common/Layout';
import EmptyState from '../../components/feedback/EmptyState';
import PetSafetyCard from '../../components/cards/PetSafetyCard';
import BookingTimeline from '../../features/bookings/BookingTimeline';
import { useActions, useData } from '../../context/AppStore';
import { useBooking } from '../../hooks/useBookings';
import { useActingWalker } from '../../hooks/useAccount';
import { useBookingActions } from '../../features/bookings/useBookingActions';
import { BOOKING_STATUS as S, STATUS_META, isClosed, isLive, walkerNextAction } from '../../features/bookings/bookingStateMachine';
import { compatibilityWarnings } from '../../features/walkers/walkerSelectors';
import { formatBRL, firstName } from '../../utils/format';
import { formatDateLong, timeToMinutes, formatDate } from '../../utils/dates';
import { PLATFORM_FEE_RATE } from '../../utils/constants';
import { useAccountSwitch } from '../../features/auth/useAccountSwitch';

/** Other active bookings of the same walker whose time window overlaps this one */
function findConflicts(bookings, booking) {
  const start = timeToMinutes(booking.time);
  const end = start + booking.duration;
  return bookings.filter((b) => {
    if (b.id === booking.id || b.walkerId !== booking.walkerId || b.date !== booking.date || isClosed(b.status)) return false;
    const s = timeToMinutes(b.time);
    return s < end && start < s + b.duration;
  });
}

export default function WalkerRequestDetailPage() {
  const { bookingId } = useParams();
  const booking = useBooking(bookingId);
  const walker = useActingWalker();
  const { switchToWalker } = useAccountSwitch();
  const data = useData();
  const actions = useActions();
  const { accept, decline, advance } = useBookingActions();
  const navigate = useNavigate();
  const [readConfirmed, setReadConfirmed] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);

  if (!booking) {
    return <EmptyState icon={Info} title="Solicitação não encontrada" description="Ela pode ter sido removida ao restaurar os dados de demonstração." action={<Button to="/dog-walker/solicitacoes">Voltar às solicitações</Button>} />;
  }
  if (walker && booking.walkerId !== walker.id) {
    return (
      <EmptyState
        icon={Info}
        title="Esta solicitação é para outro dog walker"
        description={`Ela foi enviada para ${booking.walker?.name}. Só o próprio dog walker pode aceitar ou recusar.`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" to="/dog-walker/solicitacoes">Ver minhas solicitações</Button>
            <Button onClick={() => switchToWalker(booking.walkerId, `/dog-walker/solicitacoes/${booking.id}`)}>Demonstração: entrar como {booking.walker?.name?.split(' ')[0]}</Button>
          </div>
        }
      />
    );
  }

  const { pet, owner } = booking;
  const isRequest = booking.status === S.REQUESTED;
  const conflicts = findConflicts(data.bookings, booking);
  const warnings = compatibilityWarnings(walker, pet);
  const next = walkerNextAction(booking.status);

  const openChat = () => {
    const conversation = actions.openConversation(booking.walkerId, booking.ownerId);
    navigate(`/dog-walker/mensagens/${conversation.id}`);
  };
  const goOnTheWay = () => {
    if (advance(booking.id, S.ON_THE_WAY, 'walker', 'A caminho', `${firstName(owner?.name)} foi avisado.`)) navigate(`/dog-walker/passeio/${booking.id}`);
  };

  return (
    <div className={isRequest ? 'pb-40 md:pb-0' : ''}>
      <PageTitle back="/dog-walker/solicitacoes" title={isRequest ? `Solicitação de ${pet?.name}` : `Passeio de ${pet?.name}`} subtitle={<StatusBadge status={booking.status} />} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          {isRequest ? (
            <p className="flex items-start gap-2 rounded-2xl bg-cream-100 p-3.5 text-sm text-ink-900">
              <Info size={18} className="mt-0.5 shrink-0 text-accent-ink" aria-hidden="true" />
              Leia com atenção o comportamento, os equipamentos e a saúde de {pet?.name} antes de responder.
            </p>
          ) : null}

          {conflicts.length ? (
            <div role="alert" className="flex gap-3 rounded-2xl border border-danger-600/30 bg-danger-50 p-4 text-sm">
              <AlertTriangle size={20} className="shrink-0 text-danger-600" aria-hidden="true" />
              <div>
                <p className="font-semibold text-danger-600">Conflito de horário</p>
                {conflicts.map((c) => (
                  <p key={c.id} className="text-ink-900">
                    Você já tem um passeio às {c.time} ({c.duration} min) — {STATUS_META[c.status].label.toLowerCase()}.
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          {warnings.length ? (
            <ul className="space-y-1 rounded-2xl border border-gold-500/40 bg-gold-50 p-4 text-sm text-ink-900">
              {warnings.map((w) => (
                <li key={w} className="flex gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-gold-800" aria-hidden="true" /> {w}
                </li>
              ))}
            </ul>
          ) : null}

          <PetSafetyCard pet={pet} variant="full" />

          {booking.notes ? (
            <Card className="p-4">
              <h2 className="mb-1.5 flex items-center gap-2 text-sm font-bold">
                <StickyNote size={16} className="text-accent-ink" aria-hidden="true" /> Recado de {firstName(owner?.name)}
              </h2>
              <p className="text-[15px] text-ink-900">“{booking.notes}”</p>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Avatar src={owner?.avatar} name={owner?.name} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{owner?.name ?? 'Tutor'}</p>
                <p className="text-[13px] text-ink-600">{owner?.createdAt ? `No Rolê de Pet desde ${formatDate(owner.createdAt, { month: 'long', year: 'numeric' })}` : 'Tutor'}</p>
              </div>
              <Button variant="secondary" size="sm" icon={MessageCircle} onClick={openChat} aria-label={`Mensagem para ${owner?.name}`}>
                <span className="hidden sm:inline">Mensagem</span>
              </Button>
            </div>
            <div className="mt-3 divide-y divide-sand-200 border-t border-sand-200">
              <InfoRow icon={CalendarDays} label="Data">
                <span className="inline-block first-letter:uppercase">{formatDateLong(booking.date)}</span>
              </InfoRow>
              <InfoRow icon={Clock} label="Horário e duração">
                {booking.time} · {booking.duration} min
              </InfoRow>
              <InfoRow icon={MapPin} label="Retirada">
                {booking.address || 'A confirmar com o tutor'}
              </InfoRow>
              <InfoRow icon={UserRound} label="Contato do tutor">
                {pet?.emergency?.ownerPhone || owner?.phone || '—'}
              </InfoRow>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 font-bold">Valores</h2>
            <dl className="space-y-1.5 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-ink-600">Valor pago pelo tutor</dt>
                <dd>{formatBRL(booking.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-600">Taxa da plataforma ({Math.round(PLATFORM_FEE_RATE * 100)}%)</dt>
                <dd>− {formatBRL(booking.fee)}</dd>
              </div>
              <div className="flex justify-between border-t border-sand-200 pt-2 text-base font-bold">
                <dt>Você recebe</dt>
                <dd>{formatBRL(booking.walkerEarnings)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[13px] text-ink-600">O tutor paga só depois que você aceita. Você recebe 50% assim que o passeio é fechado e os outros 50% quando finaliza o passeio.</p>
          </Card>

          {!isRequest ? (
            <Card className="p-4">
              <h2 className="mb-3 font-bold">Andamento</h2>
              <BookingTimeline booking={booking} compact />
              <div className="mt-4 flex flex-col gap-2">
                {booking.status === S.PAID && next ? (
                  <Button fullWidth size="lg" icon={Navigation} onClick={goOnTheWay}>
                    {next.label}
                  </Button>
                ) : null}
                {isLive(booking.status) ? (
                  <Button fullWidth size="lg" icon={Navigation} to={`/dog-walker/passeio/${booking.id}`}>
                    Abrir passeio
                  </Button>
                ) : null}
                {booking.status === S.ACCEPTED ? <p className="rounded-xl bg-cream-100 p-3 text-[13px] text-ink-600">Aceito. Aguardando o pagamento de {firstName(owner?.name)} para confirmar o horário.</p> : null}
                {[S.COMPLETED, S.REVIEWED].includes(booking.status) ? (
                  <Button fullWidth variant="secondary" to="/dog-walker/ganhos">
                    Ver em Ganhos
                  </Button>
                ) : null}
              </div>
            </Card>
          ) : null}
        </aside>
      </div>

      {isRequest ? (
        <div className="fixed inset-x-0 z-[800] border-t border-sand-200 bg-white/95 shadow-bar backdrop-blur-md lg:static lg:mt-6 lg:rounded-3xl lg:border lg:shadow-card" style={{ bottom: 'calc(var(--bottom-nav-h) + var(--safe-bottom))' }}>
          <div className="container-page flex flex-col gap-2.5 py-3 md:px-5">
            <label className="flex cursor-pointer items-start gap-2.5 text-sm">
              <input type="checkbox" checked={readConfirmed} onChange={(e) => setReadConfirmed(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--accent-ink)]" />
              <span>Li as informações de comportamento e segurança de {pet?.name}</span>
            </label>
            <div className="flex gap-2">
              <Button variant="secondary" icon={X} onClick={() => setConfirmDecline(true)} className="flex-1 md:flex-none">
                Recusar
              </Button>
              <Button icon={Check} disabled={!readConfirmed} onClick={() => accept(booking.id)} className="flex-[2] md:flex-none">
                Aceitar · {formatBRL(booking.walkerEarnings)}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDecline}
        onClose={() => setConfirmDecline(false)}
        onConfirm={() => {
          decline(booking.id);
          setConfirmDecline(false);
        }}
        title="Recusar esta solicitação?"
        description={`${firstName(owner?.name)} será avisado e poderá escolher outro dog walker. Nenhum valor é cobrado.`}
        confirmLabel="Recusar solicitação"
        tone="danger"
      />

      {!isRequest && booking.status === S.DECLINED ? (
        <p className="mt-5 text-sm text-ink-600">
          Você recusou esta solicitação. <Link to="/dog-walker/solicitacoes" className="font-semibold text-accent-ink underline-offset-4 hover:underline">Ver outras solicitações</Link>
        </p>
      ) : null}
    </div>
  );
}
