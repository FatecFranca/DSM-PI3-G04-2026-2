import { newId, notify } from './notificationService';

// Simulated chat. A real implementation would use a realtime channel (WebSocket).

export function findOrCreateConversation(state, { ownerId, walkerId, bookingId = null }) {
  const existing = state.conversations.find((c) => c.ownerId === ownerId && c.walkerId === walkerId);
  if (existing) return { state, conversation: existing };
  const conversation = { id: newId('c'), ownerId, walkerId, bookingId, messages: [], unread: { owner: 0, walker: 0 } };
  return { state: { ...state, conversations: [conversation, ...state.conversations] }, conversation };
}

/** `from` is the sender side: 'owner' | 'walker' */
export function sendMessage(state, { conversationId, from, text }) {
  const body = text.trim();
  if (!body) return { state };
  const other = from === 'owner' ? 'walker' : 'owner';
  const message = { id: newId('m'), from, text: body.slice(0, 1000), at: Date.now() };
  const conversation = state.conversations.find((c) => c.id === conversationId);
  if (!conversation) return { state };
  const updated = {
    ...conversation,
    messages: [...conversation.messages, message],
    unread: { ...conversation.unread, [other]: (conversation.unread?.[other] || 0) + 1 },
  };
  // Keep the most recent conversation at the top
  return {
    state: { ...state, conversations: [updated, ...state.conversations.filter((c) => c.id !== conversationId)] },
    message,
  };
}

export function markConversationRead(state, conversationId, side) {
  return {
    ...state,
    conversations: state.conversations.map((c) => (c.id === conversationId && c.unread?.[side] ? { ...c, unread: { ...c.unread, [side]: 0 } } : c)),
  };
}

const AUTO_REPLIES = [
  'Perfeito, combinado!',
  'Obrigado pelo aviso. Qualquer novidade eu te escrevo por aqui.',
  'Certo! Vou seguir exatamente as orientações do perfil do pet.',
  'Recebido 👍',
];

/** Simulated reply from the other side, so conversations feel alive in the demo */
export function simulateReply(state, { conversationId, from }) {
  const text = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
  const { state: next } = sendMessage(state, { conversationId, from, text });
  const conversation = next.conversations.find((c) => c.id === conversationId);
  const walker = next.walkers.find((w) => w.id === conversation.walkerId);
  const owner = next.users.find((u) => u.id === conversation.ownerId);
  const toOwner = from === 'walker';
  return notify(next, {
    audience: toOwner ? 'owner' : 'walker',
    userId: toOwner ? conversation.ownerId : conversation.walkerId,
    kind: 'message',
    title: `Mensagem de ${(toOwner ? walker?.name : owner?.name)?.split(' ')[0] ?? ''}`,
    body: text,
    link: toOwner ? `/tutor/mensagens/${conversationId}` : `/dog-walker/mensagens/${conversationId}`,
  });
}
