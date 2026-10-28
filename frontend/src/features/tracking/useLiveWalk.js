import { useMemo } from 'react';
import { useBooking } from '../../hooks/useBookings';
import { BOOKING_STATUS as S, isLive, isFinished, isClosed } from '../bookings/bookingStateMachine';
import { buildWalkRoute, buildApproachRoute, pointAlong, remainingMinutes, estimatedReturn, routeLengthKm } from '../../services/trackingService';
import { firstName } from '../../utils/format';

const FALLBACK_HOME = { lat: -23.5925, lng: -46.6365 };

/**
 * Everything a live-tracking screen needs, derived from a booking id.
 * Positions are simulated (interpolated along predefined routes).
 */
export function useLiveWalk(bookingId) {
  const booking = useBooking(bookingId);

  const routes = useMemo(() => {
    if (!booking) return null;
    const home = booking.owner?.address?.coords || FALLBACK_HOME;
    const base = booking.walker?.coords || home;
    return {
      home,
      base,
      walk: buildWalkRoute(home, booking.duration),
      approach: buildApproachRoute(base, home),
    };
    // Routes only depend on the participants and duration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id, booking?.duration, booking?.owner?.address?.coords?.lat, booking?.walker?.coords?.lat]);

  return useMemo(() => {
    if (!booking || !routes) return { booking: null };
    const { status, tracking } = booking;
    const homePoint = [routes.home.lat, routes.home.lng];
    const basePoint = [routes.base.lat, routes.base.lng];

    let point = basePoint;
    let traveled = [];
    let planned = routes.walk;
    let phase = 'idle';

    if (status === S.PAID || status === S.ACCEPTED || status === S.REQUESTED) {
      point = basePoint;
      planned = routes.approach;
      phase = 'waiting';
    } else if (status === S.ON_THE_WAY) {
      const at = pointAlong(routes.approach, tracking.approachProgress);
      point = at.point;
      traveled = at.traveled;
      planned = routes.approach;
      phase = 'approach';
    } else if (status === S.PICKED_UP) {
      point = homePoint;
      phase = 'pickup';
    } else if (status === S.WALKING || status === S.RETURNING) {
      const at = pointAlong(routes.walk, tracking.walkProgress);
      point = at.point;
      traveled = at.traveled;
      phase = status === S.WALKING ? 'walking' : 'returning';
    } else if (isFinished(status)) {
      point = homePoint;
      traveled = routes.walk;
      phase = 'done';
    } else if (isClosed(status)) {
      phase = 'closed';
    }

    const walkerName = firstName(booking.walker?.name) || 'O dog walker';
    const petName = booking.pet?.name || 'seu pet';
    const headlines = {
      waiting: status === S.PAID ? `Passeio confirmado com ${walkerName}` : 'Aguardando confirmação',
      approach: `${walkerName} está a caminho`,
      pickup: `${walkerName} retirou ${petName}`,
      walking: `Em passeio com ${petName}`,
      returning: `${walkerName} está voltando com ${petName}`,
      done: 'Passeio finalizado',
      closed: 'Passeio encerrado',
      idle: '',
    };

    const approachEta = Math.max(1, Math.round(12 * (1 - (tracking.approachProgress || 0))));

    return {
      booking,
      routes,
      point,
      traveled,
      planned,
      phase,
      headline: headlines[phase],
      isLive: isLive(status),
      isMoving: [S.ON_THE_WAY, S.WALKING, S.RETURNING].includes(status),
      walkProgress: tracking.walkProgress || 0,
      approachProgress: tracking.approachProgress || 0,
      approachEta,
      elapsedMin: tracking.elapsedMin || 0,
      distanceKm: tracking.distanceKm || 0,
      totalKm: routeLengthKm(booking.duration),
      remainingMin: remainingMinutes(booking),
      eta: estimatedReturn(booking),
    };
  }, [booking, routes]);
}
