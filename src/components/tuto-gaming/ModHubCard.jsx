import React from 'react';
import { Star, Tag, User, Cog } from 'lucide-react';
import FarmingModImage from '@/components/tuto-gaming/FarmingModImage';
import DownloadModButton from '@/components/tuto-gaming/DownloadModButton';
import { FARMING_LOCAL_IMAGES } from '@/components/tuto-gaming/farmingLocalImages';

export default function ModHubCard({ mod, onSelect, priority = false }) {
  const specs = mod.specs || {};
  const specEntries = Object.entries(specs).slice(0, 3);

  return (
    <article className="flex flex-col rounded-xl border bg-card text-card-foreground overflow-hidden hover:border-primary transition-all">
      <button
        type="button"
        onClick={() => onSelect(mod)}
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