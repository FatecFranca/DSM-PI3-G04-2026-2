import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, UserRound, Eye, EyeOff, Heart, Footprints } from 'lucide-react';
import Button from '../../components/common/Button';
import Field, { TextInput, RadioCard } from '../../components/forms/Field';
import { useActions } from '../../context/AppStore';
import { useCurrentUser } from '../../hooks/useAccount';
import { useToast } from '../../components/feedback/Toast';
import { AuthShell, SimulatedAuthNotice } from './SignInPage';
import { firstName } from '../../utils/format';

export default function SignUpPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const actions = useActions();
  const toast = useToast();
  const user = useCurrentUser();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: params.get('perfil') === 'dog-walker' ? 'walker' : 'owner',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      try {
        const created = actions.signUp(form);
        if (form.role === 'walker') {
          toast.success(`Bem-vindo, ${firstName(created.name)}`, 'Complete seu perfil profissional para aparecer nas buscas.');
          navigate('/dog-walker/perfil', { replace: true });
        } else {
          toast.success(`Bem-vindo, ${firstName(created.name)}`, 'Cadastre seu primeiro pet para solicitar passeios.');
          navigate('/tutor/pets/novo?boas-vindas=1', { replace: true });
        }
      } catch (error) {
        setErrors({ [error.field || 'email']: error.message });
        setLoading(false);
      }
    }, 450);
  };

  if (user) {
    return (
      <AuthShell title="Você já tem uma conta" subtitle={`Conectado como ${user.name}.`}>
        <Button to={user.roles.includes('owner') ? '/tutor' : '/dog-walker/hoje'} fullWidth size="lg">
          Ir para minha conta
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Criar conta" subtitle="Leva menos de um minuto. Você pode atuar como tutor e como dog walker na mesma conta." photo="goldenPark">
      <form onSubmit={submit} noValidate className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink-900">Como você vai usar o Rolê de Pet?</legend>
          <div className="space-y-2">
            <RadioCard
              name="role"
              value="owner"
              checked={form.role === 'owner'}
              onChange={(v) => setForm((f) => ({ ...f, role: v }))}
              icon={Heart}
              title="Sou tutor"
              description="Quero encontrar dog walkers de confiança para o meu cão."
            />
            <RadioCard
              name="role"
              value="walker"
              checked={form.role === 'walker'}
              onChange={(v) => setForm((f) => ({ ...f, role: v }))}
              icon={Footprints}
              title="Quero ser dog walker"
              description="Quero oferecer passeios, organizar minha agenda e receber pela plataforma."
            />
          </div>
        </fieldset>

        <Field label="Nome completo" error={errors.name}>
          <TextInput autoComplete="name" icon={UserRound} value={form.name} onChange={update('name')} placeholder="Como aparece no seu documento" />
        </Field>
        <Field label="E-mail" error={errors.email}>
          <TextInput type="email" inputMode="email" autoComplete="email" icon={Mail} value={form.email} onChange={update('email')} placeholder="voce@email.com" />
        </Field>
        <Field label="Senha" error={errors.password} hint="Mínimo de 6 caracteres.">
          <div className="relative">
            <TextInput
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              aria-label="Senha"
              icon={Lock}
              value={form.password}
              onChange={update('password')}
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

        <Button type="submit" fullWidth size="lg" loading={loading} variant={form.role === 'walker' ? 'gold' : 'wine'}>
          {form.role === 'walker' ? 'Criar conta de dog walker' : 'Criar conta de tutor'}
        </Button>
        <p className="text-[13px] leading-snug text-ink-600">
          Ao continuar, você concorda com os <Link to="/termos" className="underline">Termos de uso</Link> e a{' '}
          <Link to="/privacidade" className="underline">Política de privacidade</Link> (versões ilustrativas).
        </p>
        <SimulatedAuthNotice />
      </form>

      <p className="mt-6 text-center text-[15px] text-ink-600">
        Já tem conta?{' '}
        <Link to={`/entrar${params.get('voltar') ? `?voltar=${encodeURIComponent(params.get('voltar'))}` : ''}`} className="font-semibold text-ink-900 underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
