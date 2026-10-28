import { NavLink } from 'react-router-dom';
import { useIndicators } from '../../hooks/useIndicators';
import { useCurrentUser, useMode } from '../../hooks/useAccount';
import { OWNER_NAV, WALKER_NAV, VISITOR_NAV } from './navConfig';

/** Fixed mobile tab bar (hidden ≥ md). Respects the iOS safe area. */
export default function BottomNav() {
  const user = useCurrentUser();
  const { isWalkerMode } = useMode();
  const indicators = useIndicators();
  const items = !user ? VISITOR_NAV : isWalkerMode ? WALKER_NAV : OWNER_NAV;

  return (
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-[900] border-t border-sand-200 bg-white/95 shadow-bar backdrop-blur-md lg:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 safe-bottom" style={{ height: 'calc(var(--bottom-nav-h) + var(--safe-bottom))' }}>
        {items.map((item) => {
          const count = item.badge ? indicators[item.badge] : 0;
          const live = item.liveKey ? indicators[item.liveKey] > 0 : false;
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex h-[var(--bottom-nav-h)] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${isActive ? 'text-accent-ink' : 'text-ink-600'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative">
                      <item.icon size={23} strokeWidth={isActive ? 2.4 : 1.9} aria-hidden="true" />
                      {count ? (
                        <span className="absolute -right-2.5 -top-1.5 min-w-[17px] rounded-full bg-danger-600 px-1 text-center text-[10px] font-bold leading-[17px] text-white ring-2 ring-white">
                          {count > 9 ? '9+' : count}
                        </span>
                      ) : live ? (
                        <span className="absolute -right-1 -top-0.5 flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-500 opacity-70" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold-500 ring-2 ring-white" />
                        </span>
                      ) : null}
                    </span>
                    <span>{item.label}</span>
                    {isActive ? <span className="absolute top-0 h-0.5 w-8 rounded-b-full bg-accent" aria-hidden="true" /> : null}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
