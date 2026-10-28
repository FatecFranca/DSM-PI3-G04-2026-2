import { ShieldCheck, Navigation, Lock, Info, KeyRound, AlertTriangle, LifeBuoy, MapPinOff, Check } from 'lucide-react';
import Button from '../../components/common/Button';
import SmartImage from '../../components/common/SmartImage';
import Badge from '../../components/common/Badge';
import { dogPhoto } from '../../data/mock/photos';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Verificação de identidade e antecedentes',
    photo: 'walkPair',
    points: [
      'Documento com foto e selfie para confirmar a identidade do profissional.',
      'Consulta de antecedentes criminais, sujeita a análise legal e ao consentimento do profissional.',
      'O selo "Verificado" só aparece quando as duas etapas estão aprovadas. Perfis em análise são sinalizados.',
    ],
  },
  {
    icon: Navigation,
    title: 'Passeio ao vivo',
    photo: 'park',
    points: [
      'Código de 4 dígitos confirma que o pet foi entregue à pessoa certa.',
      'Mapa com a rota percorrida, tempo decorrido, distância e previsão de retorno.',
      'Botão "Preciso de ajuda" e compartilhamento do acompanhamento com alguém de confiança.',
    ],
  },
  {
    icon: Lock,
    title: 'Pagamento protegido',
    photo: 'happy',
    points: [
      'Você só paga depois que o dog walker aceita a solicitação.',
      'Metade vai para o profissional na confirmação; a outra metade fica retida até ele finalizar o passeio.',
      'Se o dog walker cancelar, o estorno é integral. Se você cancelar depois de pagar, a metade retida é devolvida.',
    ],
  },
];

export default function SafetyPage() {
  return (
    <div className="pb-6">
      <section className="container-page grid items-center gap-8 pt-8 md:pt-14 lg:grid-cols-2">
        <div>
          <Badge tone="accent" icon={ShieldCheck}>Garantia Rolê de Pet</Badge>
          <h1 className="mt-4 text-[30px] font-bold leading-[1.1] tracking-tight md:text-[46px]">Segurança em cada etapa do passeio</h1>
          <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-ink-600">
            Três camadas de proteção para o seu cão e para você: quem passeia é verificado, o passeio é acompanhado e metade do pagamento só é liberada quando o passeio termina.
          </p>
        </div>
        <SmartImage src={dogPhoto('goldenPark', 1200)} alt="Dog walker conduzindo cães na guia" className="aspect-[16/11] w-full rounded-[2rem]" rounded="rounded-[2rem]" />
      </section>

      <section className="container-page mt-8">
        <div role="note" className="flex gap-3 rounded-2xl border border-gold-500/40 bg-gold-50 p-4 md:p-5">
          <Info size={20} className="mt-0.5 shrink-0 text-gold-800" aria-hidden="true" />
          <p className="text-[15px] leading-relaxed text-ink-900">
            <strong>Este é um protótipo.</strong> A página descreve como o produto foi pensado para funcionar. Hoje, as verificações, a localização, os pagamentos e o fluxo de ajuda são
            <strong> simulados</strong>: nenhuma checagem de documentos ou antecedentes é feita, não há seguro contratado, nenhum serviço de emergência é acionado e nenhum valor é
            realmente retido ou transferido.
          </p>
        </div>
      </section>

      <section className="container-page mt-12 space-y-6 md:mt-16" aria-label="Pilares de segurança">
        {PILLARS.map((pillar, i) => (
          <article key={pillar.title} className="grid items-center gap-6 overflow-hidden rounded-[2rem] border border-sand-200 bg-white p-5 shadow-card md:grid-cols-2 md:p-8">
            <div className={i % 2 ? 'md:order-2' : ''}>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-on-accent">
                  <pillar.icon size={24} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-ink-600">Pilar {i + 1}</span>
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight">{pillar.title}</h2>
              <ul className="mt-4 space-y-3">
                {pillar.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-900">
                    <Check size={18} className="mt-0.5 shrink-0 text-success-600" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <SmartImage src={dogPhoto(pillar.photo, 900)} alt="" className="aspect-[4/3] w-full rounded-3xl" rounded="rounded-3xl" />
          </article>
        ))}
      </section>

      <section className="container-page mt-14 grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl bg-cream-100 p-6">
          <AlertTriangle size={24} className="text-danger-600" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold">Perfil de segurança do pet</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
            Gatilhos, reatividade, focinheira, medicação com dosagem e horário, restrições de esforço e contatos de emergência. O alerta curto do pet aparece em destaque antes do aceite e durante todo o passeio.
          </p>
        </div>
        <div className="rounded-3xl bg-cream-100 p-6">
          <KeyRound size={24} className="text-accent-ink" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold">Retirada confirmada</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
            O dog walker só inicia o passeio depois de informar o código exibido no app do tutor. Sem código, sem retirada.
          </p>
        </div>
        <div className="rounded-3xl bg-cream-100 p-6">
          <LifeBuoy size={24} className="text-accent-ink" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold">Ajuda durante o passeio</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
            Tutor e dog walker acessam o suporte e os contatos de emergência a um toque. Em risco à vida, ligue diretamente para 192 ou 193.
          </p>
        </div>
      </section>

      <section className="container-page mt-14">
        <div className="flex flex-col gap-5 rounded-[2rem] border border-sand-200 bg-white p-6 md:flex-row md:items-start md:p-8">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-info-50 text-info-600">
            <MapPinOff size={24} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-bold">Localização é um dado sensível</h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-ink-600">
              Na versão em produção, a localização do dog walker será coletada apenas durante o passeio e com consentimento, visível somente para o tutor responsável e para quem ele escolher
              compartilhar, com retenção limitada e controles de acesso, conforme a Lei Geral de Proteção de Dados (LGPD). Links de compartilhamento expiram ao fim do passeio.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button to="/privacidade" variant="secondary" size="sm">Ler a política de privacidade</Button>
              <Button to="/ajuda?categoria=emergencia" variant="ghost" size="sm">Dúvidas sobre segurança</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-14 text-center">
        <h2 className="text-2xl font-bold">Pronto para o primeiro rolê?</h2>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Button to="/buscar" size="lg">Buscar dog walkers</Button>
          <Button to="/como-funciona" variant="secondary" size="lg">Como funciona</Button>
        </div>
      </section>
    </div>
  );
}
