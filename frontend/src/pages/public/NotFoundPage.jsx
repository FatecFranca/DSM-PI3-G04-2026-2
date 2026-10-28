import { Compass } from 'lucide-react';
import Button from '../../components/common/Button';
import SmartImage from '../../components/common/SmartImage';
import { dogPhoto } from '../../data/mock/photos';

export default function NotFoundPage() {
  return (
    <div className="container-page flex flex-col items-center py-12 text-center md:py-20">
      <SmartImage src={dogPhoto('husky', 500)} alt="Beagle farejando o caminho" className="h-40 w-40 rounded-full md:h-48 md:w-48" rounded="rounded-full" />
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-accent-ink">Erro 404</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight md:text-[38px]">Esse caminho não leva a lugar nenhum</h1>
      <p className="mt-3 max-w-md text-[16px] text-ink-600">A página que você procura não existe ou mudou de endereço.</p>
      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <Button to="/" size="lg">
          Voltar ao início
        </Button>
        <Button to="/buscar" variant="secondary" size="lg" icon={Compass}>
          Buscar dog walkers
        </Button>
      </div>
    </div>
  );
}
