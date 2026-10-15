import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { resolveRocketImageSources } from './rocketLeagueImages';
import RocketLeagueFallbackCard from './RocketLeagueFallbackCard';

const IMAGE_TIMEOUT_MS = 3_000;
const PROXY_TIMEOUT_MS = 6_000;

export default function RocketLeagueImage({
  src = '',
  sources = [],
  alt,
  className = '',
  contain = true,
  fallbackLabel = '',
  captureRemote = true,
  showFallback = true,
  fallbackCategory = '',
  fallbackRarity = '',
  fallbackPrice = null,
  fallbackPriceEstimated = true,
  fallbackSummary = '',
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
    base44.functions.fetch('/api/rocket-league-proxy', {
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
    >
      {showFallback && (
        <RocketLeagueFallbackCard
          name={label}
          category={fallbackCategory}
          rarity={fallbackRarity}
          price={fallbackPrice}
          priceEstimated={fallbackPriceEstimated}
          summary={fallbackSummary}
        />
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
