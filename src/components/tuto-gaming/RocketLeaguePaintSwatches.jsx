import React from 'react';

export const ROCKET_PAINTS = [
  { id: 'default', name: 'Par défaut', color: null },
  { id: 'tw', name: 'Titanium White', color: '#e7e7e7' },
  { id: 'black', name: 'Black', color: '#3f3f3f' },
  { id: 'crimson', name: 'Crimson', color: '#cb0000' },
  { id: 'sky_blue', name: 'Sky Blue', color: '#27bce7' },
  { id: 'lime', name: 'Lime', color: '#bcff00' },
  { id: 'purple', name: 'Purple', color: '#8900bc' },
  { id: 'gold', name: 'Gold', color: '#ffd700' },
  { id: 'orange', name: 'Orange', color: '#ff9500' },
  { id: 'pink', name: 'Pink', color: '#ff66cc' },
  { id: 'forest', name: 'Forest Green', color: '#008000' },
];

export default function RocketLeaguePaintSwatches({ selected, onSelect, compact = false }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? '' : 'p-1'}`}>
      {ROCKET_PAINTS.map(paint => {
        const active = selected === paint.id;
        return (
          <button
            key={paint.id}
            type="button"
            onClick={() => onSelect(paint.id)}
            title={paint.name}
            aria-label={paint.name}
            aria-pressed={active}
            className="rounded-full transition-all hover:scale-110 tap-sm"
            style={{
              width: compact ? 20 : 24,
              height: compact ? 20 : 24,
              background: paint.color || 'transparent',
              border: active ? '2px solid #fff' : paint.color ? '2px solid rgba(255,255,255,0.2)' : '2px dashed rgba(255,255,255,0.3)',
              boxShadow: active ? `0 0 8px ${paint.color || '#fff'}` : 'none',
            }}
          >
            {!paint.color && <span className="text-[8px] text-muted-foreground">∅</span>}
          </button>
        );
      })}
    </div>
  );
}