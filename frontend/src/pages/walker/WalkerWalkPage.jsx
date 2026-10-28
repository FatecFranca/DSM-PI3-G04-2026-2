import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MessageCircle, Phone, LifeBuoy, Clock, Route, Hourglass, Smartphone, Pill, MapPin, Navigation, KeyRound, Footprints, Undo2, Flag, CheckCircle2, MapPinOff, ArrowLeftRight } from 'lucide-react';
import { useLiveWalk } from '../../features/tracking/useLiveWalk';
import LiveMap from '../../features/tracking/LiveMap';
import HelpSheet from '../../features/tracking/HelpSheet';
import WalkSummary from '../../features/tracking/WalkSummary';
import DemoControls from '../../features/tracking/DemoControls';
import { SafetyAlert } from '../../components/cards/PetSafetyCard';
import { Avatar } from '../../components/common/SmartImage';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Button, { IconButton } from '../../components/common/Button';
import Modal, { ConfirmDialog } from '../../components/common/Modal';
import { useActions } from '../../context/AppStore';
import { useActingWalker } from '../../hooks/useAccount';
import { useToast } from '../../components/feedback/Toast';
import { useAccountSwitch } from '../../features/auth/useAccountSwitch';
import { useBookingActions } from '../../features/bookings/useBookingActions';
import { BOOKING_STATUS as S, STATUS_META, walkerNextAction, isFinished, isClosed } from '../../features/bookings/bookingStateMachine';
import { DOG_SIZE_LABEL, TEMPERAMENT_LABEL } from '../../utils/constants';
import { formatClock, formatKm, firstName } from '../../utils/format';
import { formatRelativeDay } from '../../utils/dates';

const ACTION_ICONS = { [S.ON_THE_WAY]: Navigation, [S.PICKED_UP]: KeyRound, [S.WALKING]: Footprints, [S.RETURNING]: Undo2, [S.COMPLETED]: Flag };

/** Operational walk screen for the dog walker (gold mode). */
export default function WalkerWalkPage() {
  const { bookingId } = useParams();
  const live = useLiveWalk(bookingId);
  const walker = useActingWalker();
  const { switchToWalker } = useAccountSwitch();
  const { booking } = live;

  if (!booking) {
    return <InfoScreen icon={MapPinOff} title="Passeio não encontrado" text="Confira sua agenda de hoje." />;
  }
  if (booking.walkerId !== walker?.id) {
    return (
      <InfoScreen icon={ArrowLeftRight} title="Este passeio é de outro dog walker" text={`Este passeio pertence a ${booking.walker?.name}. Só o próprio dog walker opera o passeio.`}>
        <Button variant="gold" className="mt-3" onClick={() => switchToWalker(booking.walkerId, `/dog-walker/passeio/${booking.id}`)}>
          Demonstração: entrar como {firstName(booking.walker?.name)}
        </Button>
      </InfoScreen>
    );
  }
  if (booking.status === S.REQUESTED || booking.status === S.ACCEPTED || isClosed(booking.status)) {
    const text = isClosed(booking.status)
      ? `${STATUS_META[booking.status].walkerHint}. Não há passeio para executar.`
      : booking.status === S.REQUESTED
        ? 'Aceite a solicitação para que o tutor possa pagar e confirmar.'
        : 'Aguardando o pagamento do tutor. Assim que for confirmado, você pode sair para buscar o pet.';
    return <InfoScreen icon={Hourglass} title={STATUS_META[booking.status].label} text={text} status={booking.status} />;
  }
  return <WalkConsole live={live} />;
}

