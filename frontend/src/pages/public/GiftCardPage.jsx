import { useState } from 'react';
import { Gift, BellRing, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Field, { TextInput, Chip } from '../../components/forms/Field';
import { LogoMark } from '../../components/common/Logo';
import { useCurrentUser } from '../../hooks/useAccount';
import { useToast } from '../../components/feedback/Toast';
import { formatBRL } from '../../utils/format';

const VALUES = [50, 100, 200, 300];

export default function GiftCardPage() {
  const user = useCurrentUser();
  const toast = useToast();
  const [value, setValue] = useState(100);
  const [recipient, setRecipient] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState('');
  const [notified, setNotified] = useState(false);

  const notify = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    setError('');
    setNotified(true);
    toast.success('Pronto', 'Avisaremos quando o cartão-presente for lançado.');
  };

  return (
    <div className="container-page grid gap-10 pb-6 pt-8 md:pt-14 lg:grid-cols-2 lg:items-center">
      <div>
        <Badge tone="gold" icon={Gift}>
          Em breve
        </Badge>
        <h1 className="mt-4 text-[30px] font-bold leading-[1.1] tracking-tight md:text-[44px]">Cartão-presente Rolê de Pet</h1>
        <p className="mt-3 max-w-md text-[16px] leading-relaxed text-ink-600">
          Presenteie quem ama cachorro com passeios de confiança. O cartão-presente ainda não está à venda — veja a prévia e peça para ser avisado.
        </p>

        <fieldset className="mt-7">
          <legend className="mb-2.5 text-sm font-semibold">Valor</legend>
          <div className="flex flex-wrap gap-2">
            {VALUES.map((v) => (
              <Chip key={v} selected={value === v} onClick={() => setValue(v)}>
                {formatBRL(v).replace(',00', '')}
              </Chip>
            ))}
          </div>
        </fieldset>
        <Field label="Para quem?" optional className="mt-5">
          <TextInput value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Nome de quem vai receber" maxLength={30} />
        </Field>

        <form onSubmit={notify} noValidate className="mt-6 rounded-3xl border border-sand-200 bg-white p-5">
          {notified ? (
            <p className="flex items-center gap-2 font-semibold text-success-600" role="status">
              <CheckCircle2 size={20} aria-hidden="true" /> Você será avisado em {email}.
            </p>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <Field label="Seu e-mail" error={error} className="flex-1">
                <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
              </Field>
              <Button type="submit" icon={BellRing} className="sm:mt-7">
                Avise-me
              </Button>
            </div>
          )}
        </form>
      </div>

      <div className="flex justify-center" aria-label="Prévia do cartão-presente">
        <div className="relative aspect-[1.6/1] w-full max-w-md overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-wine-500 via-wine-700 to-ink-900 p-6 text-white shadow-float">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gold-500/25" aria-hidden="true" />
          <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-wine-400/30" aria-hidden="true" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[15px] font-bold">
                <span className="rounded-lg bg-cream-50 px-1.5 py-1"><LogoMark size={22} /></span> Rolê de Pet
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">Cartão-presente</span>
            </div>
            <div>
              <p className="text-sm text-white/70">{recipient ? `Para ${recipient}` : 'Para alguém especial'}</p>
              <p className="text-[40px] font-bold leading-none tracking-tight text-gold-400">{formatBRL(value)}</p>
              <p className="mt-1 text-[13px] text-white/70">em passeios com dog walkers de confiança</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
