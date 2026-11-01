import React from 'react';
import { Star, Tag, User, Cog } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FarmingModImage from '@/components/tuto-gaming/FarmingModImage';
import DownloadModButton from '@/components/tuto-gaming/DownloadModButton';
import { FARMING_LOCAL_IMAGES } from '@/components/tuto-gaming/farmingLocalImages';

export default function ModHubCard({ mod, onSelect, priority = false }) {
  const queryClient = useQueryClient();
  const specs = mod.specs || {};
  const specEntries = Object.entries(specs).slice(0, 3);

  // Prefetch full mod details on hover/focus so the modal opens instantly with
  // description + gallery — no intermediate loading state.
  const prefetchDetails = () => {
    queryClient.prefetchQuery({
      queryKey: ['farming-mod-detail', mod.id],
      staleTime: 60 * 60 * 1000,
      queryFn: async () => {
        const { data } = await base44.functions.invoke('farmingModApi', { action: 'getModDetails', modId: mod.id });
        if (data.error) throw new Error(data.error);
        // Warm the browser cache for every gallery image so the modal opens instantly.
        const urls = [...(data.images || []), data.hdImg, data.img].filter(Boolean);
        urls.forEach((url) => { const img = new Image(); img.src = url; });
        return data;
      },
    });
  };

  return (
    <article className="flex flex-col rounded-xl border bg-card text-card-foreground overflow-hidden hover:border-primary transition-all">
      <button
        type="button"
        onClick={() => onSelect(mod)}
        onMouseEnter={prefetchDetails}
        onFocus={prefetchDetails}
        aria-label={`Voir les détails de ${mod.title}`}
        className="flex flex-col text-left flex-1"
      >
        <div className="relative w-full aspect-square">
          <FarmingModImage
            src={mod.img}
            fallbackSrc={FARMING_LOCAL_IMAGES[mod.id]}
            priority={priority}
            alt={mod.title}
            modTitle={mod.title}
            brand={mod.brand}
            className="w-full h-full object-cover"
          />
          {mod.brand && mod.brand !== "none" && (
            <span
              className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider"
              style={{ background: "rgba(125,166,39,0.85)", color: "#0a0a0a" }}
            >
              {mod.brand}
            </span>
          )}
          {mod.version && (
            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[8px] font-bold text-white/80">
              v{mod.version}
            </span>
          )}
        </div>
        <div className="p-2.5 w-full">
          <h3 className="text-sm font-bold line-clamp-2">{mod.title}</h3>
          <div className="flex items-center gap-1 mt-1">
            <User className="w-2.5 h-2.5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground truncate">{mod.author}</p>
          </div>
          {mod.category && (
            <div className="flex items-center gap-1 mt-0.5">
              <Tag className="w-2.5 h-2.5 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground truncate">{mod.category}</p>
            </div>
          )}
          {specEntries.length > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Cog className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
              <p className="text-[9px] text-muted-foreground truncate">
                {specEntries.map(([k, v]) => `${k}: ${v}`).join(" · ")}
              </p>
            </div>
          )}
          {mod.rating > 0 && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
              <Star className="w-3 h-3 text-primary" />
              {Number(mod.rating).toFixed(1)} ({mod.votes || 0})
            </p>
          )}
        </div>
      </button>
      <div className="p-2 pt-0">
        <DownloadModButton mod={mod} />
      </div>
    </article>
  );
}