import { mockWalkers } from './walkers';
import { mockPets } from './pets';
import { mockUsers } from './users';
import { MAIN_FLOW, BOOKING_STATUS as S } from '../../features/bookings/bookingStateMachine';
import { daysFromToday, toTimestamp } from '../../utils/dates';
import { PLATFORM_FEE_RATE } from '../../utils/constants';
import { PAYMENT_STATUS as P } from '../../features/payments/paymentSplit';

/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} ownerId
 * @property {string} walkerId
 * @property {string} petId
 * @property {string} date            ISO day
 * @property {string} time            "HH:MM"
 * @property {number} duration        minutes
 * @property {number} price           paid by the tutor (BRL)
 * @property {number} fee             platform fee kept from the walker
 * @property {number} walkerEarnings  price − fee
 * @property {string} status          BOOKING_STATUS
 * @property {{status:string, at:number, actor:string}[]} history
 * @property {string} pickupCode      4-digit code shown to the tutor
 * @property {{status:'none'|'partial'|'released'|'refunded'|'partially_refunded', methodId:string|null, paidAt:number|null, firstReleaseAt:number|null, releasedAt:number|null}} payment  50% released on payment, 50% on completion
 * @property {{approachProgress:number, walkProgress:number, distanceKm:number, elapsedMin:number, startedAt:number|null, endedAt:number|null, routeSummary:string}} tracking
 * @property {{rating:number, comment:string, at:number}|null} review
 * @property {string} notes
 * @property {string} address
 * @property {number} createdAt
 * @property {number} expiresAt
 */

const walkerById = Object.fromEntries(mockWalkers.map((w) => [w.id, w]));
const petById = Object.fromEntries(mockPets.map((p) => [p.id, p]));
const userById = Object.fromEntries(mockUsers.map((u) => [u.id, u]));

const ROUTE_SUMMARIES = {
  u1: 'Rua Joaquim Távora → Parque Ibirapuera (portão 10) → retorno pela Av. Sena Madureira',
  u2: 'Rua Domingos de Morais → Praça Dr. Carvalho Franco → retorno pela Rua Afonso Celso',
  u3: 'Rua Vergueiro → Parque da Aclimação → retorno pela Rua Pires da Mota',
  u4: 'Rua Tutóia → Parque Ibirapuera (portão 3) → retorno pela Rua Abílio Soares',
};

/** Builds history timestamps consistent with the status reached on the main flow */
function historyUntil(status, date, time) {
  const start = toTimestamp(date, time);
  const offsets = {
    [S.REQUESTED]: -3 * 86400000,
    [S.ACCEPTED]: -3 * 86400000 + 40 * 60000,
    [S.PAID]: -3 * 86400000 + 3 * 3600000,
    [S.ON_THE_WAY]: -15 * 60000,
    [S.PICKED_UP]: -2 * 60000,
    [S.WALKING]: 0,
    [S.RETURNING]: 35 * 60000,
    [S.COMPLETED]: 60 * 60000,
    [S.REVIEWED]: 3 * 3600000,
  };
  const actors = { requested: 'owner', accepted: 'walker', paid: 'owner', reviewed: 'owner' };
  const reached = MAIN_FLOW.indexOf(status);
  return MAIN_FLOW.slice(0, reached + 1).map((s) => ({ status: s, at: start + offsets[s], actor: actors[s] || 'walker' }));
}

/**
 * Seed helper: derives price, fee, payment and tracking from walker table + status,
 * so seeded bookings always respect the business rules.
 */
