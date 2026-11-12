import { BOOKING_STATUS as S, applyTransition, canTransition } from '../features/bookings/bookingStateMachine';
import { quote } from './pricing';
import { isAvailableOn } from './availabilityService';
import { notify } from './notificationService';
import { compatibilityWarnings } from '../features/walkers/walkerSelectors';
import { formatRelativeDay } from '../utils/dates';
import { firstName, formatBRL } from '../utils/format';
import { routeLengthKm } from './trackingService';
import { walkerPayout } from '../features/payments/paymentSplit';
import { api } from '../api';

// Fase 4: as regras de negócio do passeio (transições por ator, pagamento em 2
// parcelas, código de retirada, avaliação) rodam no backend (PasseioService).
// Aqui ficam: a validação local instantânea (mesmas mensagens, com `field` para
// o formulário), as chamadas à API com erro convertido em BookingError, a
// mesclagem do retorno do servidor com o tracking simulado localmente e as
// notificações locais (ainda não vão para o backend).

export class BookingError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'BookingError';
    this.field = field;
  }
}

/** Converte erros da API ({"message", "field"?}) em BookingError para o formulário/toast */
const erroDeApi = (error) => {
  const corpo = error.response?.data;
  const mensagem = corpo?.message ?? 'Não foi possível falar com o servidor. Tente novamente.';
  return new BookingError(mensagem, corpo?.field);
};

// ------------------------------------------------------------------
// Chamadas à API (o backend é a fonte de verdade de negócio)
// ------------------------------------------------------------------

export async function criarNaApi(input) {
  try {
    return (await api.post('/passeios', input)).data;
  } catch (error) {
    throw erroDeApi(error);
  }
}

export async function transicionarNaApi(bookingId, to, actor) {
  try {
    return (await api.post(`/passeios/${bookingId}/transicoes`, { to, actor })).data;
  } catch (error) {
    throw erroDeApi(error);
  }
}

export async function pagarNaApi(bookingId, methodId) {
  try {
    return (await api.post(`/passeios/${bookingId}/pagamento`, { methodId })).data;
  } catch (error) {
    throw erroDeApi(error);
  }
}

export async function confirmarRetiradaNaApi(bookingId, code) {
  try {
    return (await api.post(`/passeios/${bookingId}/retirada`, { code })).data;
  } catch (error) {
    throw erroDeApi(error);
  }
}

export async function avaliarNaApi(bookingId, rating, comment) {
  try {
    return (await api.post(`/passeios/${bookingId}/avaliacao`, { rating, comment })).data;
  } catch (error) {
    throw erroDeApi(error);
  }
}

// ------------------------------------------------------------------
// Validação local (erros instantâneos, antes de chamar a API)
// ------------------------------------------------------------------

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

// ------------------------------------------------------------------
// Mesclagem servidor + tracking simulado
// ------------------------------------------------------------------

/**
 * Patch de tracking aplicado localmente quando um status é alcançado.
 * (Extraído da transitionBooking original: o tracking é simulação visual do
 * front — o backend grava apenas status/histórico/pagamento/avaliação.)
 */
export function trackingPatch(booking, to) {
  const now = Date.now();
  const tracking = booking.tracking || {};
  if (to === S.WALKING) return { ...tracking, approachProgress: 1, startedAt: now };
  if (to === S.PICKED_UP) return { ...tracking, approachProgress: 1 };
  if (to === S.COMPLETED) {
    return {
      ...tracking,
      walkProgress: 1,
      endedAt: now,
      elapsedMin: Math.max(tracking.elapsedMin ?? 0, booking.duration),
      distanceKm: Math.max(tracking.distanceKm ?? 0, routeLengthKm(booking.duration)),
    };
  }
  return {};
}

/** Servidor vence nos campos de negócio; o tracking preserva a simulação local em curso. */
export function mesclarBookingRemoto(serverBooking, localBooking, to) {
  const base = localBooking ?? serverBooking;
  const patch = trackingPatch(base, to);
  return Object.keys(patch).length ? { ...serverBooking, tracking: { ...serverBooking.tracking, ...patch } } : serverBooking;
}

/** Hidratação (load do app): status divergente → servidor vence; igual → mantém o tracking local. */
export function mesclarHidratado(serverBooking, localBooking) {
  if (localBooking && localBooking.status === serverBooking.status && localBooking.tracking) {
    return { ...serverBooking, tracking: localBooking.tracking };
  }
  return serverBooking;
}

