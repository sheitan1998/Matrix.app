import React from 'react';
import FortniteShopCard from '@/components/fortnite/FortniteShopCard';

export default function FortniteShopSection({ items, onSelect, user, voteCounts }) {
  const section = items[0];
  const textures = Object.fromEntries((section.section_textures || []).map(({ key, value }) => [key, value]));
  return <section className="mb-10">
    {section.section_category && <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">{section.section_category}</p>}
    <h2 className="mb-4 text-xl font-black uppercase text-foreground">{section.layout}</h2>
    {section.display_type === 'billboard' && textures.background && <button onClick={() => onSelect(section)} className="relative mb-4 block w-full overflow-hidden rounded-xl text-left" aria-label={`Voir ${section.name}`}>
      <img src={textures.background} alt="" loading="lazy" className="aspect-[3/1] w-full object-cover" />
      {textures.foreground && <img src={textures.foreground} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-contain" />}
      {textures.titleImage && <img src={textures.titleImage} alt={section.layout} loading="lazy" className="absolute left-6 top-6 h-1/3 max-w-[40%] object-contain" />}
      {textures.bodyImage && <img src={textures.bodyImage} alt="" loading="lazy" className="absolute bottom-4 left-6 h-1/3 max-w-[40%] object-contain" />}
    </button>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{items.map(item => <FortniteShopCard key={item.offer_id || item.id} item={item} onClick={() => onSelect(item)} user={user} voteCounts={voteCounts?.[item.id]} />)}</div>
  </section>;
}