function seedBooking({ id, ownerId, walkerId, petId, dayOffset, time, duration, status, pickupCode, review = null, notes = '', walkProgress, closedStatus }) {
  const walker = walkerById[walkerId];
  const owner = userById[ownerId];
  if (!walker || !petById[petId] || !owner) throw new Error(`Seed inválido: ${id}`);
  const date = daysFromToday(dayOffset);
  const price = walker.prices[duration];
  const fee = Math.round(price * PLATFORM_FEE_RATE * 100) / 100;
  const effectiveStatus = closedStatus || status;
  const history = closedStatus
    ? [...historyUntil(status, date, time), { status: closedStatus, at: toTimestamp(date, time) - 2 * 86400000, actor: closedStatus === S.DECLINED ? 'walker' : 'owner' }]
    : historyUntil(status, date, time);
  const reachedIdx = MAIN_FLOW.indexOf(status);
  const paid = !closedStatus && reachedIdx >= MAIN_FLOW.indexOf(S.PAID);
  const finished = !closedStatus && reachedIdx >= MAIN_FLOW.indexOf(S.COMPLETED);
  const paidAt = paid ? history.find((h) => h.status === S.PAID)?.at ?? null : null;
  const routeKm = { 30: 2.1, 45: 3.0, 60: 3.9, 90: 5.6 }[duration];
  const progress = finished ? 1 : walkProgress ?? 0;
  return {
    id,
    ownerId,
    walkerId,
    petId,
    date,
    time,
    duration,
    price,
    fee,
    walkerEarnings: Math.round((price - fee) * 100) / 100,
    status: effectiveStatus,
    history,
    pickupCode,
    payment: {
      status: finished ? P.RELEASED : paid ? P.PARTIAL : P.NONE,
      methodId: paid ? 'pm1' : null,
      paidAt,
      firstReleaseAt: paidAt,
      releasedAt: finished ? history.find((h) => h.status === S.COMPLETED)?.at ?? null : null,
    },
    tracking: {
      approachProgress: reachedIdx >= MAIN_FLOW.indexOf(S.PICKED_UP) ? 1 : 0,
      walkProgress: progress,
      distanceKm: Math.round(routeKm * progress * 10) / 10,
      elapsedMin: Math.round(duration * progress),
      startedAt: reachedIdx >= MAIN_FLOW.indexOf(S.WALKING) ? toTimestamp(date, time) : null,
      endedAt: finished ? toTimestamp(date, time) + duration * 60000 : null,
      routeSummary: ROUTE_SUMMARIES[ownerId] || 'Rota pelo bairro',
    },
    review,
    notes,
    address: `${owner.address.street} — ${owner.address.neighborhood}`,
    createdAt: history[0].at,
    // A request/acceptance expires when the walk time arrives without confirmation
    expiresAt: toTimestamp(date, time),
  };
}

const at = (dayOffset, time) => toTimestamp(daysFromToday(dayOffset), time);

/** The live demo walk starts at the current hour so timelines read naturally */
const currentHour = () => `${String(new Date().getHours()).padStart(2, '0')}:00`;
const hourFromNow = (n) => `${String(Math.min(new Date().getHours() + n, 23)).padStart(2, '0')}:00`;

