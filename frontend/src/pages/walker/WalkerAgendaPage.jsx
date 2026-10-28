import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Settings2, CalendarX, Lock, Info } from 'lucide-react';
import Button, { IconButton } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Chip } from '../../components/forms/Field';
import { PageTitle } from '../../components/common/Layout';
import EmptyState from '../../components/feedback/EmptyState';
import { useActions, useData } from '../../context/AppStore';
import { useActingWalker } from '../../hooks/useAccount';
import { useToast } from '../../components/feedback/Toast';
import { getDaySlots, isDayOff } from '../../services/availabilityService';
import { enrichBooking } from '../../features/bookings/bookingSelectors';
import { isClosed, STATUS_META } from '../../features/bookings/bookingStateMachine';
import { todayISO, addDays, weekDates, startOfWeek, weekdayOf, WEEKDAYS_SHORT, WEEKDAYS_LONG, WEEKDAY_ORDER, DAY_SLOTS, parseISODate, formatDate } from '../../utils/dates';

const SLOT_STYLE = {
  available: 'border-success-600/30 bg-success-50 text-success-600 hover:border-success-600',
  booked: 'border-gold-500 bg-gold-50 text-ink-900',
  blocked: 'border-sand-300 bg-[repeating-linear-gradient(135deg,#F7EDE2_0_6px,#fff_6px_12px)] text-ink-600 hover:border-ink-600',
  off: 'border-transparent bg-cream-100/60 text-ink-400',
  past: 'border-transparent bg-transparent text-ink-400',
};
const SLOT_LABEL = { available: 'Disponível', booked: 'Reservado', blocked: 'Bloqueado', off: 'Fora do expediente', past: 'Horário passado' };

