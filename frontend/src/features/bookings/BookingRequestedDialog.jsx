import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LogIn, CalendarDays, Clock } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import SmartImage, { Avatar } from '../../components/common/SmartImage';
import { StatusBadge } from '../../components/common/Badge';
import { useData } from '../../context/AppStore';
import { useAccountSwitch } from '../auth/useAccountSwitch';
import { formatBRL, firstName } from '../../utils/format';
import { formatDateLong } from '../../utils/dates';

/** Confirmation shown right after a request is created */
export default function BookingRequestedDialog({ booking, onClose }) {
  const data = useData();
  const navigate = useNavigate();
  const { switchToWalker } = useAccountSwitch();
  if (!booking) return null;
  const walker = data.walkers.find((w) => w.id === booking.walkerId);
  const pet = data.pets.find((p) => p.id === booking.petId);

  const signInAsWalker = () => {
    onClose();
    switchToWalker(booking.walkerId, `/dog-walker/solicitacoes/${booking.id}`);
  };

  return (
    <Modal open={Boolean(booking)} onClose={onClose} size="sm">
      <div className="flex flex-col items-center pt-2 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-600">
          <CheckCircle2 size={34} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-bold">Solicitação enviada</h2>
        <p className="mt-1 text-[15px] text-ink-600">
          {firstName(walker?.name)} vai analisar o perfil de {pet?.name} e responder em breve. Nada é cobrado até o aceite.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-sand-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <SmartImage src={pet?.photo} alt={pet?.name} className="h-14 w-14 rounded-2xl" rounded="rounded-2xl" />
            <Avatar src={walker?.avatar} name={walker?.name} size={28} ring className="absolute -bottom-1.5 -right-1.5" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="font-semibold">
              {pet?.name} com {firstName(walker?.name)}
            </p>
            <StatusBadge status={booking.status} size="xs" />
          </div>
          <span className="font-bold">{formatBRL(booking.price)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-600">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={14} aria-hidden="true" /> {formatDateLong(booking.date)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} aria-hidden="true" /> {booking.time} · {booking.duration} min
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Button
          fullWidth
          size="lg"
          onClick={() => {
            onClose();
            navigate(`/tutor/passeios/${booking.id}`);
          }}
        >
          Ver meus passeios
        </Button>
        <div className="rounded-2xl border border-dashed border-gold-700/40 bg-gold-50 p-3">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-gold-800">Demonstração</p>
          <Button fullWidth variant="gold" icon={LogIn} onClick={signInAsWalker}>
            Entrar como {firstName(walker?.name)} (dog walker)
          </Button>
          <p className="mt-2 text-[12px] leading-snug text-ink-600">Sai da sua conta e entra na conta de {walker?.name}, como se fosse o celular dele, para aceitar ou recusar esta solicitação.</p>
        </div>
      </div>
    </Modal>
  );
}
