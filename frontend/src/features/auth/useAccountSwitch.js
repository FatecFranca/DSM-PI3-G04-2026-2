import { useNavigate } from 'react-router-dom';
import { useActions, useData } from '../../context/AppStore';
import { useToast } from '../../components/feedback/Toast';
import { userIdForWalker } from '../../data/mock/users';
import { APP_MODES } from '../../utils/constants';
import { firstName } from '../../utils/format';

/**
 * Demo helper: sign out of the current account and sign in to another one, as if
 * that person had opened the app on their own phone. Used to show the dog walker's
 * side of a booking with the walker's real identity.
 */
export function useAccountSwitch() {
  const actions = useActions();
  const data = useData();
  const navigate = useNavigate();
  const toast = useToast();

  const switchTo = (userId, mode, path) => {
    const user = actions.signInAs(userId, mode);
    if (!user) {
      toast.error('Conta não encontrada');
      return null;
    }
    toast.info(`Você entrou como ${firstName(user.name)}`, mode === APP_MODES.WALKER ? 'Área do dog walker' : 'Área do tutor');
    navigate(path ?? (mode === APP_MODES.WALKER ? '/dog-walker/hoje' : '/tutor'));
    return user;
  };

  return {
    switchTo,
    /** Sign in as the account that owns `walkerId` and open `path` in dog walker mode */
    switchToWalker: (walkerId, path) => {
      const userId = userIdForWalker(data.users, walkerId);
      return userId ? switchTo(userId, APP_MODES.WALKER, path) : null;
    },
    /** Sign in as the tutor of a booking and open `path` in tutor mode */
    switchToOwner: (ownerId, path) => switchTo(ownerId, APP_MODES.OWNER, path),
  };
}
