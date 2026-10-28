// Simulated walk tracking. Positions are interpolated along a predefined route —
// this is NOT real GPS. A real implementation would stream positions from the
// walker's device (with consent, limited retention and access controls — LGPD).

/** Loop template as offsets from the pickup address (approx. 3.9 km in Vila Mariana → Ibirapuera) */
const LOOP_OFFSETS = [
  [0, 0],
  [0.0013, -0.0033],
  [0.0027, -0.0067],
  [0.004, -0.0103],
  [0.0057, -0.0137],
  [0.0077, -0.017],
  [0.0093, -0.0202],
  [0.0075, -0.023],
  [0.0047, -0.0235],
  [0.0026, -0.0213],
  [0.002, -0.0175],
  [0.0025, -0.0135],
  [0.0015, -0.0095],
  [0.0007, -0.0055],
  [0, 0],
];

/** Simulated time acceleration: 1 real second = 1 simulated minute */
export const SIM_MINUTES_PER_SECOND = 1;
/** Fraction of the walk after which the walker starts heading back */
export const RETURN_THRESHOLD = 0.6;
/** Simulated minutes for the walker to reach the pickup address */
export const APPROACH_MINUTES = 12;

const ROUTE_KM_BY_DURATION = { 30: 2.1, 45: 3.0, 60: 3.9, 90: 5.6 };

export function routeLengthKm(duration) {
  return ROUTE_KM_BY_DURATION[duration] ?? (duration / 60) * 3.9;
}

/** Full walking loop for a pickup point, scaled to the walk duration */
export function buildWalkRoute(home, duration = 60) {
  const scale = routeLengthKm(duration) / 3.9;
  return LOOP_OFFSETS.map(([dLat, dLng]) => [home.lat + dLat * scale, home.lng + dLng * scale]);
}

/** Path from the walker's base to the pickup point */
export function buildApproachRoute(from, to) {
  const mid1 = [from.lat + (to.lat - from.lat) * 0.35, from.lng];
  const mid2 = [mid1[0], from.lng + (to.lng - from.lng) * 0.7];
  return [[from.lat, from.lng], mid1, mid2, [to.lat, to.lng]];
}

function segmentLength(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/** Point at `progress` (0–1) along a polyline, plus the traveled sub-path */
export function pointAlong(route, progress) {
  const p = Math.min(1, Math.max(0, progress));
  const lengths = route.slice(1).map((pt, i) => segmentLength(route[i], pt));
  const total = lengths.reduce((a, b) => a + b, 0);
  let target = total * p;
  const traveled = [route[0]];
  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i]) {
      const t = lengths[i] ? target / lengths[i] : 0;
      const a = route[i];
      const b = route[i + 1];
      const point = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      traveled.push(point);
      return { point, traveled };
    }
    target -= lengths[i];
    traveled.push(route[i + 1]);
  }
  return { point: route[route.length - 1], traveled };
}

/**
 * Advances a booking's tracking by `seconds` of real time.
 * Returns { tracking, crossedReturn, approachDone } — pure, no side effects.
 */
export function advanceTracking(booking, seconds, phase) {
  const t = booking.tracking;
  const simMinutes = seconds * SIM_MINUTES_PER_SECOND;
  if (phase === 'approach') {
    const approachProgress = Math.min(1, t.approachProgress + simMinutes / APPROACH_MINUTES);
    return { tracking: { ...t, approachProgress }, approachDone: approachProgress >= 1 && t.approachProgress < 1 };
  }
  const walkProgress = Math.min(1, t.walkProgress + simMinutes / booking.duration);
  const tracking = {
    ...t,
    walkProgress,
    elapsedMin: Math.round(booking.duration * walkProgress * 10) / 10,
    distanceKm: Math.round(routeLengthKm(booking.duration) * walkProgress * 100) / 100,
  };
  return { tracking, crossedReturn: t.walkProgress < RETURN_THRESHOLD && walkProgress >= RETURN_THRESHOLD };
}

export function remainingMinutes(booking) {
  return Math.max(0, Math.round(booking.duration * (1 - booking.tracking.walkProgress)));
}

/** Estimated return clock time ("HH:MM") */
export function estimatedReturn(booking) {
  const date = new Date(Date.now() + remainingMinutes(booking) * 60000);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Demonstration-only share link; carries no coordinates */
export function demoShareLink(bookingId) {
  const token = btoa(`${bookingId}:${Date.now()}`).replace(/=+$/, '').slice(-10);
  return `https://roledepet.demo/acompanhar/${token}`;
}
