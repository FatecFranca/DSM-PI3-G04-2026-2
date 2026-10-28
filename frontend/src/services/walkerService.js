import { toggleBlockedSlot, setWeeklyTemplate } from './availabilityService';
import { newId } from './notificationService';

export class WalkerProfileError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'WalkerProfileError';
    this.field = field;
  }
}

const replaceWalker = (state, walker) => ({ ...state, walkers: state.walkers.map((w) => (w.id === walker.id ? walker : w)) });
const getWalker = (state, id) => {
  const walker = state.walkers.find((w) => w.id === id);
  if (!walker) throw new WalkerProfileError('Perfil de dog walker não encontrado.');
  return walker;
};

/** Updates editable profile fields. Verification can't be changed here. */
export function updateWalkerProfile(state, walkerId, changes) {
  const walker = getWalker(state, walkerId);
  // eslint-disable-next-line no-unused-vars
  const { verification, rating, reviewsCount, walksCount, id, ...editable } = changes;
  if (editable.prices) {
    const prices = Object.fromEntries(
      Object.entries(editable.prices)
        .filter(([, v]) => v !== '' && v !== null && Number(v) > 0)
        .map(([k, v]) => [Number(k), Number(v)]),
    );
    if (!Object.keys(prices).length) throw new WalkerProfileError('Defina o preço de pelo menos uma duração.', 'prices');
    editable.prices = prices;
  }
  if (editable.sizes && !editable.sizes.length) throw new WalkerProfileError('Selecione pelo menos um porte atendido.', 'sizes');
  const updated = { ...walker, ...editable };
  const complete = updated.bio?.trim().length > 40 && Object.values(updated.availability || {}).some((d) => d.length);
  return replaceWalker(state, { ...updated, unlisted: !complete });
}

export function toggleSlot(state, walkerId, date, time) {
  return replaceWalker(state, toggleBlockedSlot(getWalker(state, walkerId), date, time));
}

export function updateWeeklyAvailability(state, walkerId, weekday, slots) {
  return replaceWalker(state, setWeeklyTemplate(getWalker(state, walkerId), weekday, slots));
}

/**
 * Simulated verification: documents are "submitted" and move to pending review.
 * The prototype never marks a profile as verified on its own.
 */
export function submitVerification(state, walkerId, kind) {
  const walker = getWalker(state, walkerId);
  if (walker.verification[kind] === 'verified') return state;
  return replaceWalker(state, { ...walker, verification: { ...walker.verification, [kind]: 'pending' } });
}

export function toggleFavorite(state, userId, walkerId) {
  const list = state.favorites[userId] || [];
  const next = list.includes(walkerId) ? list.filter((id) => id !== walkerId) : [walkerId, ...list];
  return { ...state, favorites: { ...state.favorites, [userId]: next } };
}

export function addReferral(state, { referrerId, walkerName, contact, note }) {
  if (!walkerName?.trim() || !contact?.trim()) throw new WalkerProfileError('Informe o nome e um contato do dog walker.');
  const referral = { id: newId('ref'), referrerId: referrerId ?? null, walkerName: walkerName.trim(), contact: contact.trim(), note: note?.trim() ?? '', at: Date.now(), status: 'enviada' };
  return { ...state, referrals: [referral, ...state.referrals] };
}
