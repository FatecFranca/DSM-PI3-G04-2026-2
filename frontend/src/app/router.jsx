import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { PublicLayout, AppLayout, FullscreenLayout, ScrollToTop, NotificationToaster } from './layouts';
import { ToastProvider } from '../components/feedback/Toast';
import { PageLoader } from '../components/feedback/Spinner';
import TrackingEngine from '../features/tracking/TrackingEngine';
import RouteError from './RouteError';
import { APP_MODES } from '../utils/constants';

// Pages are code-split per route.
const p = (loader) => {
  const Component = lazy(loader);
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
};

function Root() {
  return (
    <ToastProvider>
      <ScrollToTop />
      <NotificationToaster />
      <TrackingEngine />
      <Outlet />
    </ToastProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      // ---------------- Public website ----------------
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: p(() => import('../pages/public/HomePage')) },
          { path: 'buscar', element: p(() => import('../pages/public/SearchPage')) },
          { path: 'dog-walkers/:walkerId', element: p(() => import('../pages/public/WalkerProfilePage')) },
          { path: 'como-funciona', element: p(() => import('../pages/public/HowItWorksPage')) },
          { path: 'seguranca', element: p(() => import('../pages/public/SafetyPage')) },
          { path: 'seja-dog-walker', element: p(() => import('../pages/public/BecomeWalkerPage')) },
          { path: 'ajuda', element: p(() => import('../pages/public/HelpCenterPage')) },
          { path: 'entrar', element: p(() => import('../pages/public/SignInPage')) },
          { path: 'cadastrar', element: p(() => import('../pages/public/SignUpPage')) },
          { path: 'cancelamentos', element: p(() => import('../pages/public/CancellationPage')) },
          { path: 'termos', element: p(() => import('../pages/public/TermsPage')) },
          { path: 'privacidade', element: p(() => import('../pages/public/PrivacyPage')) },
          { path: 'indicar', element: p(() => import('../pages/public/ReferralPage')) },
          { path: 'planos', element: p(() => import('../pages/public/PlansPage')) },
          { path: 'cartao-presente', element: p(() => import('../pages/public/GiftCardPage')) },
          { path: '*', element: p(() => import('../pages/public/NotFoundPage')) },
        ],
      },

      // ---------------- Tutor area ----------------
      {
        path: 'tutor',
        element: <AppLayout mode={APP_MODES.OWNER} />,
        children: [
          { index: true, element: p(() => import('../pages/owner/OwnerHomePage')) },
          { path: 'passeios', element: p(() => import('../pages/owner/OwnerWalksPage')) },
          { path: 'passeios/:bookingId', element: p(() => import('../pages/owner/BookingDetailPage')) },
          { path: 'favoritos', element: p(() => import('../pages/owner/FavoritesPage')) },
          { path: 'mensagens', element: p(() => import('../pages/owner/OwnerMessagesPage')) },
          { path: 'mensagens/:conversationId', element: p(() => import('../pages/owner/OwnerMessagesPage')) },
          { path: 'pets', element: p(() => import('../pages/owner/MyPetsPage')) },
          { path: 'pets/novo', element: p(() => import('../pages/owner/PetFormPage')) },
          { path: 'pets/:petId', element: p(() => import('../pages/owner/PetDetailPage')) },
          { path: 'pets/:petId/editar', element: p(() => import('../pages/owner/PetFormPage')) },
          { path: 'perfil', element: p(() => import('../pages/owner/OwnerProfilePage')) },
        ],
      },
      {
        path: 'tutor/acompanhar/:bookingId',
        element: <FullscreenLayout mode={APP_MODES.OWNER} />,
        children: [{ index: true, element: p(() => import('../pages/owner/LiveTrackingPage')) }],
      },

      // ---------------- Dog walker area ----------------
      {
        path: 'dog-walker',
        element: <AppLayout mode={APP_MODES.WALKER} />,
        children: [
          { index: true, element: p(() => import('../pages/walker/WalkerTodayPage')) },
          { path: 'hoje', element: p(() => import('../pages/walker/WalkerTodayPage')) },
          { path: 'agenda', element: p(() => import('../pages/walker/WalkerAgendaPage')) },
          { path: 'solicitacoes', element: p(() => import('../pages/walker/WalkerRequestsPage')) },
          { path: 'solicitacoes/:bookingId', element: p(() => import('../pages/walker/WalkerRequestDetailPage')) },
          { path: 'mensagens', element: p(() => import('../pages/walker/WalkerMessagesPage')) },
          { path: 'mensagens/:conversationId', element: p(() => import('../pages/walker/WalkerMessagesPage')) },
          { path: 'ganhos', element: p(() => import('../pages/walker/WalkerEarningsPage')) },
          { path: 'perfil', element: p(() => import('../pages/walker/WalkerProfileEditPage')) },
        ],
      },
      {
        path: 'dog-walker/passeio/:bookingId',
        element: <FullscreenLayout mode={APP_MODES.WALKER} />,
        children: [{ index: true, element: p(() => import('../pages/walker/WalkerWalkPage')) }],
      },
    ],
  },
]);
