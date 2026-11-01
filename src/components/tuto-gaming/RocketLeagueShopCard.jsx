import React, { useState } from 'react';
import { rarityNeon } from './rocketLeagueShopData';
import RocketLeaguePaintSwatches from './RocketLeaguePaintSwatches';
import { ROCKET_PAINTS } from './RocketLeaguePaintSwatches';

export default function RocketLeagueShopCard({ item, onOpen }) {
  const [imgError, setImgError] = useState(false);
  const [paintId, setPaintId] = useState('default');
  const neon = rarityNeon(item.rarity, item.rarityColor);
  const selectedPaint = ROCKET_PAINTS.find(p => p.id === paintId);
  const overlayColor = selectedPaint?.color;

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
        onClick={() => onOpen({ ...item, selectedPaintId: paintId })}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Détails de ${item.name}`}
      >
        <div className="relative aspect-square w-full overflow-hidden" style={{ background: '#0a0a0f' }}>
          {!imgError && item.image ? (
            <>
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
              />
              {overlayColor && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: overlayColor, mixBlendMode: 'multiply', opacity: 0.45 }}
                />
              )}
            </>
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
          {item.paint && (
            <span
              className="absolute bottom-2 left-2 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white"
              style={{ background: item.paintColor || '#3f3f3f' }}
            >
              {item.paint}
            </span>
          )}
        </div>
        <div className="space-y-1 p-3">
          <h3 className="truncate text-sm font-bold text-foreground">{item.name}</h3>
          <p className="truncate text-[11px] text-muted-foreground">{item.type}</p>
          <p className="text-xs font-black" style={{ color: neon.color }}>
            {item.price != null ? `${item.price} crédits` : 'Prix N/A'}
          </p>
        </div>
      </button>
      <div className="px-3 pb-2">
        <RocketLeaguePaintSwatches selected={paintId} onSelect={setPaintId} compact />
      </div>
    </article>
  );
}