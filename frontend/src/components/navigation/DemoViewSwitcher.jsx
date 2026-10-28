import { useLocation } from 'react-router-dom';
import { PawPrint, Footprints } from 'lucide-react';
import { useCurrentUser, useMode } from '../../hooks/useAccount';
import { useAccountSwitch } from '../../features/auth/useAccountSwitch';
import { useData } from '../../context/AppStore';
import { Avatar } from '../common/SmartImage';
import { APP_MODES } from '../../utils/constants';

/**
 * Prototype-only bar: switches the whole app between the tutor's and the dog
 * walker's point of view, each with its own account and mock data
 * (Marina: pets, bookings, live walk · Lucas: today's walks, requests, earnings).
 * There is no backend, so this simply signs in to the corresponding demo account.
 */
export const DEMO_VIEWS = [
  { id: APP_MODES.OWNER, userId: 'u1', label: 'Tutor', icon: PawPrint, home: '/tutor' },
  { id: APP_MODES.WALKER, userId: 'u5', label: 'Dog walker', icon: Footprints, home: '/dog-walker/hoje' },
];

export default function DemoViewSwitcher() {
  const user = useCurrentUser();
  const { mode } = useMode();
  const data = useData();
  const { switchTo } = useAccountSwitch();
  const { pathname } = useLocation();

  const isActive = (view) => user?.id === view.userId && mode === view.id;

  return (
    <div className="bg-ink-900 text-white">
      <div className="container-page flex h-10 items-center justify-end gap-3">
        <div role="group" aria-label="Ver o app como" className="flex shrink-0 items-center gap-1.5">
          <span className="text-[12px] text-white/70">Ver como</span>
          <div className="flex rounded-full bg-white/10 p-0.5">
            {DEMO_VIEWS.map((view) => {
              const active = isActive(view);
              const person = data.users.find((u) => u.id === view.userId);
              return (
                <button
                  key={view.id}
                  type="button"
                  aria-pressed={active}
                  title={person ? `${view.label}: ${person.name}` : view.label}
                  onClick={() => {
                    if (active) return;
                    // Keep the visitor on the same tutor/walker page when it exists on both sides
                    switchTo(view.userId, view.id, pathname.startsWith(view.id === APP_MODES.WALKER ? '/dog-walker' : '/tutor') ? pathname : view.home);
                  }}
                  className={`flex h-8 items-center gap-1.5 rounded-full pl-1 pr-3 text-[12px] font-semibold transition ${
                    active ? (view.id === APP_MODES.WALKER ? 'bg-gold-500 text-ink-900' : 'bg-wine-400 text-white') : 'text-white/80 hover:text-white'
                  }`}
                >
                  {person ? <Avatar src={person.avatar} name={person.name} size={24} /> : <view.icon size={14} aria-hidden="true" />}
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
