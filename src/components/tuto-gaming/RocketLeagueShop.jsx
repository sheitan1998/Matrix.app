import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';
import { ROCKET_FALLBACK } from '@/components/tuto-gaming/rocketLeagueFallback';
export default function RocketLeagueShop() {
  const {data,isFetching}=useQuery({queryKey:['rocket-league-shop'],initialData:{items:ROCKET_FALLBACK,source:'reference'},staleTime:0,retry:false,queryFn:async()=>{try{const {data}=await base44.functions.invoke('rocketLeagueApi',{action:'getItemShop'});return data.items?.length?data:{items:ROCKET_FALLBACK,source:'reference'};}catch{return {items:ROCKET_FALLBACK,source:'reference'};}}});
  return <section aria-label="Boutique Rocket League" className="space-y-4">
    <h2 className="text-xl font-bold">Boutique du jour</h2>
    <p role="status" className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">{data.source==='live'?'Objets retournés par Tracker Network.':'Catalogue de secours : ces objets sont des références, pas la boutique du jour confirmée. Disponibilité et prix du jour indisponibles.'}</p>
    {isFetching&&<p className="flex gap-2 text-xs text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin"/>Vérification de la boutique en cours...</p>}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{data.items.map(item=><a key={item.id} href={item.url||'https://rocket-league.com/items'} target="_blank" rel="noopener noreferrer" className="rounded-xl border bg-card overflow-hidden hover:border-primary">
      <CatalogueImage src={item.img} alt={item.name} kind={item.type} className="aspect-square w-full"/><div className="p-3 space-y-1"><h3 className="text-sm font-bold">{item.name}</h3><p className="text-xs text-muted-foreground">{item.type}</p><p className="text-xs text-primary">{item.rarity}</p><p className="text-xs text-muted-foreground">{item.price!=null?`${item.price} crédits`:'Prix du jour non confirmé'}</p><span className="flex items-center gap-1 text-xs mt-2">Voir le catalogue <ExternalLink className="w-3 h-3"/></span></div>
    </a>)}</div>
    {data.categories?.length>0&&<nav className="flex flex-wrap gap-2" aria-label="Catégories RL Garage">{data.categories.map(c=><a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="border rounded-lg px-3 py-2 text-xs">{c.label}</a>)}</nav>}
  </section>;
}