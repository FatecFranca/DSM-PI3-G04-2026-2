import { useEffect, useRef } from 'react';
import { useActions, useData } from '../../context/AppStore';
import { BOOKING_STATUS as S } from '../bookings/bookingStateMachine';
import { advanceTracking } from '../../services/trackingService';

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
  const { commit, transitionBooking } = useActions();
  const autoReturnPendentes = useRef(new Set());
  const hasMoving = data.bookings.some((b) => MOVING.includes(b.status));

  useEffect(() => {
    if (!hasMoving) return undefined;
    const id = setInterval(() => {
      commit((state) => {
        let changed = false;
        const bookings = state.bookings.map((b) => {
          if (!MOVING.includes(b.status)) return b;
          const phase = b.status === S.ON_THE_WAY ? 'approach' : 'walk';
          if (phase === 'approach' && b.tracking.approachProgress >= 1) return b;
          if (phase === 'walk' && b.tracking.walkProgress >= 1) return b;
          const { tracking, crossedReturn } = advanceTracking(b, TICK_MS / 1000, phase);
          changed = true;
          if (crossedReturn && b.status === S.WALKING && !autoReturnPendentes.current.has(b.id)) {
            // Voltar para casa é um status real: valida e persiste no backend (Fase 4).
            autoReturnPendentes.current.add(b.id);
            transitionBooking(b.id, S.RETURNING, 'system').catch(() => autoReturnPendentes.current.delete(b.id));
          }
          return { ...b, tracking };
        });
        if (!changed) return state;
        return { ...state, bookings: bookings.map(({ _autoReturn, ...b }) => b) };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [hasMoving, commit, transitionBooking]);

  return null;
}
