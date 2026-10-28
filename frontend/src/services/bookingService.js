import { applyTransition, BOOKING_STATUS as S, STATUS_META, canTransition } from '../features/bookings/bookingStateMachine';
import { quote } from './pricing';
import { isAvailableOn } from './availabilityService';
import { notify, newId } from './notificationService';
import { compatibilityWarnings } from '../features/walkers/walkerSelectors';
import { formatRelativeDay, toTimestamp } from '../utils/dates';
import { firstName } from '../utils/format';
import { routeLengthKm } from './trackingService';
import { PAYMENT_STATUS as P, walkerPayout } from '../features/payments/paymentSplit';
import { formatBRL } from '../utils/format';

// All booking mutations are pure (state) => state functions.
// Validation errors are thrown as BookingError with a user-facing message (pt-BR).
// To plug a real API, keep these signatures and move the logic server-side.

export class BookingError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'BookingError';
    this.field = field;
  }
}

const findBooking = (state, id) => {
  const booking = state.bookings.find((b) => b.id === id);
  if (!booking) throw new BookingError('Passeio não encontrado.');
  return booking;
};

const replaceBooking = (state, booking) => ({
  ...state,
  bookings: state.bookings.map((b) => (b.id === booking.id ? booking : b)),
});

const ctx = (state, booking) => ({
  walker: state.walkers.find((w) => w.id === booking.walkerId),
  pet: state.pets.find((p) => p.id === booking.petId),
  owner: state.users.find((u) => u.id === booking.ownerId),
});

const randomCode = () => String(Math.floor(1000 + Math.random() * 9000));

export function validateBookingInput(state, { walkerId, petId, date, time, duration }) {
  const walker = state.walkers.find((w) => w.id === walkerId);
  if (!walker) throw new BookingError('Dog walker não encontrado.');
  if (!petId) throw new BookingError('Selecione qual pet vai passear.', 'petId');
  const pet = state.pets.find((p) => p.id === petId);
  if (!pet) throw new BookingError('Pet não encontrado. Cadastre o pet antes de solicitar.', 'petId');
  if (!date) throw new BookingError('Escolha a data do passeio.', 'date');
  if (!time) throw new BookingError('Escolha um horário disponível.', 'time');
  if (!duration || !quote(walker, duration)) throw new BookingError('Escolha uma duração oferecida por este profissional.', 'duration');
  if (pet.health?.maxWalkMinutes && duration > pet.health.maxWalkMinutes)
    throw new BookingError(`O perfil de ${pet.name} limita passeios a ${pet.health.maxWalkMinutes} min.`, 'duration');
  if (!isAvailableOn(walker, date, state.bookings, time)) throw new BookingError('Este horário não está mais disponível. Escolha outro.', 'time');
  const hardWarning = compatibilityWarnings(walker, pet).find((w) => w.includes('porte'));
  if (hardWarning) throw new BookingError(hardWarning, 'petId');
  return { walker, pet };
}

/** Tutor creates a request → status "requested" */
export function createBooking(state, { ownerId, walkerId, petId, date, time, duration, notes = '' }) {
  const { walker, pet } = validateBookingInput(state, { walkerId, petId, date, time, duration });
  const owner = state.users.find((u) => u.id === ownerId);
  const q = quote(walker, duration);
  const now = Date.now();
  const booking = {
    id: newId('b'),
    ownerId,
    walkerId,
    petId,
    date,
    time,
    duration,
    ...q,
    status: S.REQUESTED,
    history: [{ status: S.REQUESTED, at: now, actor: 'owner' }],
    pickupCode: randomCode(),
    payment: { status: P.NONE, methodId: null, paidAt: null, firstReleaseAt: null, releasedAt: null },
    tracking: { approachProgress: 0, walkProgress: 0, distanceKm: 0, elapsedMin: 0, startedAt: null, endedAt: null, routeSummary: `${owner?.address?.street?.split(',')[0] ?? 'Endereço do tutor'} → rota pelo bairro → retorno` },
    review: null,
    notes,
    address: owner ? `${owner.address.street} — ${owner.address.neighborhood}` : '',
    createdAt: now,
    expiresAt: Math.min(now + 48 * 3600000, toTimestamp(date, time)),
  };
  let next = { ...state, bookings: [booking, ...state.bookings] };
  next = notify(next, {
    audience: 'walker',
    userId: walkerId,
    kind: 'booking',
    title: 'Nova solicitação',
    body: `${firstName(owner?.name)} solicitou ${duration} min para ${pet.name} — ${formatRelativeDay(date)} às ${time}.`,
    link: `/dog-walker/solicitacoes/${booking.id}`,
  });
  next = notify(next, {
    audience: 'owner',
    userId: ownerId,
    kind: 'booking',
    title: 'Solicitação enviada',
    body: `Aguardando ${firstName(walker.name)} aceitar o passeio de ${pet.name}.`,
    link: `/tutor/passeios/${booking.id}`,
  });
  return { state: next, booking };
}

