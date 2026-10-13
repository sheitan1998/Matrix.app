import React from 'react';
import { getFortniteItemStyle } from '@/components/fortnite/rarityUtils';

export default function FortniteItemGallery({ title, items, onSelect }) {
  if (!items?.length) return null;
  return <section className="border-t border-border pt-4">
    <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
    <div className="grid grid-cols-3 gap-2">{items.map(item => <button key={item.id} onClick={() => onSelect(item)} className="overflow-hidden rounded-lg border text-left" style={{ background: getFortniteItemStyle(item).bg }}>
      {item.image && <img src={item.image} alt={item.name} loading="lazy" className="aspect-square w-full object-contain" />}
      <span className="block truncate bg-background/80 p-2 text-[10px] text-foreground">{item.name}</span>
    </button>)}</div>
  </section>;
}