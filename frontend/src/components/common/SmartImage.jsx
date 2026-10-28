import { useState } from 'react';
import { PawPrint } from 'lucide-react';
import { initials } from '../../utils/format';

/** <img> with lazy loading, fade-in and a branded fallback if the source fails */
export default function SmartImage({ src, alt = '', className = '', fallbackLabel, rounded = '', ...props }) {
  const [state, setState] = useState(src ? 'loading' : 'error');
  if (state === 'error' || !src) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-gradient-to-br from-wine-100 via-cream-100 to-gold-100 text-wine-400 ${rounded} ${className}`}>
        {fallbackLabel ? <span className="text-lg font-bold">{initials(fallbackLabel)}</span> : <PawPrint size={28} aria-hidden="true" />}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setState('loaded')}
      onError={() => setState('error')}
      className={`bg-cream-100 object-cover transition-opacity duration-300 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'} ${rounded} ${className}`}
      {...props}
    />
  );
}

export function Avatar({ src, name = '', size = 40, className = '', ring = false }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, fontSize: Math.max(11, size * 0.36) };
  if (!src || failed) {
    return (
      <span style={style} className={`inline-flex shrink-0 items-center justify-center rounded-full bg-wine-100 font-semibold text-wine-500 ${ring ? 'ring-2 ring-white' : ''} ${className}`} aria-label={name}>
        {initials(name) || '?'}
      </span>
    );
  }
  return <img src={src} alt={name} style={style} onError={() => setFailed(true)} className={`shrink-0 rounded-full bg-cream-100 object-cover ${ring ? 'ring-2 ring-white' : ''} ${className}`} loading="lazy" />;
}
