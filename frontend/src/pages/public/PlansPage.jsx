import { useState } from 'react';
import { CalendarHeart, Check, Sparkles, BellRing, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SmartImage from '../../components/common/SmartImage';
import { useActions } from '../../context/AppStore';
import { useCurrentUser } from '../../hooks/useAccount';
import { useToast } from '../../components/feedback/Toast';
import { dogPhoto } from '../../data/mock/photos';
import { formatBRL } from '../../utils/format';

// Illustrative plans for a future feature. Reference price: 60-min walk at R$ 55.
const REFERENCE_PRICE = 55;
const PLANS = [
  { id: 'p3', title: '3 passeios por semana', perWeek: 3, discount: 0.05, perks: ['Mesmo dog walker toda semana', 'Dias e horários fixos', 'Remarcação flexível'] },
  { id: 'p5', title: '5 passeios por semana', perWeek: 5, discount: 0.1, featured: true, perks: ['Mesmo dog walker toda semana', 'Prioridade na agenda', 'Relatório semanal do passeio'] },
  { id: 'p7', title: 'Todos os dias', perWeek: 7, discount: 0.15, perks: ['Rotina completa, inclusive fins de semana', 'Substituto indicado em ausências', 'Relatório semanal do passeio'] },
];

export default function PlansPage() {
  const user = useCurrentUser();
  const actions = useActions();
  const toast = useToast();
  const [joined, setJoined] = useState(null);

  const join = (plan) => {
    if (user) {
      actions.pushNotification({
        audience: 'owner',
        userId: user.id,
        kind: 'system',
        title: 'Você está na lista de espera',
        body: `Avisaremos quando o plano "${plan.title}" estiver disponível no seu bairro.`,
        link: '/planos',
      });
    } else {
      toast.info('Interesse registrado', 'Entre na sua conta para receber o aviso quando o plano for lançado.');
    }
    setJoined(plan.id);
  };

  return (
    <div className="pb-6">
      <section className="container-page grid items-center gap-8 pt-8 md:pt-14 lg:grid-cols-2">
        <div>
          <Badge tone="gold" icon={Sparkles}>
            Em breve · prévia
          </Badge>
          <h1 className="mt-4 text-[30px] font-bold leading-[1.1] tracking-tight md:text-[46px]">Plano recorrente: a rotina que seu cão precisa</h1>
          <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-ink-600">
            Passeios fixos com o mesmo dog walker, cobrança semanal e desconto progressivo. Estamos preparando o lançamento — entre na lista de espera.
          </p>
        </div>
        <SmartImage src={dogPhoto('labrador', 1100)} alt="Cão pronto para o passeio" className="aspect-[16/11] w-full rounded-[2rem]" rounded="rounded-[2rem]" />
      </section>

      <section className="container-page mt-12" aria-label="Planos">
        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => {
            const weekly = plan.perWeek * REFERENCE_PRICE * (1 - plan.discount);
            const isJoined = joined === plan.id;
            return (
              <article key={plan.id} className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-card ${plan.featured ? 'border-ink-900 ring-1 ring-ink-900' : 'border-sand-200'}`}>
                {plan.featured ? <span className="absolute -top-3 left-6 rounded-full bg-ink-900 px-3 py-1 text-[12px] font-bold text-white">Mais escolhido</span> : null}
                <CalendarHeart size={26} className="text-accent-ink" aria-hidden="true" />
                <h2 className="mt-3 text-xl font-bold">{plan.title}</h2>
                <p className="mt-1 text-sm text-ink-600">{Math.round(plan.discount * 100)}% de desconto sobre o passeio avulso</p>
                <p className="mt-4">
                  <span className="text-[28px] font-bold tracking-tight">{formatBRL(weekly)}</span>
                  <span className="text-ink-600"> / semana</span>
                </p>
                <p className="text-[12px] text-ink-400">Exemplo com passeios de 60 min a {formatBRL(REFERENCE_PRICE)}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex gap-2 text-[15px]">
                      <Check size={18} className="mt-0.5 shrink-0 text-success-600" aria-hidden="true" /> {perk}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6" fullWidth variant={plan.featured ? 'primary' : 'secondary'} icon={isJoined ? CheckCircle2 : BellRing} onClick={() => join(plan)} disabled={isJoined}>
                  {isJoined ? 'Você está na lista' : 'Entrar na lista de espera'}
                </Button>
              </article>
            );
          })}
        </div>
        <p className="mt-6 text-center text-[13px] text-ink-600">Valores e condições ilustrativos. Enquanto isso, você pode contratar passeios avulsos com o mesmo profissional sempre que quiser.</p>
        <div className="mt-4 flex justify-center">
          <Button to="/buscar" variant="ghost">
            Buscar passeio avulso
          </Button>
        </div>
      </section>
    </div>
  );
}
