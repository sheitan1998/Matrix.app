import React from 'react';

const CATEGORY_LABELS = {
  body: 'Carrosserie',
  wheels: 'Roues',
  decal: 'Sticker',
  goalExplosion: 'Explosion de but',
  paint: 'Peinture',
  preset: 'Preset',
};

const RARITY_STYLES = [
  { pattern: /marché noir|black market/i, className: 'border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-200' },
  { pattern: /exotique|exotic/i, className: 'border-amber-300/50 bg-amber-400/15 text-amber-100' },
  { pattern: /importé|import/i, className: 'border-red-400/50 bg-red-500/15 text-red-200' },
  { pattern: /très rare|very rare/i, className: 'border-violet-400/50 bg-violet-500/15 text-violet-200' },
  { pattern: /\brare\b/i, className: 'border-blue-400/50 bg-blue-500/15 text-blue-200' },
  { pattern: /peu commun|uncommon/i, className: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200' },
  { pattern: /limité|limited/i, className: 'border-orange-400/50 bg-orange-500/15 text-orange-200' },
];

function rarityClass(rarity) {
  return RARITY_STYLES.find(({ pattern }) => pattern.test(String(rarity)))?.className
    || 'border-slate-500/60 bg-slate-700/50 text-slate-200';
}

export default function RocketLeagueFallbackCard({
  name,
  category,
  rarity,
  price = null,
  priceEstimated = true,
  summary = '',
}) {
  const categoryLabel = CATEGORY_LABELS[category] || category || 'Objet Rocket League';
  const rarityLabel = rarity || 'Rareté non précisée';
  const hasPrice = Number.isFinite(Number(price)) && Number(price) > 0;

  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-slate-950 p-3 text-left text-white">
      <div className="min-w-0">
        <span className="inline-flex rounded-full border border-violet-400/40 bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-200">
          {categoryLabel}
        </span>
        <strong className="mt-2 block line-clamp-2 text-base font-black leading-tight sm:text-lg">
          {name || 'Objet non sélectionné'}
        </strong>
        {summary && (
          <p className="mt-1 line-clamp-3 text-[10px] leading-relaxed text-slate-300 sm:text-xs">
            {summary}
          </p>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-1.5">
        <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${rarityClass(rarityLabel)}`}>
          {rarityLabel}
        </span>
        <span className="text-right text-[10px] font-semibold text-slate-300">
          {hasPrice
            ? `${priceEstimated ? 'Prix estimé' : 'Prix fourni'} : ${price} crédits`
            : 'Prix non disponible'}
        </span>
      </div>
    </div>
  );
}
