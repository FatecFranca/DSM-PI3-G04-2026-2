import { mockBookings } from './bookings';
import { mockUsers } from './users';
import { mockPets } from './pets';

/**
 * Reviews are always tied to a finished walk.
 * - In-app walks: `bookingId` points to a booking in `mockBookings`.
 * - Walks completed before the prototype window use `source: 'historico'`
 *   and only keep the reviewer's first name (these feed the walker's aggregate rating).
 *
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} walkerId
 * @property {string|null} bookingId
 * @property {'app'|'historico'} source
 * @property {string} authorName
 * @property {string} authorAvatar
 * @property {string} petName
 * @property {number} rating
 * @property {string} comment
 * @property {number} at
 */

const userById = Object.fromEntries(mockUsers.map((u) => [u.id, u]));
const petById = Object.fromEntries(mockPets.map((p) => [p.id, p]));

const fromBookings = mockBookings
  .filter((b) => b.review)
  .map((b) => ({
    id: `r-${b.id}`,
    walkerId: b.walkerId,
    bookingId: b.id,
    source: 'app',
    authorName: userById[b.ownerId].name,
    authorAvatar: userById[b.ownerId].avatar,
    petName: petById[b.petId].name,
    rating: b.review.rating,
    comment: b.review.comment,
    at: b.review.at,
  }));

const DAY = 86400000;
const now = Date.now();

