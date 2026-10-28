import { isLive, isUpcoming, isFinished, isClosed, BOOKING_STATUS as S } from './bookingStateMachine';
import { toTimestamp } from '../../utils/dates';

/** Booking joined with walker, pet and owner records (missing relations become null) */
export function enrichBooking(data, booking) {
  if (!booking) return null;
  return {
    ...booking,
    walker: data.walkers.find((w) => w.id === booking.walkerId) ?? null,
    pet: data.pets.find((p) => p.id === booking.petId) ?? null,
    owner: data.users.find((u) => u.id === booking.ownerId) ?? null,
  };
}

const byStartAsc = (a, b) => toTimestamp(a.date, a.time) - toTimestamp(b.date, b.time);
const byStartDesc = (a, b) => byStartAsc(b, a);

/** Tutor tabs: próximos / ao vivo / concluídos (+ encerrados: recusado/expirado/cancelado) */
export function groupOwnerBookings(bookings) {
  return {
    upcoming: bookings.filter((b) => isUpcoming(b.status)).sort(byStartAsc),
    live: bookings.filter((b) => isLive(b.status)).sort(byStartAsc),
    finished: bookings.filter((b) => isFinished(b.status)).sort(byStartDesc),
    closed: bookings.filter((b) => isClosed(b.status)).sort(byStartDesc),
  };
}

export function groupWalkerBookings(bookings) {
  return {
    requests: bookings.filter((b) => b.status === S.REQUESTED).sort(byStartAsc),
    awaitingPayment: bookings.filter((b) => b.status === S.ACCEPTED).sort(byStartAsc),
    confirmed: bookings.filter((b) => b.status === S.PAID).sort(byStartAsc),
    live: bookings.filter((b) => isLive(b.status)).sort(byStartAsc),
    finished: bookings.filter((b) => isFinished(b.status)).sort(byStartDesc),
    closed: bookings.filter((b) => isClosed(b.status)).sort(byStartDesc),
  };
}

export { byStartAsc, byStartDesc };
