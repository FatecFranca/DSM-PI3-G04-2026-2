import { AlertTriangle, Pill, ShieldAlert, HeartPulse, Dog, Phone, Stethoscope } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import Badge from '../common/Badge';
import { DOG_SIZE_LABEL, REACTIVITY_LABEL, DOG_SOCIABILITY_LABEL, TEMPERAMENT_LABEL } from '../../utils/constants';

const MUZZLE_LABEL = { nao: 'Não usa', sempre: 'Obrigatória durante todo o passeio', perto_de_caes: 'Usar perto de outros cães' };

/** The short, high-visibility safety alert. Renders nothing if empty. */
export function SafetyAlert({ pet, size = 'md', className = '' }) {
  if (!pet?.safetyAlert) return null;
  const big = size === 'lg';
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-2xl border-2 border-danger-600 bg-danger-50 ${big ? 'p-4' : 'p-3'} ${className}`}>
      <AlertTriangle size={big ? 26 : 20} className="mt-0.5 shrink-0 text-danger-600" aria-hidden="true" />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-danger-600">Alerta de segurança</p>
        <p className={`font-bold text-ink-900 ${big ? 'text-lg leading-snug' : 'text-[15px]'}`}>{pet.safetyAlert}</p>
      </div>
    </div>
  );
}

/**
 * Full pet briefing shown to walkers before accepting and during the walk.
 * `variant="summary"` shows only the essentials.
 */
export default function PetSafetyCard({ pet, variant = 'full', className = '' }) {
  if (!pet) return null;
  const hasMedication = Boolean(pet.health?.medication);
  const reactive = pet.reactivity && pet.reactivity !== 'nenhuma';
  return (
    <section className={`rounded-3xl border border-sand-200 bg-white ${className}`} aria-label={`Perfil de segurança de ${pet.name}`}>
      <div className="flex items-center gap-3.5 p-4">
        <SmartImage src={pet.photo} alt={pet.name} className="h-16 w-16 rounded-2xl" rounded="rounded-2xl" />
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-ink-900">{pet.name}</h3>
          <p className="text-sm text-ink-600">
            {pet.breed} · {pet.ageYears} {pet.ageYears === 1 ? 'ano' : 'anos'} · {pet.weightKg} kg · {DOG_SIZE_LABEL[pet.size]}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge size="xs">{TEMPERAMENT_LABEL[pet.temperament] ?? pet.temperament}</Badge>
            {reactive ? <Badge size="xs" tone="danger">Reatividade {pet.reactivity}</Badge> : null}
            {pet.equipment?.muzzle !== 'nao' ? <Badge size="xs" tone="warning">Focinheira</Badge> : null}
            {hasMedication ? <Badge size="xs" tone="info">Medicação</Badge> : null}
          </div>
        </div>
      </div>
      <SafetyAlert pet={pet} className="mx-4 mb-4" />
      {variant === 'full' ? (
        <dl className="grid gap-px overflow-hidden rounded-b-3xl border-t border-sand-200 bg-sand-200 sm:grid-cols-2">
          <Block icon={Dog} title="Comportamento">
            <Item label="Personalidade">{pet.personality}</Item>
            <Item label="Gatilhos">{pet.triggers}</Item>
            <Item label="Reatividade">{REACTIVITY_LABEL[pet.reactivity]}</Item>
            <Item label="Com outros cães">{DOG_SOCIABILITY_LABEL[pet.dogInteraction]}</Item>
            <Item label="Observações">{pet.behaviorNotes}</Item>
          </Block>
          <Block icon={ShieldAlert} title="Equipamentos">
            <Item label="Focinheira">{MUZZLE_LABEL[pet.equipment?.muzzle]}</Item>
            <Item label="Peitoral">{pet.equipment?.harness}</Item>
            <Item label="Coleira">{pet.equipment?.collar}</Item>
          </Block>
          <Block icon={HeartPulse} title="Saúde">
            <Item label="Condições">{pet.health?.conditions}</Item>
            {hasMedication ? (
              <Item label="Medicação" highlight>
                <span className="inline-flex items-center gap-1">
                  <Pill size={14} aria-hidden="true" /> {pet.health.medication} — {pet.health.dosage} às {pet.health.medicationTimes}
                </span>
              </Item>
            ) : null}
            <Item label="Restrições de esforço">{pet.health?.effortRestrictions}</Item>
            <Item label="Tempo máximo de caminhada">{pet.health?.maxWalkMinutes ? `${pet.health.maxWalkMinutes} min` : ''}</Item>
            <Item label="Vacinação">{pet.health?.vaccination}</Item>
          </Block>
          <Block icon={Phone} title="Emergência">
            <Item label="Tutor">{pet.emergency?.ownerPhone}</Item>
            <Item label="Contato de emergência">{pet.emergency?.emergencyName ? `${pet.emergency.emergencyName} · ${pet.emergency.emergencyPhone}` : ''}</Item>
            <Item label="Veterinário">
              {pet.emergency?.vetName ? (
                <span className="inline-flex items-center gap-1">
                  <Stethoscope size={14} aria-hidden="true" /> {pet.emergency.vetName} · {pet.emergency.vetPhone}
                </span>
              ) : (
                ''
              )}
            </Item>
          </Block>
        </dl>
      ) : null}
    </section>
  );
}

function Block({ icon: Icon, title, children }) {
  return (
    <div className="bg-white p-4">
      <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-900">
        <Icon size={16} className="text-accent-ink" aria-hidden="true" /> {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Item({ label, children, highlight }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-[12px] text-ink-600">{label}</dt>
      <dd className={`text-sm ${highlight ? 'font-semibold text-info-600' : 'text-ink-900'}`}>{children}</dd>
    </div>
  );
}
