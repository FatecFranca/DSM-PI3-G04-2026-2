import { Link } from 'react-router-dom';
import Spinner from '../feedback/Spinner';

const VARIANTS = {
  // follows the current mode (vinho for tutor, dourado for dog walker)
  primary: 'bg-accent text-on-accent hover:bg-accent-hover shadow-sm',
  wine: 'bg-wine-500 text-white hover:bg-wine-700 shadow-sm',
  gold: 'bg-gold-500 text-ink-900 hover:bg-gold-400 shadow-sm',
  secondary: 'border border-sand-200 bg-white text-ink-900 hover:border-ink-900/40 hover:bg-cream-50',
  ghost: 'text-ink-900 hover:bg-cream-100',
  soft: 'bg-accent-soft text-accent-ink hover:brightness-95',
  danger: 'bg-danger-600 text-white hover:brightness-110 shadow-sm',
  dangerGhost: 'text-danger-600 hover:bg-danger-50',
  dark: 'bg-ink-900 text-white hover:bg-black',
};

const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-[15px] gap-2 rounded-xl',
  lg: 'h-13 px-6 text-base gap-2 rounded-2xl min-h-[52px]',
  xl: 'min-h-[60px] px-6 text-lg gap-2.5 rounded-2xl',
};

/**
 * Polymorphic button: renders <Link> with `to`, <a> with `href`, else <button>.
 */
export default function Button({ variant = 'primary', size = 'md', to, href, loading = false, disabled, fullWidth, icon: Icon, iconRight: IconRight, className = '', children, ...props }) {
  const classes = [
    'inline-flex select-none items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45',
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');
  const content = (
    <>
      {loading ? <Spinner size={size === 'sm' ? 14 : 18} /> : Icon ? <Icon size={size === 'sm' ? 16 : 18} aria-hidden="true" /> : null}
      {children}
      {IconRight && !loading ? <IconRight size={size === 'sm' ? 16 : 18} aria-hidden="true" /> : null}
    </>
  );
  if (to && !disabled) return <Link to={to} className={classes} {...props}>{content}</Link>;
  if (href && !disabled) return <a href={href} className={classes} {...props}>{content}</a>;
  return (
    <button type="button" className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}

export function IconButton({ icon: Icon, label, onClick, className = '', size = 40, variant = 'ghost', badge, ...props }) {
  const styles = {
    ghost: 'hover:bg-cream-100 text-ink-900',
    surface: 'bg-white/95 text-ink-900 shadow-card hover:bg-white backdrop-blur',
    outline: 'border border-sand-200 bg-white hover:border-ink-900/40',
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full transition active:scale-95 ${styles[variant]} ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      <Icon size={Math.round(size * 0.48)} aria-hidden="true" />
      {badge ? (
        <span className="absolute -top-0.5 -right-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-white">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  );
}
