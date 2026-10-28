import { Link } from 'react-router-dom';
import { Plus, PawPrint, ChevronRight, Pill } from 'lucide-react';
import { PageTitle } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SmartImage from '../../components/common/SmartImage';
import EmptyState from '../../components/feedback/EmptyState';
import { SafetyAlert } from '../../components/cards/PetSafetyCard';
import { useMyPets } from '../../hooks/useAccount';
import { DOG_SIZE_LABEL, TEMPERAMENT_LABEL } from '../../utils/constants';

export default function MyPetsPage() {
  const pets = useMyPets();
  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle
        title="Meus pets"
        subtitle="Essas informações são mostradas ao dog walker antes de ele aceitar o passeio."
        back="/tutor/perfil"
        actions={<Button to="/tutor/pets/novo" icon={Plus} size="sm" className="hidden sm:inline-flex">Adicionar pet</Button>}
      />
      {pets.length ? (
        <>
          <ul className="grid gap-4 sm:grid-cols-2">
            {pets.map((pet) => (
              <li key={pet.id}>
                <Link to={`/tutor/pets/${pet.id}`} className="group block h-full animate-fade-up overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card transition hover:shadow-float">
                  <div className="flex gap-4 p-4">
                    <SmartImage src={pet.photo} alt={pet.name} className="h-24 w-24 rounded-2xl" rounded="rounded-2xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="truncate text-xl font-bold">{pet.name}</h2>
                        <ChevronRight size={20} className="mt-1 shrink-0 text-ink-400 transition group-hover:translate-x-0.5" aria-hidden="true" />
                      </div>
                      <p className="text-sm text-ink-600">
                        {pet.breed} · {pet.ageYears} {pet.ageYears === 1 ? 'ano' : 'anos'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge size="xs">{DOG_SIZE_LABEL[pet.size]} · {pet.weightKg} kg</Badge>
                        <Badge size="xs">{TEMPERAMENT_LABEL[pet.temperament]}</Badge>
                        {pet.health?.medication ? <Badge size="xs" tone="info" icon={Pill}>Medicação</Badge> : null}
                      </div>
                    </div>
                  </div>
                  {pet.safetyAlert ? <SafetyAlert pet={pet} className="mx-4 mb-4" /> : null}
                </Link>
              </li>
            ))}
          </ul>
          <Button to="/tutor/pets/novo" icon={Plus} variant="secondary" fullWidth className="mt-5 sm:hidden">Adicionar pet</Button>
        </>
      ) : (
        <EmptyState
          icon={PawPrint}
          title="Cadastre seu primeiro pet"
          description="Comportamento, saúde e alertas de segurança ajudam o dog walker a cuidar bem dele."
          action={<Button to="/tutor/pets/novo" icon={Plus}>Adicionar pet</Button>}
        />
      )}
    </div>
  );
}
