import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function RocketLeagueImage({ src, alt, className = '', contain = true }) {
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
      {status === 'error' && (
        <span className="p-3 text-center text-xs text-muted-foreground" role="status">
          Le visuel fourni par Tracker est indisponible.
        </span>
      )}
      {status === 'missing' && (
        <span className="p-3 text-center text-xs text-muted-foreground">
          Aucun visuel fourni par Tracker.
        </span>
      )}
    </div>
  );
}
