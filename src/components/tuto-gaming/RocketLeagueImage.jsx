import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { resolveRocketImageSources, rocketFallbackColors } from './rocketLeagueImages';

const IMAGE_TIMEOUT_MS = 3_000;
const PROXY_TIMEOUT_MS = 6_000;

export default function RocketLeagueImage({
  src,
  sources,
  alt,
  className = '',
  contain = true,
  fallbackLabel = '',
  accent = '',
  captureRemote = true,
  showFallback = true,
}) {
  const candidates = useMemo(
    () => resolveRocketImageSources({ src, sources }),
    [src, sources],
  );
  const signature = candidates.join('|');
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('direct');
  const [loadedSource, setLoadedSource] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const current = candidates[index] || '';
  const imageSource = phase === 'direct' ? current : phase === 'proxy-image' ? proxyUrl : '';
  const label = fallbackLabel || alt || 'Visuel indisponible';
  const colors = rocketFallbackColors(label, accent);
  const initials = String(label).trim().slice(0, 2).toUpperCase() || 'RL';

  useEffect(() => {
    setIndex(0);
    setPhase('direct');
    setLoadedSource('');
    setProxyUrl('');
  }, [signature]);

  useEffect(() => () => {
    if (proxyUrl) URL.revokeObjectURL(proxyUrl);
  }, [proxyUrl]);

  useEffect(() => {
    if (phase !== 'direct' || !current || loadedSource === current) return undefined;
    const timeout = setTimeout(() => {
      setLoadedSource('');
      setPhase('proxy-fetch');
    }, IMAGE_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [current, loadedSource, phase]);

  useEffect(() => {
    if (phase !== 'proxy-fetch' || !current) return undefined;
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    base44.functions.fetch('/rocketLeagueImage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: current }),
      signal: controller.signal,
    })
      .then(response => {
        if (!response.ok) throw new Error('proxy_rejected');
        return response.blob();
      })
      .then(blob => {
        if (!active || !/^image\/(avif|jpeg|png|webp)(?:;|$)/i.test(blob.type)) {
          throw new Error('proxy_invalid');
        }
        setProxyUrl(URL.createObjectURL(blob));
        setPhase('proxy-image');
      })
      .catch(() => {
        if (!active) return;
        setIndex(value => value + 1);
        setPhase('direct');
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [current, phase]);

  useEffect(() => {
    if (phase !== 'proxy-image' || !proxyUrl || loadedSource === proxyUrl) return undefined;
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(proxyUrl);
      setProxyUrl('');
      setLoadedSource('');
      setIndex(value => value + 1);
      setPhase('direct');
    }, IMAGE_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [loadedSource, phase, proxyUrl]);

  function handleImageError() {
    setLoadedSource('');
    if (phase === 'direct') {
      setPhase('proxy-fetch');
      return;
    }
    if (proxyUrl) URL.revokeObjectURL(proxyUrl);
    setProxyUrl('');
    setIndex(value => value + 1);
    setPhase('direct');
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${showFallback ? 'bg-slate-950' : 'bg-transparent'} ${className}`}
      style={{
        backgroundImage: showFallback
          ? `radial-gradient(circle at 22% 18%, ${colors.primary}88, transparent 42%), linear-gradient(135deg, #111827, ${colors.secondary}55)`
          : 'none',
      }}
    >
      {showFallback && (
        <span className="flex max-w-full flex-col items-center gap-2 px-3 text-center text-white">
          <span className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/25 bg-black/35 px-2 text-sm font-black shadow-lg">
            {initials}
          </span>
          <span className="line-clamp-2 text-xs font-semibold drop-shadow">{label}</span>
        </span>
      )}
      {imageSource && (
        <img
          key={imageSource}
          src={imageSource}
          alt={alt}
          loading="lazy"
          crossOrigin={imageSource.startsWith('blob:') ? undefined : 'anonymous'}
          referrerPolicy="no-referrer"
          data-html2canvas-ignore={
            !captureRemote && !imageSource.startsWith('blob:') ? 'true' : undefined
          }
          onLoad={() => setLoadedSource(imageSource)}
          onError={handleImageError}
          className={`absolute inset-0 h-full w-full transition-opacity duration-200 ${contain ? 'object-contain' : 'object-cover'} ${loadedSource === imageSource ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
