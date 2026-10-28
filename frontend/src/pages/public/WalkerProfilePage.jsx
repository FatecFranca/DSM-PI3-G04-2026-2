import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share2, Grid3x3, MapPin, ShieldCheck, Clock3, Award, Check, X, MessageCircle, Dog, Zap, CircleDot, Pill, Baby, HeartHandshake, GraduationCap, UserSearch, Star, SearchX } from 'lucide-react';
import SmartImage, { Avatar } from '../../components/common/SmartImage';
import Badge, { Rating, Stars, VerifiedBadge } from '../../components/common/Badge';
import Button, { IconButton } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/feedback/EmptyState';
import { FavoriteButton } from '../../components/cards/WalkerCard';
import { useToast } from '../../components/feedback/Toast';
import BookingForm from '../../features/bookings/BookingForm';
import BookingRequestedDialog from '../../features/bookings/BookingRequestedDialog';
import { useActions, useData } from '../../context/AppStore';
import { useCurrentUser } from '../../hooks/useAccount';
import { getDaySlots } from '../../services/availabilityService';
import { referencePrice } from '../../services/pricing';
import { VERIFICATION_LABEL } from '../../features/walkers/walkerSelectors';
import { DOG_SIZES } from '../../utils/constants';
import { addDays, todayISO, parseISODate, WEEKDAYS_SHORT, formatDateLong, formatRelativeDay } from '../../utils/dates';
import { formatBRL, formatNumber, formatRating, firstName } from '../../utils/format';

