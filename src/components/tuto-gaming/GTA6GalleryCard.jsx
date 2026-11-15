import React from 'react';
import { Images } from 'lucide-react';
import GTA6Image from '@/components/tuto-gaming/GTA6Image';
export default function GTA6GalleryCard({ item, onClick }) {
  return <button type="button" onClick={() => onClick(item)} data-entity-type={item.type} className="group overflow-hidden rounded-xl border border-border bg-card text-left text-card-foreground transition hover:border-primary">
    <div className="relative aspect-[4/3]"><GTA6Image key={item.image} src={item.image} alt={item.name} fallbackColor={item.color} className="h-full w-full object-cover" />{item.gallery.length > 1 && <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-popover px-2 py-1 text-xs text-popover-foreground"><Images className="h-3 w-3" />{item.gallery.length}</span>}</div>
    <div className="p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">{item.tag || item.category}</p><h3 className="text-sm font-black">{item.name}</h3><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.desc}</p></div>
  </button>;
}