function WalkConsole({ live }) {
  const { booking } = live;
  const navigate = useNavigate();
  const actions = useActions();
  const toast = useToast();
  const bookingActions = useBookingActions();
  const [codeOpen, setCodeOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const { pet, owner } = booking;
  const finished = isFinished(booking.status);
  const next = walkerNextAction(booking.status);
  const NextIcon = next ? ACTION_ICONS[next.to] || Navigation : null;

  const runNext = () => {
    if (!next) return;
    if (next.requiresCode) return setCodeOpen(true);
    if (next.to === S.COMPLETED) return setFinishOpen(true);
    const titles = { [S.ON_THE_WAY]: 'Tutor avisado: você está a caminho', [S.WALKING]: 'Passeio iniciado', [S.RETURNING]: 'Voltando para casa' };
    bookingActions.advance(booking.id, next.to, 'walker', titles[next.to]);
  };

  const openChat = () => {
    const conversation = actions.openConversation(booking.walkerId, booking.ownerId);
    navigate(`/dog-walker/mensagens/${conversation.id}`);
  };

  const helperText = {
    [S.PAID]: `Saia com antecedência: retirada às ${booking.time} em ${booking.address}.`,
    [S.ON_THE_WAY]: `Ao chegar, peça a ${firstName(owner?.name)} o código de 4 dígitos exibido no app.`,
    [S.PICKED_UP]: 'Confira peitoral, guia e focinheira antes de sair.',
    [S.WALKING]: 'O botão "Voltar para casa" fica disponível a qualquer momento.',
    [S.RETURNING]: `Finalize somente depois de entregar ${pet?.name} em segurança.`,
  }[booking.status];

  return (
    <div className="flex min-h-dvh flex-col bg-cream-50">
      {/* Map ~45% */}
      <div className="relative h-[45dvh] min-h-[260px] shrink-0">
        <LiveMap live={live} recenterClassName="right-3 bottom-3" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[600] flex items-center gap-2 px-3 pt-[max(12px,env(safe-area-inset-top))]">
          <IconButton icon={ChevronLeft} label="Voltar para Hoje" variant="surface" size={44} className="pointer-events-auto" onClick={() => navigate('/dog-walker/hoje')} />
          <div className="pointer-events-auto rounded-full bg-white/95 px-2 py-1.5 shadow-card">
            <StatusBadge status={booking.status} size="xs" />
          </div>
          <Badge tone="white" size="xs" className="pointer-events-auto ml-auto">
            Simulação
          </Badge>
        </div>
      </div>

      <main className="-mt-5 flex-1 rounded-t-3xl bg-cream-50 px-4 pt-4 pb-[max(24px,env(safe-area-inset-bottom))] shadow-bar relative z-[700] sm:px-6">
        <div className="mx-auto max-w-xl space-y-4">
          {/* Safety alert pinned at the top */}
          <SafetyAlert pet={pet} size="lg" />

          {!finished ? (
            <p className="flex items-start gap-2.5 rounded-2xl bg-gold-50 p-3 text-[13px] leading-snug text-ink-900 ring-1 ring-gold-100">
              <Smartphone size={18} className="mt-px shrink-0 text-gold-800" aria-hidden="true" />
              Mantenha esta tela aberta durante o passeio para permitir o acompanhamento da localização.
            </p>
          ) : null}

          {finished ? (
            <div className="rounded-3xl border border-sand-200 bg-white p-4">
              <WalkSummary live={live} perspective="walker" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <dl className="grid grid-cols-3 gap-2">
                {[
                  { icon: Clock, label: 'Tempo', value: formatClock(live.elapsedMin) },
                  { icon: Route, label: 'Distância', value: formatKm(live.distanceKm) },
                  {
                    icon: Hourglass,
                    label: booking.status === S.ON_THE_WAY ? 'Chegada' : 'Restante',
                    value: booking.status === S.ON_THE_WAY ? `${live.approachEta} min` : `${live.remainingMin} min`,
                  },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-sand-200 bg-white p-3">
                    <dt className="flex items-center gap-1 text-[12px] text-ink-600">
                      <s.icon size={13} aria-hidden="true" /> {s.label}
                    </dt>
                    <dd className="mt-0.5 text-lg font-bold tabular-nums">{s.value}</dd>
                  </div>
                ))}
              </dl>

              {/* Primary action */}
              <div>
                {next ? (
                  <Button variant="gold" size="xl" fullWidth icon={NextIcon} onClick={runNext}>
                    {next.label}
                  </Button>
                ) : null}
                {helperText ? <p className="mt-2 text-center text-[13px] text-ink-600">{helperText}</p> : null}
                <StepRail status={booking.status} />
              </div>
            </>
          )}

          {/* Pet quick facts */}
          <section className="rounded-3xl border border-sand-200 bg-white p-4" aria-label={`Sobre ${pet?.name}`}>
            <div className="flex items-center gap-3">
              <Avatar src={pet?.photo} name={pet?.name} size={52} />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">{pet?.name}</p>
                <p className="truncate text-sm text-ink-600">
                  {pet?.breed} · {DOG_SIZE_LABEL[pet?.size]} · {TEMPERAMENT_LABEL[pet?.temperament] ?? ''}
                </p>
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {pet?.triggers ? <Fact label="Gatilhos">{pet.triggers}</Fact> : null}
              {pet?.equipment?.harness ? <Fact label="Equipamento">{[pet.equipment.harness, pet.equipment.muzzle === 'sempre' ? 'focinheira o tempo todo' : pet.equipment.muzzle === 'perto_de_caes' ? 'focinheira perto de cães' : null].filter(Boolean).join(' · ')}</Fact> : null}
              {pet?.health?.effortRestrictions ? <Fact label="Esforço">{pet.health.effortRestrictions}</Fact> : null}
              {pet?.behaviorNotes ? <Fact label="Atenção">{pet.behaviorNotes}</Fact> : null}
            </ul>
            {pet?.health?.medication ? (
              <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-info-50 p-3 text-sm">
                <Pill size={18} className="mt-px shrink-0 text-info-600" aria-hidden="true" />
                <p>
                  <strong>Medicação:</strong> {pet.health.medication} — {pet.health.dosage} às {pet.health.medicationTimes}
                </p>
              </div>
            ) : null}
            <p className="mt-3 flex items-start gap-2 text-[13px] text-ink-600">
              <MapPin size={15} className="mt-px shrink-0" aria-hidden="true" /> {booking.address} · {formatRelativeDay(booking.date)} às {booking.time}
            </p>
          </section>

          {/* Contact */}
          <div className="grid grid-cols-3 gap-2">
            <ContactButton icon={MessageCircle} label="Mensagem" onClick={openChat} />
            <ContactButton
              icon={Phone}
              label="Ligar para tutor"
              onClick={() => toast.info('Ligação simulada', `No app real, a chamada para ${firstName(owner?.name)} usa um número protegido.`)}
            />
            <ContactButton icon={LifeBuoy} label="Preciso de ajuda" danger onClick={() => setHelpOpen(true)} />
          </div>

          {!finished ? <DemoControls booking={booking} /> : null}
        </div>
      </main>

      <PickupCodeDialog open={codeOpen} onClose={() => setCodeOpen(false)} booking={booking} onConfirm={(code) => bookingActions.confirmPickup(booking.id, code)} />
      <ConfirmDialog
        open={finishOpen}
        onClose={() => setFinishOpen(false)}
        onConfirm={() => {
          setFinishOpen(false);
          bookingActions.advance(booking.id, S.COMPLETED, 'walker', 'Passeio finalizado');
        }}
        title="Finalizar passeio?"
        description={`Confirme que ${pet?.name} foi entregue em segurança. O tutor será avisado para avaliar.`}
        confirmLabel="Finalizar passeio"
      />
      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} booking={booking} audience="walker" />
    </div>
  );
}