/** Messages sent to each side when a status is reached */
function transitionNotifications(status, { walker, pet, owner }, booking) {
  const w = firstName(walker?.name);
  const o = firstName(owner?.name);
  const ownerLink = `/tutor/passeios/${booking.id}`;
  const liveLink = `/tutor/acompanhar/${booking.id}`;
  const walkerLink = `/dog-walker/passeio/${booking.id}`;
  switch (status) {
    case S.ACCEPTED:
      return [{ audience: 'owner', title: 'Solicitação aceita', body: `${w} aceitou o passeio de ${pet?.name}. Confirme o pagamento para garantir o horário.`, link: ownerLink, kind: 'booking' }];
    case S.DECLINED:
      return [{ audience: 'owner', title: 'Solicitação recusada', body: `${w} não pode atender neste horário. Nenhum valor foi cobrado.`, link: ownerLink, kind: 'booking' }];
    case S.PAID: {
      const { first, second } = walkerPayout(booking);
      return [{ audience: 'walker', title: 'Passeio fechado — 50% liberado', body: `${o} pagou o passeio de ${pet?.name}. ${formatBRL(first)} já foi liberado; os outros ${formatBRL(second)} quando você finalizar o passeio.`, link: walkerLink, kind: 'payment' }];
    }
    case S.ON_THE_WAY:
      return [{ audience: 'owner', title: `${w} está a caminho`, body: `Tenha o código de retirada em mãos: ${booking.pickupCode}.`, link: liveLink, kind: 'tracking' }];
    case S.PICKED_UP:
      return [{ audience: 'owner', title: 'Retirada confirmada', body: `${pet?.name} está com ${w}.`, link: liveLink, kind: 'tracking' }];
    case S.WALKING:
      return [{ audience: 'owner', title: 'Passeio iniciado', body: `${w} iniciou o passeio com ${pet?.name}.`, link: liveLink, kind: 'tracking' }];
    case S.RETURNING:
      return [{ audience: 'owner', title: 'Voltando para casa', body: `${w} está trazendo ${pet?.name} de volta.`, link: liveLink, kind: 'tracking' }];
    case S.COMPLETED:
      return [
        { audience: 'owner', title: 'Passeio finalizado', body: `${pet?.name} chegou em casa. Conte como foi avaliando ${w}.`, link: liveLink, kind: 'tracking' },
        { audience: 'walker', title: 'Passeio concluído — 100% liberado', body: `Os outros ${formatBRL(walkerPayout(booking).second)} do passeio de ${pet?.name} foram liberados.`, link: '/dog-walker/ganhos', kind: 'payment' },
      ];
    case S.REVIEWED:
      return [{ audience: 'walker', title: 'Nova avaliação', body: `${o} avaliou o passeio de ${pet?.name} com ${booking.review?.rating} estrela(s).`, link: `/dog-walkers/${booking.walkerId}`, kind: 'booking' }];
    case S.CANCELED:
      return [
        { audience: 'owner', title: 'Passeio cancelado', body: `O passeio de ${pet?.name} foi cancelado.`, link: ownerLink, kind: 'booking' },
        { audience: 'walker', title: 'Passeio cancelado', body: `O passeio de ${pet?.name} com ${o} foi cancelado.`, link: '/dog-walker/agenda', kind: 'booking' },
      ];
    case S.EXPIRED:
      return [{ audience: 'owner', title: 'Solicitação expirada', body: `${w} não respondeu a tempo. Nenhum valor foi cobrado.`, link: ownerLink, kind: 'booking' }];
    default:
      return [];
  }
}

