import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Info, Plus, AlertTriangle, AlertCircle, Lock } from 'lucide-react';
import Button from '../../components/common/Button';
import SmartImage from '../../components/common/SmartImage';
import Field, { TextArea } from '../../components/forms/Field';
import { SafetyAlert } from '../../components/cards/PetSafetyCard';
import { useActions, useData } from '../../context/AppStore';
import { useCurrentUser, useMyPets } from '../../hooks/useAccount';
import { getAvailableTimes } from '../../services/availabilityService';
import { quote, walkerDurations } from '../../services/pricing';
import { compatibilityWarnings } from '../walkers/walkerSelectors';
import { addDays, todayISO, parseISODate, WEEKDAYS_SHORT } from '../../utils/dates';
import { formatBRL, firstName } from '../../utils/format';

export const PAYMENT_NOTICE = 'Você só paga depois que o dog walker aceitar. Metade do valor vai para ele quando o passeio é fechado e a outra metade quando ele finaliza o passeio.';

const DAYS_AHEAD = 14;

/**
 * Booking request form (pet, date, time, duration → price).
 * Prefills from the URL (?pet, ?data, ?hora, ?duracao) so search results and
 * "Contratar de novo" land with the right selection.
 */
export default function BookingForm({ walker, onRequested, className = '' }) {
  const data = useData();
  const actions = useActions();
  const user = useCurrentUser();
  const pets = useMyPets();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const durations = walkerDurations(walker);

  const dates = useMemo(() => Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(todayISO(), i)), []);
  const availability = useMemo(() => Object.fromEntries(dates.map((d) => [d, getAvailableTimes(walker, d, data.bookings)])), [dates, walker, data.bookings]);

  const initialDate = params.get('data') && availability[params.get('data')]?.length ? params.get('data') : dates.find((d) => availability[d].length) ?? '';
  const initialPet = pets.find((p) => p.id === params.get('pet'))?.id ?? (pets.length === 1 ? pets[0].id : '');
  const initialDuration = durations.includes(Number(params.get('duracao'))) ? Number(params.get('duracao')) : durations.includes(60) ? 60 : durations[0];

  const [petId, setPetId] = useState(initialPet);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(() => (availability[initialDate]?.includes(params.get('hora')) ? params.get('hora') : ''));
  const [duration, setDuration] = useState(initialDuration);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const pet = pets.find((p) => p.id === petId) ?? null;
  const q = quote(walker, duration);
  const warnings = compatibilityWarnings(walker, pet);
  const times = availability[date] || [];
  const tooLong = (d) => Boolean(pet?.health?.maxWalkMinutes && d > pet.health.maxWalkMinutes);

  const clearError = (key) => setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));

  const submit = (e) => {
    e.preventDefault();
    if (!user) {
      const next = new URLSearchParams(params);
      if (date) next.set('data', date);
      if (time) next.set('hora', time);
      if (duration) next.set('duracao', duration);
      navigate(`/entrar?voltar=${encodeURIComponent(`${location.pathname}?${next.toString()}`)}`);
      return;
    }
    const nextErrors = {};
    if (!petId) nextErrors.petId = 'Selecione qual pet vai passear.';
    if (!date) nextErrors.date = 'Escolha a data do passeio.';
    if (!time) nextErrors.time = 'Escolha um horário disponível.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    try {
      const booking = actions.createBooking({ walkerId: walker.id, petId, date, time, duration, notes: notes.trim() });
      onRequested?.(booking);
      setTime('');
      setNotes('');
    } catch (error) {
      setErrors({ [error.field || 'form']: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={`space-y-5 ${className}`}>
      {/* Pet */}
      <fieldset>
        <legend className="mb-2 flex w-full items-center justify-between text-sm font-semibold">
          <span>
            Qual pet vai passear? <span className="text-danger-600">*</span>
          </span>
          {user ? (
            <Link to={`/tutor/pets/novo?voltar=${encodeURIComponent(location.pathname + location.search)}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent-ink hover:underline">
              <Plus size={14} aria-hidden="true" /> Cadastrar pet
            </Link>
          ) : null}
        </legend>
        {!user ? (
          <p className="rounded-2xl bg-cream-100 p-3.5 text-sm text-ink-600">Entre na sua conta para escolher um dos seus pets cadastrados.</p>
        ) : pets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand-300 p-4 text-center">
            <p className="text-sm text-ink-600">Cadastre o perfil do seu pet para o dog walker conhecer comportamento, saúde e cuidados.</p>
            <Button to={`/tutor/pets/novo?voltar=${encodeURIComponent(location.pathname + location.search)}`} size="sm" variant="secondary" className="mt-3" icon={Plus}>
              Cadastrar meu pet
            </Button>
          </div>
        ) : (
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label="Pet">
            {pets.map((p) => {
              const active = p.id === petId;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setPetId(p.id);
                    clearError('petId');
                    if (p.health?.maxWalkMinutes && duration > p.health.maxWalkMinutes) {
                      const fit = [...durations].reverse().find((d) => d <= p.health.maxWalkMinutes);
                      if (fit) setDuration(fit);
                    }
                  }}
                  className={`flex shrink-0 items-center gap-2 rounded-2xl border-2 py-1.5 pl-1.5 pr-3.5 transition ${active ? 'border-accent-ink bg-accent-soft' : 'border-sand-200 bg-white hover:border-sand-300'}`}
                >
                  <SmartImage src={p.photo} alt="" className="h-10 w-10 rounded-xl" rounded="rounded-xl" />
                  <span className="text-left">
                    <span className="block text-sm font-semibold leading-tight">{p.name}</span>
                    <span className="block text-[12px] text-ink-600">{p.breed}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {errors.petId ? <FieldError>{errors.petId}</FieldError> : null}
      </fieldset>

      {pet ? (
        <div className="space-y-2">
          <SafetyAlert pet={pet} />
          {warnings.map((w) => (
            <p key={w} className="flex items-start gap-2 rounded-xl bg-gold-50 p-3 text-[13px] text-gold-800">
              <AlertTriangle size={16} className="mt-px shrink-0" aria-hidden="true" /> {w}
            </p>
          ))}
        </div>
      ) : null}

      {/* Date */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">
          Data <span className="text-danger-600">*</span>
        </legend>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {dates.map((d) => {
            const free = availability[d].length;
            const active = d === date;
            const dt = parseISODate(d);
            return (
              <button
                key={d}
                type="button"
                disabled={!free}
                aria-pressed={active}
                aria-label={`${dt.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}${free ? '' : ' — sem horários'}`}
                onClick={() => {
                  setDate(d);
                  setTime('');
                  clearError('date');
                }}
                className={`flex w-[54px] shrink-0 flex-col items-center rounded-2xl border py-2 transition disabled:cursor-not-allowed disabled:opacity-35 ${
                  active ? 'border-ink-900 bg-ink-900 text-white' : 'border-sand-200 bg-white hover:border-ink-900/50'
                }`}
              >
                <span className={`text-[11px] font-semibold uppercase ${active ? 'text-white/80' : 'text-ink-600'}`}>{d === todayISO() ? 'hoje' : WEEKDAYS_SHORT[dt.getDay()]}</span>
                <span className="text-lg font-bold leading-tight">{dt.getDate()}</span>
                <span className={`text-[10px] ${active ? 'text-white/70' : 'text-ink-400'}`}>{dt.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
              </button>
            );
          })}
        </div>
        {errors.date ? <FieldError>{errors.date}</FieldError> : null}
      </fieldset>

      {/* Time */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">
          Horário <span className="text-danger-600">*</span>
        </legend>
        {date && times.length ? (
          <div className="grid grid-cols-4 gap-2">
            {times.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={t === time}
                onClick={() => {
                  setTime(t);
                  clearError('time');
                }}
                className={`h-10 rounded-xl border text-sm font-semibold transition ${t === time ? 'border-ink-900 bg-ink-900 text-white' : 'border-sand-200 bg-white hover:border-ink-900/50'}`}
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-cream-100 p-3 text-sm text-ink-600">{date ? 'Sem horários livres nesta data. Escolha outro dia.' : 'Escolha uma data para ver os horários.'}</p>
        )}
        {errors.time ? <FieldError>{errors.time}</FieldError> : null}
      </fieldset>

      {/* Duration */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Duração</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {durations.map((d) => {
            const blocked = tooLong(d);
            return (
              <button
                key={d}
                type="button"
                disabled={blocked}
                aria-pressed={d === duration}
                onClick={() => {
                  setDuration(d);
                  clearError('duration');
                }}
                className={`flex flex-col items-center rounded-xl border py-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${d === duration ? 'border-ink-900 bg-ink-900 text-white' : 'border-sand-200 bg-white hover:border-ink-900/50'}`}
              >
                <span className="text-sm font-bold">{d} min</span>
                <span className={`text-[12px] ${d === duration ? 'text-white/75' : 'text-ink-600'}`}>{formatBRL(walker.prices[d])}</span>
              </button>
            );
          })}
        </div>
        {pet?.health?.maxWalkMinutes && durations.some(tooLong) ? <p className="mt-1.5 text-[13px] text-ink-600">O perfil de {pet.name} limita passeios a {pet.health.maxWalkMinutes} min.</p> : null}
        {errors.duration ? <FieldError>{errors.duration}</FieldError> : null}
      </fieldset>

      {user ? (
        <Field label={`Recado para ${firstName(walker.name)}`} optional>
          <TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} placeholder="Ex.: a guia fica atrás da porta; avisar o porteiro." />
        </Field>
      ) : null}

      {/* Price */}
      {q ? (
        <div className="rounded-2xl border border-sand-200 p-4">
          <div className="flex justify-between text-[15px]">
            <span className="text-ink-600">Passeio de {duration} min</span>
            <span>{formatBRL(q.price)}</span>
          </div>
          <div className="mt-1 flex justify-between text-[15px]">
            <span className="text-ink-600">Taxa para o tutor</span>
            <span>Sem taxa</span>
          </div>
          <hr className="my-3 border-sand-200" />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatBRL(q.price)}</span>
          </div>
        </div>
      ) : null}

      {errors.form ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger-50 p-3 text-sm font-medium text-danger-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {errors.form}
        </p>
      ) : null}

      <Button type="submit" fullWidth size="lg" loading={submitting} icon={user ? undefined : Lock}>
        {user ? 'Solicitar passeio' : 'Entrar para solicitar'}
      </Button>

      <p className="flex items-start gap-2 text-[13px] leading-snug text-ink-600">
        <Info size={15} className="mt-0.5 shrink-0 text-accent-ink" aria-hidden="true" />
        {PAYMENT_NOTICE}
      </p>
    </form>
  );
}

function FieldError({ children }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-[13px] font-medium text-danger-600" role="alert">
      <AlertCircle size={14} aria-hidden="true" /> {children}
    </p>
  );
}
