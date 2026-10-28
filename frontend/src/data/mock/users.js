import { portrait } from './photos';
import { mockWalkers } from './walkers';

/**
 * Prototype accounts. Authentication is simulated: no password is ever stored.
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} avatar
 * @property {('owner'|'walker')[]} roles
 * @property {string|null} walkerProfileId  the account's own walker profile (null for tutor-only accounts)
 * @property {{street:string, neighborhood:string, city:string, coords:{lat:number,lng:number}, notes:string}} address
 * @property {{name:string, relation:string, phone:string}[]} emergencyContacts
 * @property {{whatsappUpdates:boolean, emailReceipts:boolean, shareLiveByDefault:boolean}} settings
 * @property {string} createdAt
 */

/** @type {User[]} */
const baseUsers = [
  {
    id: 'u1',
    name: 'Marina Costa',
    email: 'marina@roledepet.demo',
    phone: '(11) 98765-4321',
    avatar: portrait('women', 65),
    roles: ['owner'],
    walkerProfileId: null,
    address: {
      street: 'Rua Joaquim Távora, 1240 — apto 82',
      neighborhood: 'Vila Mariana',
      city: 'São Paulo, SP',
      coords: { lat: -23.5925, lng: -46.6365 },
      notes: 'Portaria 24 h. Avisar o porteiro Seu Antônio.',
    },
    emergencyContacts: [
      { name: 'Paulo Costa', relation: 'Irmão', phone: '(11) 99812-3344' },
      { name: 'Dra. Helena Siqueira', relation: 'Veterinária', phone: '(11) 3571-2200' },
    ],
    settings: { whatsappUpdates: true, emailReceipts: true, shareLiveByDefault: false },
    createdAt: '2024-04-02',
  },
  {
    id: 'u2',
    name: 'Rafael Tavares',
    email: 'rafael@roledepet.demo',
    phone: '(11) 97654-1122',
    avatar: portrait('men', 41),
    roles: ['owner'],
    walkerProfileId: null,
    address: {
      street: 'Rua Domingos de Morais, 2100',
      neighborhood: 'Vila Mariana',
      city: 'São Paulo, SP',
      coords: { lat: -23.5951, lng: -46.6398 },
      notes: 'Interfone 34.',
    },
    emergencyContacts: [{ name: 'Clara Tavares', relation: 'Esposa', phone: '(11) 97654-8899' }],
    settings: { whatsappUpdates: true, emailReceipts: false, shareLiveByDefault: false },
    createdAt: '2024-09-14',
  },
  {
    id: 'u3',
    name: 'Juliana Akemi',
    email: 'juliana@roledepet.demo',
    phone: '(11) 96543-7788',
    avatar: portrait('women', 21),
    roles: ['owner'],
    walkerProfileId: null,
    address: {
      street: 'Rua Vergueiro, 3150',
      neighborhood: 'Vila Mariana',
      city: 'São Paulo, SP',
      coords: { lat: -23.5868, lng: -46.6352 },
      notes: '',
    },
    emergencyContacts: [{ name: 'Kenji Akemi', relation: 'Pai', phone: '(11) 98877-6655' }],
    settings: { whatsappUpdates: true, emailReceipts: true, shareLiveByDefault: true },
    createdAt: '2025-01-20',
  },
  {
    id: 'u4',
    name: 'Pedro Henrique Lopes',
    email: 'pedro@roledepet.demo',
    phone: '(11) 95432-6677',
    avatar: portrait('men', 67),
    roles: ['owner'],
    walkerProfileId: null,
    address: {
      street: 'Rua Tutóia, 860',
      neighborhood: 'Paraíso',
      city: 'São Paulo, SP',
      coords: { lat: -23.5779, lng: -46.6489 },
      notes: 'Casa com portão verde.',
    },
    emergencyContacts: [{ name: 'Lúcia Lopes', relation: 'Mãe', phone: '(11) 99111-2233' }],
    settings: { whatsappUpdates: false, emailReceipts: true, shareLiveByDefault: false },
    createdAt: '2025-03-08',
  },
  {
    id: 'u5',
    name: 'Lucas Andrade',
    email: 'lucas@roledepet.demo',
    phone: '(11) 94321-5566',
    avatar: portrait('men', 32),
    // Lucas works as a dog walker and can also hire walks for himself (dual account)
    roles: ['walker', 'owner'],
    walkerProfileId: 'w1',
    address: {
      street: 'Rua França Pinto, 400',
      neighborhood: 'Vila Mariana',
      city: 'São Paulo, SP',
      coords: { lat: -23.5889, lng: -46.6338 },
      notes: '',
    },
    emergencyContacts: [],
    settings: { whatsappUpdates: true, emailReceipts: true, shareLiveByDefault: false },
    createdAt: '2021-03-12',
  },
];

const slug = (name) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(' ')
    .filter(Boolean);

/**
 * Every other dog walker also has a login of their own (walker-only accounts),
 * derived from the walker profile so names, photos and neighborhoods stay consistent.
 * Lucas (w1) is the hand-written dual account u5 above.
 * @type {User[]}
 */
const walkerAccounts = mockWalkers
  .filter((w) => w.id !== 'w1')
  .map((w) => {
    const [first, ...rest] = slug(w.name);
    return {
      id: `u-${w.id}`,
      name: w.name,
      email: `${first}.${rest[rest.length - 1]}@roledepet.demo`,
      phone: `(11) 9${8100 + Number(w.id.slice(1)) * 113}-${2000 + Number(w.id.slice(1)) * 347}`,
      avatar: w.avatar,
      roles: ['walker'],
      walkerProfileId: w.id,
      address: { street: '', neighborhood: w.neighborhood, city: w.city, coords: w.coords, notes: '' },
      emergencyContacts: [],
      settings: { whatsappUpdates: true, emailReceipts: true, shareLiveByDefault: false },
      createdAt: w.joinedAt,
    };
  });

/** @type {User[]} */
export const mockUsers = [...baseUsers, ...walkerAccounts];

/** Account that owns a walker profile (used to "sign in as" the walker in demos) */
export const userIdForWalker = (users, walkerId) => users.find((u) => u.walkerProfileId === walkerId)?.id ?? null;

/** Shortcuts on the sign-in screen, grouped by the role the person signs in with */
export const DEMO_ACCOUNTS = [
  { userId: 'u1', role: 'owner', label: 'Tutora', description: 'Marina — 3 pets, com um passeio ao vivo agora' },
  { userId: 'u2', role: 'owner', label: 'Tutor', description: 'Rafael — tutor da Luna e do Bob' },
  { userId: 'u5', role: 'walker', label: 'Dog walker', description: 'Lucas — Vila Mariana · passeio em andamento, solicitações e ganhos' },
  { userId: 'u-w2', role: 'walker', label: 'Dog walker', description: 'Beatriz — Pinheiros · cães pequenos, idosos e com medicação' },
  { userId: 'u-w3', role: 'walker', label: 'Dog walker', description: 'Rafael Moreira — Perdizes · cães grandes e reativos' },
];
