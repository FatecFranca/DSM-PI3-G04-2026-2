// Central business rules for the booking lifecycle.
// Every status change in the app goes through `canTransition` / `assertTransition`,
// so invalid moves (e.g. starting a declined walk) are impossible from any screen.

export const BOOKING_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  PAID: 'paid',
  ON_THE_WAY: 'on_the_way',
  PICKED_UP: 'picked_up',
  WALKING: 'walking',
  RETURNING: 'returning',
  COMPLETED: 'completed',
  REVIEWED: 'reviewed',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  CANCELED: 'canceled',
};

const S = BOOKING_STATUS;

/** Main happy-path order, used for timelines/progress */
export const MAIN_FLOW = [
  S.REQUESTED,
  S.ACCEPTED,
  S.PAID,
  S.ON_THE_WAY,
  S.PICKED_UP,
  S.WALKING,
  S.RETURNING,
  S.COMPLETED,
  S.REVIEWED,
];

export const STATUS_META = {
  [S.REQUESTED]: { label: 'Solicitado', ownerHint: 'Aguardando resposta do dog walker', walkerHint: 'Nova solicitação para analisar', tone: 'warning' },
  [S.ACCEPTED]: { label: 'Aceito', ownerHint: 'Aceito — falta o pagamento', walkerHint: 'Aguardando pagamento do tutor', tone: 'info' },
  [S.PAID]: { label: 'Pago e confirmado', ownerHint: 'Pago. Metade já foi repassada ao dog walker; a outra metade, ao fim do passeio', walkerHint: 'Confirmado. 50% já liberado; o restante ao finalizar o passeio', tone: 'success' },
  [S.ON_THE_WAY]: { label: 'A caminho', ownerHint: 'O dog walker está a caminho', walkerHint: 'Indo buscar o pet', tone: 'live' },
  [S.PICKED_UP]: { label: 'Retirada confirmada', ownerHint: 'Pet retirado com código confirmado', walkerHint: 'Pet com você. Inicie o passeio.', tone: 'live' },
  [S.WALKING]: { label: 'Em passeio', ownerHint: 'Passeio em andamento', walkerHint: 'Passeio em andamento', tone: 'live' },
  [S.RETURNING]: { label: 'Voltando', ownerHint: 'A caminho de casa', walkerHint: 'Voltando para entregar o pet', tone: 'live' },
  [S.COMPLETED]: { label: 'Concluído', ownerHint: 'Passeio concluído — avalie o dog walker', walkerHint: 'Concluído — pagamento 100% liberado', tone: 'neutral' },
  [S.REVIEWED]: { label: 'Avaliado', ownerHint: 'Passeio concluído e avaliado', walkerHint: 'Concluído e avaliado pelo tutor', tone: 'neutral' },
  [S.DECLINED]: { label: 'Recusado', ownerHint: 'O dog walker não pôde aceitar', walkerHint: 'Você recusou', tone: 'danger' },
  [S.EXPIRED]: { label: 'Expirado', ownerHint: 'Sem resposta no prazo', walkerHint: 'Expirou sem resposta', tone: 'danger' },
  [S.CANCELED]: { label: 'Cancelado', ownerHint: 'Passeio cancelado', walkerHint: 'Cancelado', tone: 'danger' },
};

/**
 * Allowed transitions: from -> { to: [actors allowed] }.
 * Actors: 'owner' (tutor), 'walker', 'system'.
 */
