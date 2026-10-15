import React, { useState } from 'react';
import { getFortniteItemStyle } from '@/components/fortnite/rarityUtils';
import CosmeticReactionBar from '@/components/fortnite/CosmeticReactionBar';
import FortniteMedia from '@/components/fortnite/FortniteMedia';

export default function FortniteCosmeticCard({ item, onClick, user, voteCounts }) {
  const [hovered, setHovered] = useState(false);
  const style = getFortniteItemStyle(item);
  return <article className="overflow-hidden rounded-xl border" style={{ background: style.bg, borderColor: style.border }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <button onClick={onClick} onFocus={() => setHovered(true)} onBlur={() => setHovered(false)} className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label={`Voir ${item.name}`}>
      <div className="group/media aspect-square"><FortniteMedia item={item} active={hovered} thumbnail /></div>
      <div className="bg-background/70 p-2 text-foreground"><h3 className="truncate text-xs font-bold">{item.name}</h3><p className="mt-1 truncate text-[10px] text-muted-foreground">{item.type_display || item.type}</p></div>
    </button>
    <div className="bg-background/70 px-2 pb-2"><CosmeticReactionBar cosmetic={item} user={user} counts={voteCounts} compact /></div>
  </article>;
}