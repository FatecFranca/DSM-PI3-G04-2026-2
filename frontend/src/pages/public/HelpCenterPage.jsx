import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, MessageSquareText, CheckCircle2, SearchX, Phone } from 'lucide-react';
import Button from '../../components/common/Button';
import Field, { TextInput, TextArea, Select } from '../../components/forms/Field';
import { Chip } from '../../components/forms/Field';
import EmptyState from '../../components/feedback/EmptyState';
import { HELP_CATEGORIES, FAQS } from '../../features/help/faqData';
import { useCurrentUser } from '../../hooks/useAccount';

const normalize = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

function SupportForm() {
  const user = useCurrentUser();
  const [form, setForm] = useState({ topic: 'passeio', email: user?.email ?? '', message: '' });
  const [errors, setErrors] = useState({});
  const [protocol, setProtocol] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Informe um e-mail para retorno.';
    if (form.message.trim().length < 10) next.message = 'Descreva o que aconteceu (mínimo de 10 caracteres).';
    setErrors(next);
    if (Object.keys(next).length) return;
    const now = new Date();
    setProtocol(`RP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  if (protocol) {
    return (
      <div className="flex flex-col items-start gap-3" role="status">
        <CheckCircle2 size={30} className="text-success-600" aria-hidden="true" />
        <h3 className="text-lg font-bold">Mensagem registrada</h3>
        <p className="text-[15px] text-ink-600">
          Protocolo <strong className="text-ink-900">{protocol}</strong>. Neste protótipo, nenhuma mensagem é enviada de verdade.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            setProtocol(null);
            setForm((f) => ({ ...f, message: '' }));
          }}
        >
          Enviar outra mensagem
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Assunto">
        <Select
          value={form.topic}
          onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
          options={[
            { value: 'passeio', label: 'Um passeio específico' },
            { value: 'pagamento', label: 'Pagamento ou reembolso' },
            { value: 'seguranca', label: 'Segurança' },
            { value: 'conta', label: 'Minha conta' },
            { value: 'outro', label: 'Outro assunto' },
          ]}
        />
      </Field>
      <Field label="E-mail para retorno" error={errors.email}>
        <TextInput type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="voce@email.com" />
      </Field>
      <Field label="Mensagem" error={errors.message}>
        <TextArea rows={4} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Conte o que aconteceu, com data e nome do pet, se for o caso." />
      </Field>
      <Button type="submit" fullWidth icon={MessageSquareText}>
        Enviar para o suporte
      </Button>
    </form>
  );
}

export default function HelpCenterPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const category = HELP_CATEGORIES.some((c) => c.id === params.get('categoria')) ? params.get('categoria') : null;

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return FAQS.filter((f) => (!category || f.category === category) && (!q || normalize(`${f.question} ${f.answer}`).includes(q)));
  }, [query, category]);

  const setCategory = (id) => {
    setParams(id ? { categoria: id } : {}, { replace: true });
    setOpenId(null);
  };

  return (
    <div className="pb-6">
      <section className="bg-cream-100">
        <div className="container-page py-10 md:py-16">
          <h1 className="text-[30px] font-bold tracking-tight md:text-[42px]">Como podemos ajudar?</h1>
          <div className="mt-5 max-w-2xl">
            <label htmlFor="help-search" className="sr-only">
              Buscar na central de ajuda
            </label>
            <div className="relative">
              <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <input
                id="help-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busque por pagamento, cancelamento, código de retirada…"
                className="h-14 w-full rounded-2xl border border-sand-200 bg-white pl-12 pr-4 text-[16px] shadow-card placeholder:text-ink-400 focus:border-accent-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-page mt-6">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Categorias">
          <Chip selected={!category} onClick={() => setCategory(null)}>
            Todas
          </Chip>
          {HELP_CATEGORIES.map((c) => (
            <Chip key={c.id} selected={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      {category === 'emergencia' ? (
        <div className="container-page mt-5">
          <div role="note" className="flex gap-3 rounded-2xl border-2 border-danger-600 bg-danger-50 p-4">
            <Phone size={20} className="mt-0.5 shrink-0 text-danger-600" aria-hidden="true" />
            <p className="text-[15px] text-ink-900">
              <strong>Em situação de risco à vida</strong>, ligue diretamente para o SAMU (192) ou os Bombeiros (193). O fluxo de ajuda do app é demonstrativo neste protótipo.
            </p>
          </div>
        </div>
      ) : null}

      <div className="container-page mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <section aria-label="Perguntas frequentes">
          <p className="mb-3 text-sm text-ink-600" aria-live="polite">
            {results.length} {results.length === 1 ? 'resposta encontrada' : 'respostas encontradas'}
          </p>
          {results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Nenhuma resposta para essa busca"
              description="Tente outras palavras ou fale com o suporte."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('');
                    setCategory(null);
                  }}
                >
                  Limpar busca
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-sand-200 rounded-3xl border border-sand-200 bg-white">
              {results.map((faq) => {
                const open = openId === faq.id;
                return (
                  <div key={faq.id}>
                    <h2>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`faq-${faq.id}`}
                        onClick={() => setOpenId(open ? null : faq.id)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span>
                          <span className="block text-[15px] font-semibold text-ink-900">{faq.question}</span>
                          {!category ? <span className="mt-0.5 block text-[12px] text-ink-400">{HELP_CATEGORIES.find((c) => c.id === faq.category)?.label}</span> : null}
                        </span>
                        <ChevronDown size={18} className={`shrink-0 text-ink-600 transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>
                    </h2>
                    <div id={`faq-${faq.id}`} hidden={!open} className="px-5 pb-5 text-[15px] leading-relaxed text-ink-600">
                      {faq.answer}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-sand-200 bg-white p-5 shadow-card lg:sticky lg:top-28" aria-labelledby="support-title">
          <h2 id="support-title" className="text-lg font-bold">
            Fale com o suporte
          </h2>
          <p className="mb-4 mt-1 text-sm text-ink-600">Respondemos em até 24 horas por e-mail.</p>
          <SupportForm />
        </aside>
      </div>
    </div>
  );
}
