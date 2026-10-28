import { Heart, Search } from 'lucide-react';
import { useMemo } from 'react';
import { PageTitle } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import WalkerCard from '../../components/cards/WalkerCard';
import EmptyState from '../../components/feedback/EmptyState';
import { useData } from '../../context/AppStore';
import { useFavorites } from '../../hooks/useAccount';
import { pluralize } from '../../utils/format';

export default function FavoritesPage() {
  const data = useData();
  const { ids } = useFavorites();
  const walkers = useMemo(() => ids.map((id) => data.walkers.find((w) => w.id === id)).filter(Boolean), [ids, data.walkers]);

  return (
    <div>
      <PageTitle title="Favoritos" subtitle={walkers.length ? `${pluralize(walkers.length, 'dog walker salvo', 'dog walkers salvos')}. Toque no coração para remover.` : undefined} />
      {walkers.length ? (
        <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {walkers.map((w) => (
            <li key={w.id}>
              <WalkerCard walker={w} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Heart}
          title="Nenhum favorito ainda"
          description="Toque no coração de um dog walker para salvá-lo aqui e encontrá-lo rápido na próxima vez."
          action={<Button to="/buscar" icon={Search}>Explorar dog walkers</Button>}
        />
      )}
    </div>
  );
}
