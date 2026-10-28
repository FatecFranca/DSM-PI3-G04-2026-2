import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MessageCircle, Send, CalendarDays } from 'lucide-react';
import { Avatar } from '../../components/common/SmartImage';
import { StatusBadge } from '../../components/common/Badge';
import EmptyState from '../../components/feedback/EmptyState';
import Button from '../../components/common/Button';
import { useActions, useData } from '../../context/AppStore';
import { useActingWalker, useCurrentUser } from '../../hooks/useAccount';
import { formatRelativeDay, formatTime, timeAgo, toISODate } from '../../utils/dates';
import { firstName } from '../../utils/format';

/**
 * Shared chat UI for both sides.
 * side="owner": conversations of the signed-in tutor, counterpart = walker.
 * side="walker": conversations of the operated walker profile, counterpart = tutor.
 */
export default function MessagesView({ side }) {
  const data = useData();
  const user = useCurrentUser();
  const walker = useActingWalker();
  const { conversationId } = useParams();
  const base = side === 'owner' ? '/tutor/mensagens' : '/dog-walker/mensagens';

  const conversations = useMemo(() => {
    const mine = data.conversations.filter((c) => (side === 'owner' ? c.ownerId === user?.id : c.walkerId === walker?.id));
    return mine
      .map((c) => {
        const counterpart = side === 'owner' ? data.walkers.find((w) => w.id === c.walkerId) : data.users.find((u) => u.id === c.ownerId);
        const booking = c.bookingId ? data.bookings.find((b) => b.id === c.bookingId) : null;
        const pet = booking ? data.pets.find((p) => p.id === booking.petId) : null;
        const last = c.messages[c.messages.length - 1];
        return { ...c, counterpart, booking, pet, last, unreadCount: c.unread?.[side] || 0 };
      })
      .sort((a, b) => (b.last?.at || 0) - (a.last?.at || 0));
  }, [data, side, user, walker]);

  const active = conversations.find((c) => c.id === conversationId) ?? null;

  return (
    <div className="-mx-4 sm:mx-0">
      <div className="flex h-[calc(100dvh-64px-var(--bottom-nav-h)-var(--safe-bottom)-48px)] overflow-hidden bg-white sm:rounded-3xl sm:border sm:border-sand-200 sm:shadow-card md:h-[calc(100dvh-80px-var(--bottom-nav-h)-var(--safe-bottom)-72px)] lg:h-[calc(100dvh-80px-96px)] md:min-h-[480px] lg:min-h-[520px]">
        <aside className={`w-full shrink-0 flex-col border-sand-200 md:flex md:w-[340px] md:border-r ${active ? 'hidden' : 'flex'}`}>
          <div className="border-b border-sand-200 px-4 py-4 md:px-5">
            <h1 className="text-2xl font-bold tracking-tight">Mensagens</h1>
          </div>
          {conversations.length ? (
            <ul className="flex-1 overflow-y-auto">
              {conversations.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`${base}/${c.id}`}
                    aria-current={c.id === conversationId ? 'page' : undefined}
                    className={`flex items-center gap-3 px-4 py-3.5 transition md:px-5 ${c.id === conversationId ? 'bg-cream-100' : 'hover:bg-cream-50'}`}
                  >
                    <Avatar src={c.counterpart?.avatar} name={c.counterpart?.name} size={48} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`truncate text-[15px] ${c.unreadCount ? 'font-bold' : 'font-semibold'}`}>{c.counterpart?.name ?? 'Conta removida'}</p>
                        {c.last ? <span className="shrink-0 text-[12px] text-ink-400">{timeAgo(c.last.at)}</span> : null}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`truncate text-sm ${c.unreadCount ? 'font-medium text-ink-900' : 'text-ink-600'}`}>
                          {c.last ? `${c.last.from === side ? 'Você: ' : ''}${c.last.text}` : 'Nenhuma mensagem ainda'}
                        </p>
                        {c.unreadCount ? (
                          <span className="min-w-5 shrink-0 rounded-full bg-accent px-1.5 text-center text-[11px] font-bold leading-5 text-on-accent" aria-label={`${c.unreadCount} não lidas`}>
                            {c.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      {c.pet ? <p className="mt-0.5 truncate text-[12px] text-ink-400">Sobre {c.pet.name}</p> : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 items-center p-4">
              <EmptyState
                icon={MessageCircle}
                title="Nenhuma conversa"
                description={side === 'owner' ? 'Fale com um dog walker pelo perfil dele antes ou depois de solicitar um passeio.' : 'Conversas com tutores aparecem aqui quando houver solicitações.'}
                action={side === 'owner' ? <Button to="/buscar" size="sm">Buscar dog walkers</Button> : null}
                className="w-full"
              />
            </div>
          )}
        </aside>

        <section className={`min-w-0 flex-1 flex-col ${active ? 'flex' : 'hidden md:flex'}`}>
          {active ? (
            <Thread key={active.id} conversation={active} side={side} base={base} />
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-ink-600">
              <div>
                <MessageCircle size={36} className="mx-auto mb-3 text-sand-300" aria-hidden="true" />
                <p>Selecione uma conversa</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Thread({ conversation, side, base }) {
  const actions = useActions();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const { counterpart, booking, pet } = conversation;
  const unread = conversation.unreadCount;

  useEffect(() => {
    if (unread) actions.markConversationRead(conversation.id, side);
  }, [unread, conversation.id, side, actions]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [conversation.messages.length]);

  const send = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    actions.sendMessage(conversation.id, text);
    setText('');
  };

  const bookingLink = booking ? (side === 'owner' ? `/tutor/passeios/${booking.id}` : booking.status === 'requested' ? `/dog-walker/solicitacoes/${booking.id}` : `/dog-walker/passeio/${booking.id}`) : null;
  const profileLink = side === 'owner' ? `/dog-walkers/${conversation.walkerId}` : null;

  // Group messages by day for separators
  let lastDay = null;

  return (
    <>
      <header className="flex items-center gap-3 border-b border-sand-200 px-3 py-3 md:px-5">
        <button type="button" onClick={() => navigate(base)} aria-label="Voltar para conversas" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream-100 md:hidden">
          <ChevronLeft size={22} />
        </button>
        <Avatar src={counterpart?.avatar} name={counterpart?.name} size={40} />
        <div className="min-w-0 flex-1">
          {profileLink ? (
            <Link to={profileLink} className="block truncate font-semibold hover:underline">{counterpart?.name}</Link>
          ) : (
            <p className="truncate font-semibold">{counterpart?.name}</p>
          )}
          <p className="truncate text-[12px] text-ink-600">{side === 'owner' ? counterpart?.responseTime ?? 'Dog walker' : 'Tutor'}</p>
        </div>
      </header>

      {booking ? (
        <Link to={bookingLink} className="flex items-center gap-2 border-b border-sand-200 bg-cream-50 px-4 py-2.5 text-[13px] hover:bg-cream-100 md:px-5">
          <CalendarDays size={15} className="shrink-0 text-ink-600" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">
            Passeio de <strong>{pet?.name}</strong> · {formatRelativeDay(booking.date)} às {booking.time}
          </span>
          <StatusBadge status={booking.status} size="xs" />
        </Link>
      ) : null}

      <div className="flex-1 space-y-2 overflow-y-auto bg-cream-50/40 px-3 py-4 md:px-6" aria-live="polite">
        {conversation.messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-600">Envie a primeira mensagem para {firstName(counterpart?.name)}.</p>
        ) : null}
        {conversation.messages.map((m) => {
          const day = toISODate(new Date(m.at));
          const separator = day !== lastDay ? <DaySeparator key={`d-${day}`} day={day} /> : null;
          lastDay = day;
          const mine = m.from === side;
          return (
            <div key={m.id}>
              {separator}
              <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug shadow-sm sm:max-w-[70%] ${mine ? 'rounded-br-md bg-accent text-on-accent' : 'rounded-bl-md bg-white text-ink-900 ring-1 ring-sand-200'}`}>
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`mt-0.5 text-right text-[11px] ${mine ? 'opacity-75' : 'text-ink-400'}`}>{formatTime(m.at)}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex items-end gap-2 border-t border-sand-200 bg-white p-3 md:px-5">
        <label htmlFor="composer" className="sr-only">Mensagem</label>
        <textarea
          id="composer"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={`Mensagem para ${firstName(counterpart?.name)}`}
          maxLength={1000}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-sand-200 bg-cream-50 px-4 py-2.5 text-[15px] focus:border-accent-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button type="submit" disabled={!text.trim()} aria-label="Enviar mensagem" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent transition hover:bg-accent-hover active:scale-95 disabled:opacity-40">
          <Send size={18} />
        </button>
      </form>
    </>
  );
}

function DaySeparator({ day }) {
  return (
    <div className="my-3 flex justify-center">
      <span className="rounded-full bg-white px-3 py-1 text-[12px] inline-block font-medium first-letter:uppercase text-ink-600 ring-1 ring-sand-200">{formatRelativeDay(day)}</span>
    </div>
  );
}
