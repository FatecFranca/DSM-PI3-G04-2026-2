// Pure helpers to append in-app notifications to the state.
// A real implementation would also dispatch push notifications.

let counter = 0;
export const newId = (prefix) => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`;

export function notify(state, { audience, userId, title, body, link = null, kind = 'system' }) {
  const notification = { id: newId('n'), audience, userId, title, body, link, kind, read: false, at: Date.now() };
  return { ...state, notifications: [notification, ...state.notifications] };
}

export function markAllRead(state, audience, userId) {
  return {
    ...state,
    notifications: state.notifications.map((n) => (n.audience === audience && n.userId === userId ? { ...n, read: true } : n)),
  };
}

export function markRead(state, notificationId) {
  return { ...state, notifications: state.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)) };
}
