import { useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, IdCard, Brain, ShieldAlert, HeartPulse, Phone, Sparkles, SearchX, Upload, Trash2 } from 'lucide-react';
import { PageTitle, Card } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import SmartImage from '../../components/common/SmartImage';
import EmptyState from '../../components/feedback/EmptyState';
import Field, { TextInput, TextArea, Select, Chip } from '../../components/forms/Field';
import { useActions, useData } from '../../context/AppStore';
import { useCurrentUser } from '../../hooks/useAccount';
import { useToast } from '../../components/feedback/Toast';
import { EMPTY_PET, SAFETY_ALERT_MAX } from '../../services/petService';
import { dogPhoto } from '../../data/mock/photos';
import { DOG_SIZES, TEMPERAMENTS, REACTIVITY_LEVELS, DOG_SOCIABILITY } from '../../utils/constants';
import { ACCEPTED_IMAGE_TYPES, isUploadedPhoto, prepareUploadedPhoto } from '../../utils/imageUpload';

const PHOTO_PRESETS = ['golden', 'labrador', 'mixed', 'beagle', 'corgi', 'shihtzu', 'frenchie', 'pug', 'husky', 'poodle', 'border', 'pitbull'].map((k) => dogPhoto(k, 400));
const ALERT_EXAMPLES = ['Focinheira obrigatória.', 'Reativo com cães machos.', 'Medicação às 12h.'];
const MUZZLE_OPTIONS = [
  { value: 'nao', label: 'Não usa focinheira' },
  { value: 'perto_de_caes', label: 'Usar perto de outros cães' },
  { value: 'sempre', label: 'Obrigatória durante todo o passeio' },
];

