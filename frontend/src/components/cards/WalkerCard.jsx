import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import SmartImage, { Avatar } from '../common/SmartImage';
import Badge, { Rating, VerifiedBadge } from '../common/Badge';
import { referencePrice } from '../../services/pricing';
import { walkerBadges } from '../../features/walkers/walkerSelectors';
import { formatBRL, formatNumber } from '../../utils/format';
import { useFavoriteToggle } from '../../features/walkers/useFavoriteToggle';

export function FavoriteButton({ walkerId, className = '', variant = 'overlay' }) {
  const { isFavorite, toggle } = useFavoriteToggle(walkerId);
  const overlay = variant === 'overlay';
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      className={`flex items-center justify-center rounded-full transition active:scale-90 ${overlay ? 'h-10 w-10 hover:bg-black/10' : 'h-10 w-10 border border-sand-200 bg-white hover:bg-cream-50'} ${className}`}
    >
      <Heart
        size={overlay ? 24 : 20}
        strokeWidth={overlay ? 2 : 2}
        className={isFavorite ? 'fill-wine-500 text-wine-500' : overlay ? 'fill-black/30 text-white drop-shadow' : 'text-ink-900'}
      />
    </button>
  );
}

/**
 * Discovery card (vertical, photo-first). `search` keeps the query string so the
 * profile can prefill date/pet. `compact` is used inside horizontal carousels.
 */
export default function WalkerCard({ walker, search = '', compact = false, className = '', highlight }) {
  const ref = referencePrice(walker);
  const badges = walkerBadges(walker).slice(0, compact ? 2 : 3);
  return (
    <Link to={`/dog-walkers/${walker.id}${search}`} className={`group block animate-fade-up focus-visible:rounded-3xl ${className}`}>
      <div className="relative overflow-hidden rounded-3xl">
        <SmartImage src={walker.photos?.[0]} alt={`${walker.name} passeando com um cão`} className="aspect-[4/3.6] w-full transition duration-500 group-hover:scale-[1.03]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <VerifiedBadge walker={walker} />
          {highlight ? <Badge tone="white">{highlight}</Badge> : null}
        </div>
        <FavoriteButton walkerId={walker.id} className="absolute right-2 top-2" />
        <Avatar src={walker.avatar} name={walker.name} size={44} ring className="absolute -bottom-0 left-3 translate-y-0 border-2 border-white shadow-md" />
      </div>
      <div className="mt-3 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[16px] font-semibold text-ink-900">{walker.name}</h3>
          <Rating value={walker.rating} count={compact ? undefined : walker.reviewsCount} />
        </div>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-ink-600">
          <MapPin size={14} aria-hidden="true" /> {walker.neighborhood} · {formatNumber(walker.walksCount)} passeios
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <Badge key={b.id} tone="neutral" size="xs">
              {b.label}
            </Badge>
          ))}
        </div>
        <p className="mt-2.5 text-[15px] text-ink-900">
          <span className="font-bold">{formatBRL(ref.price)}</span> <span className="text-ink-600">/ passeio de {ref.duration} min</span>
        </p>
      </div>
    </Link>
  );
}

/** Horizontal list card (search results on mobile/desktop list) */
export function WalkerRowCard({ walker, search = '', active, onHover }) {
  const ref = referencePrice(walker);
  const badges = walkerBadges(walker).slice(0, 3);
  return (
    <Link
      to={`/dog-walkers/${walker.id}${search}`}
      onMouseEnter={() => onHover?.(walker.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group flex animate-fade-up gap-3.5 rounded-3xl border bg-white p-3 transition sm:gap-4 ${active ? 'border-ink-900 shadow-card' : 'border-sand-200 hover:shadow-card'}`}
    >
      <div className="relative w-[118px] shrink-0 overflow-hidden rounded-2xl sm:w-[180px]">
        <SmartImage src={walker.photos?.[0]} alt={`${walker.name} com um cão`} className="h-full min-h-[148px] w-full" />
        <FavoriteButton walkerId={walker.id} className="absolute right-0.5 top-0.5" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-center gap-2">
          <Avatar src={walker.avatar} name={walker.name} size={28} />
          <h3 className="truncate font-semibold text-ink-900">{walker.name}</h3>
        </div>
        <p className="mt-1 truncate text-[13px] text-ink-600">{walker.headline}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-600">
          <Rating value={walker.rating} count={walker.reviewsCount} />
          <span aria-hidden="true">·</span>
          <span>{walker.neighborhood}</span>
        </div>
        <div className="mt-2 hidden flex-wrap gap-1.5 sm:flex">
          <VerifiedBadge walker={walker} size="xs" />
          {badges.map((b) => (
            <Badge key={b.id} size="xs">
              {b.label}
            </Badge>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 sm:hidden">
          <VerifiedBadge walker={walker} size="xs" />
          {badges[0] ? <Badge size="xs">{badges[0].label}</Badge> : null}
        </div>
        <p className="mt-auto pt-2 text-sm text-ink-900">
          <span className="font-bold">{formatBRL(ref.price)}</span> <span className="text-ink-600">· {ref.duration} min</span>
        </p>
      </div>
    </Link>
  );
}
