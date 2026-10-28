import { Search, CalendarCheck, Heart, MessageCircle, UserRound, Sun, CalendarDays, Inbox, Wallet, LogIn } from 'lucide-react';

/** Bottom navigation / desktop app nav per mode. `badge` keys map to useIndicators() */
export const OWNER_NAV = [
  { to: '/tutor', label: 'Início', icon: Search, end: true },
  { to: '/tutor/passeios', label: 'Passeios', icon: CalendarCheck, badge: 'awaitingAction', liveKey: 'live' },
  { to: '/tutor/favoritos', label: 'Favoritos', icon: Heart },
  { to: '/tutor/mensagens', label: 'Mensagens', icon: MessageCircle, badge: 'messages' },
  { to: '/tutor/perfil', label: 'Perfil', icon: UserRound },
];

export const WALKER_NAV = [
  { to: '/dog-walker/hoje', label: 'Início', icon: Sun, liveKey: 'live' },
  { to: '/dog-walker/solicitacoes', label: 'Solicitações', icon: Inbox, badge: 'requests' },
  { to: '/dog-walker/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/dog-walker/mensagens', label: 'Mensagens', icon: MessageCircle, badge: 'messages' },
  { to: '/dog-walker/ganhos', label: 'Ganhos', icon: Wallet },
];

export const VISITOR_NAV = [
  { to: '/', label: 'Explorar', icon: Search, end: true },
  { to: '/tutor/favoritos', label: 'Favoritos', icon: Heart },
  { to: '/entrar', label: 'Entrar', icon: LogIn },
];

export const PUBLIC_LINKS = [
  { to: '/buscar', label: 'Passeio avulso' },
  { to: '/planos', label: 'Plano recorrente' },
  { to: '/seja-dog-walker', label: 'Seja um dog walker' },
];

export const FOOTER_SECTIONS = [
  {
    title: 'Atendimento',
    links: [
      { to: '/ajuda', label: 'Central de ajuda' },
      { to: '/seguranca', label: 'Garantia Rolê de Pet' },
      { to: '/cancelamentos', label: 'Opções de cancelamento' },
      { to: '/ajuda?categoria=emergencia', label: 'Emergência durante o passeio' },
    ],
  },
  {
    title: 'Para dog walkers',
    links: [
      { to: '/seja-dog-walker', label: 'Seja um dog walker' },
      { to: '/entrar?perfil=dog-walker', label: 'Entrar como dog walker' },
      { to: '/como-funciona?perfil=dog-walker', label: 'Como funciona para profissionais' },
      { to: '/ajuda?categoria=dog-walkers', label: 'Ajuda para dog walkers' },
      { to: '/indicar', label: 'Indicar um dog walker' },
    ],
  },
  {
    title: 'Rolê de Pet',
    links: [
      { to: '/como-funciona', label: 'Como funciona' },
      { to: '/planos', label: 'Planos recorrentes' },
      { to: '/cartao-presente', label: 'Cartão-presente' },
      { to: '/termos', label: 'Termos de uso' },
      { to: '/privacidade', label: 'Privacidade' },
    ],
  },
];
