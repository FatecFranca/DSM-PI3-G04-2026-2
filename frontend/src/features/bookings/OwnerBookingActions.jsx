import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Navigation, Star, MessageCircle, RotateCcw, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal, { ConfirmDialog } from '../../components/common/Modal';
import PaymentSheet from '../payments/PaymentSheet';
import ReviewForm from '../reviews/ReviewForm';
import { useActions } from '../../context/AppStore';
import { useBookingActions } from './useBookingActions';
import { BOOKING_STATUS as S, isLive, isFinished } from './bookingStateMachine';
import { firstName } from '../../utils/format';

/**
 * Status-specific tutor actions for a booking (used in lists and detail page).
 * `layout="detail"` renders larger, full-width buttons.
 */
export default function OwnerBookingActions({ booking, layout = 'card' }) {
  const navigate = useNavigate();
  const actions = useActions();
  const { cancel } = useBookingActions();
  const [paying, setPaying] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const detail = layout === 'detail';
  const size = detail ? 'lg' : 'sm';
  const status = booking.status;

  const openChat = () => {
    const conversation = actions.openConversation(booking.walkerId);
    navigate(`/tutor/mensagens/${conversation.id}`);
  };

  const buttons = [];
  if (status === S.ACCEPTED) {
    buttons.push(<Button key="pay" size={size} icon={CreditCard} onClick={() => setPaying(true)} fullWidth={detail}>Pagar e confirmar</Button>);
  }
  if (isLive(status)) {
    buttons.push(<Button key="live" size={size} icon={Navigation} to={`/tutor/acompanhar/${booking.id}`} fullWidth={detail}>Acompanhar ao vivo</Button>);
  }
  if (status === S.COMPLETED) {
    buttons.push(<Button key="review" size={size} icon={Star} onClick={() => setReviewing(true)} fullWidth={detail}>Avaliar passeio</Button>);
  }
  if (status === S.PAID || isLive(status) || status === S.ACCEPTED) {
    buttons.push(<Button key="msg" size={size} variant="secondary" icon={MessageCircle} onClick={openChat} fullWidth={detail}>Mensagem</Button>);
  }
  if (isFinished(status) || ['declined', 'expired', 'canceled'].includes(status)) {
    buttons.push(
      <Button key="again" size={size} variant={status === S.COMPLETED ? 'secondary' : 'primary'} icon={RotateCcw} to={`/dog-walkers/${booking.walkerId}?pet=${booking.petId}&duracao=${booking.duration}`} fullWidth={detail}>
        Contratar de novo
      </Button>,
    );
  }
  if ([S.REQUESTED, S.ACCEPTED, S.PAID].includes(status)) {
    buttons.push(
      <Button key="cancel" size={size} variant="dangerGhost" icon={X} onClick={() => setConfirmCancel(true)} fullWidth={detail}>
        {status === S.REQUESTED ? 'Cancelar solicitação' : 'Cancelar'}
      </Button>,
    );
  }

  if (!buttons.length) return null;

  return (
    <>
      <div className={detail ? 'flex flex-col gap-2' : 'contents'}>{buttons}</div>
      <PaymentSheet booking={booking} open={paying} onClose={() => setPaying(false)} />
      <Modal open={reviewing} onClose={() => setReviewing(false)} title={`Avaliar passeio com ${firstName(booking.walker?.name)}`}>
        <ReviewForm booking={booking} compact onDone={() => setReviewing(false)} />
      </Modal>
      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => {
          cancel(booking.id, 'owner');
          setConfirmCancel(false);
        }}
        tone="danger"
        title={status === S.REQUESTED ? 'Cancelar solicitação?' : 'Cancelar passeio?'}
        description={
          status === S.PAID
            ? 'A metade ainda retida será devolvida para a forma de pagamento usada. A primeira metade fica com o dog walker pelo horário reservado.'
            : 'Nenhum valor foi cobrado. O dog walker será avisado.'
        }
        confirmLabel="Cancelar passeio"
        cancelLabel="Manter"
      />
    </>
  );
}
