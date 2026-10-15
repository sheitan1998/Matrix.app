import React,{useEffect,useState} from 'react';
import {ImageOff} from 'lucide-react';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';

const OVERLAYS=[
  ['cape','left-2 top-1/2'],
  ['head','left-1/2 top-1 -translate-x-1/2'],
  ['weapon','left-2 bottom-3'],
  ['shield','right-2 bottom-3'],
  ['companion','right-2 top-1/2'],
];

export default function DofusAvatarPreview({breed,variant,equipment,onImageError}) {
  const [failed,setFailed]=useState(false);
  const selected=breed?.variants?.find(value=>value.id===variant)||breed?.variants?.[0];
  useEffect(()=>setFailed(false),[selected?.img]);
  return <div className="flex h-full flex-col items-center justify-center gap-3 p-3">
    <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-2 border-primary/30 bg-gradient-to-b from-primary/10 to-background shadow-inner">
      {selected?.img&&!failed?<img crossOrigin="anonymous" src={selected.img} alt={`${breed.name}, variante ${selected.name}`} className="h-32 w-32 object-contain" onError={event=>{setFailed(true);event.currentTarget.dataset.exportError='true';onImageError?.();}}/>:<div className="flex flex-col items-center gap-2 text-center text-muted-foreground"><ImageOff className="h-12 w-12"/><span className="text-xs">Avatar indisponible</span></div>}
      {OVERLAYS.map(([slot,position])=>equipment[slot]?.img&&<div key={slot} className={`absolute ${position} h-12 w-12 rounded-lg border bg-background/90 p-1 shadow-lg`} title={`${equipment[slot].name} — aperçu par icône`}><CatalogueImage src={equipment[slot].img} alt="" className="h-full w-full rounded"/></div>)}
    </div>
    <div className="text-center"><p className="font-bold">{breed?.name||'Choisissez une classe'}</p><p className="text-[11px] text-muted-foreground">Aperçu par icônes : DofusDB ne fournit pas de sprites d’équipement portés.</p></div>
  </div>;
}
