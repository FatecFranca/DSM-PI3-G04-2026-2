import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info, notification: Bell };
const TONES = {
  success: 'text-success-600',
  error: 'text-danger-600',
  info: 'text-info-600',
  notification: 'text-accent-ink',
};

let seq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (input) => {
      const toast = typeof input === 'string' ? { title: input } : input;
      const id = ++seq;
      setToasts((list) => [...list.slice(-2), { tone: 'success', duration: 3800, ...toast, id }]);
      setTimeout(() => dismiss(id), toast.duration ?? 3800);
      return id;
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      show,
      success: (title, description) => show({ tone: 'success', title, description }),
      error: (title, description) => show({ tone: 'error', title, description, duration: 5000 }),
      info: (title, description) => show({ tone: 'info', title, description }),
      notify: (title, description, link) => show({ tone: 'notification', title, description, link, duration: 5000 }),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  const navigate = useNavigate();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[1200] flex flex-col items-center gap-2 px-3 pt-[max(12px,env(safe-area-inset-top))] md:items-end md:pr-6 md:pt-20" aria-live="polite" role="status">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.tone] || Info;
        return (
          <div key={toast.id} className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-2xl border border-sand-200 bg-white p-3.5 pr-2 shadow-float">
            <Icon size={20} className={`mt-0.5 shrink-0 ${TONES[toast.tone]}`} aria-hidden="true" />
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => {
                if (toast.link) navigate(toast.link);
                onDismiss(toast.id);
              }}
            >
              <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
              {toast.description ? <p className="mt-0.5 text-[13px] leading-snug text-ink-600">{toast.description}</p> : null}
            </button>
            <button type="button" aria-label="Fechar aviso" onClick={() => onDismiss(toast.id)} className="rounded-full p-1.5 text-ink-400 hover:bg-cream-100 hover:text-ink-900">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de ToastProvider');
  return ctx;
}
