import { NavLink, Link } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';
import Logo from '../common/Logo';
import AccountMenu, { useSwitchMode } from './AccountMenu';
import NotificationsButton from './NotificationsButton';
import DemoViewSwitcher from './DemoViewSwitcher';
import { useCurrentUser, useMode } from '../../hooks/useAccount';
import { useIndicators } from '../../hooks/useIndicators';
import { OWNER_NAV, WALKER_NAV, PUBLIC_LINKS } from './navConfig';
import { APP_MODES } from '../../utils/constants';

/**
 * Single responsive header.
 * - Mobile: compact bar (logo + contextual actions + account menu); main nav lives in BottomNav.
 * - Desktop: brand, public links or app nav, mode switch, notifications, account menu.
 */
export default function Header({ variant = 'default' }) {
  const user = useCurrentUser();
  const { isWalkerMode } = useMode();
  const indicators = useIndicators();
  const switchMode = useSwitchMode();
  const appNav = user ? (isWalkerMode ? WALKER_NAV : OWNER_NAV.filter((i) => i.to !== '/tutor/perfil')) : null;
  const home = !user ? '/' : isWalkerMode ? '/dog-walker/hoje' : '/tutor';

  return (
    <header className={`sticky top-0 z-[950] border-b bg-white/90 backdrop-blur-md ${variant === 'transparent' ? 'border-transparent' : 'border-sand-200'}`}>
      <DemoViewSwitcher />
      <div className="container-page flex h-16 items-center gap-4 md:h-20">
        <Logo to={home} />
        {isWalkerMode && user ? <span className="hidden whitespace-nowrap rounded-full bg-gold-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-900 sm:inline lg:hidden xl:inline">Dog walker</span> : null}

        <nav aria-label="Navegação" className="mx-auto hidden items-center gap-0.5 lg:flex xl:gap-1">
          {(appNav || PUBLIC_LINKS).map((link) => {
            const count = link.badge ? indicators[link.badge] : 0;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `relative flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[15px] font-medium transition xl:px-4 ${isActive && appNav ? 'bg-cream-100 text-ink-900' : 'text-ink-600 hover:bg-cream-50 hover:text-ink-900'}`
                }
              >
                {link.label}
                {count ? <span className="rounded-full bg-danger-600 px-1.5 text-[11px] font-bold leading-5 text-white">{count}</span> : null}
              </NavLink>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          {!user ? (
            <Link to="/seja-dog-walker" className="hidden h-10 items-center rounded-full px-4 text-[15px] font-semibold text-ink-900 hover:bg-cream-100 md:flex lg:hidden">
              Seja um dog walker
            </Link>
          ) : user.roles.includes('owner') && user.roles.includes('walker') ? (
            <button
              type="button"
              onClick={() => switchMode(isWalkerMode ? APP_MODES.OWNER : APP_MODES.WALKER)}
              className="hidden h-10 items-center gap-2 whitespace-nowrap rounded-full px-3 text-[15px] font-semibold text-ink-900 hover:bg-cream-100 md:flex"
            >
              <ArrowLeftRight size={16} aria-hidden="true" />
              {isWalkerMode ? 'Modo tutor' : 'Modo dog walker'}
            </button>
          ) : null}
          {user ? <NotificationsButton /> : null}
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