// ------------------------------------------------------------------
// Aplicação do retorno do servidor ao estado local (+ notificações)
// ------------------------------------------------------------------

const ctx = (state, booking) => ({
  walker: state.walkers.find((w) => w.id === booking.walkerId),
  pet: state.pets.find((p) => p.id === booking.petId),
  owner: state.users.find((u) => u.id === booking.ownerId),
});

/** Mensagens enviadas a cada lado quando um status é alcançado */
export function transitionNotifications(status, { walker, pet, owner }, booking) {
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

/** Notificações da criação da solicitação (o backend devolve o passeio criado) */
export function creationNotifications(booking, { walker, pet, owner }) {
  return [
    {
      audience: 'walker',
      kind: 'booking',
      title: 'Nova solicitação',
      body: `${firstName(owner?.name)} solicitou ${booking.duration} min para ${pet?.name} — ${formatRelativeDay(booking.date)} às ${booking.time}.`,
      link: `/dog-walker/solicitacoes/${booking.id}`,
    },
    {
      audience: 'owner',
      kind: 'booking',
      title: 'Solicitação enviada',
      body: `Aguardando ${firstName(walker?.name)} aceitar o passeio de ${pet?.name}.`,
      link: `/tutor/passeios/${booking.id}`,
    },
  ];
}

/** Efeitos locais da avaliação: registro público do perfil + walker atualizado. */
export function registrarAvaliacao(state, booking) {
  const { walker, pet, owner } = ctx(state, booking);
  if (!walker || !booking.review) return state;
  const reviewRecord = {
    id: `r-${booking.id}`,
    walkerId: booking.walkerId,
    bookingId: booking.id,
    source: 'app',
    authorName: owner?.name ?? 'Tutor',
    authorAvatar: owner?.avatar ?? '',
    petName: pet?.name ?? '',
    rating: booking.review.rating,
    comment: booking.review.comment,
    at: booking.review.at,
  };
  const antigoCount = walker.reviewsCount ?? 0;
  const newCount = antigoCount + 1;
  const updatedWalker = {
    ...walker,
    reviewsCount: newCount,
    rating: Math.round((((walker.rating ?? 0) * antigoCount + booking.review.rating) / newCount) * 100) / 100,
  };
  return {
    ...state,
    reviews: [reviewRecord, ...state.reviews],
    walkers: state.walkers.map((w) => (w.id === walker.id ? updatedWalker : w)),
  };
}

/** Aplica o passeio devolvido pelo backend: mescla, notifica e atualiza contadores locais */
export function aplicarBookingRemoto(state, serverBooking, localBooking, to) {
  const booking = mesclarBookingRemoto(serverBooking, localBooking, to);
  let next = { ...state, bookings: state.bookings.map((b) => (b.id === booking.id ? booking : b)) };
  const context = ctx(next, booking);
  for (const n of transitionNotifications(serverBooking.status, context, booking)) {
    next = notify(next, { ...n, userId: n.audience === 'owner' ? booking.ownerId : booking.walkerId });
  }
  if (serverBooking.status === S.COMPLETED) {
    next = { ...next, walkers: next.walkers.map((w) => (w.id === booking.walkerId ? { ...w, walksCount: (w.walksCount ?? 0) + 1 } : w)) };
  }
  if (serverBooking.status === S.REVIEWED) next = registrarAvaliacao(next, booking);
  return next;
}

// ------------------------------------------------------------------
// Expiração local (o backend tem um scheduler com a mesma regra)
// ------------------------------------------------------------------

function aplicarTransicaoLocal(state, bookingId, to, actor) {
  const booking = state.bookings.find((b) => b.id === bookingId);
  if (!booking || !canTransition(booking.status, to, actor)) return state;
  const updated = applyTransition(booking, to, actor);
  let next = { ...state, bookings: state.bookings.map((b) => (b.id === bookingId ? updated : b)) };
  for (const n of transitionNotifications(to, ctx(next, updated), updated)) {
    next = notify(next, { ...n, userId: n.audience === 'owner' ? updated.ownerId : updated.walkerId });
  }
  return next;
}

/** Expires requests/acceptances whose response window has passed */
export function expireStaleBookings(state) {
  const now = Date.now();
  let next = state;
  for (const b of state.bookings) {
    if ((b.status === S.REQUESTED || b.status === S.ACCEPTED) && b.expiresAt < now) {
      next = aplicarTransicaoLocal(next, b.id, S.EXPIRED, 'system');
    }
  }
  return next;
}
