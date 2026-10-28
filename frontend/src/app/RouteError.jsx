import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { RotateCcw, Home } from 'lucide-react';
import { LogoMark } from '../components/common/Logo';

/**
 * Friendly fallback for unexpected errors in any route.
 * In development, a module updated mid-session can leave the page with stale code;
 * a full reload fixes it, so that is the primary action.
 */
export default function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error?.message;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-50 px-6 text-center">
      <LogoMark size={56} />
      <h1 className="mt-6 text-2xl font-bold text-ink-900">Algo deu errado nesta tela</h1>
      <p className="mt-2 max-w-md text-[15px] text-ink-600">Recarregue a página para tentar de novo. Seus dados de demonstração continuam salvos.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => window.location.reload()} className="inline-flex h-11 items-center gap-2 rounded-xl bg-wine-500 px-5 font-semibold text-white hover:bg-wine-700">
          <RotateCcw size={18} aria-hidden="true" /> Recarregar
        </button>
        <Link to="/" reloadDocument className="inline-flex h-11 items-center gap-2 rounded-xl border border-sand-200 bg-white px-5 font-semibold text-ink-900 hover:bg-cream-100">
          <Home size={18} aria-hidden="true" /> Ir para o início
        </Link>
      </div>
      {import.meta.env.DEV && message ? <pre className="mt-8 max-w-full overflow-x-auto rounded-xl bg-white p-3 text-left text-[12px] text-ink-600 ring-1 ring-sand-200">{message}</pre> : null}
    </div>
  );
}
