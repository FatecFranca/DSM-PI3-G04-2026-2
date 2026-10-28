import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Header from '../components/navigation/Header';
import Footer from '../components/navigation/Footer';
import BottomNav from '../components/navigation/BottomNav';
import { useActions } from '../context/AppStore';
import { useCurrentUser, useMode } from '../hooks/useAccount';
import { useMyNotifications } from '../hooks/useIndicators';
import { useToast } from '../components/feedback/Toast';
import { APP_MODES } from '../utils/constants';

/** Scrolls to top on route change (keeps position for query-only changes) */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

/** Shows new in-app notifications as toasts (simulated push) */
export function NotificationToaster() {
  const { items } = useMyNotifications();
  const toast = useToast();
  const seen = useRef(null);
  useEffect(() => {
    if (seen.current === null) {
      seen.current = new Set(items.map((n) => n.id));
      return;
    }
    for (const n of items) {
      if (!seen.current.has(n.id)) {
        seen.current.add(n.id);
        if (Date.now() - n.at < 10000) toast.notify(n.title, n.body, n.link);
      }
    }
  }, [items, toast]);
  return null;
}

/** Public pages: header + content + footer (+ bottom nav on mobile) */
export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="conteudo" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <div className="h-[calc(var(--bottom-nav-h)+var(--safe-bottom))] lg:hidden" aria-hidden="true" />
      <BottomNav />
    </div>
  );
}

/** Authenticated app areas. `mode` forces the right mode for deep links (e.g. notifications). */
export function AppLayout({ mode }) {
  const user = useCurrentUser();
  const { mode: current } = useMode();
  const actions = useActions();
  const location = useLocation();

  useEffect(() => {
    if (user && mode && current !== mode) actions.setMode(mode);
  }, [user, mode, current, actions]);

  if (!user) return <Navigate to={`/entrar?voltar=${encodeURIComponent(location.pathname + location.search)}`} replace />;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="conteudo" className="container-page flex-1 pt-5 pb-nav md:pt-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

/** Immersive full-screen pages (live tracking) — no header/bottom nav */
export function FullscreenLayout({ mode }) {
  const user = useCurrentUser();
  const { mode: current } = useMode();
  const actions = useActions();
  const location = useLocation();
  useEffect(() => {
    if (user && mode && current !== mode) actions.setMode(mode);
  }, [user, mode, current, actions]);
  if (!user) return <Navigate to={`/entrar?voltar=${encodeURIComponent(location.pathname)}`} replace />;
  return <Outlet />;
}

export { APP_MODES };