export default function WalkerProfilePage() {
  const { walkerId } = useParams();
  const data = useData();
  const walker = data.walkers.find((w) => w.id === walkerId);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [requested, setRequested] = useState(null);
  const navigate = useNavigate();

  if (!walker) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={SearchX}
          title="Perfil não encontrado"
          description="Este dog walker pode ter saído da plataforma ou o link está incorreto."
          action={<Button to="/buscar">Buscar dog walkers</Button>}
        />
      </div>
    );
  }

  const ref = referencePrice(walker);
  const onRequested = (booking) => {
    setBookingOpen(false);
    setRequested(booking);
  };

  return (
    <div className="lg:pt-6">
      <Gallery walker={walker} onOpenAll={() => setGalleryOpen(true)} onBack={() => (window.history.length > 1 ? navigate(-1) : navigate('/buscar'))} />

      <div className="container-page mt-5 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
        <div className="min-w-0">
          <Header walker={walker} />
          <Section>
            <Highlights walker={walker} />
          </Section>
          <Section title={`Sobre ${firstName(walker.name)}`}>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-900">{walker.bio || 'Este profissional ainda não escreveu uma apresentação.'}</p>
          </Section>
          <Section title="Cães atendidos">
            <SizesAndSkills walker={walker} />
          </Section>
          {walker.courses.length ? (
            <Section title="Cursos e certificados">
              <ul className="space-y-3">
                {walker.courses.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-[15px]">
                    <GraduationCap size={20} className="mt-0.5 shrink-0 text-accent-ink" aria-hidden="true" /> {c}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[13px] text-ink-600">Certificados informados pelo profissional.</p>
            </Section>
          ) : null}
          <Section title="Bairros atendidos">
            <div className="flex flex-wrap gap-2">
              {walker.areas.map((a) => (
                <Badge key={a} size="md" icon={MapPin}>
                  {a}
                </Badge>
              ))}
            </div>
          </Section>
          <Section title="Disponibilidade nos próximos dias" subtitle="Horários de início dos passeios">
            <AvailabilityCalendar walker={walker} />
          </Section>
          <Section title="Verificação">
            <VerificationBlock walker={walker} />
          </Section>
          <Section title={walker.reviewsCount ? `${formatRating(walker.rating)} · ${formatNumber(walker.reviewsCount)} avaliações` : 'Avaliações'} icon={Star}>
            <Reviews walker={walker} />
          </Section>
          <ContactBlock walker={walker} />
        </div>

        {/* Desktop sticky booking card */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl border border-sand-200 bg-white p-6 shadow-float">
            <p className="mb-5 text-[15px]">
              <span className="text-2xl font-bold">{formatBRL(ref.price)}</span> <span className="text-ink-600">/ passeio de {ref.duration} min</span>
            </p>
            <BookingForm walker={walker} onRequested={onRequested} />
          </div>
        </aside>
      </div>

      {/* Mobile fixed booking bar (sits above the bottom navigation) */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+var(--safe-bottom))] z-[850] border-t border-sand-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="container-page flex items-center justify-between gap-3 py-3">
          <div>
            <p className="text-[15px]">
              <span className="font-bold">A partir de {formatBRL(ref.price)}</span>
            </p>
            <p className="text-[13px] text-ink-600">Passeio de {ref.duration} min · pague após o aceite</p>
          </div>
          <Button size="lg" onClick={() => setBookingOpen(true)}>
            Solicitar
          </Button>
        </div>
      </div>

      <Modal open={bookingOpen} onClose={() => setBookingOpen(false)} title={`Solicitar passeio com ${firstName(walker.name)}`} size="md">
        <BookingForm walker={walker} onRequested={onRequested} />
      </Modal>

      <Modal open={galleryOpen} onClose={() => setGalleryOpen(false)} title={`Fotos de ${walker.name}`} size="xl" variant="center">
        <div className="grid gap-3 sm:grid-cols-2">
          {walker.photos.map((src, i) => (
            <SmartImage key={src + i} src={src.replace(/w=\d+/, 'w=1400')} alt={`Foto ${i + 1} de ${walker.name}`} className={`w-full rounded-2xl ${i === 0 ? 'aspect-[16/10] sm:col-span-2' : 'aspect-square'}`} rounded="rounded-2xl" />
          ))}
        </div>
      </Modal>

      <BookingRequestedDialog booking={requested} onClose={() => setRequested(null)} />
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="border-t border-sand-200 py-8 first:border-t-0">
      {title ? (
        <div className="mb-4">
          <h2 className="text-[20px] font-bold tracking-tight">{title}</h2>
          {subtitle ? <p className="text-sm text-ink-600">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function Gallery({ walker, onOpenAll, onBack }) {
  const toast = useToast();
  const [index, setIndex] = useState(0);
  const photos = walker.photos.length ? walker.photos : [''];

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${walker.name} no Rolê de Pet`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado');
      }
    } catch {
      /* user canceled */
    }
  };

  return (
    <>
      {/* Mobile: swipeable */}
      <div className="relative lg:hidden">
        <div
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          aria-label="Galeria de fotos"
        >
          {photos.map((src, i) => (
            <SmartImage key={src + i} src={src} alt={`Foto ${i + 1} de ${walker.name}`} className="aspect-[4/3] w-full shrink-0 snap-center sm:aspect-[16/9]" />
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 flex justify-between p-3">
          <IconButton icon={ChevronLeft} label="Voltar" variant="surface" onClick={onBack} />
          <div className="flex gap-2">
            <IconButton icon={Share2} label="Compartilhar perfil" variant="surface" onClick={share} />
            <FavoriteButton walkerId={walker.id} variant="solid" className="border-0! shadow-card" />
          </div>
        </div>
        <span className="absolute bottom-3 right-3 rounded-lg bg-ink-900/70 px-2.5 py-1 text-[12px] font-semibold text-white">
          {index + 1} / {photos.length}
        </span>
      </div>

      {/* Desktop: grid */}
      <div className="container-page hidden lg:block">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/buscar" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline">
            <ChevronLeft size={18} aria-hidden="true" /> Voltar aos resultados
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={Share2} onClick={share}>
              Compartilhar
            </Button>
            <FavoriteButton walkerId={walker.id} variant="solid" />
          </div>
        </div>
        <div className={`relative grid h-[440px] gap-2 overflow-hidden rounded-3xl ${photos.length === 1 ? 'grid-cols-1' : photos.length === 2 ? 'grid-cols-2' : 'grid-cols-4 grid-rows-2'}`}>
          {photos.slice(0, 5).map((src, i) => (
            <button key={src + i} type="button" onClick={onOpenAll} className={`group overflow-hidden ${galleryTileClass(i, Math.min(photos.length, 5))}`} aria-label={`Ampliar foto ${i + 1}`}>
              <SmartImage src={src} alt={`Foto ${i + 1} de ${walker.name}`} className="h-full w-full transition duration-300 group-hover:brightness-90" />
            </button>
          ))}
          <button type="button" onClick={onOpenAll} className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-ink-900 bg-white px-4 py-2 text-sm font-semibold shadow hover:bg-cream-50">
            <Grid3x3 size={16} aria-hidden="true" /> Mostrar todas as fotos
          </button>
        </div>
      </div>
    </>
  );
}

/** Tile spans for the desktop gallery so 1–5 photos always fill the grid */
function galleryTileClass(index, count) {
  if (count <= 2) return '';
  if (index === 0) return 'col-span-2 row-span-2';
  if (count === 3) return 'col-span-2';
  if (count === 4 && index === 1) return 'col-span-2';
  return '';
}

function Header({ walker }) {
  return (
    <div className="pb-6">
      <div className="flex flex-wrap gap-2">
        <VerifiedBadge walker={walker} showPending />
        {walker.rating >= 4.9 && walker.reviewsCount >= 50 ? (
          <Badge tone="gold" icon={Award}>
            Destaque entre tutores
          </Badge>
        ) : null}
      </div>
      <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-tight md:text-[34px]">{walker.name}</h1>
      <p className="mt-1 text-[16px] text-ink-600">{walker.headline}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
        <Rating value={walker.rating} count={walker.reviewsCount} />
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <MapPin size={15} aria-hidden="true" /> {walker.neighborhood}, {walker.city}
        </span>
      </div>
      <dl className="mt-6 grid grid-cols-3 divide-x divide-sand-200 rounded-2xl border border-sand-200 bg-white py-4 text-center">
        <div>
          <dt className="text-[12px] text-ink-600">Passeios</dt>
          <dd className="text-lg font-bold">{formatNumber(walker.walksCount)}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-600">Experiência</dt>
          <dd className="text-lg font-bold">
            {walker.yearsExperience} {walker.yearsExperience === 1 ? 'ano' : 'anos'}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-600">Nota</dt>
          <dd className="text-lg font-bold">{walker.reviewsCount ? formatRating(walker.rating) : 'Novo'}</dd>
        </div>
      </dl>
      <div className="mt-6 flex items-center gap-3">
        <Avatar src={walker.avatar} name={walker.name} size={52} />
        <div>
          <p className="font-semibold">Passeios individuais com {firstName(walker.name)}</p>
          <p className="flex items-center gap-1 text-sm text-ink-600">
            <Clock3 size={14} aria-hidden="true" /> {walker.responseTime}
          </p>
        </div>
      </div>
    </div>
  );
}

function Highlights({ walker }) {
  const items = [
    walker.sizes.some((s) => s === 'grande' || s === 'gigante') && { icon: Dog, title: 'Aceita cães grandes', text: 'Experiência com portes grandes e gigantes.' },
    walker.reactiveExperience && { icon: Zap, title: 'Experiência com reativos', text: 'Rotas calmas e manejo à distância de gatilhos.' },
    walker.acceptsMuzzle && { icon: CircleDot, title: 'Aceita focinheira', text: 'Conduz cães que precisam de focinheira.' },
    walker.medicationExperience && { icon: Pill, title: 'Administra medicação', text: 'Segue horários e dosagens do perfil do pet.' },
    walker.puppies && { icon: Baby, title: 'Filhotes', text: 'Socialização respeitando o calendário de vacinas.' },
    walker.seniors && { icon: HeartHandshake, title: 'Cães idosos', text: 'Ritmo adaptado e pausas frequentes.' },
  ].filter(Boolean);
  if (!items.length) return <p className="text-ink-600">Atende cães de porte pequeno e médio.</p>;
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {items.map((it) => (
        <li key={it.title} className="flex gap-4">
          <it.icon size={26} className="mt-0.5 shrink-0 text-ink-900" aria-hidden="true" />
          <div>
            <p className="font-semibold">{it.title}</p>
            <p className="text-sm text-ink-600">{it.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SizesAndSkills({ walker }) {
  const skills = [
    ['Cães reativos', walker.reactiveExperience],
    ['Uso de focinheira', walker.acceptsMuzzle],
    ['Administração de medicação', walker.medicationExperience],
    ['Filhotes', walker.puppies],
    ['Cães idosos', walker.seniors],
  ];
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold">Portes aceitos</p>
        <div className="flex flex-wrap gap-2">
          {DOG_SIZES.map((s) => {
            const ok = walker.sizes.includes(s.id);
            return (
              <span key={s.id} className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${ok ? 'border-ink-900/80 bg-white font-semibold' : 'border-sand-200 text-ink-400 line-through'}`}>
                {ok ? <Check size={15} aria-hidden="true" /> : null} {s.label} <span className="font-normal text-ink-600 no-underline">{s.hint}</span>
              </span>
            );
          })}
        </div>
      </div>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {skills.map(([label, ok]) => (
          <li key={label} className="flex items-center gap-2.5 text-[15px]">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${ok ? 'bg-success-50 text-success-600' : 'bg-cream-100 text-ink-400'}`}>
              {ok ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : <X size={14} strokeWidth={3} aria-hidden="true" />}
            </span>
            <span className={ok ? '' : 'text-ink-600'}>
              {label}
              <span className="sr-only">{ok ? ': sim' : ': não'}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SLOT_STYLE = {
  available: 'border-ink-900/70 bg-white text-ink-900 font-semibold',
  booked: 'border-transparent bg-wine-50 text-wine-400',
  blocked: 'border-transparent bg-cream-100 text-ink-400 line-through',
  off: 'border-transparent bg-transparent text-ink-400/60',
  past: 'border-transparent bg-transparent text-ink-400/60',
};
const SLOT_LABEL = { available: 'livre', booked: 'reservado', blocked: 'bloqueado', off: 'fora do horário', past: 'encerrado' };

function AvailabilityCalendar({ walker }) {
  const data = useData();
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(todayISO(), i)), []);
  const slotsByDay = useMemo(() => Object.fromEntries(days.map((d) => [d, getDaySlots(walker, d, data.bookings)])), [days, walker, data.bookings]);
  const firstFree = days.find((d) => slotsByDay[d].some((s) => s.state === 'available')) ?? days[0];
  const [day, setDay] = useState(firstFree);
  const slots = slotsByDay[day].filter((s) => s.state !== 'off' || slotsByDay[day].every((x) => x.state === 'off'));
  const freeCount = slotsByDay[day].filter((s) => s.state === 'available').length;

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5" role="tablist" aria-label="Dias">
        {days.map((d) => {
          const dt = parseISODate(d);
          const free = slotsByDay[d].filter((s) => s.state === 'available').length;
          const active = d === day;
          return (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setDay(d)}
              className={`flex flex-col items-center rounded-2xl border py-2 transition ${active ? 'border-ink-900 bg-ink-900 text-white' : 'border-sand-200 bg-white hover:border-ink-900/50'}`}
            >
              <span className={`text-[11px] font-semibold uppercase ${active ? 'text-white/75' : 'text-ink-600'}`}>{d === todayISO() ? 'hoje' : WEEKDAYS_SHORT[dt.getDay()]}</span>
              <span className="text-[17px] font-bold">{dt.getDate()}</span>
              <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${free ? (active ? 'bg-gold-500' : 'bg-success-600') : 'bg-transparent'}`} aria-hidden="true" />
              <span className="sr-only">{free ? `${free} horários livres` : 'sem horários'}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm font-semibold">
        {formatDateLong(day)} · <span className="font-normal text-ink-600">{freeCount ? `${freeCount} ${freeCount === 1 ? 'horário livre' : 'horários livres'}` : 'sem horários livres'}</span>
      </p>
      {slots.every((s) => s.state === 'off') ? (
        <p className="mt-2 rounded-xl bg-cream-100 p-3 text-sm text-ink-600">{firstName(walker.name)} não atende neste dia da semana.</p>
      ) : (
        <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {slots.map((s) => (
            <li key={s.time} className={`rounded-xl border px-1 py-2 text-center text-sm ${SLOT_STYLE[s.state]}`} title={SLOT_LABEL[s.state]}>
              {s.time}
              <span className="sr-only"> — {SLOT_LABEL[s.state]}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-ink-900/70 bg-white" /> Livre
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-wine-50" /> Reservado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-cream-100" /> Bloqueado pelo profissional
        </span>
      </div>
    </div>
  );
}

function VerificationBlock({ walker }) {
  const rows = [
    ['Identidade', walker.verification.identity],
    ['Antecedentes', walker.verification.background],
  ];
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-4">
      <ul className="space-y-3">
        {rows.map(([label, status]) => (
          <li key={label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5 text-[15px]">
              {status === 'verified' ? <ShieldCheck size={20} className="text-success-600" aria-hidden="true" /> : <UserSearch size={20} className="text-ink-400" aria-hidden="true" />}
              {label}
            </span>
            <Badge tone={status === 'verified' ? 'success' : status === 'pending' ? 'warning' : 'neutral'} size="xs">
              {VERIFICATION_LABEL[status]}
            </Badge>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[13px] leading-snug text-ink-600">
        Neste protótipo, os status de verificação são dados demonstrativos. <Link to="/seguranca" className="font-semibold underline">Como funciona a verificação</Link>
      </p>
    </div>
  );
}

function Reviews({ walker }) {
  const data = useData();
  const [showAll, setShowAll] = useState(false);
  const reviews = useMemo(() => data.reviews.filter((r) => r.walkerId === walker.id).sort((a, b) => b.at - a.at), [data.reviews, walker.id]);
  if (!reviews.length) return <p className="text-ink-600">Ainda sem avaliações. As avaliações aparecem depois de passeios concluídos.</p>;

  const list = (items) => (
    <ul className="grid gap-x-12 gap-y-7 md:grid-cols-2">
      {items.map((r) => (
        <li key={r.id}>
          <div className="flex items-center gap-3">
            <Avatar src={r.authorAvatar} name={r.authorName} size={42} />
            <div>
              <p className="font-semibold">{firstName(r.authorName)}</p>
              <p className="text-[13px] text-ink-600">
                Tutor de {r.petName} · {formatRelativeDay(new Date(r.at).toISOString().slice(0, 10))}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <Stars value={r.rating} size={13} />
          </div>
          <p className="mt-1.5 text-[15px] leading-relaxed">{r.comment || 'Sem comentário.'}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {list(reviews.slice(0, 4))}
      {reviews.length > 4 ? (
        <Button variant="secondary" className="mt-6" onClick={() => setShowAll(true)}>
          Mostrar as {reviews.length} avaliações
        </Button>
      ) : null}
      <p className="mt-4 text-[13px] text-ink-600">Somente tutores com passeio concluído podem avaliar.</p>
      <Modal open={showAll} onClose={() => setShowAll(false)} title={`Avaliações de ${walker.name}`} size="lg">
        {list(reviews)}
      </Modal>
    </>
  );
}

function ContactBlock({ walker }) {
  const user = useCurrentUser();
  const actions = useActions();
  const navigate = useNavigate();
  const location = useLocation();
  const contact = () => {
    if (!user) {
      navigate(`/entrar?voltar=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    const conversation = actions.openConversation(walker.id);
    navigate(`/tutor/mensagens/${conversation.id}`);
  };
  return (
    <section className="border-t border-sand-200 py-8">
      <div className="flex flex-col gap-4 rounded-3xl bg-cream-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={walker.avatar} name={walker.name} size={48} />
          <div>
            <p className="font-semibold">Ficou com alguma dúvida?</p>
            <p className="text-sm text-ink-600">Converse com {firstName(walker.name)} antes de solicitar.</p>
          </div>
        </div>
        <Button variant="secondary" icon={MessageCircle} onClick={contact}>
          Enviar mensagem
        </Button>
      </div>
    </section>
  );
}
