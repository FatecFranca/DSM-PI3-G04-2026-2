import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound, PawPrint, CreditCard, QrCode, Plus, Trash2, Star, Receipt, Phone, Settings, ArrowLeftRight, LogOut, RotateCcw, ChevronRight, Pencil, ShieldCheck, Info } from 'lucide-react';
import { PageTitle, Card, InfoRow } from '../../components/common/Layout';
import Button, { IconButton } from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SmartImage, { Avatar } from '../../components/common/SmartImage';
import Modal, { ConfirmDialog } from '../../components/common/Modal';
import Field, { TextInput, Select, Toggle, RadioCard } from '../../components/forms/Field';
import { useActions, useData } from '../../context/AppStore';
import { useCurrentUser, useMyPets } from '../../hooks/useAccount';
import { useToast } from '../../components/feedback/Toast';
import { useSwitchMode } from '../../components/navigation/AccountMenu';
import { ownerPayments } from '../../services/paymentService';
import { formatBRL, firstName } from '../../utils/format';
import { formatDateTime } from '../../utils/dates';
import { APP_MODES, NEIGHBORHOODS } from '../../utils/constants';
import { OWNER_PAYMENT_META } from '../../features/payments/paymentSplit';

const PAYMENT_STATUS = OWNER_PAYMENT_META;

