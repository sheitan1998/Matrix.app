import React from 'react';
import { Star } from 'lucide-react';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';
import DownloadModButton from '@/components/tuto-gaming/DownloadModButton';
export default function ModHubCard({mod,onSelect}) {
  return <article className="flex flex-col rounded-xl border bg-card text-card-foreground overflow-hidden hover:border-primary">
    <button type="button" onClick={()=>onSelect(mod)} aria-label={`Voir les détails de ${mod.title}`} className="flex flex-col text-left flex-1">
      <CatalogueImage src={mod.img} alt={mod.title} kind="farming" className="w-full aspect-square"/><div className="p-3 w-full"><h3 className="text-sm font-bold line-clamp-2">{mod.title}</h3><p className="text-xs text-muted-foreground mt-1">Par {mod.author}</p>{mod.rating>0&&<p className="flex items-center gap-1 text-xs text-muted-foreground mt-2"><Star className="w-3 h-3 text-primary"/>{Number(mod.rating).toFixed(1)} ({mod.votes||0})</p>}</div>
    </button><div className="p-2 pt-0"><DownloadModButton mod={mod}/></div>
  </article>;
}