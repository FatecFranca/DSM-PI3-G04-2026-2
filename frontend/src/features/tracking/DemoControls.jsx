import { FlaskConical, SkipForward, FastForward } from 'lucide-react';
import { useActions } from '../../context/AppStore';
import { useToast } from '../../components/feedback/Toast';
import { BOOKING_STATUS as S, walkerNextAction, ownerNextAction, STATUS_META } from '../bookings/bookingStateMachine';
import { routeLengthKm, RETURN_THRESHOLD } from '../../services/trackingService';

/**
 * Presentation helper: advances the booking one step at a time, always through
 * the central state machine (invalid moves are rejected with a toast).
 * Steps that belong to the tutor (payment, review) are not automated here.
 */
export default function DemoControls({ booking, className = '', tone = 'light' }) {
  const actions = useActions();
  const toast = useToast();
  if (!booking) return null;

  const walkerStep = walkerNextAction(booking.status);
  const ownerStep = ownerNextAction(booking.status);
  const canAccelerate = [S.ON_THE_WAY, S.WALKING, S.RETURNING].includes(booking.status);

  const advance = () => {
    if (!walkerStep) return;
    try {
      if (walkerStep.requiresCode) actions.confirmPickup(booking.id, booking.pickupCode);
      else if (walkerStep.to === S.ACCEPTED) actions.acceptBooking(booking.id);
      else actions.transitionBooking(booking.id, walkerStep.to, 'walker');
      toast.info(`Simulação: ${STATUS_META[walkerStep.to].label}`);
    } catch (error) {
      toast.error('Etapa não permitida', error.message);
    }
  };

  /** Jumps the simulated clock forward ~10 minutes */
  const accelerate = () => {
    const t = booking.tracking;
    if (booking.status === S.ON_THE_WAY) {
      actions.updateTracking(booking.id, { ...t, approachProgress: Math.min(1, t.approachProgress + 0.5) });
      return;
    }
    // Stay just below the return point while "walking" so the engine performs the automatic switch
    const cap = booking.status === S.WALKING ? RETURN_THRESHOLD - 0.01 : 1;
    const walkProgress = Math.min(cap, Math.max(t.walkProgress, t.walkProgress + 10 / booking.duration));
    actions.updateTracking(booking.id, {
      ...t,
      walkProgress,
      elapsedMin: Math.round(booking.duration * walkProgress * 10) / 10,
      distanceKm: Math.round(routeLengthKm(booking.duration) * walkProgress * 100) / 100,
    });
  };

  const dark = tone === 'dark';
  return (
    <section
      aria-label="Controles de simulação"
      className={`rounded-2xl border border-dashed p-3 ${dark ? 'border-white/25 bg-white/5 text-white' : 'border-sand-300 bg-cream-50 text-ink-900'} ${className}`}
    >
      <div className="flex items-center gap-2">
        <FlaskConical size={16} className={dark ? 'text-gold-400' : 'text-gold-700'} aria-hidden="true" />
        <p className="text-[13px] font-bold uppercase tracking-wide">Simulação</p>
        <p className={`ml-auto text-[12px] ${dark ? 'text-white/70' : 'text-ink-600'}`}>1 s = 1 min de passeio</p>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {walkerStep ? (
          <button
            type="button"
            onClick={advance}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink-900 px-3 text-[13px] font-semibold text-white hover:bg-black"
          >
            <SkipForward size={15} aria-hidden="true" /> Dog walker: {walkerStep.label}
          </button>
        ) : null}
        {canAccelerate ? (
          <button
            type="button"
            onClick={accelerate}
            className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold ${dark ? 'border-white/30 hover:bg-white/10' : 'border-sand-200 bg-white hover:border-ink-900/40'}`}
          >
            <FastForward size={15} aria-hidden="true" /> Acelerar 10 min
          </button>
        ) : null}
      </div>
      {!walkerStep && ownerStep ? (
        <p className={`mt-2 text-[13px] ${dark ? 'text-white/80' : 'text-ink-600'}`}>Próxima etapa é do tutor: {ownerStep.label.toLowerCase()}.</p>
      ) : null}
      {!walkerStep && !ownerStep ? <p className={`mt-2 text-[13px] ${dark ? 'text-white/80' : 'text-ink-600'}`}>Nenhuma etapa pendente para simular.</p> : null}
    </section>
  );
}
