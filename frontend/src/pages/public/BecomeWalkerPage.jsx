import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CalendarDays, Wallet, ClipboardCheck, ChevronDown, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import SmartImage from '../../components/common/SmartImage';
import { useActions } from '../../context/AppStore';
import { useCurrentUser } from '../../hooks/useAccount';
import { dogPhoto } from '../../data/mock/photos';
import { PLATFORM_FEE_RATE, APP_MODES } from '../../utils/constants';
import { formatBRL } from '../../utils/format';

const BENEFITS = [
  { icon: Eye, title: 'Visibilidade profissional', text: 'Perfil com fotos, cursos, avaliações reais e selos de habilidades. Tutores do seu bairro encontram você pela busca.' },
  { icon: CalendarDays, title: 'Agenda organizada', text: 'Defina seus horários semanais e bloqueie o que não puder atender. Solicitações só chegam em horários livres.' },
  { icon: Wallet, title: 'Renda com previsibilidade', text: 'Você define o preço por duração. Você recebe 50% assim que o passeio é fechado e os outros 50% ao finalizá-lo.' },
  { icon: ClipboardCheck, title: 'Análise antes de aceitar', text: 'Veja comportamento, gatilhos, equipamentos, saúde e alertas do pet antes de dizer sim. Recusar é sempre uma opção.' },
];

const FAQ = [
  { q: 'Quanto custa para participar?', a: 'Criar o perfil é gratuito. A plataforma retém uma taxa de serviço de 15% sobre cada passeio concluído.' },
  { q: 'Preciso ter experiência comprovada?', a: 'Não é obrigatório, mas cursos, certificados e experiência com perfis específicos (cães grandes, reativos, idosos) aumentam suas chances de ser escolhido.' },
  { q: 'Como funciona a verificação?', a: 'Você envia documento de identidade e autoriza a consulta de antecedentes. Neste protótipo, o envio é simulado e o perfil fica "em análise".' },
  { q: 'Posso passear com mais de um cão por vez?', a: 'Nesta versão, os passeios são individuais — mais atenção para cada cão e mais segurança para todos.' },
];

const WALKS_OPTIONS = [5, 10, 15, 20, 30];

export default function BecomeWalkerPage() {
  const user = useCurrentUser();
  const actions = useActions();
  const navigate = useNavigate();
  const [walksPerWeek, setWalksPerWeek] = useState(15);
  const [avgPrice, setAvgPrice] = useState(45);
  const [openFaq, setOpenFaq] = useState(0);

  const weeklyNet = walksPerWeek * avgPrice * (1 - PLATFORM_FEE_RATE);
  const monthlyNet = weeklyNet * 4.3;

  const start = () => {
    if (user) {
      actions.setMode(APP_MODES.WALKER);
      navigate('/dog-walker/perfil');
    } else {
      navigate('/cadastrar?perfil=dog-walker');
    }
  };

  return (
    <div className="pb-6">
      <section className="relative">
        <div className="container-page grid items-center gap-8 pt-8 md:pt-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-800">Seja um dog walker</p>
            <h1 className="mt-3 text-[32px] font-bold leading-[1.08] tracking-tight md:text-[50px]">Transforme seu cuidado com cães em renda</h1>
            <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-ink-600">
              Atenda tutores do seu bairro, escolha os passeios que fazem sentido para você e receba com o valor garantido antes de sair de casa.
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <Button variant="gold" size="lg" onClick={start} iconRight={ArrowRight}>
                Quero ser dog walker
              </Button>
              <Button to="/como-funciona?perfil=dog-walker" variant="secondary" size="lg">
                Como funciona
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SmartImage src={dogPhoto('walkPair', 700)} alt="Profissional passeando com cães" className="aspect-[3/4] w-full rounded-3xl" rounded="rounded-3xl" />
            <div className="grid gap-3">
              <SmartImage src={dogPhoto('border', 600)} alt="" className="aspect-square w-full rounded-3xl" rounded="rounded-3xl" />
              <SmartImage src={dogPhoto('running', 600)} alt="" className="aspect-square w-full rounded-3xl" rounded="rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-14 md:mt-20" aria-labelledby="beneficios">
        <h2 id="beneficios" className="text-2xl font-bold tracking-tight md:text-3xl">Por que atender pelo Rolê de Pet</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-3xl border border-sand-200 bg-white p-5 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-500 text-ink-900">
                <b.icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{b.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-600">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-14 md:mt-20" aria-labelledby="estimativa">
        <div className="grid gap-6 rounded-[2rem] bg-ink-900 p-6 text-white md:grid-cols-2 md:p-10">
          <div>
            <h2 id="estimativa" className="text-2xl font-bold md:text-3xl">Estime seus ganhos</h2>
            <p className="mt-2 text-[15px] text-white/70">Simulação ilustrativa, já descontada a taxa de serviço de {Math.round(PLATFORM_FEE_RATE * 100)}%.</p>

            <fieldset className="mt-6">
              <legend className="mb-2.5 text-sm font-semibold text-white/90">Passeios por semana</legend>
              <div className="flex flex-wrap gap-2">
                {WALKS_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={walksPerWeek === n}
                    onClick={() => setWalksPerWeek(n)}
                    className={`h-10 min-w-12 rounded-full px-4 text-sm font-semibold transition ${walksPerWeek === n ? 'bg-gold-500 text-ink-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-6">
              <label htmlFor="avg-price" className="flex justify-between text-sm font-semibold text-white/90">
                <span>Preço médio por passeio</span>
                <span className="text-gold-400">{formatBRL(avgPrice)}</span>
              </label>
              <input
                id="avg-price"
                type="range"
                min={25}
                max={90}
                step={1}
                value={avgPrice}
                onChange={(e) => setAvgPrice(Number(e.target.value))}
                className="mt-3 w-full accent-[#F9A825]"
              />
              <div className="mt-1 flex justify-between text-[12px] text-white/50">
                <span>R$ 25</span>
                <span>R$ 90</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <p className="text-sm text-white/70">Estimativa mensal líquida</p>
            <p className="mt-1 text-[40px] font-bold leading-none tracking-tight text-gold-400 md:text-[52px]">{formatBRL(monthlyNet)}</p>
            <p className="mt-3 text-[15px] text-white/80">
              {formatBRL(weeklyNet)} por semana · {walksPerWeek} passeios × {formatBRL(avgPrice)}
            </p>
            <p className="mt-4 text-[13px] text-white/50">Valores reais dependem da demanda no seu bairro, da sua agenda e das avaliações.</p>
            <Button variant="gold" size="lg" className="mt-6" onClick={start}>
              Começar meu perfil
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page mt-14 grid gap-8 md:mt-20 lg:grid-cols-[1fr_1.4fr]" aria-labelledby="faq-walker">
        <div>
          <h2 id="faq-walker" className="text-2xl font-bold tracking-tight md:text-3xl">Perguntas frequentes</h2>
          <p className="mt-2 text-[15px] text-ink-600">Mais respostas na Central de ajuda.</p>
          <Button to="/ajuda?categoria=dog-walkers" variant="secondary" className="mt-4">
            Ajuda para dog walkers
          </Button>
        </div>
        <div className="divide-y divide-sand-200 rounded-3xl border border-sand-200 bg-white">
          {FAQ.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`bw-faq-${i}`}
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold"
                  >
                    {item.q}
                    <ChevronDown size={18} className={`shrink-0 transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                </h3>
                <div id={`bw-faq-${i}`} hidden={!open} className="px-5 pb-4 text-[15px] leading-relaxed text-ink-600">
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
