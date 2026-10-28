import { DOG_SIZE_LABEL } from '../../utils/constants';

export const isVerified = (walker) => walker?.verification?.identity === 'verified' && walker?.verification?.background === 'verified';

export const VERIFICATION_LABEL = {
  verified: 'Verificado',
  pending: 'Em análise',
  not_started: 'Não iniciado',
};

/** Skill badges shown on cards/profile, in priority order */
export function walkerBadges(walker) {
  const badges = [];
  if (walker.sizes.includes('grande') || walker.sizes.includes('gigante')) badges.push({ id: 'grandes', label: 'Aceita cães grandes' });
  if (walker.reactiveExperience) badges.push({ id: 'reativos', label: 'Experiência com reativos' });
  if (walker.acceptsMuzzle) badges.push({ id: 'focinheira', label: 'Aceita focinheira' });
  if (walker.medicationExperience) badges.push({ id: 'medicacao', label: 'Administra medicação' });
  if (walker.puppies) badges.push({ id: 'filhotes', label: 'Filhotes' });
  if (walker.seniors) badges.push({ id: 'idosos', label: 'Cães idosos' });
  return badges;
}

export function sizesLabel(walker) {
  return walker.sizes.map((s) => DOG_SIZE_LABEL[s]).join(', ');
}

/** Checks if a walker is a good fit for a pet; returns human-readable warnings */
export function compatibilityWarnings(walker, pet) {
  if (!walker || !pet) return [];
  const warnings = [];
  if (!walker.sizes.includes(pet.size)) warnings.push(`${walker.name.split(' ')[0]} não atende cães de porte ${DOG_SIZE_LABEL[pet.size]?.toLowerCase()}.`);
  if (['moderada', 'alta'].includes(pet.reactivity) && !walker.reactiveExperience) warnings.push('Este profissional não informou experiência com cães reativos.');
  if (pet.equipment?.muzzle !== 'nao' && !walker.acceptsMuzzle) warnings.push('Este profissional não informou que aceita focinheira.');
  if (pet.health?.medication && !walker.medicationExperience) warnings.push('Este profissional não informou experiência com medicação.');
  return warnings;
}
