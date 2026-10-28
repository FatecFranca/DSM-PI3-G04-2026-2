import { PLATFORM_FEE_RATE } from '../utils/constants';

const round2 = (n) => Math.round(n * 100) / 100;

export function walkerDurations(walker) {
  return Object.keys(walker?.prices || {})
    .map(Number)
    .sort((a, b) => a - b);
}

export function priceFor(walker, duration) {
  return walker?.prices?.[duration] ?? null;
}

/** Lowest price, used as "a partir de" reference on cards */
export function referencePrice(walker) {
  const durations = walkerDurations(walker);
  const d = durations.includes(30) ? 30 : durations[0];
  return { duration: d, price: priceFor(walker, d) };
}

export function quote(walker, duration) {
  const price = priceFor(walker, duration);
  if (price == null) return null;
  const fee = round2(price * PLATFORM_FEE_RATE);
  return { price, fee, walkerEarnings: round2(price - fee) };
}
