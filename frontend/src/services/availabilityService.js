import { DAY_SLOTS, weekdayOf, todayISO, timeToMinutes, nowTime } from '../utils/dates';
import { isClosed } from '../features/bookings/bookingStateMachine';

// Availability = weekly template − blocked slots − slots taken by active bookings.

export function isDayOff(walker, date) {
  return (walker.blockedSlots?.[date] || []).includes('*');
}

/** Slots taken by bookings that are still active (closed bookings free the slot) */
export function bookedSlots(walkerId, date, bookings) {
  return bookings
    .filter((b) => b.walkerId === walkerId && b.date === date && !isClosed(b.status))
    .map((b) => b.time);
}

/**
 * Returns every platform hour slot for the date with its state:
 * 'available' | 'booked' | 'blocked' | 'off' (outside weekly template) | 'past'
 */
export function getDaySlots(walker, date, bookings) {
  const template = walker.availability?.[weekdayOf(date)] || [];
  const blocked = walker.blockedSlots?.[date] || [];
  const booked = bookedSlots(walker.id, date, bookings);
  const dayOff = blocked.includes('*');
  const isToday = date === todayISO();
  const nowMinutes = timeToMinutes(nowTime());
  return DAY_SLOTS.map((time) => {
    let state = 'available';
    if (booked.includes(time)) state = 'booked';
    else if (dayOff || blocked.includes(time)) state = 'blocked';
    else if (!template.includes(time)) state = 'off';
    else if (isToday && timeToMinutes(time) <= nowMinutes) state = 'past';
    return { time, state };
  });
}

export function getAvailableTimes(walker, date, bookings) {
  return getDaySlots(walker, date, bookings)
    .filter((slot) => slot.state === 'available')
    .map((slot) => slot.time);
}

export function isAvailableOn(walker, date, bookings, time) {
  const times = getAvailableTimes(walker, date, bookings);
  return time ? times.includes(time) : times.length > 0;
}

/** Pure update: toggles a single blocked slot (or whole day with "*") */
export function toggleBlockedSlot(walker, date, time) {
  const current = walker.blockedSlots?.[date] || [];
  const next = current.includes(time) ? current.filter((t) => t !== time) : [...current, time];
  const blockedSlots = { ...walker.blockedSlots };
  if (next.length) blockedSlots[date] = next;
  else delete blockedSlots[date];
  return { ...walker, blockedSlots };
}

export function setWeeklyTemplate(walker, weekday, slots) {
  return { ...walker, availability: { ...walker.availability, [weekday]: [...slots].sort() } };
}
