import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Map as MapIcon, List, Search, X, ShieldCheck, Pill, Zap, CircleDot, SearchX } from 'lucide-react';
import { WalkerRowCard } from '../../components/cards/WalkerCard';
import BaseMap, { PriceMarker, FitBounds, InvalidateOnShow } from '../../components/maps/BaseMap';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import EmptyState from '../../components/feedback/EmptyState';
import { Chip, Select } from '../../components/forms/Field';
import SearchBar from '../../features/discovery/SearchBar';
import { useData } from '../../context/AppStore';
import { searchWalkers, countActiveFilters } from '../../services/searchService';
import { referencePrice } from '../../services/pricing';
import { SORT_OPTIONS, DOG_SIZES, DOG_SIZE_LABEL, TEMPERAMENT_LABEL, DISCOVERY_CATEGORIES, WALK_DURATIONS } from '../../utils/constants';
import { formatDateShort } from '../../utils/dates';
import { formatBRL, pluralize } from '../../utils/format';

const FILTER_KEYS = ['precoMax', 'notaMin', 'porte', 'reativo', 'focinheira', 'medicacao', 'verificado', 'duracao', 'categoria'];
const PRICE_STEPS = [30, 35, 40, 45, 50];
const RATING_STEPS = [4.7, 4.8, 4.9];

/** URL → filter object understood by searchWalkers */
function readFilters(params, pet) {
  return {
    maxPrice: Number(params.get('precoMax')) || null,
    minRating: Number(params.get('notaMin')) || null,
    size: params.get('porte') || pet?.size || null,
    reactive: params.get('reativo') === '1',
    muzzle: params.get('focinheira') === '1',
    medication: params.get('medicacao') === '1',
    verified: params.get('verificado') === '1',
    duration: Number(params.get('duracao')) || null,
    category: params.get('categoria') || null,
  };
}

/** filter object → URL entries */
function filtersToEntries(f) {
  return {
    precoMax: f.maxPrice || '',
    notaMin: f.minRating || '',
    porte: f.size || '',
    reativo: f.reactive ? '1' : '',
    focinheira: f.muzzle ? '1' : '',
    medicacao: f.medication ? '1' : '',
    verificado: f.verified ? '1' : '',
    duracao: f.duration || '',
    categoria: f.category || '',
  };
}

