import { useMemo, useState } from 'react';
import { Copy, Check, Link2, Clock3, EyeOff } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { demoShareLink } from '../../services/trackingService';
import { useToast } from '../../components/feedback/Toast';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers without async clipboard permission
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    el.remove();
    return ok;
  }
}

/** Demonstration share link for the live walk. Carries no coordinates. */
export default function ShareSheet({ open, onClose, booking }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const link = useMemo(() => (booking ? demoShareLink(booking.id) : ''), [booking?.id, open]);

  const copy = async () => {
    const ok = await copyText(link);
    if (ok) {
      setCopied(true);
      toast.success('Link copiado', 'Link demonstrativo — não abre um acompanhamento real.');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Não foi possível copiar', 'Selecione o link e copie manualmente.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Compartilhar acompanhamento" description={`Envie para quem também cuida de ${booking?.pet?.name ?? 'seu pet'}.`} size="sm">
      <div className="space-y-4">
        <div className="rounded-2xl border border-sand-200 bg-cream-50 p-3.5">
          <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-gold-800">
            <Link2 size={14} aria-hidden="true" /> Link demonstrativo — não expõe localização real
          </p>
          <p className="select-all break-all font-mono text-sm text-ink-900">{link}</p>
        </div>
        <Button fullWidth size="lg" icon={copied ? Check : Copy} onClick={copy}>
          {copied ? 'Copiado' : 'Copiar link'}
        </Button>
        <ul className="space-y-2.5 text-sm text-ink-600">
          <li className="flex gap-2.5">
            <Clock3 size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            Em produção, o link expira automaticamente ao fim do passeio.
          </li>
          <li className="flex gap-2.5">
            <EyeOff size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            Quem recebe vê só o status e o trajeto aproximado — nunca o endereço completo nem dados de pagamento.
          </li>
        </ul>
      </div>
    </Modal>
  );
}
