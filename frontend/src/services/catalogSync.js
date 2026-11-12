import { api } from '../api';

// Sincronização em background do catálogo (walkers, pets, favoritos, conta)
// com a API. O estado local segue sendo a fonte imediata da UI; aqui só
// empurramos as mudanças (write-through optimista). Falha de rede não quebra
// o protótipo: a mudança fica só local e o desvio é logado no console.

const warn = (label, error) => {
  const detalhe = error?.response?.data?.message ?? error?.message ?? 'erro desconhecido';
  console.warn(`[catalogSync] ${label} falhou (${detalhe}). Alteração mantida só localmente.`);
};

/** PUT; em 404 (item criado localmente/sem backend), cria com POST. */
async function upsert(path, item, label) {
  if (!item?.id) return false;
  try {
    await api.put(`${path}/${item.id}`, item);
    return true;
  } catch (error) {
    if (error?.response?.status === 404) {
      try {
        await api.post(path, item);
        return true;
      } catch (postError) {
        warn(`${label}(post)`, postError);
        return false;
      }
    }
    warn(label, error);
    return false;
  }
}

export const upsertWalker = (walker) => upsert('/walkers', walker, 'upsertWalker');
export const upsertPet = (pet) => upsert('/pets', pet, 'upsertPet');

/** A conta (tutores) só é atualizada por PUT: sempre existe se veio da sessão. */
export async function upsertUser(user) {
  if (!user?.id) return false;
  try {
    await api.put(`/tutores/${user.id}`, user);
    return true;
  } catch (error) {
    warn('upsertUser', error);
    return false;
  }
}

export async function deletePetOnApi(petId) {
  try {
    await api.delete(`/pets/${petId}`);
    return true;
  } catch (error) {
    warn('deletePet', error);
    return false;
  }
}

/** Devolve a lista de favoritos atualizada pelo backend (ou null em falha). */
export async function toggleFavoriteOnApi(userId, walkerId) {
  try {
    const { data } = await api.post(`/tutores/${userId}/favoritos/${walkerId}`);
    return data?.favorites ?? null;
  } catch (error) {
    warn('toggleFavorite', error);
    return null;
  }
}
