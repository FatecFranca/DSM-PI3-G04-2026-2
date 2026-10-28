import { BOOKING_STATUS as S, isLive } from '../features/bookings/bookingStateMachine';
import { PAYMENT_STATUS as P, halves, walkerPayout } from '../features/payments/paymentSplit';
import { newId } from './notificationService';

// Simulated payments, paid out in two installments (see features/payments/paymentSplit.js):
// 50% to the walker when the tutor pays, 50% when the walker finishes the walk.
// A real implementation would use a payment provider with split support; no card
// data is ever collected here.

const round2 = (n) => Math.round(n * 100) / 100;
const sum = (list, key) => round2(list.reduce((acc, item) => acc + (item[key] || 0), 0));

/** Tutor payment history derived from bookings */
export function ownerPayments(state, ownerId) {
  return state.bookings
    .filter((b) => b.ownerId === ownerId && b.payment.status !== P.NONE)
    .map((b) => ({
      id: `pay-${b.id}`,
      bookingId: b.id,
      walkerId: b.walkerId,
      petId: b.petId,
      amount: b.price,
      refunded: b.payment.status === P.REFUNDED ? b.price : b.payment.status === P.PARTIALLY_REFUNDED ? halves(b.price)[1] : 0,
      status: b.payment.status,
      methodId: b.payment.methodId,
      at: b.payment.paidAt,
    }))
    .sort((a, b) => (b.at || 0) - (a.at || 0));
}

/**
 * Walker earnings summary:
 * - pending:  accepted, waiting for the tutor's payment (not yet guaranteed)
 * - held:     second half of paid walks that are not finished yet
 * - released: first halves of paid walks + full value of finished walks
 * Transactions list each installment separately.
 */
export function walkerEarnings(state, walkerId) {
  const mine = state.bookings.filter((b) => b.walkerId === walkerId);
  const pending = mine.filter((b) => b.status === S.ACCEPTED);
  const paidOut = mine.filter((b) => [P.PARTIAL, P.RELEASED, P.PARTIALLY_REFUNDED].includes(b.payment.status));
  const held = paidOut.filter((b) => b.payment.status === P.PARTIAL);

  const transactions = [];
  for (const b of paidOut) {
    const payout = walkerPayout(b);
    const [grossFirst, grossSecond] = halves(b.price);
    const [feeFirst, feeSecond] = halves(b.fee);
    const base = { bookingId: b.id, ownerId: b.ownerId, petId: b.petId, date: b.date, bookingStatus: b.status, live: isLive(b.status) };
    transactions.push({
      ...base,
      id: `tx-${b.id}-1`,
      installment: 1,
      label: '1ª metade · passeio fechado',
      gross: grossFirst,
      fee: feeFirst,
      net: payout.first,
      status: 'released',
      at: b.payment.firstReleaseAt || b.payment.paidAt || b.createdAt,
    });
    if (b.payment.status !== P.PARTIALLY_REFUNDED) {
      const done = b.payment.status === P.RELEASED;
      transactions.push({
        ...base,
        id: `tx-${b.id}-2`,
        installment: 2,
        label: done ? '2ª metade · passeio finalizado' : '2ª metade · ao finalizar o passeio',
        gross: grossSecond,
        fee: feeSecond,
        net: payout.second,
        status: done ? 'released' : 'held',
        at: b.payment.releasedAt || b.payment.firstReleaseAt || b.createdAt,
      });
    }
  }
  transactions.sort((a, b) => b.at - a.at || b.installment - a.installment);

  const releasedTx = transactions.filter((t) => t.status === 'released');
  const monthPrefix = new Date().toISOString().slice(0, 7);
  return {
    pending: { count: pending.length, amount: sum(pending, 'walkerEarnings') },
    held: { count: held.length, amount: round2(held.reduce((n, b) => n + walkerPayout(b).retained, 0)) },
    released: { count: paidOut.length, amount: sum(releasedTx, 'net') },
    releasedThisMonth: sum(releasedTx.filter((t) => new Date(t.at).toISOString().startsWith(monthPrefix)), 'net'),
    feesTotal: sum(releasedTx, 'fee'),
    transactions,
  };
}

export function addPaymentMethod(state, userId, { type, brand, nickname }) {
  const label = type === 'pix' ? `Pix — ${nickname || 'chave cadastrada'}` : `${brand} — ${nickname || 'cartão demonstrativo'}`;
  const isFirst = !state.paymentMethods.some((m) => m.userId === userId);
  const method = { id: newId('pm'), userId, type, brand: type === 'pix' ? 'Pix' : brand, label, isDefault: isFirst };
  return { state: { ...state, paymentMethods: [...state.paymentMethods, method] }, method };
}

export function setDefaultPaymentMethod(state, userId, methodId) {
  return {
    ...state,
    paymentMethods: state.paymentMethods.map((m) => (m.userId === userId ? { ...m, isDefault: m.id === methodId } : m)),
  };
}

export function removePaymentMethod(state, methodId) {
  return { ...state, paymentMethods: state.paymentMethods.filter((m) => m.id !== methodId) };
}