const RAIL = [S.ON_THE_WAY, S.PICKED_UP, S.WALKING, S.RETURNING, S.COMPLETED];
const RAIL_LABEL = { [S.ON_THE_WAY]: 'A caminho', [S.PICKED_UP]: 'Retirada', [S.WALKING]: 'Passeio', [S.RETURNING]: 'Volta', [S.COMPLETED]: 'Fim' };

/** Compact horizontal progress of the operational steps */
function StepRail({ status }) {
  const current = RAIL.indexOf(status);
  return (
    <ol className="mt-4 grid grid-cols-5 gap-1" aria-label="Etapas do passeio">
      {RAIL.map((s, i) => (
        <li key={s} className="text-center">
          <span className={`block h-1.5 rounded-full ${i <= current ? 'bg-gold-500' : 'bg-sand-200'}`} aria-hidden="true" />
          <span className={`mt-1 block text-[11px] ${i === current ? 'font-bold text-ink-900' : 'text-ink-600'}`}>
            {RAIL_LABEL[s]}
            {i === current ? <span className="sr-only"> (etapa atual)</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Fact({ label, children }) {
  return (
    <li className="flex gap-2">
      <span className="w-24 shrink-0 text-ink-600">{label}</span>
      <span className="min-w-0 text-ink-900">{children}</span>
    </li>
  );
}

function ContactButton({ icon: Icon, label, onClick, danger }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-sand-200 bg-white px-1 text-center text-[12px] font-semibold leading-tight hover:bg-cream-100">
      <Icon size={20} className={danger ? 'text-danger-600' : 'text-ink-900'} aria-hidden="true" />
      {label}
    </button>
  );
}

function PickupCodeDialog({ open, onClose, booking, onConfirm }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const close = () => {
    setCode('');
    setError('');
    onClose();
  };
  const submit = (e) => {
    e.preventDefault();
    if (code.length !== 4) {
      setError('Digite os 4 números do código.');
      return;
    }
    try {
      onConfirm(code);
      close();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Confirmar retirada" description={`Peça a ${firstName(booking.owner?.name)} o código exibido no app do tutor.`} size="sm">
      <form onSubmit={submit} noValidate className="space-y-4">
        <label htmlFor="pickup-code" className="sr-only">
          Código de retirada
        </label>
        <input
          id="pickup-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, '').slice(0, 4));
            setError('');
          }}
          placeholder="••••"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'pickup-code-error' : undefined}
          className={`h-16 w-full rounded-2xl border-2 bg-white text-center font-mono text-3xl font-bold tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-gold-500/30 ${error ? 'border-danger-600' : 'border-sand-200 focus:border-gold-700'}`}
        />
        {error ? (
          <p id="pickup-code-error" className="text-[13px] font-medium text-danger-600">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="gold" size="lg" fullWidth icon={CheckCircle2}>
          Confirmar retirada
        </Button>
        <button
          type="button"
          onClick={() => {
            setCode(booking.pickupCode);
            setError('');
          }}
          className="w-full text-center text-[13px] font-semibold text-gold-800 underline-offset-4 hover:underline"
        >
          Demonstração: preencher código
        </button>
      </form>
    </Modal>
  );
}

function InfoScreen({ icon: Icon, title, text, status, children }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-50 px-6 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-800">
        <Icon size={26} aria-hidden="true" />
      </span>
      {status ? <StatusBadge status={status} className="mb-3" /> : null}
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 max-w-sm text-[15px] text-ink-600">{text}</p>
      {children}
      <Button to="/dog-walker/hoje" variant="secondary" className="mt-4">
        Voltar para Hoje
      </Button>
    </div>
  );
}
