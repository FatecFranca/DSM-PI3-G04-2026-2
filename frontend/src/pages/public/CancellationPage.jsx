import { FileWarning, CheckCircle2, RotateCcw, XCircle, Clock } from 'lucide-react';
import Button from '../../components/common/Button';

/** Layout for provisional policy pages (cancellation, terms, privacy) */
export function LegalLayout({ title, updated, intro, sections, children }) {
  return (
    <div className="container-page pb-6 pt-8 md:pt-14">
      <div className="max-w-3xl">
      <h1 className="text-[30px] font-bold tracking-tight md:text-[40px]">{title}</h1>
      {updated ? <p className="mt-2 text-sm text-ink-600">Versão ilustrativa · atualizada em {updated}</p> : null}
      <div role="note" className="mt-5 flex gap-3 rounded-2xl border border-gold-500/40 bg-gold-50 p-4">
        <FileWarning size={20} className="mt-0.5 shrink-0 text-gold-800" aria-hidden="true" />
        <p className="text-[15px] leading-relaxed text-ink-900">
          <strong>Documento provisório e ilustrativo.</strong> Este texto faz parte de um protótipo, não tem validade jurídica e não constitui aconselhamento legal. A versão final deverá ser
          redigida e revisada por profissionais habilitados.
        </p>
      </div>
      {intro ? <p className="mt-6 text-[16px] leading-relaxed text-ink-900">{intro}</p> : null}
      {children}
      {sections?.length ? (
        <div className="mt-8 space-y-8">
          {sections.map((s, i) => (
            <section key={s.title} aria-labelledby={`legal-${i}`}>
              <h2 id={`legal-${i}`} className="text-xl font-bold">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-2.5 space-y-2.5 text-[15px] leading-relaxed text-ink-600">
                {s.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
      <div className="mt-10 flex flex-wrap gap-2 border-t border-sand-200 pt-6">
        <Button to="/ajuda" variant="secondary">Central de ajuda</Button>
        <Button to="/" variant="ghost">Voltar ao início</Button>
      </div>
      </div>
    </div>
  );
}

const RULES = [
  { icon: CheckCircle2, tone: 'text-success-600 bg-success-50', when: 'Antes do aceite', what: 'Cancele a solicitação sem custo. Nada foi cobrado.' },
  { icon: CheckCircle2, tone: 'text-success-600 bg-success-50', when: 'Aceito, antes do pagamento', what: 'Cancele sem custo. A reserva só é confirmada com o pagamento.' },
  { icon: RotateCcw, tone: 'text-info-600 bg-info-50', when: 'Pago, antes do início do passeio', what: 'A metade ainda retida é devolvida. A primeira metade, já repassada na confirmação, fica com o dog walker pelo horário reservado.' },
  { icon: XCircle, tone: 'text-danger-600 bg-danger-50', when: 'Depois da retirada do pet', what: 'O passeio não pode mais ser cancelado pelo app. Fale com o suporte em caso de problema.' },
  { icon: Clock, tone: 'text-gold-800 bg-gold-50', when: 'Sem resposta do dog walker', what: 'A solicitação expira no horário do passeio e nada é cobrado.' },
];

export default function CancellationPage() {
  return (
    <LegalLayout
      title="Opções de cancelamento"
      updated="outubro de 2026"
      intro="O pagamento só acontece depois do aceite e é repassado em duas metades: 50% quando o passeio é fechado e 50% quando o dog walker o finaliza. Por isso, as regras de cancelamento dependem da etapa."
      sections={[
        {
          title: 'Cancelamento pelo dog walker',
          paragraphs: [
            'O dog walker pode recusar solicitações ou cancelar um passeio confirmado antes da retirada. Nesse caso, o tutor recebe o estorno integral, inclusive da metade já repassada, e é avisado imediatamente.',
            'Cancelamentos frequentes podem afetar a visibilidade do profissional na busca.',
          ],
        },
        {
          title: 'Como cancelar',
          paragraphs: ['Abra "Passeios", toque no passeio e escolha "Cancelar passeio". A confirmação aparece na tela e o status muda para "Cancelado" para os dois lados.'],
        },
        {
          title: 'Prazos de estorno',
          paragraphs: ['Na versão em produção, estornos em Pix serão imediatos e em cartão de crédito seguirão o prazo da operadora. Neste protótipo, o estorno é apenas simulado.'],
        },
      ]}
    >
      <ul className="mt-8 space-y-3">
        {RULES.map((r) => (
          <li key={r.when} className="flex gap-3.5 rounded-2xl border border-sand-200 bg-white p-4">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${r.tone}`}>
              <r.icon size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-ink-900">{r.when}</p>
              <p className="text-[15px] text-ink-600">{r.what}</p>
            </div>
          </li>
        ))}
      </ul>
    </LegalLayout>
  );
}
