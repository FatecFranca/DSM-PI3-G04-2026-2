/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'owner'|'walker'} audience
 * @property {string} userId     owner user id (audience owner) or walker id (audience walker)
 * @property {string} title
 * @property {string} body
 * @property {string|null} link
 * @property {'booking'|'message'|'payment'|'tracking'|'system'} kind
 * @property {boolean} read
 * @property {number} at
 */

const MIN = 60000;
const now = Date.now();

/** @type {Notification[]} */
export const mockNotifications = [
  { id: 'n1', audience: 'owner', userId: 'u1', kind: 'tracking', title: 'Passeio iniciado', body: 'Lucas iniciou o passeio com o Thor.', link: '/tutor/acompanhar/b1', read: false, at: now - 20 * MIN },
  { id: 'n2', audience: 'owner', userId: 'u1', kind: 'booking', title: 'Solicitação aceita', body: 'Rafael aceitou o passeio da Mel. Confirme o pagamento para garantir o horário.', link: '/tutor/passeios/b2', read: false, at: now - 18 * 60 * MIN },
  { id: 'n3', audience: 'owner', userId: 'u1', kind: 'booking', title: 'Avalie o passeio de ontem', body: 'Como foi o passeio do Thor com Lucas?', link: '/tutor/passeios/b5', read: true, at: now - 20 * 60 * MIN },
  { id: 'n4', audience: 'walker', userId: 'w1', kind: 'booking', title: 'Nova solicitação', body: 'Pedro solicitou um passeio de 60 min para o Zeus amanhã às 07:00.', link: '/dog-walker/solicitacoes/b13', read: false, at: now - 95 * MIN },
  { id: 'n5', audience: 'walker', userId: 'w1', kind: 'booking', title: 'Nova solicitação', body: 'Juliana solicitou um passeio de 30 min para a Nina.', link: '/dog-walker/solicitacoes/b14', read: false, at: now - 4 * 60 * MIN },
  { id: 'n6', audience: 'walker', userId: 'w1', kind: 'payment', title: 'Passeio fechado — 50% liberado', body: 'Rafael pagou o passeio da Luna de hoje. Metade já foi liberada; o restante quando você finalizar o passeio.', link: '/dog-walker/hoje', read: true, at: now - 26 * 60 * MIN },
];
