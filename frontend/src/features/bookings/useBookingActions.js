import { useActions } from '../../context/AppStore';
import { useToast } from '../../components/feedback/Toast';

/**
 * Booking actions wrapped with user feedback. Each returns the updated booking,
 * or null if the business rules rejected the change (an error toast is shown).
 */
export function useBookingActions() {
  const actions = useActions();
  const toast = useToast();

  const run = (fn, successTitle, successDescription) => {
    try {
      const result = fn();
      if (successTitle) toast.success(successTitle, successDescription);
      return result ?? true;
    } catch (error) {
      toast.error('Não foi possível concluir', error.message);
      return null;
    }
  };

  return {
    accept: (id) => run(() => actions.acceptBooking(id), 'Solicitação aceita', 'O tutor foi avisado para concluir o pagamento.'),
    decline: (id) => run(() => actions.declineBooking(id), 'Solicitação recusada', 'O tutor foi avisado. Nenhum valor foi cobrado.'),
    cancel: (id, actor = 'owner') => run(() => actions.cancelBooking(id, actor), 'Passeio cancelado'),
    pay: (id, methodId) => run(() => actions.payBooking(id, methodId), 'Pagamento confirmado', 'Metade vai para o dog walker agora e a outra metade quando ele finalizar o passeio.'),
    advance: (id, to, actor = 'walker', successTitle) => run(() => actions.transitionBooking(id, to, actor), successTitle),
    confirmPickup: (id, code) => {
      // Errors here are shown inline by the caller, so rethrow instead of toasting
      const booking = actions.confirmPickup(id, code);
      toast.success('Retirada confirmada');
      return booking;
    },
    review: (id, rating, comment) => run(() => actions.reviewBooking(id, rating, comment), 'Avaliação enviada', 'Obrigado! Sua avaliação ajuda outros tutores.'),
  };
}
