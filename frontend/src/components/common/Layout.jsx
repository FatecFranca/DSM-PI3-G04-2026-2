import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/** Page title block used at the top of app pages */
export function PageTitle({ title, subtitle, actions, back, className = '' }) {
  const navigate = useNavigate();
  return (
    <div className={`mb-5 flex items-start gap-3 md:mb-8 ${className}`}>
      {back ? (
        <button
          type="button"
          onClick={() => (typeof back === 'string' ? navigate(back) : window.history.length > 1 ? navigate(-1) : navigate('/'))}
          aria-label="Voltar"
          className="-ml-2 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-cream-100"
        >
          <ChevronLeft size={24} />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink-900 md:text-[32px]">{title}</h1>
        {subtitle ? <p className="mt-1 text-[15px] text-ink-600">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action, actionTo, actionLabel = 'Ver tudo', className = '' }) {
  return (
    <div className={`mb-4 flex items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight text-ink-900 md:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-ink-600">{subtitle}</p> : null}
      </div>
      {action ??
        (actionTo ? (
          <Link to={actionTo} className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-ink-900 underline-offset-4 hover:underline">
            {actionLabel} <ChevronRight size={16} aria-hidden="true" />
          </Link>
        ) : null)}
    </div>
  );
}

export function Card({ children, className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag className={`rounded-3xl border border-sand-200 bg-white shadow-card ${className}`} {...props}>
      {children}
    </Tag>
  );
}

/** Label/value list row */
export function InfoRow({ icon: Icon, label, children, className = '' }) {
  return (
    <div className={`flex items-start gap-3 py-2.5 ${className}`}>
      {Icon ? <Icon size={18} className="mt-0.5 shrink-0 text-ink-600" aria-hidden="true" /> : null}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-ink-600">{label}</p>
        <div className="text-[15px] font-medium text-ink-900">{children}</div>
      </div>
    </div>
  );
}

export function Divider({ className = '' }) {
  return <hr className={`border-sand-200 ${className}`} />;
}
