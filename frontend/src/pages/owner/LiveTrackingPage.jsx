import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronUp, ChevronDown, MessageCircle, Phone, Share2, LifeBuoy, Clock, Route, Flag, KeyRound, Info, MapPinOff } from 'lucide-react';
import { useLiveWalk } from '../../features/tracking/useLiveWalk';
import LiveMap from '../../features/tracking/LiveMap';
import DemoControls from '../../features/tracking/DemoControls';
import HelpSheet from '../../features/tracking/HelpSheet';
import ShareSheet from '../../features/tracking/ShareSheet';
import WalkSummary from '../../features/tracking/WalkSummary';
import BookingTimeline from '../../features/bookings/BookingTimeline';
import { SafetyAlert } from '../../components/cards/PetSafetyCard';
import { Avatar } from '../../components/common/SmartImage';
import Badge, { StatusBadge, Rating } from '../../components/common/Badge';
import Button, { IconButton } from '../../components/common/Button';
import { useActions } from '../../context/AppStore';
import { useCurrentUser } from '../../hooks/useAccount';
import { useToast } from '../../components/feedback/Toast';
import { BOOKING_STATUS as S, STATUS_META, isClosed, isFinished } from '../../features/bookings/bookingStateMachine';
import { formatClock, formatKm, firstName } from '../../utils/format';
import { formatDateLong } from '../../utils/dates';

/** Tutor's immersive live tracking (simulated positions — never real GPS). */
export default function LiveTrackingPage() {
  const { bookingId } = useParams();
  const live = useLiveWalk(bookingId);
  const user = useCurrentUser();
  const { booking } = live;

  if (!booking || booking.ownerId !== user?.id) {
    return <InfoScreen icon={MapPinOff} title="Passeio não encontrado" text="Este acompanhamento não existe ou não pertence à sua conta." back="/tutor/passeios" />;
  }
  if (booking.status === S.REQUESTED || booking.status === S.ACCEPTED || isClosed(booking.status)) {
    const text = isClosed(booking.status)
      ? `${STATUS_META[booking.status].ownerHint}. Não há acompanhamento para este passeio.`
      : booking.status === S.REQUESTED
        ? `O acompanhamento ao vivo fica disponível depois que ${firstName(booking.walker?.name)} aceitar e o pagamento for confirmado.`
        : 'Confirme o pagamento para garantir o horário. O acompanhamento começa quando o dog walker sair para buscar seu pet.';
    return <InfoScreen icon={Info} title={STATUS_META[booking.status].label} text={text} back={`/tutor/passeios/${booking.id}`} backLabel="Ver detalhes do passeio" status={booking.status} />;
  }
  return <Tracking live={live} />;
}

