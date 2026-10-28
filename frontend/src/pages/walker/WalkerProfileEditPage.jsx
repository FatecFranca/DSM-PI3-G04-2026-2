import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Save, Plus, Trash2, ArrowUp, ArrowDown, ImagePlus, ShieldCheck, Clock3, Upload, FileText, CalendarDays, Info, EyeOff, GraduationCap, X } from 'lucide-react';
import Button, { IconButton } from '../../components/common/Button';
import Badge, { VerifiedBadge } from '../../components/common/Badge';
import SmartImage, { Avatar } from '../../components/common/SmartImage';
import Modal from '../../components/common/Modal';
import { Card, PageTitle } from '../../components/common/Layout';
import Field, { TextInput, TextArea, Toggle, Chip } from '../../components/forms/Field';
import EmptyState from '../../components/feedback/EmptyState';
import { useToast } from '../../components/feedback/Toast';
import { useActions } from '../../context/AppStore';
import { useActingWalker } from '../../hooks/useAccount';
import { VERIFICATION_LABEL } from '../../features/walkers/walkerSelectors';
import { DOG_SIZES, NEIGHBORHOODS, WALK_DURATIONS } from '../../utils/constants';
import { DOG_PHOTOS, dogPhoto } from '../../data/mock/photos';
import { WEEKDAY_ORDER, WEEKDAYS_SHORT } from '../../utils/dates';

const toForm = (w) => ({
  headline: w.headline || '',
  bio: w.bio || '',
  yearsExperience: w.yearsExperience ?? 0,
  courses: [...(w.courses || [])],
  photos: [...(w.photos || [])],
  sizes: [...(w.sizes || [])],
  reactiveExperience: !!w.reactiveExperience,
  acceptsMuzzle: !!w.acceptsMuzzle,
  medicationExperience: !!w.medicationExperience,
  puppies: !!w.puppies,
  seniors: !!w.seniors,
  areas: [...(w.areas || [])],
  prices: Object.fromEntries(WALK_DURATIONS.map((d) => [d, w.prices?.[d] ?? ''])),
});

const VERIFICATION_ITEMS = [
  { kind: 'identity', title: 'Verificação de identidade', description: 'Documento oficial com foto (RG ou CNH) e uma selfie.', docs: ['Frente do documento', 'Verso do documento', 'Selfie segurando o documento'] },
  { kind: 'background', title: 'Verificação de antecedentes', description: 'Certidão de antecedentes criminais emitida nos últimos 90 dias.', docs: ['Certidão de antecedentes criminais'] },
];

