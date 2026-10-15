import React, { useState } from 'react';
import { getFortniteItemStyle } from '@/components/fortnite/rarityUtils';
import CosmeticReactionBar from '@/components/fortnite/CosmeticReactionBar';
import FortniteMedia from '@/components/fortnite/FortniteMedia';
import VbuckPrice from '@/components/fortnite/VbuckPrice';

const WIDTHS = { Size_1_x_1: '', Size_2_x_1: 'sm:col-span-2', Size_3_x_1: 'sm:col-span-3', Size_4_x_1: 'sm:col-span-4' };
export default function FortniteShopCard({ item, onClick, user, voteCounts }) {
  const [hovered, setHovered] = useState(false);
  const style = getFortniteItemStyle(item);
  return <article className={`relative flex flex-col overflow-hidden rounded-xl border backdrop-blur-xl ${WIDTHS[item.tile_size] || ''}`} style={{ background: style.bg, borderColor: style.border, boxShadow: `0 0 24px ${style.glow}` }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <button onClick={onClick} className="block w-full flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label={`Voir l’offre ${item.name}`}>
      <div className="group/media relative h-44 sm:h-64"><FortniteMedia item={item} active={hovered} thumbnail />
        {item.banner && <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-[10px] font-bold text-foreground">{item.banner}</span>}
      </div>
      <div className="bg-background/80 p-3 text-foreground"><h3 className="truncate text-sm font-black">{item.name}</h3>
        <p className="mb-2 mt-1 truncate text-[10px] text-muted-foreground">{item.is_bundle ? `Pack · ${item.included_items.length} objets` : item.type_display || item.type}</p><VbuckPrice item={item} compact />
      </div>
    </button>
    <div className="bg-background/80 px-3 pb-3"><CosmeticReactionBar cosmetic={item} user={user} counts={voteCounts} compact /></div>
  </article>;
}