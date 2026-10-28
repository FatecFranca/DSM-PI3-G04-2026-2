/**
 * Representations only — the prototype never collects real card numbers.
 *
 * @typedef {Object} PaymentMethod
 * @property {string} id
 * @property {string} userId
 * @property {'card'|'pix'} type
 * @property {string} label       e.g. "Visa final 4242"
 * @property {string} brand
 * @property {boolean} isDefault
 */

/** @type {PaymentMethod[]} */
export const mockPaymentMethods = [
  { id: 'pm1', userId: 'u1', type: 'card', brand: 'Visa', label: 'Visa final 4242', isDefault: true },
  { id: 'pm2', userId: 'u1', type: 'pix', brand: 'Pix', label: 'Pix — chave e-mail', isDefault: false },
  { id: 'pm3', userId: 'u2', type: 'card', brand: 'Mastercard', label: 'Mastercard final 8810', isDefault: true },
  { id: 'pm4', userId: 'u3', type: 'pix', brand: 'Pix', label: 'Pix — chave celular', isDefault: true },
  { id: 'pm5', userId: 'u4', type: 'card', brand: 'Elo', label: 'Elo final 1203', isDefault: true },
];