export default function OwnerProfilePage() {
  const user = useCurrentUser();
  const pets = useMyPets();
  const data = useData();
  const actions = useActions();
  const toast = useToast();
  const navigate = useNavigate();
  const switchMode = useSwitchMode();
  const [editing, setEditing] = useState(false);
  const [addingMethod, setAddingMethod] = useState(false);
  const [contactEdit, setContactEdit] = useState(null); // { index, name, relation, phone }
  const [confirmReset, setConfirmReset] = useState(false);

  const methods = data.paymentMethods.filter((m) => m.userId === user?.id);
  const payments = useMemo(() => (user ? ownerPayments(data, user.id) : []), [data, user]);
  if (!user) return null;

  const updateSettings = (key, value) => {
    actions.updateUser({ settings: { ...user.settings, [key]: value } });
    toast.success('Preferência salva');
  };

  const saveContact = (contact) => {
    const list = [...(user.emergencyContacts || [])];
    const entry = { name: contact.name.trim(), relation: contact.relation.trim(), phone: contact.phone.trim() };
    if (contact.index == null) list.push(entry);
    else list[contact.index] = entry;
    actions.updateUser({ emergencyContacts: list });
    setContactEdit(null);
    toast.success('Contato de emergência salvo');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="Perfil e pagamentos" />

      {/* Identity */}
      <Card className="flex items-center gap-4 p-5">
        <Avatar src={user.avatar} name={user.name} size={64} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-bold">{user.name}</p>
          <p className="truncate text-sm text-ink-600">{user.email}</p>
          <p className="mt-0.5 text-[13px] text-ink-400">Conta demonstrativa · autenticação simulada</p>
        </div>
        <IconButton icon={Pencil} label="Editar dados pessoais" variant="outline" onClick={() => setEditing(true)} />
      </Card>

      <div className="mt-6 space-y-6">
        <Section icon={UserRound} title="Dados pessoais" action={<Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Editar</Button>}>
          <div className="grid sm:grid-cols-2 sm:gap-x-6">
            <InfoRow label="Nome">{user.name}</InfoRow>
            <InfoRow label="Telefone">{user.phone || <span className="text-ink-400">Não informado</span>}</InfoRow>
            <InfoRow label="Endereço de retirada" className="sm:col-span-2">
              {user.address?.street ? `${user.address.street} — ${user.address.neighborhood}, ${user.address.city}` : <span className="text-ink-400">Não informado</span>}
            </InfoRow>
            {user.address?.notes ? <InfoRow label="Instruções de acesso" className="sm:col-span-2">{user.address.notes}</InfoRow> : null}
          </div>
        </Section>

        <Section icon={PawPrint} title="Meus pets" action={<Button size="sm" variant="ghost" to="/tutor/pets">Ver todos</Button>}>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {pets.map((pet) => (
              <Link key={pet.id} to={`/tutor/pets/${pet.id}`} className="w-24 shrink-0 text-center">
                <SmartImage src={pet.photo} alt={pet.name} className="mx-auto h-20 w-20 rounded-2xl" rounded="rounded-2xl" />
                <p className="mt-1.5 truncate text-sm font-semibold">{pet.name}</p>
              </Link>
            ))}
            <Link to="/tutor/pets/novo" className="flex w-24 shrink-0 flex-col items-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-sand-300 text-ink-600 hover:border-accent-ink hover:text-accent-ink">
                <Plus size={24} aria-hidden="true" />
              </span>
              <span className="mt-1.5 text-sm font-semibold">Adicionar</span>
            </Link>
          </div>
        </Section>

        <Section icon={CreditCard} title="Formas de pagamento" action={<Button size="sm" variant="ghost" icon={Plus} onClick={() => setAddingMethod(true)}>Adicionar</Button>}>
          {methods.length ? (
            <ul className="divide-y divide-sand-200">
              {methods.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-ink-600">
                    {m.type === 'pix' ? <QrCode size={20} /> : <CreditCard size={20} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{m.label}</p>
                    {m.isDefault ? <Badge tone="success" size="xs">Padrão</Badge> : (
                      <button type="button" onClick={() => { actions.setDefaultPaymentMethod(m.id); toast.success('Forma padrão atualizada'); }} className="text-[13px] font-semibold text-accent-ink hover:underline">
                        Tornar padrão
                      </button>
                    )}
                  </div>
                  <IconButton icon={Trash2} label={`Remover ${m.label}`} onClick={() => { actions.removePaymentMethod(m.id); toast.success('Forma de pagamento removida'); }} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-600">Nenhuma forma salva. Você também pode pagar com Pix avulso no momento da confirmação.</p>
          )}
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-cream-100 p-3 text-[13px] text-ink-600">
            <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> Representações demonstrativas. Este protótipo nunca solicita nem armazena números de cartão.
          </p>
        </Section>

        <Section icon={Receipt} title="Histórico de pagamentos">
          {payments.length ? (
            <ul className="divide-y divide-sand-200">
              {payments.map((p) => {
                const walker = data.walkers.find((w) => w.id === p.walkerId);
                const pet = data.pets.find((x) => x.id === p.petId);
                const status = PAYMENT_STATUS[p.status];
                return (
                  <li key={p.id}>
                    <Link to={`/tutor/passeios/${p.bookingId}`} className="flex items-center gap-3 py-3 hover:bg-cream-50">
                      <Avatar src={walker?.avatar} name={walker?.name} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium">{pet?.name ?? 'Pet'} com {firstName(walker?.name)}</p>
                        <p className="text-[12px] text-ink-600">{formatDateTime(p.at)} · {data.paymentMethods.find((m) => m.id === p.methodId)?.label ?? 'Pix avulso'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatBRL(p.amount)}</p>
                        {status ? <Badge tone={status.tone} size="xs">{status.label}</Badge> : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-ink-600">Nenhum pagamento ainda.</p>
          )}
        </Section>

        <Section icon={Phone} title="Contatos de emergência" action={<Button size="sm" variant="ghost" icon={Plus} onClick={() => setContactEdit({ index: null, name: '', relation: '', phone: '' })}>Adicionar</Button>}>
          {user.emergencyContacts?.length ? (
            <ul className="divide-y divide-sand-200">
              {user.emergencyContacts.map((c, i) => (
                <li key={`${c.name}-${i}`} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{c.name} <span className="font-normal text-ink-600">· {c.relation}</span></p>
                    <p className="text-sm text-ink-600">{c.phone}</p>
                  </div>
                  <IconButton icon={Pencil} label={`Editar ${c.name}`} onClick={() => setContactEdit({ index: i, ...c })} />
                  <IconButton
                    icon={Trash2}
                    label={`Remover ${c.name}`}
                    onClick={() => {
                      actions.updateUser({ emergencyContacts: user.emergencyContacts.filter((_, j) => j !== i) });
                      toast.success('Contato removido');
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-600">Adicione alguém para ser avisado se o dog walker não conseguir falar com você.</p>
          )}
        </Section>

        <Section icon={Settings} title="Configurações da conta">
          <div className="divide-y divide-sand-200">
            <Toggle label="Atualizações por WhatsApp" description="Avisos de início e fim de passeio" checked={user.settings?.whatsappUpdates} onChange={(v) => updateSettings('whatsappUpdates', v)} />
            <Toggle label="Recibos por e-mail" description="Comprovante após cada pagamento" checked={user.settings?.emailReceipts} onChange={(v) => updateSettings('emailReceipts', v)} />
            <Toggle label="Compartilhar acompanhamento automaticamente" description="Gera um link demonstrativo ao iniciar o passeio" checked={user.settings?.shareLiveByDefault} onChange={(v) => updateSettings('shareLiveByDefault', v)} />
          </div>
        </Section>

        <Card className="divide-y divide-sand-200 overflow-hidden">
          <MenuRow icon={ArrowLeftRight} label="Alternar para modo dog walker" onClick={() => switchMode(APP_MODES.WALKER)} accent />
          <MenuRow icon={ShieldCheck} label="Segurança e Garantia Rolê de Pet" onClick={() => navigate('/seguranca')} />
          <MenuRow icon={Star} label="Central de ajuda" onClick={() => navigate('/ajuda')} />
          <MenuRow icon={RotateCcw} label="Restaurar dados de demonstração" onClick={() => setConfirmReset(true)} />
          <MenuRow
            icon={LogOut}
            label="Sair"
            onClick={() => {
              actions.signOut();
              navigate('/');
              toast.info('Você saiu da conta');
            }}
          />
        </Card>
      </div>

      <PersonalDataModal open={editing} onClose={() => setEditing(false)} user={user} onSave={(changes) => { actions.updateUser(changes); setEditing(false); toast.success('Dados atualizados'); }} />
      <AddMethodModal open={addingMethod} onClose={() => setAddingMethod(false)} onSave={(input) => { actions.addPaymentMethod(input); setAddingMethod(false); toast.success('Forma de pagamento adicionada'); }} />
      <ContactModal contact={contactEdit} onClose={() => setContactEdit(null)} onSave={saveContact} />
      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => { actions.resetDemo(); setConfirmReset(false); toast.success('Dados de demonstração restaurados'); }}
        title="Restaurar dados de demonstração?"
        description="Passeios, pets, mensagens e favoritos voltam ao estado inicial."
        confirmLabel="Restaurar"
      />
    </div>
  );
}

function Section({ icon: Icon, title, action, children }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Icon size={20} className="text-accent-ink" aria-hidden="true" /> {title}
        </h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

function MenuRow({ icon: Icon, label, onClick, accent }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-cream-50">
      <Icon size={20} className={accent ? 'text-accent-ink' : 'text-ink-600'} aria-hidden="true" />
      <span className={`flex-1 text-[15px] ${accent ? 'font-semibold' : ''}`}>{label}</span>
      <ChevronRight size={18} className="text-ink-400" aria-hidden="true" />
    </button>
  );
}

function PersonalDataModal({ open, onClose, user, onSave }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const current = form ?? { name: user.name, phone: user.phone, street: user.address?.street ?? '', neighborhood: user.address?.neighborhood ?? '', notes: user.address?.notes ?? '' };
  const set = (k) => (e) => setForm({ ...current, [k]: e.target.value });
  const close = () => { setForm(null); setError(''); onClose(); };
  const save = () => {
    if (current.name.trim().length < 3) {
      setError('Informe seu nome completo.');
      return;
    }
    onSave({ name: current.name.trim(), phone: current.phone.trim(), address: { ...user.address, street: current.street.trim(), neighborhood: current.neighborhood, notes: current.notes.trim() } });
    setForm(null);
  };
  return (
    <Modal open={open} onClose={close} title="Dados pessoais" footer={<Button fullWidth size="lg" onClick={save}>Salvar</Button>}>
      <div className="space-y-4">
        <Field label="Nome completo" required error={error}><TextInput value={current.name} onChange={set('name')} autoComplete="name" /></Field>
        <Field label="Telefone"><TextInput type="tel" inputMode="tel" value={current.phone} onChange={set('phone')} placeholder="(11) 90000-0000" autoComplete="tel" /></Field>
        <Field label="Endereço de retirada"><TextInput value={current.street} onChange={set('street')} placeholder="Rua, número e complemento" autoComplete="street-address" /></Field>
        <Field label="Bairro">
          <Select value={current.neighborhood} onChange={set('neighborhood')} placeholder="Selecione" options={Array.from(new Set([current.neighborhood, ...NEIGHBORHOODS].filter(Boolean))).map((n) => ({ value: n, label: n }))} />
        </Field>
        <Field label="Instruções de acesso" optional><TextInput value={current.notes} onChange={set('notes')} placeholder="Portaria, interfone, vizinho…" /></Field>
      </div>
    </Modal>
  );
}

function AddMethodModal({ open, onClose, onSave }) {
  const [type, setType] = useState('card');
  const [brand, setBrand] = useState('Visa');
  const [nickname, setNickname] = useState('');
  const close = () => { setNickname(''); onClose(); };
  return (
    <Modal
      open={open}
      onClose={close}
      title="Adicionar forma de pagamento"
      description="Nenhum número de cartão é solicitado neste protótipo."
      footer={<Button fullWidth size="lg" onClick={() => { onSave({ type, brand, nickname: nickname.trim() }); setNickname(''); }}>Adicionar</Button>}
    >
      <div className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold">Tipo</legend>
          <RadioCard name="type" value="card" checked={type === 'card'} onChange={setType} icon={CreditCard} title="Cartão de crédito" description="Representação demonstrativa" />
          <RadioCard name="type" value="pix" checked={type === 'pix'} onChange={setType} icon={QrCode} title="Pix" description="Pagamento instantâneo" />
        </fieldset>
        {type === 'card' ? (
          <Field label="Bandeira">
            <Select value={brand} onChange={(e) => setBrand(e.target.value)} options={['Visa', 'Mastercard', 'Elo', 'American Express'].map((b) => ({ value: b, label: b }))} />
          </Field>
        ) : null}
        <Field label="Apelido" optional hint={type === 'pix' ? 'Ex.: chave e-mail' : 'Ex.: cartão pessoal'}>
          <TextInput value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={30} />
        </Field>
      </div>
    </Modal>
  );
}

function ContactModal({ contact, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  if (!contact) return null;
  const current = form ?? contact;
  const set = (k) => (e) => setForm({ ...current, [k]: e.target.value });
  const close = () => { setForm(null); setError(''); onClose(); };
  const save = () => {
    if (!current.name.trim() || !current.phone.trim()) {
      setError('Informe nome e telefone.');
      return;
    }
    onSave(current);
    setForm(null);
    setError('');
  };
  return (
    <Modal open onClose={close} title={contact.index == null ? 'Novo contato de emergência' : 'Editar contato'} footer={<Button fullWidth size="lg" onClick={save}>Salvar contato</Button>}>
      <div className="space-y-4">
        <Field label="Nome" required error={error}><TextInput value={current.name} onChange={set('name')} /></Field>
        <Field label="Relação"><TextInput value={current.relation} onChange={set('relation')} placeholder="Ex.: irmã, vizinho, veterinária" /></Field>
        <Field label="Telefone" required><TextInput type="tel" inputMode="tel" value={current.phone} onChange={set('phone')} /></Field>
      </div>
    </Modal>
  );
}