export default function SearchPage() {
  const data = useData();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState('list');
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const pet = data.pets.find((p) => p.id === params.get('pet')) ?? null;
  const where = params.get('onde') || '';
  const date = params.get('data') || '';
  const time = params.get('hora') || '';
  const sort = params.get('ordem') || 'relevancia';
  const temperament = params.get('temperamento') || (pet ? (['moderada', 'alta'].includes(pet.reactivity) ? 'reativo' : pet.temperament) : '');
  const filters = useMemo(() => readFilters(params, pet), [params, pet]);

  const run = (f) => searchWalkers(data.walkers, { where, date, time, temperament, filters: f, sort }, data.bookings);
  const results = useMemo(() => run(filters), [data.walkers, data.bookings, where, date, time, temperament, filters, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (entries) => {
    const next = new URLSearchParams(params);
    Object.entries(entries).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, String(v))));
    setParams(next, { replace: true });
  };
  const setFilter = (key, value) => update(filtersToEntries({ ...filters, [key]: value }));
  const clearFilters = () => update(Object.fromEntries(FILTER_KEYS.map((k) => [k, ''])));

  const activeCount = countActiveFilters({ ...filters, size: params.get('porte') ? filters.size : null }) + (filters.category ? 1 : 0);
  const querySuffix = (() => {
    const keep = new URLSearchParams();
    ['pet', 'data', 'hora', 'duracao'].forEach((k) => params.get(k) && keep.set(k, params.get(k)));
    const s = keep.toString();
    return s ? `?${s}` : '';
  })();

  const category = DISCOVERY_CATEGORIES.find((c) => c.id === filters.category);
  const summary = [where || 'São Paulo', date ? `${formatDateShort(date)}${time ? ` · ${time}` : ''}` : 'Qualquer data', pet ? pet.name : [filters.size && DOG_SIZE_LABEL[filters.size], temperament && TEMPERAMENT_LABEL[temperament]].filter(Boolean).join(', ') || 'Qualquer cão'];

  const points = results.map((w) => [w.coords.lat, w.coords.lng]);
  const selectedWalker = results.find((w) => w.id === selected);

  return (
    <div className="container-page pt-4 md:pt-6">
      {/* Search summary */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-expanded={editing}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-sand-200 bg-white px-4 py-2.5 text-left shadow-card transition hover:shadow-float md:max-w-2xl"
        >
          <Search size={18} className="shrink-0 text-accent-ink" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold">{summary[0]}</span>
            <span className="block truncate text-[13px] text-ink-600">
              {summary[1]} · {summary[2]}
            </span>
          </span>
          <span className="ml-auto hidden shrink-0 text-sm font-semibold underline sm:inline">Editar busca</span>
        </button>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="relative flex h-12 shrink-0 items-center gap-2 rounded-full border border-sand-200 bg-white px-4 text-sm font-semibold hover:border-ink-900/40"
          aria-label={`Filtros${activeCount ? ` (${activeCount} ativos)` : ''}`}
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Filtros</span>
          {activeCount ? <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-900 px-1 text-[11px] text-white">{activeCount}</span> : null}
        </button>
      </div>

      {editing ? (
        <div className="mt-3 animate-fade-up">
          <SearchBar
            variant="compact"
            initial={{ where, date, time, petId: pet?.id ?? '', size: params.get('porte') ?? '', temperament: params.get('temperamento') ?? '', category: filters.category }}
            onSearch={(v) => {
              update({ onde: v.where, data: v.date, hora: v.time, pet: v.petId, porte: v.size || (v.petId ? '' : params.get('porte')), temperamento: v.temperament });
              setEditing(false);
            }}
          />
        </div>
      ) : null}

      {/* Quick filters */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {category ? (
          <Chip selected size="sm" onClick={() => setFilter('category', null)}>
            {category.label} <X size={13} aria-hidden="true" />
          </Chip>
        ) : null}
        <Chip size="sm" selected={filters.verified} onClick={() => setFilter('verified', !filters.verified)} icon={ShieldCheck}>
          Verificados
        </Chip>
        <Chip size="sm" selected={filters.reactive} onClick={() => setFilter('reactive', !filters.reactive)} icon={Zap}>
          Aceita reativos
        </Chip>
        <Chip size="sm" selected={filters.muzzle} onClick={() => setFilter('muzzle', !filters.muzzle)} icon={CircleDot}>
          Aceita focinheira
        </Chip>
        <Chip size="sm" selected={filters.medication} onClick={() => setFilter('medication', !filters.medication)} icon={Pill}>
          Medicação
        </Chip>
        <Chip size="sm" selected={filters.minRating === 4.9} onClick={() => setFilter('minRating', filters.minRating === 4.9 ? null : 4.9)}>
          Nota 4,9+
        </Chip>
      </div>

      <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-8">
        {/* List */}
        <section className={view === 'map' ? 'hidden lg:block' : ''} aria-label="Resultados">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[15px] font-semibold" aria-live="polite">
              {results.length ? pluralize(results.length, 'dog walker encontrado', 'dog walkers encontrados') : 'Nenhum resultado'}
              {date ? <span className="font-normal text-ink-600"> com horário livre</span> : null}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="hidden text-ink-600 sm:inline">Ordenar por</span>
              <Select value={sort} onChange={(e) => update({ ordem: e.target.value === 'relevancia' ? '' : e.target.value })} options={SORT_OPTIONS} className="h-10! w-[170px] text-sm!" aria-label="Ordenar resultados" />
            </label>
          </div>

          {results.length ? (
            <div className="space-y-3.5">
              {results.map((w) => (
                <WalkerRowCard key={w.id} walker={w} search={querySuffix} active={hovered === w.id} onHover={setHovered} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={SearchX}
              title="Nenhum dog walker com esses critérios"
              description={date ? 'Tente outra data ou horário, ou remova alguns filtros.' : 'Remova alguns filtros ou busque por outro bairro.'}
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="secondary" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                  {where || date ? (
                    <Button variant="ghost" onClick={() => update({ onde: '', data: '', hora: '' })}>
                      Buscar em toda a cidade
                    </Button>
                  ) : null}
                </div>
              }
            />
          )}
        </section>

        {/* Map */}
        <section className={`${view === 'list' ? 'hidden lg:block' : ''}`} aria-label="Mapa dos resultados">
          <div className="relative -mx-4 h-[calc(100dvh-230px)] overflow-hidden sm:-mx-6 lg:sticky lg:top-24 lg:mx-0 lg:h-[calc(100dvh-140px)] lg:rounded-3xl lg:border lg:border-sand-200">
            <BaseMap zoom={12}>
              <FitBounds points={points} fitKey={results.map((r) => r.id).join()} />
              <InvalidateOnShow visible={view === 'map'} />
              {results.map((w) => (
                <PriceMarker key={w.id} position={[w.coords.lat, w.coords.lng]} price={referencePrice(w).price} active={hovered === w.id || selected === w.id} onClick={() => setSelected(w.id)} />
              ))}
            </BaseMap>
            <p className="pointer-events-none absolute left-3 top-3 z-[500] rounded-full bg-white/95 px-3 py-1 text-[12px] font-medium text-ink-600 shadow">Localização aproximada por bairro</p>
            {selectedWalker ? (
              <div className="absolute inset-x-3 bottom-3 z-[500] animate-fade-up">
                <button type="button" onClick={() => setSelected(null)} aria-label="Fechar prévia" className="absolute -top-3 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow">
                  <X size={16} />
                </button>
                <WalkerRowCard walker={selectedWalker} search={querySuffix} />
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {/* Mobile list/map toggle */}
      <button
        type="button"
        onClick={() => {
          setView((v) => (v === 'list' ? 'map' : 'list'));
          setSelected(null);
        }}
        className="fixed bottom-[calc(var(--bottom-nav-h)+var(--safe-bottom)+16px)] left-1/2 z-[800] flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-ink-900 px-5 text-sm font-semibold text-white shadow-float transition active:scale-95 lg:hidden"
      >
        {view === 'list' ? <MapIcon size={18} aria-hidden="true" /> : <List size={18} aria-hidden="true" />}
        {view === 'list' ? 'Mapa' : 'Lista'}
      </button>

      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} filters={filters} countFor={(f) => run(f).length} onApply={(f) => update(filtersToEntries(f))} />
    </div>
  );
}

function FiltersModal({ open, onClose, filters, countFor, onApply }) {
  const [draft, setDraft] = useState(filters);
  const [lastOpen, setLastOpen] = useState(false);
  if (open && !lastOpen) {
    setLastOpen(true);
    setDraft(filters);
  } else if (!open && lastOpen) setLastOpen(false);

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const count = open ? countFor(draft) : 0;
  const empty = { maxPrice: null, minRating: null, size: null, reactive: false, muzzle: false, medication: false, verified: false, duration: null, category: null };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filtros"
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="text-[15px] font-semibold underline" onClick={() => setDraft(empty)}>
            Limpar filtros
          </button>
          <Button
            variant="dark"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Mostrar {pluralize(count, 'resultado', 'resultados')}
          </Button>
        </div>
      }
    >
      <div className="divide-y divide-sand-200">
        <FilterGroup title="Preço por passeio (referência de 30 min)">
          <div className="flex flex-wrap gap-2">
            <Chip size="sm" selected={!draft.maxPrice} onClick={() => set('maxPrice', null)}>
              Qualquer
            </Chip>
            {PRICE_STEPS.map((p) => (
              <Chip key={p} size="sm" selected={draft.maxPrice === p} onClick={() => set('maxPrice', p)}>
                Até {formatBRL(p).replace(',00', '')}
              </Chip>
            ))}
          </div>
        </FilterGroup>
        <FilterGroup title="Avaliação">
          <div className="flex flex-wrap gap-2">
            <Chip size="sm" selected={!draft.minRating} onClick={() => set('minRating', null)}>
              Qualquer
            </Chip>
            {RATING_STEPS.map((r) => (
              <Chip key={r} size="sm" selected={draft.minRating === r} onClick={() => set('minRating', r)}>
                {String(r).replace('.', ',')}+
              </Chip>
            ))}
          </div>
        </FilterGroup>
        <FilterGroup title="Porte do cão atendido">
          <div className="flex flex-wrap gap-2">
            <Chip size="sm" selected={!draft.size} onClick={() => set('size', null)}>
              Qualquer
            </Chip>
            {DOG_SIZES.map((s) => (
              <Chip key={s.id} size="sm" selected={draft.size === s.id} onClick={() => set('size', s.id)}>
                {s.label}
              </Chip>
            ))}
          </div>
        </FilterGroup>
        <FilterGroup title="Duração do passeio">
          <div className="flex flex-wrap gap-2">
            <Chip size="sm" selected={!draft.duration} onClick={() => set('duration', null)}>
              Qualquer
            </Chip>
            {WALK_DURATIONS.map((d) => (
              <Chip key={d} size="sm" selected={draft.duration === d} onClick={() => set('duration', d)}>
                {d} min
              </Chip>
            ))}
          </div>
        </FilterGroup>
        <FilterGroup title="Perfil do cão">
          <div className="flex flex-wrap gap-2">
            {DISCOVERY_CATEGORIES.map((c) => (
              <Chip key={c.id} size="sm" selected={draft.category === c.id} onClick={() => set('category', draft.category === c.id ? null : c.id)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </FilterGroup>
        <FilterGroup title="Experiência e segurança">
          {[
            ['reactive', 'Aceita cães reativos'],
            ['muzzle', 'Aceita focinheira'],
            ['medication', 'Administra medicação'],
            ['verified', 'Somente verificados (identidade e antecedentes)'],
          ].map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center justify-between gap-4 py-2.5">
              <span className="text-[15px]">{label}</span>
              <input type="checkbox" checked={draft[key]} onChange={(e) => set(key, e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
            </label>
          ))}
        </FilterGroup>
        <p className="pt-4 text-[13px] text-ink-600">A disponibilidade na data é filtrada pela busca: escolha data e horário em “Editar busca”.</p>
      </div>
    </Modal>
  );
}

function FilterGroup({ title, children }) {
  return (
    <fieldset className="py-5 first:pt-1">
      <legend className="mb-3 text-[16px] font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}
