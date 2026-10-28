import { useMemo, useState } from 'react';
import { UserPlus, CheckCircle2, Send, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import Field, { TextInput, TextArea } from '../../components/forms/Field';
import Badge from '../../components/common/Badge';
import { useActions, useData } from '../../context/AppStore';
import { useCurrentUser } from '../../hooks/useAccount';
import { useToast } from '../../components/feedback/Toast';
import { dogPhoto } from '../../data/mock/photos';
import SmartImage from '../../components/common/SmartImage';
import { timeAgo } from '../../utils/dates';

const EMPTY = { walkerName: '', contact: '', note: '' };

export default function ReferralPage() {
  const actions = useActions();
  const data = useData();
  const user = useCurrentUser();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);

  const mine = useMemo(() => data.referrals.filter((r) => (user ? r.referrerId === user.id : r.referrerId === null)), [data.referrals, user]);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.walkerName.trim()) next.walkerName = 'Informe o nome do dog walker.';
    if (form.contact.trim().length < 8) next.contact = 'Informe um telefone ou e-mail.';
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      actions.addReferral(form);
      setSent(form.walkerName.trim());
      setForm(EMPTY);
      toast.success('Indicação enviada');
    } catch (error) {
      toast.error('Não foi possível enviar', error.message);
    }
  };

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  return (
    <div className="container-page grid gap-10 pb-6 pt-8 md:pt-14 lg:grid-cols-[1fr_1fr]">
      <div>
        <h1 className="text-[30px] font-bold leading-tight tracking-tight md:text-[40px]">Indicar um dog walker</h1>
        <p className="mt-3 max-w-md text-[16px] leading-relaxed text-ink-600">
          Conhece alguém que cuida bem de cães? Indique e nós convidamos essa pessoa para criar um perfil profissional no Rolê de Pet.
        </p>
        <SmartImage src={dogPhoto('walk', 900)} alt="" className="mt-6 hidden aspect-[16/10] w-full rounded-3xl lg:block" rounded="rounded-3xl" />
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-sand-200 bg-white p-5 shadow-card md:p-6">
          {sent ? (
            <div className="flex flex-col items-start gap-3" role="status">
              <CheckCircle2 size={32} className="text-success-600" aria-hidden="true" />
              <h2 className="text-xl font-bold">Indicação de {sent} enviada</h2>
              <p className="text-[15px] text-ink-600">Na versão final, enviaremos um convite com o link de cadastro. Neste protótipo, a indicação fica registrada apenas neste navegador.</p>
              <Button variant="secondary" icon={UserPlus} onClick={() => setSent(null)}>
                Indicar outra pessoa
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <Field label="Nome do dog walker" required error={errors.walkerName}>
                <TextInput value={form.walkerName} onChange={update('walkerName')} placeholder="Ex.: Ana Souza" autoComplete="off" />
              </Field>
              <Field label="Telefone ou e-mail" required error={errors.contact}>
                <TextInput value={form.contact} onChange={update('contact')} placeholder="(11) 90000-0000 ou nome@email.com" autoComplete="off" />
              </Field>
              <Field label="Por que você indica?" optional>
                <TextArea value={form.note} onChange={update('note')} maxLength={300} placeholder="Ex.: passeia com o meu cão há dois anos e é muito pontual." />
              </Field>
              <Button type="submit" fullWidth size="lg" icon={Send}>
                Enviar indicação
              </Button>
            </form>
          )}
        </div>

        <section aria-labelledby="my-referrals">
          <h2 id="my-referrals" className="mb-3 text-lg font-bold">
            Suas indicações
          </h2>
          {mine.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sand-200 p-5 text-[15px] text-ink-600">Você ainda não indicou ninguém.</p>
          ) : (
            <ul className="divide-y divide-sand-200 rounded-3xl border border-sand-200 bg-white">
              {mine.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{r.walkerName}</p>
                    <p className="truncate text-[13px] text-ink-600">
                      {r.contact} · {timeAgo(r.at)}
                    </p>
                  </div>
                  <Badge tone="info" icon={Clock} size="xs">
                    Convite enviado
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
