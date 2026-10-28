import { useState } from 'react';
import { HeartPulse, Bandage, SearchX, MessageSquareWarning, Headset, Phone, Stethoscope, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { RadioCard, TextArea } from '../../components/forms/Field';
import { useActions } from '../../context/AppStore';

const REASONS = [
  { id: 'pet', title: 'Problema com o pet', description: 'Mal-estar, comportamento incomum, fuga', icon: HeartPulse },
  { id: 'acidente', title: 'Acidente ou ferimento', description: 'Mordida, queda, atropelamento, corte', icon: Bandage },
  { id: 'desencontro', title: 'Não encontro o dog walker', description: 'Atraso, localização ou contato', icon: SearchX },
  { id: 'outro', title: 'Outro assunto', description: 'Descreva o que está acontecendo', icon: MessageSquareWarning },
];

/**
 * Simulated emergency/support flow: choose → confirm → support screen.
 * This prototype never contacts emergency services or any real person.
 */
export default function HelpSheet({ open, onClose, booking, audience = 'owner' }) {
  const actions = useActions();
  const [step, setStep] = useState('choose');
  const [reason, setReason] = useState('pet');
  const [details, setDetails] = useState('');
  const [protocol, setProtocol] = useState('');

  const close = () => {
    onClose();
    setTimeout(() => {
      setStep('choose');
      setDetails('');
    }, 250);
  };

  const confirm = () => {
    const number = `RDP-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000))}`;
    setProtocol(number);
    setStep('support');
    actions.pushNotification({
      audience,
      userId: audience === 'owner' ? booking.ownerId : booking.walkerId,
      kind: 'system',
      title: 'Pedido de ajuda registrado',
      body: `Protocolo ${number} (simulação). ${REASONS.find((r) => r.id === reason)?.title}.`,
      link: audience === 'owner' ? `/tutor/acompanhar/${booking.id}` : `/dog-walker/passeio/${booking.id}`,
    });
  };

  const pet = booking?.pet;
  const chosen = REASONS.find((r) => r.id === reason);

  return (
    <Modal
      open={open}
      onClose={close}
      title={step === 'support' ? 'Suporte acionado (simulação)' : 'Preciso de ajuda'}
      description={step === 'choose' ? 'Conte o que está acontecendo. Você confirma antes de enviarmos.' : undefined}
      footer={
        step === 'choose' ? (
          <Button fullWidth size="lg" variant="danger" onClick={() => setStep('confirm')}>
            Continuar
          </Button>
        ) : step === 'confirm' ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="secondary" size="lg" fullWidth onClick={() => setStep('choose')}>
              Voltar
            </Button>
            <Button variant="danger" size="lg" fullWidth icon={ShieldAlert} onClick={confirm}>
              Confirmar pedido de ajuda
            </Button>
          </div>
        ) : (
          <Button fullWidth size="lg" variant="secondary" onClick={close}>
            Fechar
          </Button>
        )
      }
    >
      <div className="mb-4 rounded-2xl border border-danger-600/30 bg-danger-50 p-3.5 text-[13px] leading-snug text-ink-900">
        <strong className="text-danger-600">Protótipo:</strong> este fluxo é uma simulação e não contata serviços de emergência, o suporte ou qualquer pessoa. Em emergência real, ligue <strong>190</strong> (Polícia), <strong>193</strong> (Bombeiros) ou para o veterinário do pet.
      </div>

      {step === 'choose' ? (
        <div className="space-y-3">
          <fieldset className="space-y-2">
            <legend className="sr-only">Motivo</legend>
            {REASONS.map((r) => (
              <RadioCard key={r.id} name="help-reason" value={r.id} checked={reason === r.id} onChange={setReason} title={r.title} description={r.description} icon={r.icon} />
            ))}
          </fieldset>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Detalhes <span className="font-normal text-ink-400">opcional</span></span>
            <TextArea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="O que aconteceu e onde vocês estão" maxLength={400} />
          </label>
        </div>
      ) : null}

      {step === 'confirm' ? (
        <div className="space-y-3">
          <p className="text-[15px]">Vamos abrir um atendimento prioritário sobre:</p>
          <div className="flex items-center gap-3 rounded-2xl bg-cream-100 p-4">
            {chosen ? <chosen.icon size={22} className="text-danger-600" aria-hidden="true" /> : null}
            <div>
              <p className="font-semibold">{chosen?.title}</p>
              {details ? <p className="text-sm text-ink-600">{details}</p> : null}
            </div>
          </div>
          <p className="text-sm text-ink-600">A equipe Rolê de Pet veria a localização simulada do passeio e os dados de emergência do pet.</p>
        </div>
      ) : null}

      {step === 'support' ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-success-50 p-4">
            <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-success-600" aria-hidden="true" />
            <div>
              <p className="font-semibold">Atendimento registrado</p>
              <p className="text-sm text-ink-600">
                Protocolo <span className="font-mono font-semibold text-ink-900">{protocol}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-sand-200 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
              <Headset size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold">Central de cuidado Rolê de Pet</p>
              <p className="text-sm text-ink-600">Em produção: retorno em até 2 minutos, 24 h por dia.</p>
            </div>
          </div>
          {pet ? (
            <div>
              <h3 className="mb-2 text-sm font-bold">Contatos de emergência de {pet.name}</h3>
              <ul className="divide-y divide-sand-200 rounded-2xl border border-sand-200">
                {[
                  { icon: Phone, label: 'Tutor', value: pet.emergency?.ownerPhone },
                  { icon: Phone, label: pet.emergency?.emergencyName || 'Contato de emergência', value: pet.emergency?.emergencyPhone },
                  { icon: Stethoscope, label: pet.emergency?.vetName || 'Veterinário', value: pet.emergency?.vetPhone },
                ]
                  .filter((c) => c.value)
                  .map((c) => (
                    <li key={c.label} className="flex items-center gap-3 px-4 py-3">
                      <c.icon size={18} className="shrink-0 text-ink-600" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.label}</p>
                        <p className="text-sm text-ink-600">{c.value}</p>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