/** Generic, validated status transition with side effects (payment, tracking, notifications) */
export function transitionBooking(state, { bookingId, to, actor, extra = {} }) {
  const booking = findBooking(state, bookingId);
  if (!canTransition(booking.status, to, actor)) {
    throw new BookingError(`Não é possível mudar de "${STATUS_META[booking.status].label}" para "${STATUS_META[to].label}".`);
  }
  const now = Date.now();
  const patch = { ...extra };
  if (to === S.WALKING) patch.tracking = { ...booking.tracking, approachProgress: 1, startedAt: now };
  if (to === S.PICKED_UP) patch.tracking = { ...booking.tracking, approachProgress: 1 };
  if (to === S.COMPLETED) {
    patch.tracking = {
      ...booking.tracking,
      walkProgress: 1,
      endedAt: now,
      elapsedMin: Math.max(booking.tracking.elapsedMin, booking.duration),
      distanceKm: Math.max(booking.tracking.distanceKm, routeLengthKm(booking.duration)),
    };
  }
  // Second installment: released when the walker finishes the walk
  if (to === S.COMPLETED && booking.payment.status === P.PARTIAL) patch.payment = { ...booking.payment, status: P.RELEASED, releasedAt: now };
  // Cancel after payment: tutor → retained half refunded; walker → full refund
  if (to === S.CANCELED && booking.payment.status === P.PARTIAL) {
    patch.payment = { ...booking.payment, status: actor === 'owner' ? P.PARTIALLY_REFUNDED : P.REFUNDED, refundedAt: now };
  }

  const updated = applyTransition(booking, to, actor, patch);
  let next = replaceBooking(state, updated);
  if (to === S.COMPLETED) {
    next = { ...next, walkers: next.walkers.map((w) => (w.id === updated.walkerId ? { ...w, walksCount: w.walksCount + 1 } : w)) };
  }
  const context = ctx(next, updated);
  for (const n of transitionNotifications(to, context, updated)) {
    next = notify(next, { ...n, userId: n.audience === 'owner' ? updated.ownerId : updated.walkerId });
  }
  return { state: next, booking: updated };
}

export const acceptBooking = (state, bookingId) => transitionBooking(state, { bookingId, to: S.ACCEPTED, actor: 'walker' });
export const declineBooking = (state, bookingId) => transitionBooking(state, { bookingId, to: S.DECLINED, actor: 'walker' });
export const cancelBooking = (state, bookingId, actor = 'owner') => transitionBooking(state, { bookingId, to: S.CANCELED, actor });

/** Simulated payment: only allowed after acceptance; 50% goes to the walker right away */
export function payBooking(state, { bookingId, methodId }) {
  const booking = findBooking(state, bookingId);
  if (booking.status !== S.ACCEPTED) throw new BookingError('O pagamento só pode ser feito depois que o dog walker aceitar.');
  if (!methodId) throw new BookingError('Escolha uma forma de pagamento.', 'methodId');
  return transitionBooking(state, {
    bookingId,
    to: S.PAID,
    actor: 'owner',
    extra: { payment: { status: P.PARTIAL, methodId, paidAt: Date.now(), firstReleaseAt: Date.now(), releasedAt: null } },
  });
}

/** Walker confirms pickup with the tutor's 4-digit code */
export function confirmPickup(state, { bookingId, code }) {
  const booking = findBooking(state, bookingId);
  if (String(code).trim() !== booking.pickupCode) throw new BookingError('Código incorreto. Peça ao tutor o código exibido no app.', 'code');
  return transitionBooking(state, { bookingId, to: S.PICKED_UP, actor: 'walker' });
}

/** Tutor reviews a completed walk (independent from payment) */
export function reviewBooking(state, { bookingId, rating, comment }) {
  const booking = findBooking(state, bookingId);
  if (booking.status !== S.COMPLETED) throw new BookingError('Só é possível avaliar passeios concluídos.');
  if (!rating || rating < 1 || rating > 5) throw new BookingError('Escolha de 1 a 5 estrelas.', 'rating');
  const review = { rating, comment: comment.trim(), at: Date.now() };
  let { state: next } = transitionBooking(state, { bookingId, to: S.REVIEWED, actor: 'owner', extra: { review } });

  const { walker, pet, owner } = ctx(next, booking);
  const reviewRecord = {
    id: `r-${booking.id}`,
    walkerId: booking.walkerId,
    bookingId: booking.id,
    source: 'app',
    authorName: owner?.name ?? 'Tutor',
    authorAvatar: owner?.avatar ?? '',
    petName: pet?.name ?? '',
    rating,
    comment: review.comment,
    at: review.at,
  };
  const newCount = walker.reviewsCount + 1;
  const updatedWalker = {
    ...walker,
    reviewsCount: newCount,
    rating: Math.round(((walker.rating * walker.reviewsCount + rating) / newCount) * 100) / 100,
  };
  next = {
    ...next,
    reviews: [reviewRecord, ...next.reviews],
    walkers: next.walkers.map((w) => (w.id === walker.id ? updatedWalker : w)),
  };
  return { state: next, booking: next.bookings.find((b) => b.id === bookingId) };
}

/** Expires requests/acceptances whose response window has passed */
export function expireStaleBookings(state) {
  const now = Date.now();
  let next = state;
  for (const b of state.bookings) {
    if ((b.status === S.REQUESTED || b.status === S.ACCEPTED) && b.expiresAt < now) {
      next = transitionBooking(next, { bookingId: b.id, to: S.EXPIRED, actor: 'system' }).state;
    }
  }
  return next;
}