export default function PetFormPage() {
  const { petId } = useParams();
  const [params] = useSearchParams();
  const data = useData();
  const user = useCurrentUser();
  const actions = useActions();
  const toast = useToast();
  const navigate = useNavigate();
  const existing = petId ? data.pets.find((p) => p.id === petId && p.ownerId === user?.id) : null;
  const welcome = params.get('boas-vindas') === '1';
  const back = params.get('voltar');

  const [pet, setPet] = useState(() => {
    if (existing) return structuredClone({ ...existing, health: { ...existing.health, maxWalkMinutes: existing.health?.maxWalkMinutes ?? '' } });
    const base = structuredClone(EMPTY_PET);
    base.photo = PHOTO_PRESETS[0];
    base.emergency.ownerPhone = user?.phone ?? '';
    const contact = user?.emergencyContacts?.[0];
    if (contact) {
      base.emergency.emergencyName = contact.name;
      base.emergency.emergencyPhone = contact.phone;
    }
    return base;
  });
  const [errors, setErrors] = useState({});
  const [photoError, setPhotoError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);

  if (petId && !existing) {
    return (
      <div className="mx-auto max-w-xl">
        <PageTitle title="Editar pet" back="/tutor/pets" />
        <EmptyState icon={SearchX} title="Pet não encontrado" action={<Button to="/tutor/pets">Ver meus pets</Button>} />
      </div>
    );
  }

  const set = (path, value) => {
    setPet((current) => {
      const next = { ...current };
      const keys = path.split('.');
      if (keys.length === 2) next[keys[0]] = { ...current[keys[0]], [keys[1]]: value };
      else next[path] = value;
      return next;
    });
    const key = path.split('.').pop();
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const bind = (path) => {
    const [a, b] = path.split('.');
    return { value: (b ? pet[a]?.[b] : pet[a]) ?? '', onChange: (e) => set(path, e.target.value) };
  };

  const onPhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file) return;
    setPhotoError('');
    setUploading(true);
    try {
      set('photo', await prepareUploadedPhoto(file));
    } catch (error) {
      setPhotoError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    try {
      const saved = actions.savePet(pet);
      toast.success(existing ? 'Perfil atualizado' : `${saved.name} foi cadastrado`);
      navigate(back || `/tutor/pets/${saved.id}`, { replace: true });
    } catch (error) {
      setErrors(error.errors || {});
      toast.error('Revise o formulário', error.message);
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-3xl">
      <PageTitle title={existing ? `Editar ${existing.name}` : 'Novo pet'} subtitle="Campos com * são obrigatórios. Quanto mais completo, mais seguro o passeio." back={existing ? `/tutor/pets/${existing.id}` : back || '/tutor/pets'} />

      {welcome ? (
        <div className="mb-5 flex gap-3 rounded-3xl bg-wine-500 p-5 text-white">
          <Sparkles size={22} className="shrink-0 text-gold-400" aria-hidden="true" />
          <div>
            <p className="font-bold">Conta criada. Agora, conte sobre seu cão.</p>
            <p className="mt-1 text-sm text-white/85">O perfil do pet é enviado ao dog walker junto com cada solicitação.</p>
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        <Section icon={IdCard} title="Identificação">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl focus-visible:outline-offset-4"
              aria-label="Enviar foto do pet"
            >
              <SmartImage src={pet.photo} alt={pet.name || 'Foto do pet'} className="h-full w-full" rounded="rounded-3xl" />
              <span className="absolute inset-0 flex items-center justify-center bg-ink-900/0 text-white opacity-0 transition group-hover:bg-ink-900/40 group-hover:opacity-100">
                <Upload size={22} aria-hidden="true" />
              </span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Foto</p>
              <p className="mb-3 text-[13px] text-ink-600">Envie uma foto do seu pet. Ela aparece para o dog walker na solicitação e durante o passeio.</p>
              <input ref={fileInput} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={onPhotoSelected} className="sr-only" tabIndex={-1} aria-hidden="true" />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" icon={Upload} loading={uploading} onClick={() => fileInput.current?.click()}>
                  {isUploadedPhoto(pet.photo) ? 'Trocar foto' : 'Enviar foto'}
                </Button>
                {isUploadedPhoto(pet.photo) ? (
                  <Button variant="ghost" icon={Trash2} onClick={() => set('photo', PHOTO_PRESETS[0])}>
                    Remover
                  </Button>
                ) : null}
                <span className="text-[12px] text-ink-600">JPG, PNG ou WebP · até 10 MB</span>
              </div>
              {photoError ? (
                <p role="alert" className="mt-2 flex items-center gap-1 text-[13px] font-medium text-danger-600">
                  <AlertTriangle size={14} aria-hidden="true" /> {photoError}
                </p>
              ) : null}
              <p className="mb-2 mt-4 text-[13px] font-medium text-ink-600">Ou escolha uma foto de exemplo</p>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="radiogroup" aria-label="Fotos de exemplo">
                {PHOTO_PRESETS.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    role="radio"
                    aria-checked={pet.photo === src}
                    aria-label={`Foto de exemplo ${i + 1}`}
                    onClick={() => set('photo', src)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 transition ${pet.photo === src ? 'ring-accent-ink' : 'ring-transparent hover:ring-sand-300'}`}
                  >
                    <SmartImage src={src} alt="" className="h-full w-full" />
                    {pet.photo === src ? <Check size={16} className="absolute right-1 top-1 rounded-full bg-accent p-0.5 text-on-accent" /> : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" required error={errors.name}><TextInput {...bind('name')} autoComplete="off" /></Field>
            <Field label="Raça" required error={errors.breed}><TextInput {...bind('breed')} placeholder="Ex.: Sem raça definida" /></Field>
            <Field label="Idade (anos)" required error={errors.ageYears}><TextInput type="number" inputMode="numeric" min="0" max="30" {...bind('ageYears')} /></Field>
            <Field label="Peso (kg)" required error={errors.weightKg}><TextInput type="number" inputMode="decimal" min="0" step="0.5" {...bind('weightKg')} /></Field>
            <Field label="Sexo"><Select {...bind('sex')} options={[{ value: 'macho', label: 'Macho' }, { value: 'femea', label: 'Fêmea' }]} /></Field>
            <Field label="Porte"><Select {...bind('size')} options={DOG_SIZES.map((s) => ({ value: s.id, label: `${s.label} (${s.hint})` }))} /></Field>
          </div>
        </Section>

        <Section icon={Brain} title="Comportamento">
          <Field label="Temperamento">
            <div className="flex flex-wrap gap-2">
              {TEMPERAMENTS.map((t) => (
                <Chip key={t.id} selected={pet.temperament === t.id} onClick={() => set('temperament', t.id)}>{t.label}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Personalidade"><TextArea {...bind('personality')} placeholder="Como ele é no dia a dia?" /></Field>
          <Field label="Gatilhos comportamentais" hint="O que deixa seu cão agitado, com medo ou reativo."><TextArea {...bind('triggers')} rows={2} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reatividade"><Select {...bind('reactivity')} options={REACTIVITY_LEVELS.map((r) => ({ value: r.id, label: r.label }))} /></Field>
            <Field label="Interação com outros cães"><Select {...bind('dogInteraction')} options={DOG_SOCIABILITY.map((s) => ({ value: s.id, label: s.label }))} /></Field>
          </div>
          <Field label="Observações importantes"><TextArea {...bind('behaviorNotes')} rows={2} placeholder="Ex.: tenta comer coisas do chão" /></Field>
        </Section>

        <Section icon={ShieldAlert} title="Equipamentos">
          <Field label="Focinheira"><Select {...bind('equipment.muzzle')} options={MUZZLE_OPTIONS} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Peitoral"><TextInput {...bind('equipment.harness')} placeholder="Ex.: anti-puxão, em H" /></Field>
            <Field label="Coleira"><TextInput {...bind('equipment.collar')} placeholder="Ex.: com plaquinha de identificação" /></Field>
          </div>
        </Section>

        <Section icon={HeartPulse} title="Saúde">
          <Field label="Condições relevantes"><TextArea {...bind('health.conditions')} rows={2} placeholder="Doenças, alergias, cirurgias recentes" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Medicação" optional><TextInput {...bind('health.medication')} /></Field>
            <Field label="Dosagem" optional><TextInput {...bind('health.dosage')} /></Field>
            <Field label="Horários" error={errors.medicationTimes} required={Boolean(pet.health.medication)}><TextInput {...bind('health.medicationTimes')} placeholder="Ex.: 12h" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Restrições de esforço"><TextInput {...bind('health.effortRestrictions')} placeholder="Ex.: sem corrida" /></Field>
            <Field label="Tempo máximo de caminhada (min)" hint="Solicitações acima disso são bloqueadas."><TextInput type="number" inputMode="numeric" min="10" step="5" {...bind('health.maxWalkMinutes')} /></Field>
          </div>
          <Field label="Vacinação"><TextInput {...bind('health.vaccination')} placeholder="Ex.: V10 e antirrábica em dia (março/2026)" /></Field>
        </Section>

        <Card className="border-2 border-danger-600/60 bg-danger-50 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-danger-600">
            <AlertTriangle size={20} aria-hidden="true" /> Alerta de segurança
          </h2>
          <p className="mt-1 text-sm text-ink-900">Uma frase curta e crítica. Aparece em destaque para o dog walker antes de aceitar e durante todo o passeio.</p>
          <Field error={errors.safetyAlert} className="mt-3">
            <TextInput {...bind('safetyAlert')} maxLength={SAFETY_ALERT_MAX + 10} placeholder="Ex.: Focinheira obrigatória." aria-label="Alerta de segurança" className="font-semibold" />
          </Field>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {ALERT_EXAMPLES.map((ex) => (
                <Chip key={ex} size="sm" selected={false} onClick={() => set('safetyAlert', ex)}>{ex}</Chip>
              ))}
            </div>
            <span className={`text-[13px] font-medium ${pet.safetyAlert.length > SAFETY_ALERT_MAX ? 'text-danger-600' : 'text-ink-600'}`}>
              {pet.safetyAlert.length}/{SAFETY_ALERT_MAX}
            </span>
          </div>
        </Card>

        <Section icon={Phone} title="Informações de emergência">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefone do tutor" required error={errors.ownerPhone}><TextInput type="tel" inputMode="tel" {...bind('emergency.ownerPhone')} placeholder="(11) 90000-0000" /></Field>
            <Field label="Contato de emergência"><TextInput {...bind('emergency.emergencyName')} placeholder="Nome e relação" /></Field>
            <Field label="Telefone de emergência"><TextInput type="tel" inputMode="tel" {...bind('emergency.emergencyPhone')} /></Field>
            <Field label="Veterinário de referência"><TextInput {...bind('emergency.vetName')} placeholder="Clínica ou profissional" /></Field>
            <Field label="Telefone do veterinário"><TextInput type="tel" inputMode="tel" {...bind('emergency.vetPhone')} /></Field>
          </div>
        </Section>
      </div>

      <div className="mt-8 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none">{existing ? 'Salvar alterações' : 'Cadastrar pet'}</Button>
      </div>
    </form>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <Icon size={20} className="text-accent-ink" aria-hidden="true" /> {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}
