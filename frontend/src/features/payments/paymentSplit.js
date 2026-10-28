// Two-installment payout rule (single source of truth for services and screens):
//  1. When the tutor pays (booking "fechado"), 50% is released to the dog walker.
//  2. When the dog walker finishes the walk, the remaining 50% is released.
// Reviews are independent from payment.
// Cancellation after payment: tutor cancels → the retained 50% is refunded and the
// walker keeps the first half (reserved slot); walker cancels → full refund.

export const PAYMENT_STATUS = {
  NONE: 'none',
  PARTIAL: 'partial', // 50% released, 50% retained
  RELEASED: 'released', // 100% released
  REFUNDED: 'refunded', // full refund to the tutor
  PARTIALLY_REFUNDED: 'partially_refunded', // retained half refunded, first half kept by the walker
};

const round2 = (n) => Math.round(n * 100) / 100;

/** Splits an amount into two installments that always add up to the cent */
export function halves(amount) {
  const first = round2(amount / 2);
  return [first, round2(amount - first)];
}

/** Walker-side view of a booking's payout (net values, after the platform fee) */
export function walkerPayout(booking) {
  const [first, second] = halves(booking.walkerEarnings);
  const status = booking.payment?.status ?? PAYMENT_STATUS.NONE;
  const released = status === PAYMENT_STATUS.RELEASED ? first + second : status === PAYMENT_STATUS.PARTIAL || status === PAYMENT_STATUS.PARTIALLY_REFUNDED ? first : 0;
  const retained = status === PAYMENT_STATUS.PARTIAL ? second : 0;
  return { first, second, released: round2(released), retained: round2(retained) };
}

/** Tutor-facing payment labels */
export const OWNER_PAYMENT_META = {
  none: { label: 'Aguardando pagamento', tone: 'neutral', text: 'Você só paga depois que o dog walker aceitar.' },
  partial: { label: '50% repassado', tone: 'info', text: 'Pagamento confirmado. Metade já foi repassada ao dog walker e a outra metade fica retida até ele finalizar o passeio.' },
  released: { label: 'Pagamento concluído', tone: 'success', text: 'O passeio foi finalizado e o valor total foi repassado ao dog walker.' },
  refunded: { label: 'Estornado', tone: 'info', text: 'O passeio foi cancelado e o valor foi devolvido integralmente.' },
  partially_refunded: { label: 'Estorno parcial', tone: 'info', text: 'O passeio foi cancelado por você após a confirmação. Os 50% retidos foram devolvidos; a primeira metade ficou com o dog walker pelo horário reservado.' },
};

/** Walker-facing payment labels */
export const WALKER_PAYMENT_META = {
  none: { label: 'Aguardando pagamento', tone: 'neutral' },
  partial: { label: '50% liberado', tone: 'info' },
  released: { label: '100% liberado', tone: 'success' },
  refunded: { label: 'Estornado ao tutor', tone: 'danger' },
  partially_refunded: { label: '50% mantido', tone: 'warning' },
};
