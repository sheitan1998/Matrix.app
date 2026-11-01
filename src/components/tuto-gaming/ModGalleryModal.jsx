import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { normalizeAppAssetUrl } from '@/lib/urlUtils';
import { FARMING_FALLBACK } from '@/components/tuto-gaming/farmingFallback';

// Single interactive gallery for a ModHub mod: opens directly on the images
// with instant switching (all images preloaded as soon as data is available).
export default function ModGalleryModal({ modId, initialMod, onClose }) {
  const [index, setIndex] = useState(0);

  const { data: mod } = useQuery({
    queryKey: ['farming-mod-detail', modId],
    initialData: initialMod || FARMING_FALLBACK.find(item => item.id === String(modId)),
    initialDataUpdatedAt: initialMod?.description ? Date.now() : 0,
    staleTime: 60 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const { data } = await base44.functions.invoke('farmingModApi', { action: 'getModDetails', modId });
      if (data.error) throw new Error(data.error);
      return data;
    },
  });

  const images = useMemo(() => {
    const values = [...(mod?.images || []), mod?.hdImg, mod?.img].filter(Boolean);
    return values.filter((value, i) => values.indexOf(value) === i);
  }, [mod]);

  const total = images.length;
  const signature = images.join('|');

  // Preload every image so navigation never shows a loading state.
  useEffect(() => {
    images.forEach((url) => {
      const img = new Image();
      img.src = normalizeAppAssetUrl(url);
    });
  }, [signature]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = useCallback((next) => {
    if (!total) return;
    setIndex(((next % total) + total) % total);
  }, [total]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft' && total > 1) goTo(index - 1);
      else if (event.key === 'ArrowRight' && total > 1) goTo(index + 1);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, total, goTo, onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.96)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Galerie de ${mod?.title || 'mod'}`}
    >
      {/* Top bar */}
      <div
        className="flex shrink-0 items-center justify-between gap-3 px-4 py-3"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{mod?.title || 'Galerie du mod'}</p>
          <p className="text-[10px] uppercase tracking-wider text-white/40">
            {total > 0 ? `${index + 1} / ${total}` : 'Aucune image'}
            {mod?.author ? ` · ${mod.author}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la galerie"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image stage */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {total > 0 ? (
          <img
            key={images[index]}
            src={normalizeAppAssetUrl(images[index])}
            alt={`${mod?.title || 'Mod'} — image ${index + 1} sur ${total}`}
            draggable={false}
            className="max-h-full max-w-full select-none object-contain"
          />
        ) : (
          <p className="text-sm text-white/50">Aucune image disponible pour ce mod.</p>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition hover:bg-white/15"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition hover:bg-white/15"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div
          className="flex shrink-0 items-center gap-2 overflow-x-auto px-4 py-3"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Afficher l’image ${i + 1}`}
              aria-current={i === index}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === index ? 'border-[#7DA627] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
              style={{ background: '#262626' }}
            >
              <img src={normalizeAppAssetUrl(url)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}