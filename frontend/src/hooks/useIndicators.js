import { useMemo } from 'react';
import { useData, useSession } from '../context/AppStore';
import { useActingWalker, useCurrentUser } from './useAccount';
import { isLive, BOOKING_STATUS as S } from '../features/bookings/bookingStateMachine';

/** Badge counts for navigation (unread messages, pending requests, live walks, notifications) */
export function useIndicators() {
  const data = useData();
  const session = useSession();
  const user = useCurrentUser();
  const walker = useActingWalker();
  return useMemo(() => {
    if (!user) return { messages: 0, requests: 0, live: 0, notifications: 0, awaitingAction: 0 };
    if (session.mode === 'walker' && walker) {
      const mine = data.bookings.filter((b) => b.walkerId === walker.id);
      return {
        messages: data.conversations.filter((c) => c.walkerId === walker.id).reduce((n, c) => n + (c.unread?.walker || 0), 0),
        requests: mine.filter((b) => b.status === S.REQUESTED).length,
        live: mine.filter((b) => isLive(b.status)).length,
        notifications: data.notifications.filter((n) => n.audience === 'walker' && n.userId === walker.id && !n.read).length,
        awaitingAction: 0,
      };
    }
    const mine = data.bookings.filter((b) => b.ownerId === user.id);
    return {
      messages: data.conversations.filter((c) => c.ownerId === user.id).reduce((n, c) => n + (c.unread?.owner || 0), 0),
      requests: 0,
      live: mine.filter((b) => isLive(b.status)).length,
      notifications: data.notifications.filter((n) => n.audience === 'owner' && n.userId === user.id && !n.read).length,
      // accepted (needs payment) + completed (needs review)
      awaitingAction: mine.filter((b) => b.status === S.ACCEPTED || b.status === S.COMPLETED).length,
    };
  }, [data, session.mode, user, walker]);
}

/** Notifications for the current audience */
export function useMyNotifications() {
  const data = useData();
  const session = useSession();
  const user = useCurrentUser();
  const walker = useActingWalker();
  return useMemo(() => {
    if (!user) return { audience: null, recipientId: null, items: [] };
    const audience = session.mode === 'walker' ? 'walker' : 'owner';
    const recipientId = audience === 'walker' ? walker?.id : user.id;
    return { audience, recipientId, items: data.notifications.filter((n) => n.audience === audience && n.userId === recipientId) };
  }, [data.notifications, session.mode, user, walker]);
}
