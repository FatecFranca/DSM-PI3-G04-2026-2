import { useState } from 'react';
import { Star } from 'lucide-react';
import Button from '../../components/common/Button';
import Field, { TextArea } from '../../components/forms/Field';
import { useBookingActions } from '../bookings/useBookingActions';
import { firstName } from '../../utils/format';

const LABELS = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];

/** Tutor review for a completed walk (independent from payment). */
export default function ReviewForm({ booking, onDone, compact = false }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const { review } = useBookingActions();
  const shown = hover || rating;

  const submit = (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Escolha de 1 a 5 estrelas.');
      return;
    }
    const result = review(booking.id, rating, comment);
    if (result) onDone?.(result);
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {!compact ? <h3 className="text-lg font-bold">Como foi o passeio com {firstName(booking.walker?.name)}?</h3> : null}
      <div>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Nota do passeio" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'} — ${LABELS[n]}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => {
                setRating(n);
                setError('');
              }}
              className="rounded-lg p-1 transition active:scale-90"
            >
              <Star size={36} className={n <= shown ? 'fill-gold-500 text-gold-500' : 'fill-transparent text-sand-300'} />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-ink-600">{LABELS[shown]}</span>
        </div>
        {error ? <p className="mt-1 text-[13px] font-medium text-danger-600">{error}</p> : null}
      </div>
      <Field label="Comentário" optional hint="Ajuda outros tutores a escolher. Seja específico.">
        <TextArea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="Pontualidade, cuidado com o pet, comunicação…" />
      </Field>
      <Button type="submit" fullWidth size="lg">
        Enviar avaliação
      </Button>
    </form>
  );
}
