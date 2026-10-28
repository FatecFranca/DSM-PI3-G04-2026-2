import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CalendarDays, Dog } from 'lucide-react';
import { useMyPets, useCurrentUser } from '../../hooks/useAccount';
import { DOG_SIZES, TEMPERAMENTS, NEIGHBORHOODS } from '../../utils/constants';
import { DAY_SLOTS, todayISO, addDays } from '../../utils/dates';

/** Builds the /buscar query string from search values (empty values are omitted) */
export function buildSearchQuery(values) {
  const params = new URLSearchParams();
  const map = { onde: values.where, data: values.date, hora: values.time, pet: values.petId, porte: values.size, temperamento: values.temperament, categoria: values.category };
  Object.entries(map).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

const fieldLabel = 'block text-[12px] font-bold uppercase tracking-wide text-ink-900';
const fieldControl = 'mt-0.5 block w-full truncate bg-transparent text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none';

/**
 * Three-part search: Onde / Quando / Quem.
 * Signed-in tutors choose one of their pets; visitors describe size and temperament.
 * variant="hero" → large pill on desktop, stacked card on mobile; "compact" → tighter card.
 */
export default function SearchBar({ initial = {}, variant = 'hero', onSearch, className = '' }) {
  const user = useCurrentUser();
  const pets = useMyPets();
  const navigate = useNavigate();
  const listId = useId();
  const [where, setWhere] = useState(initial.where ?? '');
  const [date, setDate] = useState(initial.date ?? '');
  const [time, setTime] = useState(initial.time ?? '');
  const [petId, setPetId] = useState(initial.petId ?? (pets.length === 1 ? pets[0].id : ''));
  const [size, setSize] = useState(initial.size ?? '');
  const [temperament, setTemperament] = useState(initial.temperament ?? '');
  const hasPets = Boolean(user && pets.length);

  const submit = (e) => {
    e.preventDefault();
    const values = { where: where.trim(), date, time: date ? time : '', petId: hasPets ? petId : '', size: hasPets ? '' : size, temperament: hasPets ? '' : temperament, category: initial.category };
    if (onSearch) onSearch(values);
    else navigate(`/buscar${buildSearchQuery(values)}`);
  };

  const hero = variant === 'hero';
  const cell = `relative flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-cream-50 focus-within:bg-cream-50 lg:rounded-full lg:px-6 ${hero ? 'lg:py-3.5' : ''}`;

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Buscar dog walkers"
      className={`rounded-3xl border border-sand-200 bg-white p-2 shadow-float lg:flex lg:items-center lg:rounded-full lg:p-1.5 ${className}`}
    >
      <div className={cell}>
        <MapPin size={20} className="shrink-0 text-accent-ink lg:hidden" aria-hidden="true" />
        <label className="min-w-0 flex-1">
          <span className={fieldLabel}>Onde</span>
          <input list={listId} value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Bairro ou cidade" className={fieldControl} autoComplete="off" />
          <datalist id={listId}>
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </label>
      </div>

      <span className="mx-4 block h-px bg-sand-200 lg:mx-0 lg:h-8 lg:w-px" aria-hidden="true" />

      <div className={cell}>
        <CalendarDays size={20} className="shrink-0 text-accent-ink lg:hidden" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 gap-3">
          <label className="min-w-0 flex-1">
            <span className={fieldLabel}>Quando</span>
            <input type="date" value={date} min={todayISO()} max={addDays(todayISO(), 60)} onChange={(e) => setDate(e.target.value)} className={`${fieldControl} ${date ? '' : 'text-ink-400'}`} aria-label="Data do passeio" />
          </label>
          <label className="w-[92px] shrink-0">
            <span className={fieldLabel}>Horário</span>
            <select value={time} onChange={(e) => setTime(e.target.value)} disabled={!date} className={`${fieldControl} ${time ? '' : 'text-ink-400'} disabled:opacity-50`} aria-label="Horário do passeio">
              <option value="">Qualquer</option>
              {DAY_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <span className="mx-4 block h-px bg-sand-200 lg:mx-0 lg:h-8 lg:w-px" aria-hidden="true" />

      <div className={`${cell} lg:pr-2`}>
        <Dog size={20} className="shrink-0 text-accent-ink lg:hidden" aria-hidden="true" />
        {hasPets ? (
          <label className="min-w-0 flex-1">
            <span className={fieldLabel}>Quem</span>
            <select value={petId} onChange={(e) => setPetId(e.target.value)} className={`${fieldControl} ${petId ? '' : 'text-ink-400'}`}>
              <option value="">Qual pet vai passear?</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.breed}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="flex min-w-0 flex-1 gap-3">
            <label className="min-w-0 flex-1">
              <span className={fieldLabel}>Porte</span>
              <select value={size} onChange={(e) => setSize(e.target.value)} className={`${fieldControl} ${size ? '' : 'text-ink-400'}`}>
                <option value="">Qualquer</option>
                {DOG_SIZES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.hint})
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0 flex-1">
              <span className={fieldLabel}>Temperamento</span>
              <select value={temperament} onChange={(e) => setTemperament(e.target.value)} className={`${fieldControl} ${temperament ? '' : 'text-ink-400'}`}>
                <option value="">Qualquer</option>
                {TEMPERAMENTS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <button type="submit" className="hidden h-12 shrink-0 items-center gap-2 rounded-full bg-accent px-5 font-semibold text-on-accent shadow-sm transition hover:bg-accent-hover active:scale-95 lg:flex">
          <Search size={18} aria-hidden="true" /> Buscar
        </button>
      </div>

      <button type="submit" className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-on-accent shadow-sm transition hover:bg-accent-hover active:scale-[0.98] lg:hidden">
        <Search size={18} aria-hidden="true" /> Buscar dog walkers
      </button>
    </form>
  );
}
