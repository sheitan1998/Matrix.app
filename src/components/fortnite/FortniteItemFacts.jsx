import React from 'react';
import VbuckPrice from '@/components/fortnite/VbuckPrice';

export default function FortniteItemFacts({ item }) {
  const facts = [
    ['Type', item.type_display || item.type], ['Rareté', item.rarity_display || item.rarity],
    ['Série', item.series], ['Ensemble', item.set_name || item.set_display], ['Section', item.layout],
    ['Chapitre / saison', item.chapter ? `${item.chapter}${item.season ? ` / ${item.season}` : ''}` : null],
    ['Ajouté le', item.added ? new Date(item.added).toLocaleDateString('fr-FR') : null],
    ['Disponible jusqu’au', item.out_date ? new Date(item.out_date).toLocaleString('fr-FR') : null], ['Artiste', item.artist],
  ];
  return <div className="space-y-4">
    {item.price != null && <div><p className="mb-1 text-xs text-muted-foreground">Prix de l’offre{item.is_bundle ? ' complète' : ''}</p><VbuckPrice item={item} /></div>}
    {item.description && <p className="text-sm leading-relaxed text-foreground/80">{item.description}</p>}
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">{facts.filter(([, value]) => value).map(([label, value]) => <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-bold text-foreground">{value}</dd>
    </div>)}</dl>
    {item.audio && <audio src={item.audio} controls loop className="w-full" aria-label={`Audio de ${item.name}`} />}
  </div>;
}