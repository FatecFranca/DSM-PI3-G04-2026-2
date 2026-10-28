import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, UserRound, ArrowLeftRight, LifeBuoy, LogOut, PawPrint, CreditCard, BadgeCheck, Gift, RotateCcw, UserPlus, LogIn, CalendarHeart } from 'lucide-react';
import { Avatar } from '../common/SmartImage';
import { useActions } from '../../context/AppStore';
import { useActingWalker, useCurrentUser, useMode } from '../../hooks/useAccount';
import { useToast } from '../feedback/Toast';
import { ConfirmDialog } from '../common/Modal';
import { APP_MODES } from '../../utils/constants';

/** Hook used by every place that switches mode, so navigation + feedback stay consistent */
export function useSwitchMode() {
  const actions = useActions();
  const navigate = useNavigate();
  const toast = useToast();
  return (mode) => {
    actions.setMode(mode);
    navigate(mode === APP_MODES.WALKER ? '/dog-walker/hoje' : '/tutor');
    toast.info(mode === APP_MODES.WALKER ? 'Modo dog walker ativado' : 'Modo tutor ativado');
  };
}

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const ref = useRef(null);
  const user = useCurrentUser();
  const walker = useActingWalker();
  const { isWalkerMode } = useMode();
  const actions = useActions();
  const navigate = useNavigate();
  const toast = useToast();
  const switchMode = useSwitchMode();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const item = 'flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-ink-900 hover:bg-cream-50';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu da conta"
        className="flex h-11 items-center gap-2.5 rounded-full border border-sand-200 bg-white pl-3 pr-1.5 transition hover:shadow-card"
      >
        <Menu size={18} aria-hidden="true" />
        {user ? <Avatar src={isWalkerMode ? walker?.avatar || user.avatar : user.avatar} name={user.name} size={32} /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-600 text-white"><UserRound size={18} /></span>}
      </button>

      {open ? (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-[1000] w-[min(300px,calc(100vw-24px))] animate-fade-up overflow-hidden rounded-2xl border border-sand-200 bg-white py-2 shadow-float">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-4 pb-3 pt-1.5">
                <Avatar src={user.avatar} name={user.name} size={40} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.name}</p>
                  <p className="truncate text-[13px] text-ink-600">{isWalkerMode ? 'Modo dog walker' : 'Modo tutor'}</p>
                </div>
              </div>
              <hr className="border-sand-200" />
              <button type="button" role="menuitem" className={`${item} font-semibold`} onClick={() => { close(); switchMode(isWalkerMode ? APP_MODES.OWNER : APP_MODES.WALKER); }}>
                <ArrowLeftRight size={18} className="text-accent-ink" />{' '}
                {isWalkerMode
                  ? user.roles.includes('owner') ? 'Alternar para modo tutor' : 'Também quero contratar passeios'
                  : user.walkerProfileId ? 'Alternar para modo dog walker' : 'Quero ser dog walker'}
              </button>
              <hr className="my-1 border-sand-200" />
              {isWalkerMode ? (
                <>
                  <Link role="menuitem" to="/dog-walker/perfil" className={item} onClick={close}><BadgeCheck size={18} /> Perfil público e verificação</Link>
                  {walker ? <Link role="menuitem" to={`/dog-walkers/${walker.id}`} className={item} onClick={close}><UserRound size={18} /> Ver meu perfil como tutor</Link> : null}
                  <Link role="menuitem" to="/dog-walker/ganhos" className={item} onClick={close}><CreditCard size={18} /> Ganhos e repasses</Link>
                </>
              ) : (
                <>
                  <Link role="menuitem" to="/tutor/perfil" className={item} onClick={close}><UserRound size={18} /> Conta e pagamentos</Link>
                  <Link role="menuitem" to="/tutor/pets" className={item} onClick={close}><PawPrint size={18} /> Meus pets</Link>
                  <Link role="menuitem" to="/planos" className={item} onClick={close}><CalendarHeart size={18} /> Planos recorrentes</Link>
                </>
              )}
              <Link role="menuitem" to="/indicar" className={item} onClick={close}><UserPlus size={18} /> Indicar um dog walker</Link>
              <Link role="menuitem" to="/cartao-presente" className={item} onClick={close}><Gift size={18} /> Cartão-presente</Link>
              <Link role="menuitem" to="/ajuda" className={item} onClick={close}><LifeBuoy size={18} /> Central de ajuda</Link>
              <hr className="my-1 border-sand-200" />
              <button type="button" role="menuitem" className={item} onClick={() => { close(); setConfirmReset(true); }}>
                <RotateCcw size={18} /> Restaurar dados de demonstração
              </button>
              <button type="button" role="menuitem" className={item} onClick={() => { close(); actions.signOut(); navigate('/'); toast.info('Você saiu da conta'); }}>
                <LogOut size={18} /> Sair
              </button>
            </>
          ) : (
            <>
              <Link role="menuitem" to="/entrar" className={`${item} font-semibold`} onClick={close}><LogIn size={18} /> Entrar</Link>
              <Link role="menuitem" to="/cadastrar" className={item} onClick={close}><UserPlus size={18} /> Cadastrar-se</Link>
              <Link role="menuitem" to="/entrar?perfil=dog-walker" className={item} onClick={close}><LogIn size={18} /> Entrar como dog walker</Link>
              <hr className="my-1 border-sand-200" />
              <Link role="menuitem" to="/seja-dog-walker" className={item} onClick={close}><BadgeCheck size={18} /> Seja um dog walker</Link>
              <Link role="menuitem" to="/indicar" className={item} onClick={close}><UserPlus size={18} /> Indicar um dog walker</Link>
              <Link role="menuitem" to="/ajuda" className={item} onClick={close}><LifeBuoy size={18} /> Central de ajuda</Link>
            </>
          )}
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => { actions.resetDemo(); setConfirmReset(false); toast.success('Dados de demonstração restaurados'); }}
        title="Restaurar dados de demonstração?"
        description="Passeios, pets, mensagens e favoritos voltam ao estado inicial. Você continua conectado."
        confirmLabel="Restaurar"
      />
    </div>
  );
}