function Tracking({ live }) {
  const { booking } = live;
  const navigate = useNavigate();
  const actions = useActions();
  const toast = useToast();
  const finished = isFinished(booking.status);
  const [expanded, setExpanded] = useState(finished);
  const [helpOpen, setHelpOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const dragStart = useRef(null);

  // Open the summary automatically when the walk finishes while watching
  useEffect(() => {
    if (finished) setExpanded(true);
  }, [finished]);

  const walkerFirst = firstName(booking.walker?.name);
  const showCode = booking.status === S.PAID || booking.status === S.ON_THE_WAY;

  const openChat = () => {
    const conversation = actions.openConversation(booking.walkerId);
    navigate(`/tutor/mensagens/${conversation.id}`);
  };
  const call = (e) => {
    e.preventDefault();
    toast.info('Ligação simulada', `No app real, a chamada para ${walkerFirst} usa um número protegido.`);
  };

  // Subline + progress for the collapsed sheet
  let subline = '';
  let progress = 0;
  if (live.phase === 'waiting') {
    subline = `Hoje às ${booking.time} · ${booking.duration} min`;
  } else if (live.phase === 'approach') {
    subline = `Chega em cerca de ${live.approachEta} min`;
    progress = live.approachProgress;
  } else if (live.phase === 'pickup') {
    subline = 'Retirada confirmada · o passeio vai começar';
  } else if (live.phase === 'walking' || live.phase === 'returning') {
    subline = `${formatClock(live.elapsedMin)} de ${booking.duration} min · volta prevista às ${live.eta}`;
    progress = live.walkProgress;
  } else if (finished) {
    subline = 'Veja o resumo e avalie o passeio';
    progress = 1;
  }

  const onHandlePointerDown = (e) => {
    dragStart.current = e.clientY;
  };
  const onHandlePointerUp = (e) => {
    if (dragStart.current == null) return;
    const delta = e.clientY - dragStart.current;
    dragStart.current = null;
    if (delta < -30) setExpanded(true);
    else if (delta > 30) setExpanded(false);
  };

  const actionsRow = [
    { icon: MessageCircle, label: 'Mensagem', onClick: openChat },
    { icon: Phone, label: 'Ligar', href: 'tel:+5511900000000', onClick: call },
    { icon: Share2, label: 'Compartilhar', onClick: () => setShareOpen(true) },
    { icon: LifeBuoy, label: 'Preciso de ajuda', onClick: () => setHelpOpen(true), danger: true },
  ];

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-cream-100 lg:flex">
      {/* Map */}
      <div className="absolute inset-0 lg:relative lg:order-2 lg:flex-1">
        <LiveMap live={live} recenterClassName="right-4 top-[calc(env(safe-area-inset-top)+76px)] lg:top-20" />
        {/* Floating top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[600] flex items-center gap-2 px-3 pt-[max(12px,env(safe-area-inset-top))] lg:px-5 lg:pt-5">
          <IconButton icon={ChevronLeft} label="Voltar ao passeio" variant="surface" size={44} className="pointer-events-auto lg:hidden" onClick={() => navigate(`/tutor/passeios/${booking.id}`)} />
          <div className="pointer-events-auto flex min-w-0 items-center gap-2 rounded-full bg-white/95 py-1.5 pl-2 pr-3 shadow-card backdrop-blur">
            <StatusBadge status={booking.status} size="xs" />
          </div>
          <Badge tone="white" size="xs" className="pointer-events-auto ml-auto">
            Simulação · não é GPS real
          </Badge>
        </div>
      </div>

      {/* Bottom sheet (mobile) / side panel (desktop) */}
      <section
        aria-label="Detalhes do acompanhamento"
        className={`absolute inset-x-0 bottom-0 z-[700] flex flex-col rounded-t-3xl bg-white shadow-float transition-[max-height] duration-300 ease-out lg:relative lg:order-1 lg:h-full lg:max-h-none lg:w-[420px] lg:shrink-0 lg:rounded-none lg:border-r lg:border-sand-200 lg:shadow-none ${
          expanded ? 'max-h-[86dvh]' : 'max-h-[300px]'
        }`}
      >
        <div className="hidden items-center gap-2 border-b border-sand-200 px-5 py-4 lg:flex">
          <IconButton icon={ChevronLeft} label="Voltar ao passeio" onClick={() => navigate(`/tutor/passeios/${booking.id}`)} />
          <p className="font-semibold">Acompanhar passeio</p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          onPointerDown={onHandlePointerDown}
          onPointerUp={onHandlePointerUp}
          aria-expanded={expanded}
          aria-label={expanded ? 'Recolher detalhes' : 'Expandir detalhes'}
          className="flex w-full shrink-0 touch-none flex-col items-center pt-2.5 pb-1 lg:hidden"
        >
          <span className="h-1.5 w-10 rounded-full bg-sand-200" aria-hidden="true" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(20px,env(safe-area-inset-bottom))] lg:pt-5">
          {/* Headline */}
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold leading-tight text-ink-900">{live.headline}</h1>
              <p className="mt-0.5 text-sm text-ink-600">{subline}</p>
            </div>
            <button type="button" onClick={() => setExpanded((v) => !v)} className="rounded-full p-2 text-ink-600 hover:bg-cream-100 lg:hidden" aria-label={expanded ? 'Recolher' : 'Expandir'}>
              {expanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>
          {progress > 0 ? (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Progresso">
              <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${Math.max(3, progress * 100)}%` }} />
            </div>
          ) : null}

          {finished ? (
            <div className={`mt-5 ${expanded ? '' : 'max-lg:hidden'}`}>
              <WalkSummary live={live} />
            </div>
          ) : (
            <>
              {/* Walker row + quick actions — always visible */}
              <div className="mt-4 flex items-center gap-3">
                <Avatar src={booking.walker?.avatar} name={booking.walker?.name} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{booking.walker?.name}</p>
                  <Rating value={booking.walker?.rating} count={booking.walker?.reviewsCount} />
                </div>
                <IconButton icon={MessageCircle} label={`Mensagem para ${walkerFirst}`} variant="outline" size={44} onClick={openChat} />
                <IconButton icon={LifeBuoy} label="Preciso de ajuda" variant="outline" size={44} className="text-danger-600" onClick={() => setHelpOpen(true)} />
              </div>

              <div className={`${expanded ? '' : 'max-lg:hidden'} mt-5 space-y-5`}>
                {showCode ? (
                  <div className="flex items-center gap-4 rounded-2xl bg-ink-900 p-4 text-white">
                    <KeyRound size={26} className="shrink-0 text-gold-400" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-white/75">Informe este código ao dog walker na retirada</p>
                      <p className="mt-0.5 font-mono text-3xl font-bold tracking-[0.35em]" aria-label={`Código ${booking.pickupCode.split('').join(' ')}`}>
                        {booking.pickupCode}
                      </p>
                    </div>
                  </div>
                ) : null}

                <SafetyAlert pet={booking.pet} />

                {(live.phase === 'walking' || live.phase === 'returning' || live.phase === 'pickup') && (
                  <dl className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Clock, label: 'Tempo', value: formatClock(live.elapsedMin) },
                      { icon: Route, label: 'Distância', value: formatKm(live.distanceKm) },
                      { icon: Flag, label: 'Retorno', value: live.eta },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl bg-cream-100 p-3">
                        <dt className="flex items-center gap-1 text-[12px] text-ink-600">
                          <s.icon size={13} aria-hidden="true" /> {s.label}
                        </dt>
                        <dd className="mt-0.5 text-base font-bold tabular-nums">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {actionsRow.map((a) => {
                    const Tag = a.href ? 'a' : 'button';
                    return (
                      <Tag
                        key={a.label}
                        href={a.href}
                        type={a.href ? undefined : 'button'}
                        onClick={a.onClick}
                        className="flex flex-col items-center gap-1.5 rounded-2xl border border-sand-200 px-1 py-3 text-center text-[12px] font-semibold leading-tight hover:bg-cream-50"
                      >
                        <a.icon size={20} className={a.danger ? 'text-danger-600' : 'text-ink-900'} aria-hidden="true" />
                        {a.label}
                      </Tag>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-sand-200 p-3">
                  <Avatar src={booking.pet?.photo} name={booking.pet?.name} size={40} />
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold">{booking.pet?.name}</p>
                    <p className="truncate text-ink-600">{formatDateLong(booking.date)} · {booking.time} · {booking.duration} min</p>
                  </div>
                  <Link to={`/tutor/passeios/${booking.id}`} className="ml-auto shrink-0 text-sm font-semibold text-accent-ink hover:underline">
                    Detalhes
                  </Link>
                </div>

                <div>
                  <h2 className="mb-3 text-sm font-bold">Etapas</h2>
                  <BookingTimeline booking={booking} compact />
                </div>

                <DemoControls booking={booking} />
                <p className="text-[12px] leading-snug text-ink-400">
                  Localização simulada para demonstração. Em produção, a posição viria do celular do dog walker com consentimento e retenção limitada (LGPD).
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} booking={booking} audience="owner" />
      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} booking={booking} />
    </div>
  );
}

function InfoScreen({ icon: Icon, title, text, back, backLabel = 'Voltar aos passeios', status }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-50 px-6 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
        <Icon size={26} aria-hidden="true" />
      </span>
      {status ? <StatusBadge status={status} className="mb-3" /> : null}
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 max-w-sm text-[15px] text-ink-600">{text}</p>
      <Button to={back} className="mt-6">
        {backLabel}
      </Button>
    </div>
  );
}
