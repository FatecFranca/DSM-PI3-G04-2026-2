import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CalendarCheck, MessageCircle, Wallet, Navigation, Info } from 'lucide-react';
import { IconButton } from '../common/Button';
import Modal from '../common/Modal';
import EmptyState from '../feedback/EmptyState';
import { useActions } from '../../context/AppStore';
import { useMyNotifications } from '../../hooks/useIndicators';
import { timeAgo } from '../../utils/dates';

const KIND_ICON = { booking: CalendarCheck, message: MessageCircle, payment: Wallet, tracking: Navigation, system: Info };

export default function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const { items, audience, recipientId } = useMyNotifications();
  const actions = useActions();
  const navigate = useNavigate();
  const unread = items.filter((n) => !n.read).length;

  return (
    <>
      <IconButton icon={Bell} label={`Notificações${unread ? ` (${unread} não lidas)` : ''}`} onClick={() => setOpen(true)} badge={unread} />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Notificações"
        size="md"
        footer={
          unread ? (
            <button type="button" className="text-sm font-semibold text-accent-ink hover:underline" onClick={() => actions.markAllNotificationsRead(audience, recipientId)}>
              Marcar todas como lidas
            </button>
          ) : null
        }
      >
        {items.length === 0 ? (
          <EmptyState icon={Bell} title="Nenhuma notificação" description="Avisos sobre solicitações, pagamentos e passeios aparecem aqui." className="border-none" />
        ) : (
          <ul className="-mx-2 divide-y divide-sand-200">
            {items.slice(0, 40).map((n) => {
              const Icon = KIND_ICON[n.kind] || Info;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      actions.markNotificationRead(n.id);
                      setOpen(false);
                      if (n.link) navigate(n.link);
                    }}
                    className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left hover:bg-cream-50"
                  >
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.read ? 'bg-cream-100 text-ink-600' : 'bg-accent-soft text-accent-ink'}`}>
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[15px] ${n.read ? 'font-medium' : 'font-bold'}`}>{n.title}</span>
                      <span className="block text-[13px] leading-snug text-ink-600">{n.body}</span>
                      <span className="mt-1 block text-[12px] text-ink-400">{timeAgo(n.at)}</span>
                    </span>
                    {!n.read ? <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-label="Não lida" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Modal>
    </>
  );
}
