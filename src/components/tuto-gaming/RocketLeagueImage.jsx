import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { resolveRocketImageSources } from './rocketLeagueImages';

export default function RocketLeagueImage({
  src,
  sources,
  alt,
  className = '',
  contain = true,
  fallbackLabel = '',
  accent = '#334155',
}) {
  const candidates = resolveRocketImageSources({ src, sources, fallbackLabel: fallbackLabel || alt, accent });
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIndex(0);
    setLoaded(false);
  }, [src, sources, fallbackLabel, accent]);

  const current = candidates[Math.min(index, candidates.length - 1)];

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-muted ${className}`}>
      <img
        key={current}
        src={current}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);
          setIndex(value => Math.min(value + 1, candidates.length - 1));
        }}
        className={`h-full w-full ${contain ? 'object-contain' : 'object-cover'} ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {!loaded && (
        <span className="absolute inset-0 flex items-center justify-center" role="status">
          <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
          <span className="sr-only">Chargement du visuel</span>
        </span>
      )}
    </div>
  );
}
