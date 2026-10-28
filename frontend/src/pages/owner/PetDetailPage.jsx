import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, Search, SearchX } from 'lucide-react';
import { PageTitle, SectionHeader } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/Modal';
import EmptyState from '../../components/feedback/EmptyState';
import PetSafetyCard from '../../components/cards/PetSafetyCard';
import BookingCard from '../../components/cards/BookingCard';
import { useActions, useData } from '../../context/AppStore';
import { useCurrentUser } from '../../hooks/useAccount';
import { useToast } from '../../components/feedback/Toast';
import { enrichBooking, byStartDesc } from '../../features/bookings/bookingSelectors';

export default function PetDetailPage() {
  const { petId } = useParams();
  const data = useData();
  const user = useCurrentUser();
  const actions = useActions();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pet = data.pets.find((p) => p.id === petId && p.ownerId === user?.id);

  const walks = useMemo(
    () => data.bookings.filter((b) => b.petId === petId).sort(byStartDesc).slice(0, 4).map((b) => enrichBooking(data, b)),
    [data, petId],
  );

  if (!pet) {
    return (
      <div className="mx-auto max-w-xl">
        <PageTitle title="Pet" back="/tutor/pets" />
        <EmptyState icon={SearchX} title="Pet não encontrado" description="Ele pode ter sido removido." action={<Button to="/tutor/pets">Ver meus pets</Button>} />
      </div>
    );
  }

  const remove = () => {
    try {
      actions.deletePet(pet.id);
      toast.success(`${pet.name} foi removido`);
      navigate('/tutor/pets');
    } catch (error) {
      toast.error('Não foi possível remover', error.message);
    }
    setConfirmDelete(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        title={pet.name}
        back="/tutor/pets"
        actions={<Button to={`/tutor/pets/${pet.id}/editar`} variant="secondary" size="sm" icon={Pencil}>Editar</Button>}
      />
      <PetSafetyCard pet={pet} />

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button to={`/buscar?pet=${pet.id}`} icon={Search} size="lg" className="sm:flex-1">Encontrar dog walker para {pet.name}</Button>
        <Button variant="dangerGhost" icon={Trash2} size="lg" onClick={() => setConfirmDelete(true)}>Remover pet</Button>
      </div>

      <section className="mt-10">
        <SectionHeader title="Passeios recentes" actionTo={walks.length ? '/tutor/passeios?aba=concluidos' : undefined} />
        {walks.length ? (
          <ul className="space-y-3">
            {walks.map((b) => (
              <li key={b.id}>
                <BookingCard booking={b} to={`/tutor/passeios/${b.id}`} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[15px] text-ink-600">{pet.name} ainda não fez passeios pelo Rolê de Pet.</p>
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        tone="danger"
        title={`Remover ${pet.name}?`}
        description="O perfil e as informações de segurança serão apagados. O histórico de passeios concluídos continua disponível."
        confirmLabel="Remover"
        cancelLabel="Manter"
      />
    </div>
  );
}
