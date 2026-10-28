import { useId, cloneElement, isValidElement } from 'react';
import { AlertCircle, Check } from 'lucide-react';

const inputBase =
  'block w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink-900 placeholder:text-ink-400 transition focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:bg-cream-100 disabled:text-ink-400';
const borderFor = (error) => (error ? 'border-danger-600 focus:border-danger-600' : 'border-sand-200 hover:border-sand-300 focus:border-accent-ink');

/** Label + control + hint/error. The control receives id/aria props automatically. */
export default function Field({ label, hint, error, required, children, className = '', optional }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, { id: children.props.id || id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy, error: children.type?.acceptsError ? error : undefined })
    : children;
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 flex items-baseline gap-1.5 text-sm font-semibold text-ink-900">
          {label}
          {required ? <span className="text-danger-600" aria-hidden="true">*</span> : null}
          {optional ? <span className="text-xs font-normal text-ink-400">opcional</span> : null}
        </label>
      ) : null}
      {control}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-[13px] font-medium text-danger-600">
          <AlertCircle size={14} aria-hidden="true" /> {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-ink-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({ error, className = '', icon: Icon, ...props }) {
  if (Icon) {
    return (
      <div className="relative">
        <Icon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input className={`${inputBase} ${borderFor(error)} h-12 pl-10 ${className}`} {...props} />
      </div>
    );
  }
  return <input className={`${inputBase} ${borderFor(error)} h-12 ${className}`} {...props} />;
}
TextInput.acceptsError = true;

export function TextArea({ error, className = '', rows = 3, ...props }) {
  return <textarea rows={rows} className={`${inputBase} ${borderFor(error)} resize-y py-3 leading-relaxed ${className}`} {...props} />;
}
TextArea.acceptsError = true;

export function Select({ error, className = '', options = [], placeholder, ...props }) {
  return (
    <select className={`${inputBase} ${borderFor(error)} h-12 appearance-none bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10 ${className}`} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B5B52' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...props}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((opt) => (
        <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
Select.acceptsError = true;

/** Switch with label on the left */
export function Toggle({ checked, onChange, label, description, id, disabled }) {
  const autoId = useId();
  const controlId = id || autoId;
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <label htmlFor={controlId} className="min-w-0 cursor-pointer">
        <span className="block text-[15px] font-medium text-ink-900">{label}</span>
        {description ? <span className="block text-[13px] text-ink-600">{description}</span> : null}
      </label>
      <button
        id={controlId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-accent' : 'bg-sand-200'} disabled:opacity-50`}
      >
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

/** Pill toggle used in filters and multi-selects */
export function Chip({ selected, onClick, children, icon: Icon, className = '', size = 'md' }) {
  const sizes = { sm: 'h-8 px-3 text-[13px]', md: 'h-10 px-4 text-sm' };
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium transition active:scale-[0.97] ${sizes[size]} ${
        selected ? 'border-ink-900 bg-ink-900 text-white' : 'border-sand-200 bg-white text-ink-900 hover:border-ink-900/50'
      } ${className}`}
    >
      {selected && !Icon ? <Check size={14} aria-hidden="true" /> : null}
      {Icon ? <Icon size={15} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/** Large radio cards (e.g. role selection, pet selection) */
export function RadioCard({ checked, onChange, title, description, icon: Icon, media, name, value, className = '' }) {
  return (
    <label
      className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3.5 transition ${
        checked ? 'border-accent-ink bg-accent-soft' : 'border-sand-200 bg-white hover:border-sand-300'
      } ${className}`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
      {media}
      {Icon && !media ? (
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${checked ? 'bg-accent text-on-accent' : 'bg-cream-100 text-ink-600'}`}>
          <Icon size={22} aria-hidden="true" />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink-900">{title}</span>
        {description ? <span className="block text-[13px] leading-snug text-ink-600">{description}</span> : null}
      </span>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${checked ? 'border-accent-ink bg-accent-ink' : 'border-sand-300'}`} aria-hidden="true">
        {checked ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
    </label>
  );
}
