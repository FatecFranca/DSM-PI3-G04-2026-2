import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import WalkerCard from '../../components/cards/WalkerCard';
import { SectionHeader } from '../../components/common/Layout';
import SmartImage from '../../components/common/SmartImage';
import { useData } from '../../context/AppStore';
import { useCurrentUser } from '../../hooks/useAccount';
import { searchWalkers } from '../../services/searchService';
import { DISCOVERY_CATEGORIES } from '../../utils/constants';
import { dogPhoto } from '../../data/mock/photos';

const CATEGORY_PHOTOS = { grandes: 'shepherd', reativos: 'doberman', filhotes: 'puppy', idosos: 'senior', medicacao: 'shihtzu' };

/** Horizontal, snap-scrolling carousel of walker cards (grid on desktop) */
export function WalkerCarousel({ title, subtitle, walkers, actionTo, highlight }) {
  if (!walkers.length) return null;
  return (
    <section className="mt-12 first:mt-0">
      <SectionHeader title={title} subtitle={subtitle} actionTo={actionTo} />
      <div className="snap-row -mx-4 px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0">
        {walkers.slice(0, 8).map((w, i) => (
          <WalkerCard key={w.id} walker={w} compact highlight={highlight?.(w)} className={`w-[72vw] max-w-[290px] shrink-0 snap-start lg:w-auto lg:max-w-none ${i >= 4 ? 'lg:hidden' : ''}`} />
        ))}
      </div>
    </section>
  );
}

/** "Descoberta por perfil do cão" */
export function CategoryGrid({ title = 'Encontre pelo perfil do seu cão', subtitle = 'Profissionais com experiência no que o seu cão precisa' }) {
  return (
    <section className="mt-14">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="snap-row -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0">
        {DISCOVERY_CATEGORIES.map((c) => (
          <Link key={c.id} to={`/buscar?categoria=${c.id}`} className="group w-[44vw] max-w-[220px] shrink-0 snap-start lg:w-auto lg:max-w-none">
            <div className="relative overflow-hidden rounded-3xl">
              <SmartImage src={dogPhoto(CATEGORY_PHOTOS[c.id], 500)} alt="" className="aspect-[4/5] w-full transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent" aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                <h3 className="text-[16px] font-bold leading-tight">{c.label}</h3>
                <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-white/85">{c.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * The standard discovery stack (popular in the neighborhood, large dogs, reactive dogs).
 * `neighborhood` personalizes the first carousel; `extra` sections render first.
 */
export default function DiscoverySections({ neighborhood, extra = [], showCategories = true }) {
  const data = useData();
  const user = useCurrentUser();
  const hood = neighborhood || user?.address?.neighborhood || '';

  const sections = useMemo(() => {
    const search = (params) => searchWalkers(data.walkers, params, data.bookings);
    let popular = hood ? search({ where: hood, sort: 'mais-passeios' }) : [];
    if (popular.length < 3) popular = search({ sort: 'mais-passeios' });
    return [
      {
        id: 'populares',
        title: hood ? `Muito procurados em ${hood}` : 'Dog walkers muito procurados no seu bairro',
        subtitle: 'Os profissionais com mais passeios concluídos',
        walkers: popular,
        actionTo: `/buscar?${hood ? `onde=${encodeURIComponent(hood)}&` : ''}ordem=mais-passeios`,
      },
      {
        id: 'grandes',
        title: 'Experientes com cães grandes',
        subtitle: 'Condução firme e tranquila para portes grandes e gigantes',
        walkers: search({ filters: { category: 'grandes' }, sort: 'melhor-avaliacao' }),
        actionTo: '/buscar?categoria=grandes',
      },
      {
        id: 'reativos',
        title: 'Preparados para cães reativos',
        subtitle: 'Rotas calmas, distância segura e reforço positivo',
        walkers: search({ filters: { category: 'reativos' }, sort: 'melhor-avaliacao' }),
        actionTo: '/buscar?categoria=reativos',
      },
    ];
  }, [data.walkers, data.bookings, hood]);

  return (
    <>
      {[...extra, ...sections].map((s) => (
        <WalkerCarousel key={s.id} {...s} />
      ))}
      {showCategories ? <CategoryGrid /> : null}
    </>
  );
}

export function SeeAllLink({ to, children = 'Ver tudo' }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
      {children} <ArrowRight size={15} aria-hidden="true" />
    </Link>
  );
}
