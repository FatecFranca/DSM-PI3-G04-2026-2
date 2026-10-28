import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Accessible dialog. On mobile it renders as a bottom sheet (variant "sheet" or
 * "auto"), on desktop as a centered modal. Locks body scroll, closes on Esc and
 * backdrop click, and returns focus to the trigger when closed.
 */
export default function Modal({ open, onClose, title, description, children, footer, variant = 'auto', size = 'md', hideClose = false }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => panelRef.current?.querySelector('[data-autofocus], input, textarea, select, button')?.focus());
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const widths = { sm: 'md:max-w-sm', md: 'md:max-w-lg', lg: 'md:max-w-2xl', xl: 'md:max-w-4xl' };
  const sheet = variant === 'sheet' || variant === 'auto';
  const panelPosition = sheet
    ? `inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl animate-sheet-up md:inset-auto md:left-1/2 md:top-1/2 md:bottom-auto md:w-full md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:animate-fade-up ${widths[size]}`
    : `left-1/2 top-1/2 w-[calc(100%-32px)] max-h-[90dvh] -translate-x-1/2 -translate-y-1/2 rounded-3xl animate-fade-up ${widths[size]}`;

  return createPortal(
    <div className="fixed inset-0 z-[1100]">
      <div className="absolute inset-0 animate-fade-in bg-ink-900/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} className={`absolute flex flex-col bg-white shadow-float ${panelPosition}`}>
        {sheet ? <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-sand-200 md:hidden" aria-hidden="true" /> : null}
        {(title || !hideClose) && (
          <div className="flex shrink-0 items-start gap-3 px-5 pb-2 pt-4 md:px-6 md:pt-5">
            <div className="min-w-0 flex-1">
              {title ? <h2 id={titleId} className="text-lg font-bold leading-tight text-ink-900">{title}</h2> : null}
              {description ? <p className="mt-1 text-sm text-ink-600">{description}</p> : null}
            </div>
            {!hideClose ? (
              <button type="button" onClick={onClose} aria-label="Fechar" className="-mr-2 rounded-full p-2 text-ink-600 hover:bg-cream-100 hover:text-ink-900">
                <X size={20} />
              </button>
            ) : null}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 md:px-6">{children}</div>
        {footer ? <div className="shrink-0 border-t border-sand-200 px-5 py-3.5 pb-[max(14px,env(safe-area-inset-bottom))] md:px-6">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Voltar', tone = 'primary', children }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="h-11 rounded-xl px-4 text-sm font-semibold text-ink-900 hover:bg-cream-100">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 rounded-xl px-5 text-sm font-semibold ${tone === 'danger' ? 'bg-danger-600 text-white' : 'bg-accent text-on-accent hover:bg-accent-hover'}`}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      {children}
    </Modal>
  );
}
