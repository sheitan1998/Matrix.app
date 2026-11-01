import React, { useState } from 'react';
import { rarityNeon } from './rocketLeagueShopData';

export default function RocketLeagueShopCard({ item, onOpen }) {
  const [imgError, setImgError] = useState(false);
  const neon = rarityNeon(item.rarity, item.rarityColor);
  const paintLabel = item.paint ? `Peinture: ${item.paint}` : null;

  return (
    <article
      className="group relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:scale-[1.03]"
      style={{
        border: `2px solid ${neon.color}`,
        boxShadow: `0 0 12px ${neon.glow}, inset 0 0 8px ${neon.glow}`,
      }}
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Détails de ${item.name}`}
      >
        <div className="relative aspect-square w-full overflow-hidden" style={{ background: '#0a0a0f' }}>
          {!imgError && item.image ? (
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
              className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
              <span className="text-2xl font-black" style={{ color: neon.color }}>RL</span>
              <span className="text-center text-[10px] font-semibold text-muted-foreground">{item.name}</span>
            </div>
          )}
          <span
            className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-black"
            style={{ background: neon.color, boxShadow: `0 0 8px ${neon.glow}` }}
          >
            {neon.label}
          </span>
        </div>
        <div className="space-y-1 p-3">
          <h3 className="truncate text-sm font-bold text-foreground">{item.name}</h3>
          <p className="truncate text-[11px] text-muted-foreground">{item.type}</p>
          {paintLabel && (
            <p className="truncate text-[10px]" style={{ color: item.paintColor || neon.color }}>
              {paintLabel}
            </p>
          )}
          <p className="text-xs font-black" style={{ color: neon.color }}>
            {item.price != null ? `${item.price} crédits` : 'Prix N/A'}
          </p>
        </div>
      </button>
    </article>
  );
}