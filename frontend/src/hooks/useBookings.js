import { useMemo } from 'react';
import { useData } from '../context/AppStore';
import { useActingWalker, useCurrentUser } from './useAccount';
import { enrichBooking, groupOwnerBookings, groupWalkerBookings } from '../features/bookings/bookingSelectors';

export function useBooking(bookingId) {
  const data = useData();
  return useMemo(() => enrichBooking(data, data.bookings.find((b) => b.id === bookingId)), [data, bookingId]);
}

/** All bookings of the signed-in tutor, enriched and grouped by tab */
export function useOwnerBookings() {
  const data = useData();
  const user = useCurrentUser();
  return useMemo(() => {
    const list = user ? data.bookings.filter((b) => b.ownerId === user.id).map((b) => enrichBooking(data, b)) : [];
    return { all: list, ...groupOwnerBookings(list) };
  }, [data, user]);
}

/** All bookings of the operated walker profile, enriched and grouped */
export function useWalkerBookings() {
  const data = useData();
  const walker = useActingWalker();
  return useMemo(() => {
    const list = walker ? data.bookings.filter((b) => b.walkerId === walker.id).map((b) => enrichBooking(data, b)) : [];
    return { all: list, ...groupWalkerBookings(list) };
  }, [data, walker]);
}
