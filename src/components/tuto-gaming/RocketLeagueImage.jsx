import React, { useEffect, useMemo, useState } from 'react';
import { CarFront } from 'lucide-react';
import { resolveRocketImageSources, rocketFallbackColors } from './rocketLeagueImages';

const IMAGE_TIMEOUT_MS = 3_000;

export default function RocketLeagueImage({
  src,
  sources,
  alt,
  className = '',
  contain = true,
  fallbackLabel = '',
  accent = '',
  captureRemote = true,
}) {
  const candidates = useMemo(
    () => resolveRocketImageSources({ src, sources }),
    [src, sources],
  );
  const signature = candidates.join('|');
  const [index, setIndex] = useState(0);
  const [loadedSource, setLoadedSource] = useState('');
  const current = candidates[index] || '';
  const label = fallbackLabel || alt || 'Rocket League';
  const colors = rocketFallbackColors(label, accent);

  useEffect(() => {
    setIndex(0);
    setLoadedSource('');
  }, [signature]);

  useEffect(() => {
    if (!current || loadedSource === current) return undefined;
    const timeout = setTimeout(() => {
      setLoadedSource('');
      setIndex(value => (value + 1 < candidates.length ? value + 1 : candidates.length));
    }, IMAGE_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [candidates.length, current, loadedSource]);

  function tryNextSource() {
    setLoadedSource('');
    setIndex(value => (value + 1 < candidates.length ? value + 1 : candidates.length));
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-slate-950 ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at 22% 18%, ${colors.primary}88, transparent 42%), linear-gradient(135deg, #111827, ${colors.secondary}55)`,
      }}
    >
      <span className="flex max-w-full flex-col items-center gap-2 px-3 text-center text-white">
        <span className="rounded-full border border-white/25 bg-black/25 p-2 shadow-lg">
          <CarFront aria-hidden="true" className="h-5 w-5" />
        </span>
        <span className="line-clamp-2 text-xs font-semibold drop-shadow">{label}</span>
      </span>
      {current && (
        <img
          key={current}
          src={current}
          alt={alt}
          loading="lazy"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          data-html2canvas-ignore={captureRemote ? undefined : 'true'}
          onLoad={() => setLoadedSource(current)}
          onError={tryNextSource}
          className={`absolute inset-0 h-full w-full transition-opacity duration-200 ${contain ? 'object-contain' : 'object-cover'} ${loadedSource === current ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
