import { useLocation, useNavigate } from 'react-router-dom';
import { useActions } from '../../context/AppStore';
import { useCurrentUser, useFavorites } from '../../hooks/useAccount';
import { useToast } from '../../components/feedback/Toast';

/** Favorite toggle with sign-in redirect for visitors */
export function useFavoriteToggle(walkerId) {
  const user = useCurrentUser();
  const { isFavorite } = useFavorites();
  const actions = useActions();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const favorite = isFavorite(walkerId);

  const toggle = () => {
    if (!user) {
      toast.info('Entre para salvar favoritos', 'Use uma conta demonstrativa em segundos.');
      navigate(`/entrar?voltar=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    actions.toggleFavorite(walkerId);
    toast.show({ tone: 'success', title: favorite ? 'Removido dos favoritos' : 'Salvo nos favoritos', link: favorite ? undefined : '/tutor/favoritos', duration: 2500 });
  };
  return { isFavorite: favorite, toggle };
}
