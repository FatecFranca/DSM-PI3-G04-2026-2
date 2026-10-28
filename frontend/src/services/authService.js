import { newId } from './notificationService';
import { CITY_DEFAULT } from '../utils/constants';

// Simulated authentication. Passwords are validated for format only and are
// NEVER stored — not in memory beyond the form, not in localStorage.
// Replace with a real identity provider (e.g. OAuth / magic link) in production.

export class AuthError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'AuthError';
    this.field = field;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials({ email, password }) {
  if (!EMAIL_RE.test(String(email).trim())) throw new AuthError('Informe um e-mail válido.', 'email');
  if (!password || password.length < 6) throw new AuthError('A senha precisa ter pelo menos 6 caracteres.', 'password');
}

export function signIn(state, { email, password }) {
  validateCredentials({ email, password });
  const user = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) throw new AuthError('Não encontramos uma conta com este e-mail. Use uma conta demonstrativa ou cadastre-se.', 'email');
  return user;
}

/** New, unverified and unlisted walker profile (onboarding) */
export function buildWalkerProfile(name) {
  return {
    id: newId('w'),
    name: name.trim(),
    avatar: '',
    photos: [],
    neighborhood: 'Vila Mariana',
    city: CITY_DEFAULT,
    coords: { lat: -23.5889, lng: -46.6338 },
    rating: 0,
    reviewsCount: 0,
    walksCount: 0,
    yearsExperience: 0,
    verification: { identity: 'not_started', background: 'not_started' },
    headline: 'Novo dog walker no Rolê de Pet',
    bio: '',
    courses: [],
    sizes: ['pequeno', 'medio'],
    reactiveExperience: false,
    acceptsMuzzle: false,
    medicationExperience: false,
    puppies: false,
    seniors: false,
    areas: ['Vila Mariana'],
    prices: { 30: 30, 45: 40, 60: 50 },
    availability: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: [] },
    blockedSlots: {},
    maxDogsPerWalk: 1,
    responseTime: 'Novo na plataforma',
    joinedAt: new Date().toISOString().slice(0, 10),
    unlisted: true, // hidden from search until the profile is complete
  };
}

/** Creates the account; a walker sign-up also creates an unverified walker profile */
export function signUp(state, { name, email, password, role }) {
  if (!name || name.trim().length < 3) throw new AuthError('Informe seu nome completo.', 'name');
  validateCredentials({ email, password });
  if (state.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    throw new AuthError('Já existe uma conta com este e-mail. Entre com ela.', 'email');
  }
  const userId = newId('u');
  const walkerProfile = role === 'walker' ? buildWalkerProfile(name) : null;
  const user = {
    id: userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: '',
    avatar: '',
    roles: role === 'walker' ? ['walker', 'owner'] : ['owner'],
    walkerProfileId: walkerProfile?.id ?? null,
    address: { street: '', neighborhood: '', city: CITY_DEFAULT, coords: { lat: -23.5925, lng: -46.6365 }, notes: '' },
    emergencyContacts: [],
    settings: { whatsappUpdates: true, emailReceipts: true, shareLiveByDefault: false },
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const next = {
    ...state,
    users: [...state.users, user],
    walkers: walkerProfile ? [...state.walkers, walkerProfile] : state.walkers,
    favorites: { ...state.favorites, [userId]: [] },
  };
  return { state: next, user };
}
