import { useSearchParams } from 'react-router-dom';
import { Search, ClipboardList, Send, CreditCard, Navigation, Star, UserRoundPen, ShieldCheck, Inbox, CalendarDays, KeyRound, Wallet, Heart, Footprints } from 'lucide-react';
import Tabs from '../../components/common/Tabs';
import Button from '../../components/common/Button';
import SmartImage from '../../components/common/SmartImage';
import { dogPhoto } from '../../data/mock/photos';

const STEPS = {
  tutor: [
    { icon: ClipboardList, title: 'Monte o perfil do seu pet', text: 'Comportamento, gatilhos, equipamentos, saúde e um alerta de segurança curto. É o que o dog walker lê antes de aceitar.', photo: 'golden' },
    { icon: Search, title: 'Encontre o profissional certo', text: 'Busque pelo bairro e filtre por porte atendido, experiência com reativos, focinheira, avaliação, preço e disponibilidade.', photo: 'walkPair' },
    { icon: Send, title: 'Solicite o passeio', text: 'Escolha pet, data, horário e duração. O preço aparece antes de enviar. Nada é cobrado nesta etapa.', photo: 'leash' },
    { icon: CreditCard, title: 'Pague só depois do aceite', text: 'Quando o dog walker aceita, você confirma o pagamento. Metade vai para ele na hora e a outra metade fica retida até o fim do passeio.', photo: 'happy' },
    { icon: Navigation, title: 'Acompanhe ao vivo', text: 'Código de retirada na porta, mapa com a rota, tempo decorrido e previsão de retorno. Mensagens a um toque.', photo: 'park' },
    { icon: Star, title: 'Receba o resumo e avalie', text: 'Ao final, você vê o resumo da rota, a segunda metade do pagamento é repassada e você avalia o profissional.', photo: 'sunset' },
  ],
  walker: [
    { icon: UserRoundPen, title: 'Crie seu perfil profissional', text: 'Biografia, cursos, portes que atende, experiência com reativos e medicação, bairros e preços por duração.', photo: 'goldenPark' },
    { icon: ShieldCheck, title: 'Envie a verificação', text: 'Identidade e antecedentes. O selo de verificado só aparece quando as duas etapas são aprovadas.', photo: 'walk' },
    { icon: CalendarDays, title: 'Organize sua agenda', text: 'Defina horários semanais e bloqueie o que não puder atender. Tutores só veem horários livres.', photo: 'border' },
    { icon: Inbox, title: 'Analise antes de aceitar', text: 'Cada solicitação traz o perfil completo do pet e os alertas de saúde e segurança. Aceite só o que fizer sentido.', photo: 'shepherd' },
    { icon: KeyRound, title: 'Conduza o passeio pelo app', text: 'Confirme a retirada com o código do tutor, inicie e finalize o passeio com botões grandes, com a tela aberta.', photo: 'running' },
    { icon: Wallet, title: 'Receba com segurança', text: 'Você recebe 50% assim que o tutor paga e o passeio fica fechado, e os outros 50% quando finaliza o passeio.', photo: 'twoDogs' },
  ],
};

export default function HowItWorksPage() {
  const [params, setParams] = useSearchParams();
  const profile = params.get('perfil') === 'dog-walker' ? 'walker' : 'tutor';
  const steps = STEPS[profile];
  const isWalker = profile === 'walker';

  return (
    <div className="pb-8">
      <section className="container-page pt-8 text-center md:pt-14">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-ink">Como funciona</p>
        <h1 className="mx-auto mt-3 max-w-2xl text-[30px] font-bold leading-[1.1] tracking-tight md:text-[46px]">
          {isWalker ? 'Seu trabalho com cães, organizado do pedido ao pagamento' : 'Passeios com quem entende o seu cão'}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[16px] text-ink-600">
          {isWalker
            ? 'Você decide quem atende, quando atende e recebe com o valor garantido antes do passeio.'
            : 'Do perfil detalhado do pet ao acompanhamento ao vivo, cada etapa foi pensada para você ficar tranquilo.'}
        </p>
        <div className="mx-auto mt-7 max-w-sm">
          <Tabs
            ariaLabel="Ver orientações para"
            items={[
              { id: 'tutor', label: 'Tutores', icon: Heart },
              { id: 'walker', label: 'Dog walkers', icon: Footprints },
            ]}
            value={profile}
            onChange={(id) => setParams(id === 'walker' ? { perfil: 'dog-walker' } : {}, { replace: true })}
          />
        </div>
      </section>

      <section className="container-page mt-10 md:mt-16" aria-label="Etapas">
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="group animate-fade-up overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card">
              <div className="relative">
                <SmartImage src={dogPhoto(step.photo, 700)} alt="" className="aspect-[16/10] w-full transition duration-500 group-hover:scale-[1.03]" />
                <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[15px] font-bold text-ink-900 shadow-card">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                    <step.icon size={18} aria-hidden="true" />
                  </span>
                  <h2 className="text-lg font-bold leading-snug">{step.title}</h2>
                </div>
                <p className="mt-2.5 text-[15px] leading-relaxed text-ink-600">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page mt-14">
        <div className={`flex flex-col items-start gap-5 rounded-[2rem] p-7 md:flex-row md:items-center md:justify-between md:p-10 ${isWalker ? 'bg-gold-500 text-ink-900' : 'bg-wine-500 text-white'}`}>
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">{isWalker ? 'Comece a receber solicitações' : 'Encontre um dog walker no seu bairro'}</h2>
            <p className={`mt-2 max-w-lg text-[15px] ${isWalker ? 'text-ink-900/80' : 'text-white/80'}`}>
              {isWalker ? 'Crie seu perfil profissional e envie a verificação.' : 'Profissionais com avaliações reais, preços claros e acompanhamento ao vivo.'}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {isWalker ? (
              <>
                <Button to="/seja-dog-walker" variant="dark" size="lg">Quero ser dog walker</Button>
                <Button to="/ajuda?categoria=dog-walkers" variant="secondary" size="lg">Tirar dúvidas</Button>
              </>
            ) : (
              <>
                <Button to="/buscar" variant="gold" size="lg">Buscar dog walkers</Button>
                <Button to="/seguranca" variant="secondary" size="lg">Ver a Garantia Rolê de Pet</Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
