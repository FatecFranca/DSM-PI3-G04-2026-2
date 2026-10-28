import { referencePrice, walkerDurations } from './pricing';
import { isAvailableOn } from './availabilityService';
import { isVerified } from '../features/walkers/walkerSelectors';

// Search/filter/sort for walkers. Params mirror the URL query string so
// results can be shared and survive reloads.

export const DEFAULT_FILTERS = {
  maxPrice: null,
  minRating: null,
  size: null,
  reactive: false,
  muzzle: false,
  medication: false,
  verified: false,
  duration: null,
  category: null,
};

const CATEGORY_RULES = {
  grandes: (w) => w.sizes.includes('grande') || w.sizes.includes('gigante'),
  reativos: (w) => w.reactiveExperience,
  filhotes: (w) => w.puppies,
  idosos: (w) => w.seniors,
  medicacao: (w) => w.medicationExperience,
};

const normalize = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export function matchesLocation(walker, where) {
  if (!where) return true;
  const q = normalize(where).replace(/,?\s*(sao paulo|sp)\s*$/g, '').trim();
  if (!q || q === 'sao paulo') return true;
  return [walker.neighborhood, walker.city, ...walker.areas].some((place) => normalize(place).includes(q));
}

export function matchesPetProfile(walker, { size, temperament }) {
  if (size && !walker.sizes.includes(size)) return false;
  if (temperament === 'reativo' && !walker.reactiveExperience) return false;
  return true;
}

/**
 * @param {Object[]} walkers
 * @param {Object} params  { where, date, time, size, temperament, filters, sort }
 * @param {Object[]} bookings  used for date/time availability
 */
export function searchWalkers(walkers, params, bookings) {
  const { where, date, time, size, temperament, sort = 'relevancia' } = params;
  const f = { ...DEFAULT_FILTERS, ...params.filters };

  const results = walkers.filter((w) => {
    if (w.unlisted) return false;
    if (!matchesLocation(w, where)) return false;
    if (!matchesPetProfile(w, { size: f.size || size, temperament })) return false;
    if (f.category && CATEGORY_RULES[f.category] && !CATEGORY_RULES[f.category](w)) return false;
    if (f.maxPrice && referencePrice(w).price > f.maxPrice) return false;
    if (f.minRating && w.rating < f.minRating) return false;
    if (f.reactive && !w.reactiveExperience) return false;
    if (f.muzzle && !w.acceptsMuzzle) return false;
    if (f.medication && !w.medicationExperience) return false;
    if (f.verified && !isVerified(w)) return false;
    if (f.duration && !walkerDurations(w).includes(Number(f.duration))) return false;
    if (date && !isAvailableOn(w, date, bookings, time || undefined)) return false;
    return true;
  });

  const sorters = {
    'menor-preco': (a, b) => referencePrice(a).price - referencePrice(b).price,
    'melhor-avaliacao': (a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount,
    'mais-passeios': (a, b) => b.walksCount - a.walksCount,
    // Relevance: verified first, then a blend of rating and volume
    relevancia: (a, b) => relevanceScore(b) - relevanceScore(a),
  };
  return [...results].sort(sorters[sort] || sorters.relevancia);
}

function relevanceScore(w) {
  return (isVerified(w) ? 2 : 0) + w.rating * 2 + Math.log10(w.walksCount + 1);
}

export function countActiveFilters(filters = {}) {
  return Object.entries(filters).filter(([key, value]) => key !== 'category' && value !== null && value !== false && value !== '').length;
}

export function categoryRule(id) {
  return CATEGORY_RULES[id];
}
