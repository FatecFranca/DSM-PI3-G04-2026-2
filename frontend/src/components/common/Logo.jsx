import { Link } from 'react-router-dom';

// Brand assets live in /public/brand (extracted from the official logo with transparent background):
// mark.png = dog + leash symbol, wordmark.png = "Rolê de Pet", logo-full.png = stacked lockup.
const MARK_RATIO = 480 / 309;
const WORDMARK_RATIO = 900 / 198;

/** Dog + leash symbol. `size` is the rendered height in px. */
export function LogoMark({ size = 32, className = '' }) {
  return <img src="/brand/mark.png" alt="" aria-hidden="true" width={Math.round(size * MARK_RATIO)} height={size} className={`shrink-0 select-none ${className}`} draggable="false" />;
}

/** Stacked lockup (symbol above the name) for auth screens and large brand moments */
export function LogoFull({ className = '' }) {
  return <img src="/brand/logo-full.png" alt="Rolê de Pet" className={`select-none ${className}`} draggable="false" />;
}

/** Horizontal logo used in the header: symbol + wordmark */
export default function Logo({ to = '/', className = '', compact = false }) {
  return (
    <Link to={to} className={`inline-flex shrink-0 items-center gap-2 rounded-xl ${className}`} aria-label="Rolê de Pet — início">
      <LogoMark size={34} className="md:h-[40px] md:w-auto" />
      {!compact ? (
        <img
          src="/brand/wordmark.png"
          alt="Rolê de Pet"
          width={Math.round(20 * WORDMARK_RATIO)}
          height={20}
          className="h-5 w-auto select-none md:h-6"
          draggable="false"
        />
      ) : null}
    </Link>
  );
}