export default function WalkerAgendaPage() {
  const data = useData();
  const walker = useActingWalker();
  const actions = useActions();
  const toast = useToast();
  const today = todayISO();
  const [selected, setSelected] = useState(today);
  const [weekStart, setWeekStart] = useState(startOfWeek(today));
  const [editorOpen, setEditorOpen] = useState(false);

  const days = weekDates(weekStart);
  const bookingsByKey = useMemo(() => {
    if (!walker) return {};
    const map = {};
    data.bookings
      .filter((b) => b.walkerId === walker.id && !isClosed(b.status))
      .forEach((b) => {
        map[`${b.date}|${b.time}`] = enrichBooking(data, b);
      });
    return map;
  }, [data, walker]);

  if (!walker) return <EmptyState icon={Info} title="Perfil de dog walker não encontrado" action={<Button to="/dog-walker/perfil">Configurar perfil</Button>} />;

  const moveWeek = (delta) => {
    const start = addDays(weekStart, delta * 7);
    setWeekStart(start);
    setSelected(delta === 0 ? today : start);
  };
  const goToday = () => {
    setWeekStart(startOfWeek(today));
    setSelected(today);
  };

  const onSlot = (date, slot) => {
    if (slot.state === 'available' || slot.state === 'blocked') {
      actions.toggleSlot(date, slot.time);
      toast.show({ tone: 'success', title: slot.state === 'available' ? `${slot.time} bloqueado` : `${slot.time} liberado`, description: formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' }), duration: 2200 });
    }
  };
  const toggleDay = (date) => {
    const off = isDayOff(walker, date);
    actions.toggleSlot(date, '*');
    toast.success(off ? 'Dia liberado' : 'Dia inteiro bloqueado', 'Novas solicitações respeitam esta mudança.');
  };

  const monthLabel = parseISODate(days[3]).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const selectedSlots = getDaySlots(walker, selected, data.bookings);
  const selectedOff = isDayOff(walker, selected);
  const selectedBookings = selectedSlots.filter((s) => s.state === 'booked').length;

  return (
    <div>
      <PageTitle
        title="Agenda"
        subtitle="Toque em um horário livre para bloquear, ou em um bloqueado para liberar."
        actions={
          <Button variant="secondary" size="sm" icon={Settings2} onClick={() => setEditorOpen(true)}>
            <span className="hidden sm:inline">Disponibilidade semanal</span>
            <span className="sm:hidden">Semanal</span>
          </Button>
        }
      />

      {/* Week navigation */}
      <div className="mb-4 flex items-center gap-2">
        <IconButton icon={ChevronLeft} label="Semana anterior" variant="outline" onClick={() => moveWeek(-1)} />
        <IconButton icon={ChevronRight} label="Próxima semana" variant="outline" onClick={() => moveWeek(1)} />
        <h2 className="ml-1 flex-1 text-lg font-bold first-letter:uppercase">{monthLabel}</h2>
        <Button variant="ghost" size="sm" onClick={goToday}>
          Hoje
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-7 gap-1 sm:gap-2" role="tablist" aria-label="Dias da semana">
        {days.map((d) => {
          const active = d === selected;
          const off = isDayOff(walker, d);
          const count = getDaySlots(walker, d, data.bookings).filter((s) => s.state === 'booked').length;
          return (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(d)}
              className={`flex flex-col items-center rounded-2xl py-2 transition ${active ? 'bg-ink-900 text-white' : 'bg-white text-ink-900 hover:bg-cream-100'} ${d === today && !active ? 'ring-2 ring-accent' : ''}`}
            >
              <span className={`text-[11px] font-semibold uppercase ${active ? 'text-white/70' : 'text-ink-600'}`}>{WEEKDAYS_SHORT[weekdayOf(d)]}</span>
              <span className="text-lg font-bold leading-tight">{parseISODate(d).getDate()}</span>
              <span className="mt-0.5 flex h-2 items-center gap-0.5" aria-label={off ? 'Dia bloqueado' : `${count} passeios`}>
                {off ? <Lock size={9} /> : Array.from({ length: Math.min(count, 3) }).map((_, i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-gold-500" />)}
              </span>
            </button>
          );
        })}
      </div>

      <Legend />

      {/* Mobile / tablet: selected day list */}
      <section className="lg:hidden" aria-label="Horários do dia">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold first-letter:uppercase">{formatDate(selected, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          <Button variant={selectedOff ? 'primary' : 'secondary'} size="sm" icon={CalendarX} onClick={() => toggleDay(selected)} disabled={selected < today}>
            {selectedOff ? 'Liberar dia' : 'Bloquear dia inteiro'}
          </Button>
        </div>
        {selectedOff && selectedBookings ? <p className="mb-3 rounded-xl bg-gold-50 p-3 text-[13px] text-ink-900">Dia bloqueado para novas solicitações. Os passeios já confirmados continuam na agenda.</p> : null}
        <ul className="space-y-2">
          {selectedSlots.map((slot) => (
            <li key={slot.time}>
              <SlotRow date={selected} slot={slot} booking={bookingsByKey[`${selected}|${slot.time}`]} onToggle={() => onSlot(selected, slot)} />
            </li>
          ))}
        </ul>
      </section>

      {/* Desktop: week grid */}
      <section className="hidden lg:block" aria-label="Semana">
        <div className="overflow-hidden rounded-3xl border border-sand-200 bg-white">
          <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] border-b border-sand-200 bg-cream-50">
            <div />
            {days.map((d) => (
              <div key={d} className="flex flex-col items-center gap-1 border-l border-sand-200 py-2.5">
                <span className={`inline-block text-sm font-semibold first-letter:uppercase ${d === today ? 'text-accent-ink' : ''}`}>
                  {WEEKDAYS_SHORT[weekdayOf(d)]} {parseISODate(d).getDate()}
                </span>
                <button type="button" onClick={() => toggleDay(d)} disabled={d < today} className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-ink-600 hover:bg-cream-100 hover:text-ink-900 disabled:opacity-40">
                  {isDayOff(walker, d) ? 'Liberar dia' : 'Bloquear dia'}
                </button>
              </div>
            ))}
          </div>
          {DAY_SLOTS.map((time) => (
            <div key={time} className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] border-b border-sand-200 last:border-b-0">
              <div className="flex items-center justify-end pr-3 text-[13px] font-medium text-ink-600">{time}</div>
              {days.map((d) => {
                const slot = getDaySlots(walker, d, data.bookings).find((s) => s.time === time);
                const booking = bookingsByKey[`${d}|${time}`];
                return (
                  <div key={d} className="border-l border-sand-200 p-1">
                    <GridCell date={d} slot={slot} booking={booking} onToggle={() => onSlot(d, slot)} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <WeeklyEditor open={editorOpen} onClose={() => setEditorOpen(false)} walker={walker} />
    </div>
  );
}

function Legend() {
  return (
    <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-ink-600" aria-label="Legenda">
      {['available', 'booked', 'blocked', 'off'].map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <span className={`h-3.5 w-3.5 rounded border ${SLOT_STYLE[s]}`} aria-hidden="true" /> {SLOT_LABEL[s]}
        </li>
      ))}
    </ul>
  );
}

function SlotRow({ slot, booking, onToggle }) {
  if (slot.state === 'booked' && booking) {
    return (
      <Link to={booking.status === 'requested' ? `/dog-walker/solicitacoes/${booking.id}` : `/dog-walker/solicitacoes/${booking.id}`} className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 px-3.5 py-2.5 ${SLOT_STYLE.booked}`}>
        <span className="w-12 text-[15px] font-bold">{slot.time}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">
            {booking.pet?.name} · {booking.duration} min
          </span>
          <span className="block truncate text-[12px] text-ink-600">
            {STATUS_META[booking.status].label} · {booking.owner?.name}
          </span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-ink-600" aria-hidden="true" />
      </Link>
    );
  }
  const interactive = slot.state === 'available' || slot.state === 'blocked';
  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onToggle}
      aria-label={`${slot.time} — ${SLOT_LABEL[slot.state]}${interactive ? (slot.state === 'available' ? '. Toque para bloquear' : '. Toque para liberar') : ''}`}
      className={`flex min-h-12 w-full items-center gap-3 rounded-2xl border px-3.5 text-left transition ${SLOT_STYLE[slot.state]}`}
    >
      <span className="w-12 text-[15px] font-bold">{slot.time}</span>
      <span className="flex-1 text-sm font-medium">{SLOT_LABEL[slot.state]}</span>
      {interactive ? <span className="text-[12px] font-semibold text-ink-600">{slot.state === 'available' ? 'Bloquear' : 'Liberar'}</span> : null}
    </button>
  );
}

function GridCell({ slot, booking, onToggle }) {
  if (!slot) return null;
  if (slot.state === 'booked' && booking) {
    return (
      <Link to={`/dog-walker/solicitacoes/${booking.id}`} title={`${booking.pet?.name} — ${STATUS_META[booking.status].label}`} className={`flex h-10 flex-col justify-center overflow-hidden rounded-lg border-l-4 px-2 text-[12px] leading-tight ${SLOT_STYLE.booked}`}>
        <span className="truncate font-bold">{booking.pet?.name}</span>
        <span className="truncate text-[11px] text-ink-600">{STATUS_META[booking.status].label}</span>
      </Link>
    );
  }
  const interactive = slot.state === 'available' || slot.state === 'blocked';
  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onToggle}
      aria-label={`${slot.time} — ${SLOT_LABEL[slot.state]}`}
      title={interactive ? (slot.state === 'available' ? 'Bloquear horário' : 'Liberar horário') : SLOT_LABEL[slot.state]}
      className={`h-10 w-full rounded-lg border text-[11px] font-semibold transition ${SLOT_STYLE[slot.state]}`}
    >
      {slot.state === 'blocked' ? <Lock size={12} className="mx-auto" aria-hidden="true" /> : slot.state === 'available' ? 'Livre' : ''}
    </button>
  );
}

function WeeklyEditor({ open, onClose, walker }) {
  const actions = useActions();
  const toast = useToast();
  const [draft, setDraft] = useState(null);
  const current = draft ?? walker.availability;

  const toggle = (weekday, time) => {
    const list = current[weekday] || [];
    const next = list.includes(time) ? list.filter((t) => t !== time) : [...list, time];
    setDraft({ ...current, [weekday]: next });
  };
  const close = () => {
    setDraft(null);
    onClose();
  };
  const save = () => {
    WEEKDAY_ORDER.forEach((wd) => actions.updateWeeklyAvailability(wd, current[wd] || []));
    toast.success('Disponibilidade semanal salva', 'Os horários de contratação já foram atualizados.');
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Disponibilidade semanal"
      description="Horários em que você aceita passeios toda semana. Bloqueios pontuais são feitos direto na agenda."
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button onClick={save}>Salvar disponibilidade</Button>
        </div>
      }
    >
      <div className="space-y-5">
        {WEEKDAY_ORDER.map((wd) => {
          const list = current[wd] || [];
          return (
            <fieldset key={wd}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <legend className="text-[15px] font-semibold first-letter:uppercase">{WEEKDAYS_LONG[wd]}</legend>
                <div className="flex gap-1">
                  <button type="button" className="rounded-full px-2.5 py-1 text-[12px] font-semibold text-ink-600 hover:bg-cream-100" onClick={() => setDraft({ ...current, [wd]: [...DAY_SLOTS] })}>
                    Dia todo
                  </button>
                  <button type="button" className="rounded-full px-2.5 py-1 text-[12px] font-semibold text-ink-600 hover:bg-cream-100" onClick={() => setDraft({ ...current, [wd]: [] })}>
                    Folga
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DAY_SLOTS.map((t) => (
                  <Chip key={t} size="sm" selected={list.includes(t)} onClick={() => toggle(wd, t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>
    </Modal>
  );
}
