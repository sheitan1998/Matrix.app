import React, { useState } from 'react';
import FarmingModPlaceholder from '@/components/tuto-gaming/FarmingModPlaceholder';

export default function FarmingModImage({ src, alt, modTitle, brand, className = '', fallbackSrc, priority = false }) {
  const [loadedSrc, setLoadedSrc] = useState(null);
  const [failedSrc, setFailedSrc] = useState(null);
  const fit = className.includes('object-contain') ? 'object-contain' : 'object-cover';
  return (
    <div className={`relative isolate overflow-hidden ${className}`} role="img" aria-label={alt || modTitle || 'Mod FS25'}>
      <FarmingModPlaceholder modTitle={modTitle} brand={brand} />
      {fallbackSrc && fallbackSrc !== src && (
        <img src={fallbackSrc} alt="" aria-hidden="true" loading={priority ? 'eager' : 'lazy'} decoding="async"
          className={`absolute inset-0 h-full w-full ${fit}`} onError={event => { event.currentTarget.hidden = true; }} />
      )}
      {src && failedSrc !== src && (
        <img key={src} src={src} alt="" aria-hidden="true" loading={priority ? 'eager' : 'lazy'} decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          className={`absolute inset-0 h-full w-full ${fit} transition-opacity duration-300 ${loadedSrc === src ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoadedSrc(src)} onError={() => setFailedSrc(src)} />
      )}
    </div>
  );
}