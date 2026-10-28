import { useMemo } from 'react';
import { useData, useSession } from '../context/AppStore';
import { APP_MODES } from '../utils/constants';

export function useCurrentUser() {
  const data = useData();
  const session = useSession();
  return useMemo(() => data.users.find((u) => u.id === session.userId) ?? null, [data.users, session.userId]);
}

export function useMode() {
  const session = useSession();
  return {
    mode: session.mode,
    isWalkerMode: session.mode === APP_MODES.WALKER,
    isOwnerMode: session.mode === APP_MODES.OWNER,
  };
}

/** The signed-in account's own walker profile (null for tutor-only accounts) */
export function useActingWalker() {
  const data = useData();
  const user = useCurrentUser();
  const walkerId = user?.walkerProfileId;
  return useMemo(() => data.walkers.find((w) => w.id === walkerId) ?? null, [data.walkers, walkerId]);
}

export function useMyPets() {
  const data = useData();
  const user = useCurrentUser();
  return useMemo(() => (user ? data.pets.filter((p) => p.ownerId === user.id) : []), [data.pets, user]);
}

export function useFavorites() {
  const data = useData();
  const user = useCurrentUser();
  const ids = useMemo(() => (user ? data.favorites[user.id] || [] : []), [data.favorites, user]);
  return { ids, isFavorite: (walkerId) => ids.includes(walkerId) };
}
