import { newId } from './notificationService';

export class PetError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'PetError';
    this.field = field;
  }
}

export const EMPTY_PET = {
  name: '',
  photo: '',
  breed: '',
  ageYears: '',
  sex: 'macho',
  weightKg: '',
  size: 'medio',
  temperament: 'tranquilo',
  personality: '',
  triggers: '',
  reactivity: 'nenhuma',
  dogInteraction: 'sociavel',
  behaviorNotes: '',
  equipment: { muzzle: 'nao', harness: '', collar: '' },
  health: { conditions: '', medication: '', dosage: '', medicationTimes: '', effortRestrictions: '', maxWalkMinutes: '', vaccination: '' },
  safetyAlert: '',
  emergency: { ownerPhone: '', emergencyName: '', emergencyPhone: '', vetName: '', vetPhone: '' },
};

export const SAFETY_ALERT_MAX = 60;

export function validatePet(pet) {
  const errors = {};
  if (!pet.name?.trim()) errors.name = 'Informe o nome do pet.';
  if (!pet.breed?.trim()) errors.breed = 'Informe a raça (ou "Sem raça definida").';
  if (pet.ageYears === '' || Number(pet.ageYears) < 0 || Number(pet.ageYears) > 30) errors.ageYears = 'Informe uma idade entre 0 e 30 anos.';
  if (pet.weightKg === '' || Number(pet.weightKg) <= 0 || Number(pet.weightKg) > 120) errors.weightKg = 'Informe o peso em kg.';
  if (pet.health?.medication?.trim() && !pet.health?.medicationTimes?.trim()) errors.medicationTimes = 'Informe os horários da medicação.';
  if ((pet.safetyAlert || '').length > SAFETY_ALERT_MAX) errors.safetyAlert = `Use no máximo ${SAFETY_ALERT_MAX} caracteres.`;
  if (!pet.emergency?.ownerPhone?.trim()) errors.ownerPhone = 'Informe um telefone para contato durante o passeio.';
  return errors;
}

function normalizePet(pet) {
  return {
    ...pet,
    name: pet.name.trim(),
    ageYears: Number(pet.ageYears),
    weightKg: Number(pet.weightKg),
    health: { ...pet.health, maxWalkMinutes: pet.health.maxWalkMinutes === '' ? null : Number(pet.health.maxWalkMinutes) },
    safetyAlert: pet.safetyAlert.trim(),
  };
}

export function savePet(state, ownerId, input) {
  const errors = validatePet(input);
  if (Object.keys(errors).length) {
    const err = new PetError('Revise os campos destacados.');
    err.errors = errors;
    throw err;
  }
  const pet = normalizePet(input);
  if (pet.id) {
    return { state: { ...state, pets: state.pets.map((p) => (p.id === pet.id ? { ...p, ...pet } : p)) }, pet };
  }
  const created = { ...pet, id: newId('p'), ownerId };
  return { state: { ...state, pets: [...state.pets, created] }, pet: created };
}

export function deletePet(state, petId) {
  const hasActive = state.bookings.some((b) => b.petId === petId && !['completed', 'reviewed', 'declined', 'expired', 'canceled'].includes(b.status));
  if (hasActive) throw new PetError('Este pet tem passeios em andamento ou agendados. Cancele-os antes de remover.');
  return { ...state, pets: state.pets.filter((p) => p.id !== petId) };
}