/** @type {Review[]} */
const historical = [
  { id: 'rh1', walkerId: 'w1', bookingId: null, source: 'historico', authorName: 'Carolina', authorAvatar: '', petName: 'Max', rating: 5, comment: 'Meu labrador puxa muito e o Lucas conduz com uma calma impressionante.', at: now - 21 * DAY },
  { id: 'rh2', walkerId: 'w1', bookingId: null, source: 'historico', authorName: 'Felipe', authorAvatar: '', petName: 'Kira', rating: 5, comment: 'Mandou atualização no meio do passeio e respeitou todas as orientações.', at: now - 34 * DAY },
  { id: 'rh3', walkerId: 'w2', bookingId: null, source: 'historico', authorName: 'Renata', authorAvatar: '', petName: 'Pipoca', rating: 5, comment: 'Beatriz deu o colírio da Pipoca no horário certo. Confiança total.', at: now - 12 * DAY },
  { id: 'rh4', walkerId: 'w2', bookingId: null, source: 'historico', authorName: 'André', authorAvatar: '', petName: 'Lola', rating: 5, comment: 'Muito cuidadosa com a Lola, que tem 14 anos.', at: now - 40 * DAY },
  { id: 'rh5', walkerId: 'w3', bookingId: null, source: 'historico', authorName: 'Marcos', authorAvatar: '', petName: 'Apolo', rating: 5, comment: 'O Apolo é reativo e o Rafael soube exatamente o que fazer. Primeiro passeio sem latidos.', at: now - 15 * DAY },
  { id: 'rh6', walkerId: 'w3', bookingId: null, source: 'historico', authorName: 'Tatiana', authorAvatar: '', petName: 'Brisa', rating: 5, comment: 'Profissional e paciente. Explicou como acostumar a Brisa com a focinheira.', at: now - 29 * DAY },
  { id: 'rh7', walkerId: 'w4', bookingId: null, source: 'historico', authorName: 'Sílvia', authorAvatar: '', petName: 'Mustafá', rating: 5, comment: 'Ideal para o meu pug idoso. Passeio curtinho e na sombra.', at: now - 8 * DAY },
  { id: 'rh8', walkerId: 'w5', bookingId: null, source: 'historico', authorName: 'Gabriel', authorAvatar: '', petName: 'Storm', rating: 5, comment: 'O Storm finalmente dorme a noite toda depois das corridas.', at: now - 11 * DAY },
  { id: 'rh9', walkerId: 'w5', bookingId: null, source: 'historico', authorName: 'Priscila', authorAvatar: '', petName: 'Nala', rating: 4, comment: 'Ótimo, mas a agenda é só de manhã.', at: now - 26 * DAY },
  { id: 'rh10', walkerId: 'w6', bookingId: null, source: 'historico', authorName: 'Vinícius', authorAvatar: '', petName: 'Café', rating: 5, comment: 'A Ana Clara ajudou muito na socialização do nosso filhote.', at: now - 6 * DAY },
  { id: 'rh11', walkerId: 'w6', bookingId: null, source: 'historico', authorName: 'Bianca', authorAvatar: '', petName: 'Tofu', rating: 5, comment: 'Explica tudo o que fez no passeio. Muito didática.', at: now - 19 * DAY },
  { id: 'rh12', walkerId: 'w7', bookingId: null, source: 'historico', authorName: 'Leandro', authorAvatar: '', petName: 'Tyson', rating: 5, comment: 'Ninguém aceitava passear com o Tyson. O Gustavo tirou de letra.', at: now - 9 * DAY },
  { id: 'rh13', walkerId: 'w8', bookingId: null, source: 'historico', authorName: 'Aline', authorAvatar: '', petName: 'Fred', rating: 5, comment: 'Passeio de farejar deixou o Fred muito mais calmo em casa.', at: now - 14 * DAY },
  { id: 'rh14', walkerId: 'w9', bookingId: null, source: 'historico', authorName: 'Cláudio', authorAvatar: '', petName: 'Mike', rating: 4, comment: 'Pontual e simpático. O vídeo no final é um diferencial.', at: now - 22 * DAY },
  { id: 'rh15', walkerId: 'w10', bookingId: null, source: 'historico', authorName: 'Helena', authorAvatar: '', petName: 'Duque', rating: 5, comment: 'Cuidou do Duque, cardiopata, com uma atenção que eu não esperava.', at: now - 5 * DAY },
  { id: 'rh16', walkerId: 'w10', bookingId: null, source: 'historico', authorName: 'Otávio', authorAvatar: '', petName: 'Belinha', rating: 5, comment: 'Anota tudo: horário do remédio, água, xixi. Impecável.', at: now - 31 * DAY },
  { id: 'rh17', walkerId: 'w11', bookingId: null, source: 'historico', authorName: 'Mariana', authorAvatar: '', petName: 'Chico', rating: 5, comment: 'Os exercícios de foco fizeram diferença no Chico.', at: now - 17 * DAY },
  { id: 'rh18', walkerId: 'w12', bookingId: null, source: 'historico', authorName: 'Eduardo', authorAvatar: '', petName: 'Maya', rating: 5, comment: 'Rotina certinha três vezes por semana. Muito confiável.', at: now - 10 * DAY },
  { id: 'rh19', walkerId: 'w13', bookingId: null, source: 'historico', authorName: 'Rogério', authorAvatar: '', petName: 'Kaiser', rating: 5, comment: 'Conduz o Kaiser, de 52 kg, com total controle.', at: now - 13 * DAY },
  { id: 'rh20', walkerId: 'w14', bookingId: null, source: 'historico', authorName: 'Débora', authorAvatar: '', petName: 'Gordo', rating: 5, comment: 'Sabe tudo de frenchie. Passeio fresquinho e sem estresse.', at: now - 7 * DAY },
  { id: 'rh21', walkerId: 'w15', bookingId: null, source: 'historico', authorName: 'Simone', authorAvatar: '', petName: 'Rex', rating: 5, comment: 'Preço justo e muito atencioso.', at: now - 20 * DAY },
  { id: 'rh22', walkerId: 'w16', bookingId: null, source: 'historico', authorName: 'Fábio', authorAvatar: '', petName: 'Pretinha', rating: 5, comment: 'A Pretinha é muito medrosa e confiou na Isabela logo no segundo passeio.', at: now - 4 * DAY },
];

/** @type {Review[]} */
export const mockReviews = [...fromBookings, ...historical].sort((a, b) => b.at - a.at);
