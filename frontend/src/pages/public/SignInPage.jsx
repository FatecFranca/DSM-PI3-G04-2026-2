import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Info, ChevronRight, CheckCircle2, PawPrint, Footprints } from 'lucide-react';
import Button from '../../components/common/Button';
import Field, { TextInput } from '../../components/forms/Field';
import { Avatar } from '../../components/common/SmartImage';
import SmartImage from '../../components/common/SmartImage';
import { useActions, useData } from '../../context/AppStore';
import { useCurrentUser } from '../../hooks/useAccount';
import { useToast } from '../../components/feedback/Toast';
import { DEMO_ACCOUNTS } from '../../data/mock/users';
import { dogPhoto } from '../../data/mock/photos';
import { firstName } from '../../utils/format';
import Tabs from '../../components/common/Tabs';
import { LogoFull } from '../../components/common/Logo';
import { APP_MODES } from '../../utils/constants';

/** Explains that sign-in is simulated, without undermining the product's look */
export function SimulatedAuthNotice() {
  return (
    <div className="flex gap-3 rounded-2xl border border-info-600/15 bg-info-50 p-3.5 text-[13px] leading-snug text-ink-900">
      <Info size={18} className="mt-0.5 shrink-0 text-info-600" aria-hidden="true" />
      <p>
        <strong>Autenticação simulada.</strong> Este é um protótipo: a senha só é validada no formato e nunca é armazenada. Não use uma senha real.
      </p>
    </div>
  );
}

/** Split layout shared by the sign-in and sign-up screens */
export function AuthShell({ title, subtitle, children, photo = 'walkPair' }) {
  return (
    <div className="container-page grid gap-10 py-8 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
      <div className="mx-auto w-full max-w-md">
        <LogoFull className="mb-6 h-24 w-auto md:h-28" />
        <h1 className="text-[28px] font-bold leading-tight tracking-tight md:text-[34px]">{title}</h1>
        {subtitle ? <p className="mt-2 text-[15px] text-ink-600">{subtitle}</p> : null}
        <div className="mt-7">{children}</div>
      </div>
      <div className="relative hidden overflow-hidden rounded-[2rem] lg:block">
        <SmartImage src={dogPhoto(photo, 1200)} alt="Dog walker passeando com um cão no parque" className="aspect-[4/5] w-full" />
        <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-white/95 p-5 shadow-float backdrop-blur">
          <p className="text-[15px] font-semibold text-ink-900">“O Thor volta cansado e feliz, e eu acompanho cada minuto pelo mapa.”</p>
          <p className="mt-1.5 text-sm text-ink-600">Marina, tutora na Vila Mariana</p>
        </div>
      </div>
    </div>
  );
}

const homeFor = (user, mode) => (mode === APP_MODES.WALKER && user.walkerProfileId ? '/dog-walker/hoje' : user.roles.includes('owner') ? '/tutor' : '/dog-walker/hoje');

const ROLE_TABS = [
  { id: APP_MODES.OWNER, label: 'Sou tutor', icon: PawPrint },
  { id: APP_MODES.WALKER, label: 'Sou dog walker', icon: Footprints },
];
const EMAIL_HINT = { [APP_MODES.OWNER]: 'marina@roledepet.demo', [APP_MODES.WALKER]: 'lucas@roledepet.demo' };

export default function SignInPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const actions = useActions();
  const data = useData();
  const toast = useToast();
  const user = useCurrentUser();
  const back = params.get('voltar');
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(params.get('perfil') === 'dog-walker' ? APP_MODES.WALKER : APP_MODES.OWNER);

  const finish = (signed) => {
    toast.success(`Olá, ${firstName(signed.name)}`, role === APP_MODES.WALKER && signed.walkerProfileId ? 'Área do dog walker' : 'Você entrou na conta demonstrativa.');
    navigate(back && back.startsWith('/') ? back : homeFor(signed, role), { replace: true });
  };

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      try {
        finish(actions.signIn(form, role));
      } catch (error) {
        setErrors({ [error.field || 'email']: error.message });
        setLoading(false);
      }
    }, 450);
  };

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  if (user) {
    return (
      <AuthShell title="Você já está conectado" subtitle={`Conectado como ${user.name} (${user.email}).`}>
        <div className="space-y-3">
          <Button to={back && back.startsWith('/') ? back : homeFor(user, user.walkerProfileId && !user.roles.includes('owner') ? APP_MODES.WALKER : APP_MODES.OWNER)} fullWidth size="lg" icon={CheckCircle2}>
            Continuar
          </Button>
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onClick={() => {
              actions.signOut();
              toast.info('Você saiu da conta');
            }}
          >
            Entrar com outra conta
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Entrar no Rolê de Pet"
      subtitle={role === APP_MODES.WALKER ? 'Veja sua agenda do dia, responda solicitações e acompanhe seus ganhos.' : 'Acompanhe passeios, fale com dog walkers e gerencie os perfis dos seus pets.'}
    >
      <Tabs items={ROLE_TABS} value={role} onChange={setRole} ariaLabel="Como você usa o Rolê de Pet" className="mb-5" />
      <section aria-labelledby="demo-title">
        <h2 id="demo-title" className="mb-2.5 text-sm font-semibold text-ink-900">
          Entrar com uma conta demonstrativa
        </h2>
        <ul className="space-y-2">
          {DEMO_ACCOUNTS.filter((account) => account.role === role).map((account) => {
            const demoUser = data.users.find((u) => u.id === account.userId);
            if (!demoUser) return null;
            return (
              <li key={account.userId}>
                <button
                  type="button"
                  onClick={() => finish(actions.signInAs(account.userId, role))}
                  className="flex w-full items-center gap-3 rounded-2xl border border-sand-200 bg-white p-3 text-left transition hover:border-ink-900/40 hover:shadow-card"
                >
                  <Avatar src={demoUser.avatar} name={demoUser.name} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2">
                      <span className="font-semibold text-ink-900">{demoUser.name}</span>
                      <span className="text-[12px] font-semibold uppercase tracking-wide text-accent-ink">{account.label}</span>
                    </span>
                    <span className="block text-[13px] leading-snug text-ink-600">{account.description}</span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-ink-400" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="my-6 flex items-center gap-3 text-[13px] text-ink-400">
        <hr className="flex-1 border-sand-200" /> ou use e-mail e senha <hr className="flex-1 border-sand-200" />
      </div>

      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="E-mail" error={errors.email}>
          <TextInput type="email" autoComplete="email" inputMode="email" icon={Mail} value={form.email} onChange={update('email')} placeholder="voce@email.com" />
        </Field>
        <Field label="Senha" error={errors.password}>
          <div className="relative">
            <TextInput
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              aria-label="Senha"
              icon={Lock}
              value={form.password}
              onChange={update('password')}
              placeholder="Mínimo de 6 caracteres"
              className="pr-12"
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-600 hover:bg-cream-100"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>
        <p className="text-[13px] text-ink-600">
          Dica: use <strong>{EMAIL_HINT[role]}</strong> e qualquer senha com 6 caracteres.
        </p>
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Entrar
        </Button>
        <SimulatedAuthNotice />
      </form>

      <p className="mt-6 text-center text-[15px] text-ink-600">
        Ainda não tem conta?{' '}
        <Link to={role === APP_MODES.WALKER ? '/cadastrar?perfil=dog-walker' : `/cadastrar${back ? `?voltar=${encodeURIComponent(back)}` : ''}`} className="font-semibold text-ink-900 underline underline-offset-4">
          Cadastre-se
        </Link>
      </p>
    </AuthShell>
  );
}
