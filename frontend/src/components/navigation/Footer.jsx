import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { FOOTER_SECTIONS } from './navConfig';
import { LogoMark } from '../common/Logo';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-sand-200 bg-cream-100">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="mb-3 text-[15px] font-bold text-ink-900">{section.title}</h2>
            <ul className="space-y-2.5">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-[15px] text-ink-600 hover:text-ink-900 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-sand-200">
        <div className="container-page flex flex-col gap-3 py-6 text-sm text-ink-600 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <LogoMark size={22} />
            <span>© {new Date().getFullYear()} Rolê de Pet · Protótipo demonstrativo</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link to="/privacidade" className="hover:underline">Privacidade</Link>
            <Link to="/termos" className="hover:underline">Termos</Link>
            <span className="inline-flex items-center gap-1.5 font-medium text-ink-900">
              <Globe size={15} aria-hidden="true" /> Português (BR) · R$ BRL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