export default function WalkerProfileEditPage() {
  const walker = useActingWalker();
  const actions = useActions();
  const toast = useToast();
  const [form, setForm] = useState(() => (walker ? toForm(walker) : null));
  const [errors, setErrors] = useState({});
  const [newCourse, setNewCourse] = useState('');
  const [newArea, setNewArea] = useState('');
  const [photoPicker, setPhotoPicker] = useState(false);
  const [verifyKind, setVerifyKind] = useState(null);

  // Re-sync when the operated profile changes (demo switcher)
  useEffect(() => {
    if (walker) setForm(toForm(walker));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walker?.id]);

  const dirty = useMemo(() => walker && form && JSON.stringify(toForm(walker)) !== JSON.stringify(form), [walker, form]);

  if (!walker || !form) {
    return <EmptyState icon={Info} title="Perfil de dog walker não encontrado" description="Alterne para o modo dog walker pelo menu da conta para criar seu perfil." />;
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggleIn = (key, value) => set(key, form[key].includes(value) ? form[key].filter((v) => v !== value) : [...form[key], value]);

  const save = () => {
    const nextErrors = {};
    if (!form.headline.trim()) nextErrors.headline = 'Escreva um título curto para o seu perfil.';
    if (form.bio.trim().length < 40) nextErrors.bio = 'Conte um pouco mais sobre você (mínimo de 40 caracteres).';
    if (!form.sizes.length) nextErrors.sizes = 'Selecione pelo menos um porte.';
    if (!WALK_DURATIONS.some((d) => Number(form.prices[d]) > 0)) nextErrors.prices = 'Defina o preço de pelo menos uma duração.';
    if (!form.areas.length) nextErrors.areas = 'Informe pelo menos um bairro atendido.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error('Revise os campos destacados');
      return;
    }
    try {
      actions.updateWalkerProfile({ ...form, headline: form.headline.trim(), bio: form.bio.trim(), yearsExperience: Number(form.yearsExperience) || 0 });
      toast.success('Perfil atualizado', 'As mudanças já aparecem no seu perfil público.');
    } catch (error) {
      toast.error('Não foi possível salvar', error.message);
      if (error.field) setErrors({ [error.field]: error.message });
    }
  };

  const addCourse = () => {
    if (!newCourse.trim()) return;
    set('courses', [...form.courses, newCourse.trim()]);
    setNewCourse('');
  };
  const addArea = () => {
    const area = newArea.trim();
    if (!area || form.areas.includes(area)) return;
    set('areas', [...form.areas, area]);
    setNewArea('');
  };
  const movePhoto = (index, delta) => {
    const photos = [...form.photos];
    const [item] = photos.splice(index, 1);
    photos.splice(index + delta, 0, item);
    set('photos', photos);
  };

  const weeklySummary = WEEKDAY_ORDER.map((wd) => ({ wd, count: walker.availability?.[wd]?.length || 0 }));
  const hasAvailability = weeklySummary.some((d) => d.count);

  return (
    <div className="pb-24 md:pb-0">
      <PageTitle
        title="Perfil público e verificação"
        subtitle="O que os tutores veem antes de solicitar um passeio."
        actions={
          <Button to={`/dog-walkers/${walker.id}`} variant="secondary" size="sm" icon={Eye}>
            <span className="hidden sm:inline">Ver perfil público</span>
            <span className="sm:hidden">Ver</span>
          </Button>
        }
      />

      {walker.unlisted ? (
        <div className="mb-6 flex gap-3 rounded-2xl border border-gold-500/40 bg-gold-50 p-4 text-sm">
          <EyeOff size={20} className="shrink-0 text-gold-800" aria-hidden="true" />
          <p>
            <strong>Seu perfil ainda não aparece nas buscas.</strong> Complete a apresentação (mínimo de 40 caracteres) e defina horários na{' '}
            <Link to="/dog-walker/agenda" className="font-semibold underline underline-offset-4">agenda</Link> para ficar visível.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Section title="Apresentação">
            <div className="mb-4 flex items-center gap-3">
              <Avatar src={walker.avatar} name={walker.name} size={56} />
              <div>
                <p className="font-semibold">{walker.name}</p>
                <p className="text-[13px] text-ink-600">{walker.neighborhood} · {walker.city}</p>
              </div>
            </div>
            <div className="space-y-4">
              <Field label="Título do perfil" error={errors.headline} hint="Uma frase que resume sua especialidade.">
                <TextInput value={form.headline} maxLength={90} onChange={(e) => set('headline', e.target.value)} />
              </Field>
              <Field label="Sobre você" error={errors.bio} hint={`${form.bio.trim().length} caracteres`}>
                <TextArea rows={5} value={form.bio} maxLength={1200} onChange={(e) => set('bio', e.target.value)} placeholder="Experiência, rotina dos passeios, como você se comunica com o tutor…" />
              </Field>
              <Field label="Anos de experiência" className="max-w-[200px]">
                <TextInput type="number" min={0} max={50} inputMode="numeric" value={form.yearsExperience} onChange={(e) => set('yearsExperience', e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title="Cursos e certificados">
            {form.courses.length ? (
              <ul className="mb-3 space-y-2">
                {form.courses.map((c, i) => (
                  <li key={`${c}-${i}`} className="flex items-center gap-3 rounded-xl border border-sand-200 px-3 py-2">
                    <GraduationCap size={17} className="shrink-0 text-accent-ink" aria-hidden="true" />
                    <span className="min-w-0 flex-1 text-[15px]">{c}</span>
                    <IconButton icon={Trash2} label={`Remover ${c}`} size={34} onClick={() => set('courses', form.courses.filter((_, j) => j !== i))} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-3 text-sm text-ink-600">Nenhum curso cadastrado.</p>
            )}
            <div className="flex gap-2">
              <TextInput value={newCourse} onChange={(e) => setNewCourse(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCourse())} placeholder="Ex.: Primeiros socorros para cães — 8 h" aria-label="Novo curso" />
              <Button variant="secondary" icon={Plus} onClick={addCourse} className="shrink-0">
                Adicionar
              </Button>
            </div>
          </Section>

          <Section title="Fotos">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {form.photos.map((src, i) => (
                <div key={`${src}-${i}`} className="group relative overflow-hidden rounded-2xl">
                  <SmartImage src={src} alt={`Foto ${i + 1}`} className="aspect-[4/3] w-full" />
                  {i === 0 ? <Badge tone="white" size="xs" className="absolute left-2 top-2">Capa</Badge> : null}
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/50 to-transparent p-1.5">
                    <IconButton icon={ArrowUp} label="Mover para antes" size={32} variant="surface" disabled={i === 0} onClick={() => movePhoto(i, -1)} className="disabled:opacity-40" />
                    <IconButton icon={ArrowDown} label="Mover para depois" size={32} variant="surface" disabled={i === form.photos.length - 1} onClick={() => movePhoto(i, 1)} className="disabled:opacity-40" />
                    <IconButton icon={Trash2} label="Remover foto" size={32} variant="surface" onClick={() => set('photos', form.photos.filter((_, j) => j !== i))} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setPhotoPicker(true)} className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-sand-300 text-sm font-semibold text-ink-600 hover:border-ink-600 hover:text-ink-900">
                <ImagePlus size={22} aria-hidden="true" /> Adicionar foto
              </button>
            </div>
          </Section>

          <Section title="Cães que você atende">
            <Field label="Portes" error={errors.sizes}>
              <div className="flex flex-wrap gap-2" role="group">
                {DOG_SIZES.map((s) => (
                  <Chip key={s.id} selected={form.sizes.includes(s.id)} onClick={() => toggleIn('sizes', s.id)}>
                    {s.label} <span className="text-[11px] opacity-70">{s.hint}</span>
                  </Chip>
                ))}
              </div>
            </Field>
            <div className="mt-3 divide-y divide-sand-200">
              <Toggle checked={form.reactiveExperience} onChange={(v) => set('reactiveExperience', v)} label="Experiência com cães reativos" description="Você aparece no filtro de reatividade." />
              <Toggle checked={form.acceptsMuzzle} onChange={(v) => set('acceptsMuzzle', v)} label="Aceito cães com focinheira" />
              <Toggle checked={form.medicationExperience} onChange={(v) => set('medicationExperience', v)} label="Administro medicação" description="Comprimidos, colírios ou outras orientações do veterinário." />
              <Toggle checked={form.puppies} onChange={(v) => set('puppies', v)} label="Atendo filhotes" />
              <Toggle checked={form.seniors} onChange={(v) => set('seniors', v)} label="Atendo cães idosos" />
            </div>
          </Section>

          <Section title="Áreas de atendimento">
            {errors.areas ? <p className="mb-2 text-[13px] font-medium text-danger-600">{errors.areas}</p> : null}
            <div className="flex flex-wrap gap-2">
              {[...new Set([...form.areas, ...NEIGHBORHOODS])].map((n) => (
                <Chip key={n} size="sm" selected={form.areas.includes(n)} onClick={() => toggleIn('areas', n)}>
                  {n}
                </Chip>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <TextInput value={newArea} onChange={(e) => setNewArea(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())} placeholder="Outro bairro" aria-label="Outro bairro" />
              <Button variant="secondary" icon={Plus} onClick={addArea} className="shrink-0">
                Incluir
              </Button>
            </div>
          </Section>

          <Section title="Preços por duração">
            <p className="mb-3 text-sm text-ink-600">Deixe em branco as durações que você não oferece. A plataforma retém 15% de cada passeio.</p>
            {errors.prices ? <p className="mb-2 text-[13px] font-medium text-danger-600">{errors.prices}</p> : null}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {WALK_DURATIONS.map((d) => (
                <Field key={d} label={`${d} min`}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-600">R$</span>
                    <TextInput type="number" inputMode="decimal" min={0} value={form.prices[d]} onChange={(e) => set('prices', { ...form.prices, [d]: e.target.value })} className="pl-10" placeholder="—" />
                  </div>
                </Field>
              ))}
            </div>
          </Section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Disponibilidade</h2>
              <Link to="/dog-walker/agenda" className="text-sm font-semibold text-accent-ink underline-offset-4 hover:underline">
                Editar agenda
              </Link>
            </div>
            <ul className="grid grid-cols-7 gap-1 text-center">
              {weeklySummary.map(({ wd, count }) => (
                <li key={wd} className={`rounded-lg py-2 ${count ? 'bg-accent-soft' : 'bg-cream-100'}`}>
                  <span className="block text-[11px] font-semibold uppercase text-ink-600">{WEEKDAYS_SHORT[wd]}</span>
                  <span className={`block text-sm font-bold ${count ? 'text-accent-ink' : 'text-ink-400'}`}>{count ? `${count}h` : '—'}</span>
                </li>
              ))}
            </ul>
            {!hasAvailability ? <p className="mt-3 flex items-center gap-1.5 text-[13px] text-danger-600"><CalendarDays size={14} /> Nenhum horário semanal definido.</p> : null}
          </Card>

          <Card id="verificacao" className="scroll-mt-28 p-5">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h2 className="font-bold">Verificação</h2>
              <VerifiedBadge walker={walker} showPending />
            </div>
            <p className="mb-4 text-[13px] text-ink-600">O selo “Verificado” só aparece quando identidade e antecedentes estão aprovados.</p>
            <ul className="space-y-3">
              {VERIFICATION_ITEMS.map((item) => {
                const status = walker.verification?.[item.kind] ?? 'not_started';
                return (
                  <li key={item.kind} className="rounded-2xl border border-sand-200 p-3.5">
                    <div className="flex items-start gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${status === 'verified' ? 'bg-success-50 text-success-600' : status === 'pending' ? 'bg-gold-50 text-gold-800' : 'bg-cream-100 text-ink-600'}`}>
                        {status === 'verified' ? <ShieldCheck size={18} /> : status === 'pending' ? <Clock3 size={18} /> : <FileText size={18} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold">{item.title}</p>
                        <p className="text-[13px] text-ink-600">{VERIFICATION_LABEL[status]}</p>
                      </div>
                    </div>
                    {status === 'not_started' ? (
                      <Button variant="secondary" size="sm" fullWidth icon={Upload} className="mt-3" onClick={() => setVerifyKind(item.kind)}>
                        Enviar documentos
                      </Button>
                    ) : status === 'pending' ? (
                      <p className="mt-2 text-[12px] text-ink-600">Documentos recebidos. Em produção, a análise é feita manualmente pela equipe.</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-[12px] leading-relaxed text-ink-600">
              Protótipo: o envio é simulado e nenhum arquivo é transmitido. Consultas de antecedentes dependem de análise jurídica e do consentimento do profissional (LGPD).
            </p>
          </Card>
        </aside>
      </div>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+var(--safe-bottom))] z-[800] border-t border-sand-200 bg-white/95 shadow-bar backdrop-blur-md lg:sticky lg:bottom-4 lg:mt-6 lg:rounded-2xl lg:border">
        <div className="container-page flex items-center justify-between gap-3 py-3 md:px-4">
          <p className="text-[13px] text-ink-600">{dirty ? 'Você tem alterações não salvas.' : 'Tudo salvo.'}</p>
          <div className="flex gap-2">
            {dirty ? (
              <Button variant="ghost" onClick={() => { setForm(toForm(walker)); setErrors({}); }}>
                Descartar
              </Button>
            ) : null}
            <Button icon={Save} onClick={save} disabled={!dirty}>
              Salvar perfil
            </Button>
          </div>
        </div>
      </div>

      <PhotoPicker
        open={photoPicker}
        onClose={() => setPhotoPicker(false)}
        selected={form.photos}
        onAdd={(url) => {
          set('photos', [...form.photos, url]);
          setPhotoPicker(false);
        }}
      />
      <VerificationDialog
        item={VERIFICATION_ITEMS.find((v) => v.kind === verifyKind)}
        onClose={() => setVerifyKind(null)}
        onSubmit={(kind) => {
          actions.submitVerification(kind);
          setVerifyKind(null);
          toast.success('Documentos enviados', 'Status atualizado para “Em análise”.');
        }}
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <Card as="section" className="p-5">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </Card>
  );
}

function PhotoPicker({ open, onClose, selected, onAdd }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const presets = Object.keys(DOG_PHOTOS).map((k) => dogPhoto(k)).filter((src) => !selected.includes(src));
  const addUrl = () => {
    if (!/^https:\/\/\S+$/.test(url.trim())) {
      setError('Informe um endereço de imagem começando com https://');
      return;
    }
    onAdd(url.trim());
    setUrl('');
    setError('');
  };
  return (
    <Modal open={open} onClose={onClose} title="Adicionar foto" description="Escolha uma foto da galeria de demonstração ou informe um endereço de imagem." size="lg">
      <div className="mb-5 flex gap-2">
        <div className="flex-1">
          <TextInput value={url} onChange={(e) => { setUrl(e.target.value); setError(''); }} placeholder="https://…" aria-label="Endereço da imagem" error={error} />
          {error ? <p className="mt-1 text-[13px] text-danger-600">{error}</p> : null}
        </div>
        <Button variant="secondary" onClick={addUrl} className="shrink-0">
          Usar endereço
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {presets.map((src) => (
          <button key={src} type="button" onClick={() => onAdd(src)} className="overflow-hidden rounded-xl ring-accent-ink transition hover:ring-2 focus-visible:ring-2" aria-label="Adicionar esta foto">
            <SmartImage src={src.replace('w=900', 'w=300')} alt="" className="aspect-square w-full" />
          </button>
        ))}
      </div>
    </Modal>
  );
}

function VerificationDialog({ item, onClose, onSubmit }) {
  const [files, setFiles] = useState({});
  useEffect(() => setFiles({}), [item?.kind]);
  if (!item) return null;
  const complete = item.docs.every((d) => files[d]);
  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title={item.title}
      description={item.description}
      footer={
        <Button fullWidth size="lg" icon={Upload} disabled={!complete} onClick={() => onSubmit(item.kind)}>
          Enviar para análise
        </Button>
      }
    >
      <ul className="space-y-2.5">
        {item.docs.map((doc) => (
          <li key={doc}>
            {files[doc] ? (
              <div className="flex items-center gap-3 rounded-2xl border border-success-600/30 bg-success-50 p-3.5">
                <FileText size={20} className="shrink-0 text-success-600" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{doc}</p>
                  <p className="truncate text-[12px] text-ink-600">{files[doc]}</p>
                </div>
                <IconButton icon={X} label={`Remover ${doc}`} size={32} onClick={() => setFiles((f) => ({ ...f, [doc]: undefined }))} />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setFiles((f) => ({ ...f, [doc]: `${doc.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[̀-ͯ]/g, '')}.jpg (simulado)` }))}
                className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-sand-300 p-3.5 text-left hover:border-ink-600"
              >
                <Upload size={20} className="shrink-0 text-ink-600" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{doc}</span>
                  <span className="block text-[12px] text-ink-600">Toque para selecionar (simulado)</span>
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-xl bg-cream-100 p-3 text-[12px] text-ink-600">
        Demonstração: nenhum arquivo é enviado. Em produção, os documentos seriam analisados manualmente, com consentimento explícito e retenção limitada conforme a LGPD.
      </p>
    </Modal>
  );
}
