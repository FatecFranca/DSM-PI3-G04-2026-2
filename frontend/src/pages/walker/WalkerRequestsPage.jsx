import { useState } from 'react';
import { Inbox, CalendarDays, Clock, ChevronRight, Hourglass } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import SmartImage, { Avatar } from '../../components/common/SmartImage';
import { PageTitle } from '../../components/common/Layout';
import Tabs from '../../components/common/Tabs';
import EmptyState from '../../components/feedback/EmptyState';
import BookingCard from '../../components/cards/BookingCard';
import { SafetyAlert } from '../../components/cards/PetSafetyCard';
import { useWalkerBookings } from '../../hooks/useBookings';
import { useActingWalker } from '../../hooks/useAccount';
import { compatibilityWarnings } from '../../features/walkers/walkerSelectors';
import { BOOKING_STATUS as S } from '../../features/bookings/bookingStateMachine';
import { DOG_SIZE_LABEL } from '../../utils/constants';
import { formatBRL, firstName } from '../../utils/format';
import { formatRelativeDay, timeAgo } from '../../utils/dates';

export default function WalkerRequestsPage() {
  const walker = useActingWalker();
  const { requests, awaitingPayment, closed } = useWalkerBookings();
  const [tab, setTab] = useState('novas');
  const answered = closed.filter((b) => b.status === S.DECLINED || b.status === S.EXPIRED || b.status === S.CANCELED);

  return (
    <div>
      <PageTitle title="Solicitações" subtitle="Analise o perfil de cada pet antes de aceitar." />
      <Tabs
        className="mb-5 md:max-w-xl"
        value={tab}
        onChange={setTab}
        items={[
          { id: 'novas', label: 'Novas', count: requests.length },
          { id: 'pagamento', label: 'Aguardando pagamento', count: awaitingPayment.length },
          { id: 'historico', label: 'Histórico' },
        ]}
      />

      {tab === 'novas' ? (
        requests.length === 0 ? (
          <EmptyState icon={Inbox} title="Nenhuma solicitação nova" description="Quando um tutor solicitar um passeio, ele aparece aqui com todas as informações do pet." action={<Button to="/dog-walker/agenda" variant="secondary">Revisar disponibilidade</Button>} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {requests.map((b) => (
              <RequestCard key={b.id} booking={b} walker={walker} />
            ))}
          </div>
        )
      ) : null}

      {tab === 'pagamento' ? (
        awaitingPayment.length === 0 ? (
          <EmptyState icon={Hourglass} title="Nada aguardando pagamento" description="Solicitações aceitas ficam aqui até o tutor confirmar o pagamento." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {awaitingPayment.map((b) => (
              <BookingCard key={b.id} booking={b} perspective="walker" to={`/dog-walker/solicitacoes/${b.id}`} />
            ))}
          </div>
        )
      ) : null}

      {tab === 'historico' ? (
        answered.length === 0 ? (
          <EmptyState icon={Inbox} title="Sem histórico de respostas" description="Solicitações recusadas, expiradas ou canceladas aparecem aqui." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {answered.map((b) => (
              <BookingCard key={b.id} booking={b} perspective="walker" to={`/dog-walker/solicitacoes/${b.id}`} />
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

function RequestCard({ booking, walker }) {
  const { pet, owner } = booking;
  const warnings = compatibilityWarnings(walker, pet);
  return (
    <article className="flex animate-fade-up flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card">
      <div className="flex gap-3.5 p-4">
        <SmartImage src={pet?.photo} alt={pet?.name} className="h-20 w-20 rounded-2xl" rounded="rounded-2xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-bold">{pet?.name}</h2>
            <StatusBadge status={booking.status} size="xs" />
          </div>
          <p className="text-[13px] text-ink-600">
            {pet?.breed} · {DOG_SIZE_LABEL[pet?.size]} · {pet?.weightKg} kg
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-600">
            <Avatar src={owner?.avatar} name={owner?.name} size={18} /> {owner?.name} · {timeAgo(booking.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px border-y border-sand-200 bg-sand-200 text-center">
        <Fact icon={CalendarDays} label="Data" value={formatRelativeDay(booking.date)} />
        <Fact icon={Clock} label="Horário" value={`${booking.time} · ${booking.duration} min`} />
        <div className="bg-white px-2 py-2.5">
          <p className="text-[11px] text-ink-600">Você recebe</p>
          <p className="text-[15px] font-bold">{formatBRL(booking.walkerEarnings)}</p>
          <p className="text-[11px] text-ink-400">de {formatBRL(booking.price)}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {pet?.reactivity && pet.reactivity !== 'nenhuma' ? <Badge size="xs" tone="danger">Reatividade {pet.reactivity}</Badge> : <Badge size="xs" tone="success">Não reativo</Badge>}
          {pet?.equipment?.muzzle && pet.equipment.muzzle !== 'nao' ? <Badge size="xs" tone="warning">Focinheira</Badge> : null}
          {pet?.health?.medication ? <Badge size="xs" tone="info">Medicação às {pet.health.medicationTimes}</Badge> : null}
          {pet?.dogInteraction === 'evitar' ? <Badge size="xs" tone="danger">Evitar outros cães</Badge> : null}
        </div>
        <SafetyAlert pet={pet} />
        {warnings.length ? (
          <ul className="space-y-1 rounded-xl bg-gold-50 p-3 text-[13px] text-ink-900">
            {warnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        ) : null}
        {booking.notes ? <p className="text-[13px] italic text-ink-600">“{booking.notes}” — {firstName(owner?.name)}</p> : null}
      </div>

      <div className="border-t border-sand-200 bg-cream-50/60 p-3">
        <Button to={`/dog-walker/solicitacoes/${booking.id}`} fullWidth iconRight={ChevronRight}>
          Ver detalhes e responder
        </Button>
      </div>
    </article>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="bg-white px-2 py-2.5">
      <p className="flex items-center justify-center gap-1 text-[11px] text-ink-600">
        <Icon size={12} aria-hidden="true" /> {label}
      </p>
      <p className="mt-0.5 text-[14px] font-semibold first-letter:uppercase leading-tight">{value}</p>
    </div>
  );
}
