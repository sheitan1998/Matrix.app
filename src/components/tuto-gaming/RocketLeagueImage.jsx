import React, { useEffect, useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { resolveRocketImageSources } from './rocketLeagueImages';

const IMAGE_TIMEOUT_MS = 8_000;

export default function RocketLeagueImage({
  src,
  sources,
  alt,
  className = '',
  contain = true,
  fallbackLabel = '',
}) {
  const candidates = resolveRocketImageSources({ src, sources });
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState(candidates.length ? 'loading' : 'fallback');
  const current = candidates[index] || null;

  useEffect(() => {
    setIndex(0);
    setStatus(candidates.length ? 'loading' : 'fallback');
  }, [src, sources]);

  useEffect(() => {
    if (status !== 'loading') return undefined;
    const timeout = setTimeout(() => {
      if (index + 1 < candidates.length) {
        setIndex(value => value + 1);
      } else {
        setStatus('fallback');
      }
    }, IMAGE_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [candidates.length, index, status]);

  function tryNextSource() {
    if (index + 1 < candidates.length) {
      setIndex(value => value + 1);
      setStatus('loading');
    } else {
      setStatus('fallback');
    }
  }

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-muted ${className}`}>
      {current && status !== 'fallback' && (
        <img
          key={current}
          src={current}
          alt={alt}
          loading="lazy"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onLoad={() => setStatus('loaded')}
          onError={tryNextSource}
          className={`h-full w-full ${contain ? 'object-contain' : 'object-cover'} ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {status === 'loading' && (
        <span className="absolute inset-0 flex items-center justify-center" role="status">
          <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
          <span className="sr-only">Chargement du visuel</span>
        </span>
      )}
      {status === 'fallback' && (
        <span className="flex max-w-full flex-col items-center gap-2 px-3 text-center text-xs text-muted-foreground">
          <ImageOff aria-hidden="true" className="h-5 w-5" />
          <span className="line-clamp-2">{fallbackLabel || alt || 'Visuel indisponible'}</span>
        </span>
      )}
    </div>
  );
}
