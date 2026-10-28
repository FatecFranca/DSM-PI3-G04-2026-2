import { useEffect } from 'react';
import { useActions, useData } from '../../context/AppStore';
import { BOOKING_STATUS as S } from '../bookings/bookingStateMachine';
import { advanceTracking } from '../../services/trackingService';
import { transitionBooking } from '../../services/bookingService';

const TICK_MS = 1000;
const MOVING = [S.ON_THE_WAY, S.WALKING, S.RETURNING];

/**
 * Global simulation loop (renders nothing). While any walk is moving it advances
 * the simulated position every second and applies automatic status changes
 * (walking → returning when the route turns back). Everything else is driven by
 * explicit walker/tutor actions. In production this would be replaced by
 * position updates pushed from the walker's device.
 */
export default function TrackingEngine() {
  const data = useData();
  const { commit } = useActions();
  const hasMoving = data.bookings.some((b) => MOVING.includes(b.status));

  useEffect(() => {
    if (!hasMoving) return undefined;
    const id = setInterval(() => {
      commit((state) => {
        let next = state;
        let changed = false;
        const bookings = state.bookings.map((b) => {
          if (!MOVING.includes(b.status)) return b;
          const phase = b.status === S.ON_THE_WAY ? 'approach' : 'walk';
          if (phase === 'approach' && b.tracking.approachProgress >= 1) return b;
          if (phase === 'walk' && b.tracking.walkProgress >= 1) return b;
          const { tracking, crossedReturn } = advanceTracking(b, TICK_MS / 1000, phase);
          changed = true;
          if (crossedReturn && b.status === S.WALKING) b = { ...b, _autoReturn: true };
          return { ...b, tracking };
        });
        if (!changed) return state;
        next = { ...state, bookings: bookings.map(({ _autoReturn, ...b }) => b) };
        for (const b of bookings) {
          if (b._autoReturn) next = transitionBooking(next, { bookingId: b.id, to: S.RETURNING, actor: 'system' }).state;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [hasMoving, commit]);

  return null;
}
