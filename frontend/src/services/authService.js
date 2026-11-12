import { api } from '../api';
import { newId } from './notificationService';
import { CITY_DEFAULT } from '../utils/constants';

// Autenticação real via API Spring (POST /auth/login e /auth/cadastro).
// O backend valida e-mail/senha contra hash BCrypt; a senha nunca é
// armazenada neste navegador. Erros da API viram AuthError com a mensagem
// em pt-BR vinda do servidor.
//
// Ainda é protótipo: os dados de walkers/pets/bookings continuam locais
// (Fases 3–4 trocam isso), então o perfil de dog walker criado no cadastro
// também nasce local (via buildWalkerProfile).

export class AuthError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'AuthError';
    this.field = field;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Senha única das contas de demonstração (definida no seed do backend). */
export const DEMO_PASSWORD = 'senha123';

export function validateCredentials({ email, password }) {
  if (!EMAIL_RE.test(String(email).trim())) throw new AuthError('Informe um e-mail válido.', 'email');
  if (!password || password.length < 6) throw new AuthError('A senha precisa ter pelo menos 6 caracteres.', 'password');
}

const primeiroErroDaResposta = (body, fallback) => {
  if (body && typeof body === 'object') {
    if (typeof body.message === 'string') return body.message;
    const values = Object.values(body).flat();
    if (values.length && typeof values[0] === 'string') return values[0];
  }
  return fallback;
};

const traduzErro = (error, fallback) => {
  if (error?.response) {
    throw new AuthError(primeiroErroDaResposta(error.response.data, fallback), 'email');
  }
  throw new AuthError(
    'Não foi possível conectar à API (http://localhost:8888). Verifique se o backend está no ar.',
    'email',
  );
};

/** Completa campos que o front espera e o backend pode trazer vazios em contas novas. */
export function normalizarUsuario(user) {
  if (!user) return user;
  return {
    ...user,
    roles: user.roles ?? ['owner'],
    favorites: user.favorites ?? [],
    address: user.address?.city
      ? user.address
      : { street: '', neighborhood: '', city: CITY_DEFAULT, coords: { lat: -23.5925, lng: -46.6365 }, notes: '' },
    emergencyContacts: user.emergencyContacts ?? [],
    settings: user.settings ?? { whatsappUpdates: true, emailReceipts: true, shareLiveByDefault: false },
  };
}

export async function signIn(_state, { email, password }) {
  validateCredentials({ email, password });
  try {
    const { data } = await api.post('/auth/login', { email: email.trim(), senha: password });
    return normalizarUsuario(data.user);
  } catch (error) {
    traduzErro(error, 'Não foi possível entrar.');
  }
}

/** Atalho das telas de demonstração: login real com a senha demo compartilhada. */
export function signInWithDemoPassword(email) {
  return signIn(null, { email, password: DEMO_PASSWORD });
}

export async function signUp(_state, { name, email, password }) {
  if (!name || name.trim().length < 3) throw new AuthError('Informe seu nome completo.', 'name');
  validateCredentials({ email, password });
  try {
    const { data } = await api.post('/auth/cadastro', { name: name.trim(), email: email.trim(), password });
    return normalizarUsuario(data.user);
  } catch (error) {
    if (error?.response?.status === 409) {
      throw new AuthError('Já existe uma conta com este e-mail. Entre com ela.', 'email');
    }
    traduzErro(error, 'Não foi possível criar a conta.');
  }
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
