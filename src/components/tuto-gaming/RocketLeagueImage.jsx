import React, { useEffect, useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';

export default function RocketLeagueImage({
  src,
  alt,
  className = '',
  contain = true,
  fallbackLabel = '',
  accent = '#334155',
}) {
  const [status, setStatus] = useState(src ? 'loading' : 'missing');

  useEffect(() => {
    setStatus(src ? 'loading' : 'missing');
  }, [src]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-muted ${className}`}>
      {src && status !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`h-full w-full ${contain ? 'object-contain' : 'object-cover'} ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {status === 'loading' && (
        <span className="absolute inset-0 flex items-center justify-center" role="status">
          <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
          <span className="sr-only">Chargement du visuel</span>
        </span>
      )}
      {(status === 'error' || status === 'missing') && (
        <span
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center text-xs font-semibold text-white"
          style={{ background: `radial-gradient(circle at 30% 20%, ${accent}, #0f172a 75%)` }}
          role={status === 'error' ? 'status' : undefined}
        >
          <ImageOff aria-hidden="true" className="h-7 w-7 opacity-80" />
          <span>{fallbackLabel || alt || 'Visuel local'}</span>
        </span>
      )}
    </div>
  );
}
