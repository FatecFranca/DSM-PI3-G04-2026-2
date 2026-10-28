import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck, Navigation, History, ChevronDown, Route, Timer, Footprints, Search } from 'lucide-react';
import { PageTitle } from '../../components/common/Layout';
import Tabs from '../../components/common/Tabs';
import Button from '../../components/common/Button';
import { Stars } from '../../components/common/Badge';
import BookingCard from '../../components/cards/BookingCard';
import EmptyState from '../../components/feedback/EmptyState';
import OwnerBookingActions from '../../features/bookings/OwnerBookingActions';
import { useOwnerBookings } from '../../hooks/useBookings';
import { formatDuration, formatKm } from '../../utils/format';

const TABS = [
  { id: 'proximos', label: 'Próximos' },
  { id: 'ao-vivo', label: 'Ao vivo' },
  { id: 'concluidos', label: 'Concluídos' },
];

export default function OwnerWalksPage() {
  const [params, setParams] = useSearchParams();
  const groups = useOwnerBookings();
  const [showClosed, setShowClosed] = useState(false);
  const defaultTab = groups.live.length ? 'ao-vivo' : 'proximos';
  const tab = TABS.some((t) => t.id === params.get('aba')) ? params.get('aba') : defaultTab;

  const items = TABS.map((t) => ({
    ...t,
    count: t.id === 'proximos' ? groups.upcoming.length : t.id === 'ao-vivo' ? groups.live.length : groups.finished.filter((b) => b.status === 'completed').length,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="Passeios" subtitle="Solicitações, passeios agendados, ao vivo e histórico." />
      <Tabs items={items} value={tab} onChange={(id) => setParams({ aba: id }, { replace: true })} ariaLabel="Situação dos passeios" className="mb-5" />

      {tab === 'proximos' ? (
        <List
          bookings={groups.upcoming}
          empty={<EmptyState icon={CalendarCheck} title="Nenhum passeio agendado" description="Encontre um dog walker de confiança e solicite o próximo passeio." action={<Button to="/buscar" icon={Search}>Buscar dog walkers</Button>} />}
        />
      ) : null}

      {tab === 'ao-vivo' ? (
        <List
          bookings={groups.live}
          live
          empty={<EmptyState icon={Navigation} title="Nenhum passeio em andamento" description="Quando o dog walker sair para buscar seu pet, o acompanhamento ao vivo aparece aqui." action={<Button variant="secondary" onClick={() => setParams({ aba: 'proximos' })}>Ver próximos passeios</Button>} />}
        />
      ) : null}

      {tab === 'concluidos' ? (
        <List
          bookings={groups.finished}
          finished
          empty={<EmptyState icon={History} title="Nenhum passeio concluído ainda" description="Seu histórico com rota, duração, distância e avaliação fica guardado aqui." action={<Button to="/buscar" icon={Search}>Buscar dog walkers</Button>} />}
        />
      ) : null}

      {groups.closed.length ? (
        <section className="mt-8">
          <button
            type="button"
            onClick={() => setShowClosed((v) => !v)}
            aria-expanded={showClosed}
            className="flex w-full items-center justify-between rounded-2xl px-1 py-2 text-left text-[15px] font-semibold text-ink-600 hover:text-ink-900"
          >
            Encerrados ({groups.closed.length}) — recusados, expirados e cancelados
            <ChevronDown size={18} className={`transition ${showClosed ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {showClosed ? <List bookings={groups.closed} className="mt-3 opacity-90" /> : null}
        </section>
      ) : null}
    </div>
  );
}

function List({ bookings, empty, finished, className = '' }) {
  if (!bookings.length) return empty ?? null;
  return (
    <ul className={`space-y-4 ${className}`}>
      {bookings.map((b) => (
        <li key={b.id}>
          <BookingCard
            booking={b}
            perspective="owner"
            to={`/tutor/passeios/${b.id}`}
            actions={
              <>
                {finished ? <FinishedSummary booking={b} /> : null}
                <OwnerBookingActions booking={b} />
              </>
            }
          />
        </li>
      ))}
    </ul>
  );
}

function FinishedSummary({ booking }) {
  return (
    <div className="mb-1 w-full space-y-2 text-[13px] text-ink-600">
      <p className="flex items-start gap-1.5">
        <Route size={14} className="mt-0.5 shrink-0" aria-hidden="true" /> {booking.tracking?.routeSummary}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1"><Timer size={14} aria-hidden="true" /> {formatDuration(booking.tracking?.elapsedMin || booking.duration)}</span>
        <span className="inline-flex items-center gap-1"><Footprints size={14} aria-hidden="true" /> {formatKm(booking.tracking?.distanceKm)}</span>
        {booking.review ? <Stars value={booking.review.rating} size={14} /> : <span className="font-semibold text-accent-ink">Aguardando sua avaliação</span>}
      </div>
    </div>
  );
}
