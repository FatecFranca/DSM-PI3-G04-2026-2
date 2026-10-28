import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Hourglass, Lock, CheckCircle2, CalendarDays, Receipt, Banknote, Info, ChevronRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import SmartImage from '../../components/common/SmartImage';
import { Card, PageTitle, SectionHeader } from '../../components/common/Layout';
import EmptyState from '../../components/feedback/EmptyState';
import { useToast } from '../../components/feedback/Toast';
import { useData } from '../../context/AppStore';
import { useActingWalker } from '../../hooks/useAccount';
import { walkerEarnings } from '../../services/paymentService';
import { formatBRL, firstName } from '../../utils/format';
import { daysFromToday, formatDate, formatDateShort, WEEKDAYS_SHORT, weekdayOf } from '../../utils/dates';

const CYCLE = [
  { label: 'Aceito', hint: 'Aguarda o pagamento do tutor' },
  { label: 'Passeio fechado', hint: '50% liberado na hora' },
  { label: 'Em passeio', hint: '50% aguardando a finalização' },
  { label: 'Finalizado', hint: 'Os outros 50% liberados' },
];

export default function WalkerEarningsPage() {
  const data = useData();
  const walker = useActingWalker();
  const toast = useToast();
  const summary = useMemo(() => (walker ? walkerEarnings(data, walker.id) : null), [data, walker]);

  const chart = useMemo(() => {
    if (!summary) return [];
    const days = Array.from({ length: 7 }, (_, i) => daysFromToday(i - 6));
    return days.map((date) => {
      const items = summary.transactions.filter((t) => t.date === date);
      return {
        date,
        released: items.filter((t) => t.status === 'released').reduce((n, t) => n + t.net, 0),
        held: items.filter((t) => t.status === 'held').reduce((n, t) => n + t.net, 0),
      };
    });
  }, [summary]);

  if (!walker || !summary) {
    return <EmptyState icon={Info} title="Perfil de dog walker não encontrado" action={<Button to="/dog-walker/perfil">Configurar perfil</Button>} />;
  }

  const max = Math.max(1, ...chart.map((d) => d.released + d.held));
  const ownerOf = (id) => data.users.find((u) => u.id === id);
  const petOf = (id) => data.pets.find((p) => p.id === id);

  return (
    <div className="space-y-7">
      <PageTitle title="Ganhos" subtitle="Você recebe 50% quando o passeio é fechado e 50% quando o finaliza." />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard icon={Hourglass} label="Ganhos pendentes" value={summary.pending.amount} hint={`${summary.pending.count} aceito(s) aguardando pagamento do tutor`} />
        <SummaryCard icon={Lock} label="A receber ao finalizar" value={summary.held.amount} hint={`2ª metade de ${summary.held.count} passeio(s) já fechado(s)`} />
        <SummaryCard icon={CheckCircle2} label="Ganhos liberados" value={summary.released.amount} hint={`${summary.released.count} passeio(s) · ${formatBRL(summary.releasedThisMonth)} neste mês`} highlight />
      </div>

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink-600">Saldo disponível para repasse</p>
          <p className="text-3xl font-bold tracking-tight">{formatBRL(summary.released.amount)}</p>
          <p className="mt-1 text-[13px] text-ink-600">
            Taxas da plataforma no período: {formatBRL(summary.feesTotal)}. Repasse demonstrativo — nenhuma transferência real é feita neste protótipo.
          </p>
        </div>
        <Button
          icon={Banknote}
          size="lg"
          disabled={summary.released.amount <= 0}
          onClick={() => toast.success('Repasse solicitado (demonstração)', `${formatBRL(summary.released.amount)} seria transferido para sua conta em até 1 dia útil.`)}
        >
          Solicitar repasse
        </Button>
      </Card>

      <section>
        <SectionHeader title="Últimos 7 dias" subtitle="Valores líquidos por data do passeio" />
        <Card className="p-5">
          <div className="flex h-44 items-end gap-2 sm:gap-4" role="list" aria-label="Ganhos líquidos por dia">
            {chart.map((d) => {
              const total = d.released + d.held;
              return (
                <div key={d.date} role="listitem" className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" aria-label={`${formatDate(d.date)}: ${formatBRL(d.released)} liberado, ${formatBRL(d.held)} a receber`}>
                  <span className="text-[11px] font-semibold text-ink-600">{total ? formatBRL(total).replace(',00', '') : ''}</span>
                  <div className="flex w-full max-w-12 flex-col-reverse overflow-hidden rounded-lg bg-cream-100" style={{ height: `${Math.max(4, (total / max) * 100)}%` }}>
                    <div className="bg-ink-900" style={{ height: total ? `${(d.released / total) * 100}%` : 0 }} />
                    <div className="bg-gold-500" style={{ height: total ? `${(d.held / total) * 100}%` : 0 }} />
                  </div>
                  <span className="text-[11px] uppercase text-ink-600">{WEEKDAYS_SHORT[weekdayOf(d.date)]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 text-[12px] text-ink-600">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-ink-900" aria-hidden="true" /> Liberado</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-gold-500" aria-hidden="true" /> A receber</span>
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader title="Como o pagamento funciona" />
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CYCLE.map((step, i) => (
            <li key={step.label} className="rounded-2xl border border-sand-200 bg-white p-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-on-accent">{i + 1}</span>
              <p className="mt-2 text-sm font-semibold">{step.label}</p>
              <p className="text-[12px] text-ink-600">{step.hint}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionHeader title="Histórico de transações" subtitle={`${summary.transactions.length} parcela(s)`} />
        {summary.transactions.length === 0 ? (
          <EmptyState icon={Receipt} title="Nenhuma transação ainda" description="Cada passeio pago gera duas parcelas: 50% na confirmação e 50% quando você o finaliza." />
        ) : (
          <Card className="divide-y divide-sand-200 overflow-hidden">
            {summary.transactions.map((t) => {
              const owner = ownerOf(t.ownerId);
              const pet = petOf(t.petId);
              return (
                <Link key={t.id} to={`/dog-walker/solicitacoes/${t.bookingId}`} className="flex items-center gap-3 p-3.5 hover:bg-cream-50/60 sm:p-4">
                  <SmartImage src={pet?.photo} alt={pet?.name} className="h-11 w-11 rounded-xl" rounded="rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">
                      {pet?.name ?? 'Pet'} <span className="font-normal text-ink-600">· {firstName(owner?.name)}</span>
                    </p>
                    <p className="flex flex-wrap items-center gap-x-2 text-[12px] text-ink-600">
                      <span className="inline-flex items-center gap-1"><CalendarDays size={12} aria-hidden="true" /> {formatDateShort(t.date)}</span>
                      <span>{t.label}</span>
                      <span>Bruto {formatBRL(t.gross)} · taxa {formatBRL(t.fee)}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[15px] font-bold">{formatBRL(t.net)}</span>
                    {t.status === 'released' ? <Badge size="xs" tone="success">Liberado</Badge> : t.live ? <StatusBadge status={t.bookingStatus} size="xs" /> : <Badge size="xs" tone="warning">Ao finalizar</Badge>}
                  </div>
                  <ChevronRight size={16} className="hidden shrink-0 text-ink-400 sm:block" aria-hidden="true" />
                </Link>
              );
            })}
          </Card>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, hint, highlight }) {
  return (
    <div className={`rounded-3xl border p-5 ${highlight ? 'border-ink-900 bg-ink-900 text-white' : 'border-sand-200 bg-white'}`}>
      <div className="flex items-center gap-2">
        <Icon size={18} className={highlight ? 'text-gold-400' : 'text-accent-ink'} aria-hidden="true" />
        <p className={`text-sm font-semibold ${highlight ? 'text-white/80' : 'text-ink-600'}`}>{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{formatBRL(value)}</p>
      <p className={`mt-1 text-[12px] ${highlight ? 'text-white/70' : 'text-ink-600'}`}>{hint}</p>
    </div>
  );
}
