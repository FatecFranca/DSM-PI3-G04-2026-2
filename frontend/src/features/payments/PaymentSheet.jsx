import { useState } from 'react';
import { CreditCard, QrCode, Lock, ShieldCheck } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { RadioCard } from '../../components/forms/Field';
import { useData } from '../../context/AppStore';
import { useCurrentUser } from '../../hooks/useAccount';
import { useBookingActions } from '../bookings/useBookingActions';
import { formatBRL, firstName } from '../../utils/format';
import { formatDateLong } from '../../utils/dates';
import { halves } from './paymentSplit';

/**
 * Simulated checkout for an accepted booking. 50% goes to the walker on payment and
 * 50% when the walk is finished. No card data is collected.
 */
export default function PaymentSheet({ booking, open, onClose, onPaid }) {
  const data = useData();
  const user = useCurrentUser();
  const { pay } = useBookingActions();
  const methods = data.paymentMethods.filter((m) => m.userId === user?.id);
  const [methodId, setMethodId] = useState(() => methods.find((m) => m.isDefault)?.id ?? methods[0]?.id ?? 'pix-avulso');
  const [processing, setProcessing] = useState(false);

  if (!booking) return null;
  const options = methods.length ? methods : [{ id: 'pix-avulso', type: 'pix', label: 'Pix (pagamento avulso)' }];

  const submit = () => {
    setProcessing(true);
    // Simulated processing delay
    setTimeout(() => {
      const result = pay(booking.id, methodId);
      setProcessing(false);
      if (result) {
        onPaid?.(result);
        onClose();
      }
    }, 1100);
  };

  return (
    <Modal
      open={open}
      onClose={processing ? () => {} : onClose}
      title="Confirmar pagamento"
      description={`Passeio de ${booking.pet?.name} com ${firstName(booking.walker?.name)} — ${formatDateLong(booking.date)} às ${booking.time}`}
      footer={
        <Button fullWidth size="lg" onClick={submit} loading={processing} icon={Lock}>
          {processing ? 'Processando…' : `Pagar ${formatBRL(booking.price)}`}
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl bg-cream-100 p-4">
          <div className="flex justify-between text-[15px]">
            <span className="text-ink-600">Passeio de {booking.duration} min</span>
            <span className="font-medium">{formatBRL(booking.price)}</span>
          </div>
          <div className="mt-1.5 flex justify-between text-[15px]">
            <span className="text-ink-600">Taxa para o tutor</span>
            <span className="font-medium">Sem taxa</span>
          </div>
          <hr className="my-3 border-sand-200" />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatBRL(booking.price)}</span>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Forma de pagamento</legend>
          <div className="space-y-2">
            {options.map((m) => (
              <RadioCard key={m.id} name="method" value={m.id} checked={methodId === m.id} onChange={setMethodId} title={m.label} icon={m.type === 'pix' ? QrCode : CreditCard} />
            ))}
          </div>
          <p className="mt-2 text-[13px] text-ink-600">Formas de pagamento demonstrativas. Nenhum dado de cartão é solicitado neste protótipo.</p>
        </fieldset>

        <div className="flex gap-3 rounded-2xl border border-success-600/20 bg-success-50 p-4">
          <ShieldCheck size={22} className="shrink-0 text-success-600" aria-hidden="true" />
          <p className="text-sm text-ink-900">
            <strong>Pagamento em duas etapas.</strong> Ao confirmar, metade ({formatBRL(halves(booking.price)[0])}) vai para o dog walker e a outra metade ({formatBRL(halves(booking.price)[1])}) fica retida até ele finalizar o passeio. Se você cancelar antes do passeio, a metade retida é devolvida; se o dog walker cancelar, você recebe tudo de volta.
          </p>
        </div>
      </div>
    </Modal>
  );
}