/** @type {Booking[]} */
export const mockBookings = [
  // ---- Marina (u1) as tutor ----
  seedBooking({ id: 'b1', ownerId: 'u1', walkerId: 'w1', petId: 'p1', dayOffset: 0, time: currentHour(), duration: 60, status: S.WALKING, pickupCode: '4821', walkProgress: 0.3, notes: 'Pode passar no Ibirapuera, ele adora o lago.' }),
  seedBooking({ id: 'b2', ownerId: 'u1', walkerId: 'w3', petId: 'p2', dayOffset: 1, time: '08:00', duration: 45, status: S.ACCEPTED, pickupCode: '3907', notes: 'Prefiro rotas com pouco movimento.' }),
  seedBooking({ id: 'b3', ownerId: 'u1', walkerId: 'w2', petId: 'p3', dayOffset: 2, time: '11:00', duration: 30, status: S.REQUESTED, pickupCode: '1564', notes: 'Medicação ao meio-dia, logo após o passeio.' }),
  seedBooking({ id: 'b4', ownerId: 'u1', walkerId: 'w1', petId: 'p1', dayOffset: 3, time: '07:00', duration: 60, status: S.PAID, pickupCode: '7290' }),
  seedBooking({ id: 'b5', ownerId: 'u1', walkerId: 'w1', petId: 'p1', dayOffset: -1, time: '07:00', duration: 60, status: S.COMPLETED, pickupCode: '6612' }),
  seedBooking({ id: 'b6', ownerId: 'u1', walkerId: 'w1', petId: 'p1', dayOffset: -4, time: '07:00', duration: 60, status: S.REVIEWED, pickupCode: '2048', review: { rating: 5, comment: 'Lucas é pontualíssimo. O Thor voltou cansado e feliz, e recebi foto no meio do passeio.', at: at(-4, '11:00') } }),
  seedBooking({ id: 'b7', ownerId: 'u1', walkerId: 'w4', petId: 'p3', dayOffset: -6, time: '09:00', duration: 30, status: S.REVIEWED, pickupCode: '5531', review: { rating: 5, comment: 'Camila respeitou o ritmo do Bidu e mandou o horário certinho do remédio.', at: at(-6, '12:00') } }),
  seedBooking({ id: 'b8', ownerId: 'u1', walkerId: 'w3', petId: 'p2', dayOffset: -9, time: '18:00', duration: 45, status: S.REVIEWED, pickupCode: '8810', review: { rating: 4, comment: 'Ótimo manejo com a Mel. Só chegou 10 minutos atrasado.', at: at(-9, '21:00') } }),
  seedBooking({ id: 'b9', ownerId: 'u1', walkerId: 'w5', petId: 'p1', dayOffset: 5, time: '06:00', duration: 90, status: S.REQUESTED, closedStatus: S.DECLINED, pickupCode: '0412' }),
  seedBooking({ id: 'b10', ownerId: 'u1', walkerId: 'w10', petId: 'p3', dayOffset: -12, time: '10:00', duration: 30, status: S.ACCEPTED, closedStatus: S.CANCELED, pickupCode: '9134' }),

  // ---- Lucas (w1) as walker, other tutors ----
  seedBooking({ id: 'b11', ownerId: 'u2', walkerId: 'w1', petId: 'p4', dayOffset: 0, time: hourFromNow(1), duration: 60, status: S.PAID, pickupCode: '3345', notes: 'A Luna fica com a vizinha do 34. Ela entrega.' }),
  seedBooking({ id: 'b12', ownerId: 'u3', walkerId: 'w1', petId: 'p5', dayOffset: 0, time: hourFromNow(3), duration: 45, status: S.ACCEPTED, pickupCode: '7781' }),
  seedBooking({ id: 'b13', ownerId: 'u4', walkerId: 'w1', petId: 'p6', dayOffset: 1, time: '07:00', duration: 60, status: S.REQUESTED, pickupCode: '2290', notes: 'O Zeus precisa de condutor com experiência em cães grandes reativos.' }),
  seedBooking({ id: 'b14', ownerId: 'u3', walkerId: 'w1', petId: 'p7', dayOffset: 2, time: '09:00', duration: 30, status: S.REQUESTED, pickupCode: '6403', notes: 'Primeiro passeio da Nina com alguém novo.' }),
  seedBooking({ id: 'b15', ownerId: 'u2', walkerId: 'w1', petId: 'p8', dayOffset: -2, time: '17:00', duration: 45, status: S.REVIEWED, pickupCode: '1177', review: { rating: 5, comment: 'Bob voltou feliz e o Lucas respeitou a dieta dele.', at: at(-2, '20:00') } }),
  seedBooking({ id: 'b16', ownerId: 'u2', walkerId: 'w1', petId: 'p4', dayOffset: -3, time: '16:00', duration: 60, status: S.REVIEWED, pickupCode: '5002', review: { rating: 5, comment: 'A Luna gastou toda a energia. Recomendo muito.', at: at(-3, '19:30') } }),
  seedBooking({ id: 'b17', ownerId: 'u4', walkerId: 'w1', petId: 'p6', dayOffset: -7, time: '07:00', duration: 60, status: S.REVIEWED, pickupCode: '4419', review: { rating: 5, comment: 'Primeira pessoa que conseguiu passear com o Zeus sem estresse.', at: at(-7, '10:00') } }),
  seedBooking({ id: 'b18', ownerId: 'u3', walkerId: 'w1', petId: 'p5', dayOffset: -10, time: '18:00', duration: 45, status: S.REVIEWED, pickupCode: '8826', review: { rating: 4, comment: 'Tudo certo, Paçoca adorou.', at: at(-10, '21:00') } }),
  seedBooking({ id: 'b19', ownerId: 'u4', walkerId: 'w1', petId: 'p6', dayOffset: -14, time: '07:00', duration: 60, status: S.REVIEWED, pickupCode: '3150', review: { rating: 5, comment: 'Excelente com focinheira e muito cuidadoso.', at: at(-14, '10:00') } }),
  seedBooking({ id: 'b20', ownerId: 'u3', walkerId: 'w1', petId: 'p7', dayOffset: 4, time: '17:00', duration: 30, status: S.REQUESTED, closedStatus: S.EXPIRED, pickupCode: '7064' }),
];
