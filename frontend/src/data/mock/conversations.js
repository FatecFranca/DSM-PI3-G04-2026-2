/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {'owner'|'walker'|'system'} from
 * @property {string} text
 * @property {number} at
 *
 * @typedef {Object} Conversation
 * @property {string} id
 * @property {string} ownerId
 * @property {string} walkerId
 * @property {string|null} bookingId   most recent related booking
 * @property {Message[]} messages
 * @property {{owner:number, walker:number}} unread
 */

const MIN = 60000;
const now = Date.now();

/** @type {Conversation[]} */
export const mockConversations = [
  {
    id: 'c1',
    ownerId: 'u1',
    walkerId: 'w1',
    bookingId: 'b1',
    messages: [
      { id: 'm1', from: 'owner', text: 'Oi, Lucas! O Thor está pronto, a guia fica pendurada atrás da porta.', at: now - 75 * MIN },
      { id: 'm2', from: 'walker', text: 'Perfeito, Marina. Chego em 10 minutos.', at: now - 70 * MIN },
      { id: 'm3', from: 'walker', text: 'Retirada confirmada com o código. Seguindo para o Ibirapuera.', at: now - 25 * MIN },
      { id: 'm4', from: 'walker', text: 'Ele já bebeu água e está ótimo. Vou dar a volta no lago.', at: now - 8 * MIN },
    ],
    unread: { owner: 1, walker: 0 },
  },
  {
    id: 'c2',
    ownerId: 'u1',
    walkerId: 'w3',
    bookingId: 'b2',
    messages: [
      { id: 'm5', from: 'walker', text: 'Olá, Marina. Li o perfil da Mel: vou usar a rota pela Rua Sena Madureira, que tem menos cães de manhã.', at: now - 20 * 60 * MIN },
      { id: 'm6', from: 'owner', text: 'Ótimo! Ela fica mais tranquila quando ganha petisco ao olhar para quem conduz.', at: now - 19 * 60 * MIN },
      { id: 'm7', from: 'walker', text: 'Combinado. Aceitei a solicitação — assim que o pagamento for confirmado, fica tudo certo.', at: now - 18 * 60 * MIN },
    ],
    unread: { owner: 0, walker: 0 },
  },
  {
    id: 'c3',
    ownerId: 'u1',
    walkerId: 'w4',
    bookingId: 'b7',
    messages: [
      { id: 'm8', from: 'walker', text: 'O Bidu tomou o remédio às 12h05, depois do passeio. Comeu bem.', at: now - 6 * 24 * 60 * MIN },
      { id: 'm9', from: 'owner', text: 'Muito obrigada, Camila!', at: now - 6 * 24 * 60 * MIN + 30 * MIN },
    ],
    unread: { owner: 0, walker: 0 },
  },
  {
    id: 'c4',
    ownerId: 'u2',
    walkerId: 'w1',
    bookingId: 'b11',
    messages: [
      { id: 'm10', from: 'owner', text: 'Lucas, hoje a Luna vai estar com a vizinha do 34, tudo bem?', at: now - 3 * 60 * MIN },
      { id: 'm11', from: 'owner', text: 'Ela já sabe que você vai às 16h.', at: now - 3 * 60 * MIN + 2 * MIN },
    ],
    unread: { owner: 0, walker: 2 },
  },
  {
    id: 'c5',
    ownerId: 'u4',
    walkerId: 'w1',
    bookingId: 'b13',
    messages: [
      { id: 'm12', from: 'owner', text: 'Oi, Lucas. Enviei a solicitação para o Zeus amanhã. Ele usa focinheira o tempo todo, beleza?', at: now - 90 * MIN },
    ],
    unread: { owner: 0, walker: 1 },
  },
  {
    id: 'c6',
    ownerId: 'u3',
    walkerId: 'w1',
    bookingId: 'b12',
    messages: [
      { id: 'm13', from: 'walker', text: 'Oi, Juliana! Aceitei o passeio do Paçoca hoje às 18h.', at: now - 5 * 60 * MIN },
      { id: 'm14', from: 'owner', text: 'Obrigada! Vou fazer o pagamento daqui a pouco.', at: now - 4 * 60 * MIN },
    ],
    unread: { owner: 0, walker: 0 },
  },
];