const TRANSITIONS = {
  [S.REQUESTED]: {
    [S.ACCEPTED]: ['walker'],
    [S.DECLINED]: ['walker'],
    [S.CANCELED]: ['owner'],
    [S.EXPIRED]: ['system'],
  },
  [S.ACCEPTED]: {
    [S.PAID]: ['owner'],
    [S.CANCELED]: ['owner', 'walker'],
    [S.EXPIRED]: ['system'],
  },
  [S.PAID]: {
    [S.ON_THE_WAY]: ['walker'],
    [S.CANCELED]: ['owner', 'walker'],
  },
  [S.ON_THE_WAY]: {
    [S.PICKED_UP]: ['walker'],
    [S.CANCELED]: ['walker'],
  },
  [S.PICKED_UP]: { [S.WALKING]: ['walker'] },
  [S.WALKING]: { [S.RETURNING]: ['walker', 'system'] },
  [S.RETURNING]: { [S.COMPLETED]: ['walker'] },
  [S.COMPLETED]: { [S.REVIEWED]: ['owner'] },
  [S.REVIEWED]: {},
  [S.DECLINED]: {},
  [S.EXPIRED]: {},
  [S.CANCELED]: {},
};

export function nextStatuses(status) {
  return Object.keys(TRANSITIONS[status] || {});
}

export function canTransition(from, to, actor) {
  const actors = TRANSITIONS[from]?.[to];
  if (!actors) return false;
  return actor ? actors.includes(actor) : true;
}

export class InvalidTransitionError extends Error {
  constructor(from, to, actor) {
    super(`Transição inválida: ${STATUS_META[from]?.label ?? from} → ${STATUS_META[to]?.label ?? to}${actor ? ` (${actor})` : ''}`);
    this.name = 'InvalidTransitionError';
  }
}

export function assertTransition(from, to, actor) {
  if (!canTransition(from, to, actor)) throw new InvalidTransitionError(from, to, actor);
}

/** Pure function: returns a new booking with the status applied and history appended */
export function applyTransition(booking, to, actor, extra = {}) {
  assertTransition(booking.status, to, actor);
  const at = Date.now();
  return {
    ...booking,
    ...extra,
    status: to,
    updatedAt: at,
    history: [...(booking.history || []), { status: to, at, actor }],
  };
}

// ---- Status groupings used by lists, tabs and dashboards ----

export const LIVE_STATUSES = [S.ON_THE_WAY, S.PICKED_UP, S.WALKING, S.RETURNING];
export const UPCOMING_STATUSES = [S.REQUESTED, S.ACCEPTED, S.PAID];
export const FINISHED_STATUSES = [S.COMPLETED, S.REVIEWED];
export const CLOSED_STATUSES = [S.DECLINED, S.EXPIRED, S.CANCELED];

export const isLive = (status) => LIVE_STATUSES.includes(status);
export const isUpcoming = (status) => UPCOMING_STATUSES.includes(status);
export const isFinished = (status) => FINISHED_STATUSES.includes(status);
export const isClosed = (status) => CLOSED_STATUSES.includes(status);

/** Index on the main flow (−1 for alternative/closed statuses) */
export const flowIndex = (status) => MAIN_FLOW.indexOf(status);

/**
 * The walker's next operational action for a booking, used by big action buttons.
 * Returns null when the walker has nothing to do.
 */
export function walkerNextAction(status) {
  switch (status) {
    case S.REQUESTED:
      return { to: S.ACCEPTED, label: 'Aceitar solicitação' };
    case S.PAID:
      return { to: S.ON_THE_WAY, label: 'Estou a caminho' };
    case S.ON_THE_WAY:
      return { to: S.PICKED_UP, label: 'Cheguei', requiresCode: true };
    case S.PICKED_UP:
      return { to: S.WALKING, label: 'Iniciar passeio' };
    case S.WALKING:
      return { to: S.RETURNING, label: 'Voltar para casa' };
    case S.RETURNING:
      return { to: S.COMPLETED, label: 'Finalizar passeio' };
    default:
      return null;
  }
}

/** The tutor's next action for a booking */
export function ownerNextAction(status) {
  switch (status) {
    case S.ACCEPTED:
      return { to: S.PAID, label: 'Pagar e confirmar' };
    case S.COMPLETED:
      return { to: S.REVIEWED, label: 'Avaliar passeio' };
    default:
      return null;
  }
}
