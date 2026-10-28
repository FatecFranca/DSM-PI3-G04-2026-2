import { Link } from 'react-router-dom';
import { ShieldCheck, Navigation, Lock, ArrowRight, CalendarCheck, Search, Star } from 'lucide-react';
import SearchBar from '../../features/discovery/SearchBar';
import DiscoverySections from '../../features/discovery/DiscoverySections';
import SmartImage from '../../components/common/SmartImage';
import Button from '../../components/common/Button';
import { dogPhoto } from '../../data/mock/photos';
import { useData } from '../../context/AppStore';
import { formatNumber, formatRating } from '../../utils/format';

const TRUST = [
  { icon: ShieldCheck, title: 'Verificação', text: 'Identidade e antecedentes analisados antes do selo de verificado aparecer no perfil.' },
  { icon: Navigation, title: 'Passeio ao vivo', text: 'Acompanhe a rota, o tempo e a distância enquanto seu cão passeia.' },
  { icon: Lock, title: 'Pagamento protegido', text: 'Você paga só depois do aceite. Metade vai para o dog walker na confirmação e a outra metade só quando o passeio termina.' },
];

const STEPS = [
  { icon: Search, title: 'Encontre', text: 'Filtre por porte, reatividade, medicação e horário disponível.' },
  { icon: CalendarCheck, title: 'Solicite', text: 'O dog walker lê o perfil completo do seu pet antes de aceitar.' },
  { icon: Navigation, title: 'Acompanhe', text: 'Código de retirada, rota ao vivo e avaliação no final.' },
];

export default function HomePage() {
  const data = useData();
  const listed = data.walkers.filter((w) => !w.unlisted);
  const totalWalks = listed.reduce((n, w) => n + w.walksCount, 0);
  const avgRating = listed.reduce((n, w) => n + w.rating, 0) / (listed.length || 1);

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="container-page pt-4 md:pt-8">
          <div className="relative overflow-hidden rounded-[28px] md:rounded-[36px]">
            <SmartImage src={dogPhoto('border', 1800)} alt="Dog walker passeando com um cão na calçada" className="h-[340px] w-full sm:h-[420px] lg:h-[520px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/75 via-ink-900/25 to-ink-900/5" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 p-5 pb-8 sm:p-8 lg:p-12 lg:pb-28">
              <p className="mb-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-[13px] font-semibold text-white backdrop-blur">São Paulo · dog walkers avaliados por tutores</p>
              <h1 className="max-w-2xl text-[32px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">O rolê do seu cão, com quem entende dele.</h1>
              <p className="mt-3 max-w-xl text-[15px] text-white/90 sm:text-lg">Dog walkers que leem o perfil do seu pet antes de aceitar, passeio acompanhado ao vivo e pagamento protegido.</p>
            </div>
          </div>
          <div className="relative z-10 -mt-6 px-1 sm:px-4 lg:-mt-12 lg:px-10">
            <SearchBar />
          </div>
        </div>
      </section>

      <div className="container-page mt-14">
        <DiscoverySections />
      </div>

      {/* Trust strip */}
      <section className="mt-16 bg-white py-14" aria-labelledby="confianca">
        <div className="container-page">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="confianca" className="text-2xl font-bold tracking-tight md:text-3xl">Confiança em cada etapa</h2>
              <p className="mt-1 text-ink-600">A Garantia Rolê de Pet reúne três camadas de proteção.</p>
            </div>
            <Link to="/seguranca" className="inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
              Conheça a Garantia Rolê de Pet <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TRUST.map((t) => (
              <div key={t.title} className="rounded-3xl border border-sand-200 bg-cream-50 p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wine-500 text-white">
                  <t.icon size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{t.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-600">{t.text}</p>
              </div>
            ))}
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-3 rounded-3xl bg-wine-700 p-5 text-white sm:p-8">
            <div>
              <dt className="text-[12px] text-white/70 sm:text-sm">Passeios concluídos</dt>
              <dd className="text-xl font-extrabold sm:text-3xl">{formatNumber(totalWalks)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-white/70 sm:text-sm">Nota média</dt>
              <dd className="flex items-center gap-1 text-xl font-extrabold sm:text-3xl">
                {formatRating(avgRating)} <Star size={18} className="fill-gold-500 text-gold-500" aria-hidden="true" />
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-white/70 sm:text-sm">Dog walkers</dt>
              <dd className="text-xl font-extrabold sm:text-3xl">{listed.length}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[12px] text-ink-400">Números da base demonstrativa deste protótipo.</p>
        </div>
      </section>

      {/* How it works teaser */}
      <section className="container-page mt-16" aria-labelledby="como">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 lg:order-1">
            <h2 id="como" className="text-2xl font-bold tracking-tight md:text-3xl">Como funciona</h2>
            <ol className="mt-6 space-y-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
                    <s.icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-bold">
                      {i + 1}. {s.title}
                    </h3>
                    <p className="text-[15px] text-ink-600">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button to="/como-funciona" variant="secondary" className="mt-7" iconRight={ArrowRight}>
              Ver as seis etapas
            </Button>
          </div>
          <div className="order-1 grid grid-cols-2 gap-3 lg:order-2">
            <SmartImage src={dogPhoto('walk', 700)} alt="Passeio com cão na calçada" className="aspect-[3/4] w-full rounded-3xl" rounded="rounded-3xl" />
            <SmartImage src={dogPhoto('leash', 700)} alt="Cão animado para o passeio" className="mt-10 aspect-[3/4] w-full rounded-3xl" rounded="rounded-3xl" />
          </div>
        </div>
      </section>

      {/* Walker recruitment band */}
      <section className="container-page mt-16" aria-labelledby="recrutamento">
        <div className="relative overflow-hidden rounded-[32px] bg-ink-900">
          <div className="grid lg:grid-cols-2">
            <div className="p-7 sm:p-10 lg:p-14">
              <span className="inline-flex rounded-full bg-gold-500 px-3 py-1 text-[12px] font-bold uppercase tracking-wide text-ink-900">Para profissionais</span>
              <h2 id="recrutamento" className="mt-4 text-[28px] font-extrabold leading-tight text-white md:text-4xl">Transforme o seu jeito com cães em renda.</h2>
              <p className="mt-3 max-w-md text-white/80">Agenda organizada, perfil profissional com avaliações e o perfil completo de cada pet antes de você aceitar.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button to="/seja-dog-walker" variant="gold" size="lg" iconRight={ArrowRight}>
                  Seja um dog walker
                </Button>
                <Button to="/indicar" variant="ghost" size="lg" className="text-white hover:bg-white/10">
                  Indicar alguém
                </Button>
              </div>
            </div>
            <SmartImage src={dogPhoto('walkPair', 1200)} alt="Dog walker com cão" className="h-56 w-full sm:h-72 lg:h-full" />
          </div>
        </div>
      </section>
    </>
  );
}
