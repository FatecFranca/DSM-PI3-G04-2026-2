import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, CreditCard, Star, Plus, ChevronRight, AlertTriangle } from 'lucide-react';
import SearchBar from '../../features/discovery/SearchBar';
import DiscoverySections from '../../features/discovery/DiscoverySections';
import SmartImage, { Avatar } from '../../components/common/SmartImage';
import { StatusBadge } from '../../components/common/Badge';
import { SectionHeader } from '../../components/common/Layout';
import { useData } from '../../context/AppStore';
import { useCurrentUser, useMyPets, useFavorites } from '../../hooks/useAccount';
import { useOwnerBookings } from '../../hooks/useBookings';
import { searchWalkers } from '../../services/searchService';
import { BOOKING_STATUS as S } from '../../features/bookings/bookingStateMachine';
import { firstName, formatBRL } from '../../utils/format';
import { formatRelativeDay } from '../../utils/dates';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function OwnerHomePage() {
  const data = useData();
  const user = useCurrentUser();
  const pets = useMyPets();
  const { ids: favoriteIds } = useFavorites();
  const { live, upcoming, finished } = useOwnerBookings();

  const needsAction = [...upcoming.filter((b) => b.status === S.ACCEPTED), ...finished.filter((b) => b.status === S.COMPLETED)];
  const nextUp = upcoming.find((b) => b.status === S.PAID || b.status === S.REQUESTED);
  const firstPet = pets[0];

  const extra = useMemo(() => {
    const sections = [];
    const favorites = favoriteIds.map((id) => data.walkers.find((w) => w.id === id)).filter(Boolean);
    if (favorites.length) sections.push({ id: 'favoritos', title: 'Seus favoritos', subtitle: 'Profissionais que você salvou', walkers: favorites, actionTo: '/tutor/favoritos' });
    if (firstPet) {
      const reactive = ['moderada', 'alta'].includes(firstPet.reactivity);
      const match = searchWalkers(data.walkers, { filters: { size: firstPet.size, reactive, muzzle: firstPet.equipment?.muzzle !== 'nao', medication: Boolean(firstPet.health?.medication) }, sort: 'melhor-avaliacao' }, data.bookings);
      sections.push({ id: 'pet', title: `Ideais para ${firstPet.name}`, subtitle: `Atendem o porte e os cuidados de ${firstPet.name}`, walkers: match, actionTo: `/buscar?pet=${firstPet.id}` });
    }
    return sections;
  }, [favoriteIds, data.walkers, data.bookings, firstPet]);

  return (
    <div>
      <h1 className="text-[26px] font-bold leading-tight tracking-tight md:text-[32px]">
        {greeting()}, {firstName(user?.name)}
      </h1>
      <p className="mt-1 text-ink-600">Para quem é o rolê de hoje?</p>

      <div className="mt-5">
        <SearchBar variant="compact" initial={{ petId: pets.length === 1 ? pets[0].id : '' }} />
      </div>

      {/* Live + action items */}
      {live.length || needsAction.length || nextUp ? (
        <section className="mt-8 space-y-3" aria-label="Seus passeios">
          {live.map((b) => (
            <Link key={b.id} to={`/tutor/acompanhar/${b.id}`} className="flex items-center gap-4 rounded-3xl bg-ink-900 p-4 text-white shadow-float transition hover:bg-black">
              <div className="relative shrink-0">
                <SmartImage src={b.pet?.photo} alt="" className="h-14 w-14 rounded-2xl" rounded="rounded-2xl" />
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-500 opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-gold-500 ring-2 ring-ink-900" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold uppercase tracking-wide text-gold-400">Ao vivo</p>
                <p className="truncate font-semibold">
                  {b.pet?.name} com {firstName(b.walker?.name)}
                </p>
                <p className="text-[13px] text-white/70">{b.tracking.distanceKm.toFixed(1).replace('.', ',')} km · toque para acompanhar</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500 text-ink-900">
                <Navigation size={20} aria-hidden="true" />
              </span>
            </Link>
          ))}

          {needsAction.map((b) => {
            const pay = b.status === S.ACCEPTED;
            const Icon = pay ? CreditCard : Star;
            return (
              <Link key={b.id} to={`/tutor/passeios/${b.id}`} className="flex items-center gap-4 rounded-3xl border border-sand-200 bg-white p-4 shadow-card transition hover:shadow-float">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${pay ? 'bg-wine-50 text-wine-500' : 'bg-gold-50 text-gold-800'}`}>
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{pay ? `Pague para confirmar o passeio de ${b.pet?.name}` : `Avalie o passeio de ${b.pet?.name}`}</p>
                  <p className="text-[13px] text-ink-600">
                    {pay ? `${firstName(b.walker?.name)} aceitou · ${formatRelativeDay(b.date)} às ${b.time} · ${formatBRL(b.price)}` : `Com ${firstName(b.walker?.name)} · conte como foi o passeio`}
                  </p>
                </div>
                <ChevronRight size={20} className="shrink-0 text-ink-400" aria-hidden="true" />
              </Link>
            );
          })}

          {nextUp && !needsAction.length ? (
            <Link to={`/tutor/passeios/${nextUp.id}`} className="flex items-center gap-4 rounded-3xl border border-sand-200 bg-white p-4 shadow-card transition hover:shadow-float">
              <Avatar src={nextUp.walker?.avatar} name={nextUp.walker?.name} size={48} />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-600">Próximo passeio</p>
                <p className="truncate font-semibold">
                  {nextUp.pet?.name} · {formatRelativeDay(nextUp.date)} às {nextUp.time}
                </p>
                <StatusBadge status={nextUp.status} size="xs" className="mt-1" />
              </div>
              <ChevronRight size={20} className="shrink-0 text-ink-400" aria-hidden="true" />
            </Link>
          ) : null}
        </section>
      ) : null}

      {/* My pets */}
      <section className="mt-10">
        <SectionHeader title="Meus pets" actionTo="/tutor/pets" actionLabel="Gerenciar" />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          {pets.map((p) => (
            <Link key={p.id} to={`/tutor/pets/${p.id}`} className="w-[150px] shrink-0 rounded-3xl border border-sand-200 bg-white p-2.5 transition hover:shadow-card">
              <SmartImage src={p.photo} alt={p.name} className="aspect-square w-full rounded-2xl" rounded="rounded-2xl" />
              <p className="mt-2 px-1 font-semibold">{p.name}</p>
              <p className="truncate px-1 text-[12px] text-ink-600">{p.breed}</p>
              {p.safetyAlert ? (
                <p className="mx-1 mt-1.5 flex items-center gap-1 truncate text-[11px] font-semibold text-danger-600" title={p.safetyAlert}>
                  <AlertTriangle size={12} className="shrink-0" aria-hidden="true" /> {p.safetyAlert}
                </p>
              ) : null}
            </Link>
          ))}
          <Link to="/tutor/pets/novo" className="flex w-[150px] shrink-0 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-sand-200 p-4 text-center text-sm font-semibold text-ink-600 transition hover:border-accent-ink hover:text-accent-ink">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
              <Plus size={22} aria-hidden="true" />
            </span>
            Cadastrar pet
          </Link>
        </div>
      </section>

      <div className="mt-12">
        <DiscoverySections extra={extra} />
      </div>
    </div>
  );
}
