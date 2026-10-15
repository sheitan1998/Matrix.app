import React,{useEffect,useState} from 'react';
import {ImageOff} from 'lucide-react';

export default function DofusClassArtwork({breed,variant,className,onImageError,imageUrl=null,showCaption=false}) {
  const [failed,setFailed]=useState(false);
  const selected=breed?.variants?.find(value=>value.id===variant)||breed?.variants?.[0];
  const source=imageUrl||breed?.artworkDataUrl||selected?.img;
  useEffect(()=>setFailed(false),[source,selected?.crop]);
  return <figure className={`flex min-w-0 flex-col items-center ${className}`}>
    <div className="relative aspect-[0.45] h-full max-h-[385px] min-h-52 overflow-hidden" data-full-body-artwork={selected?.crop||''}>
      {source&&!failed?<img src={source} alt={`${breed.name}, personnage ${selected.name} en pied`} loading="eager" className={`absolute top-0 h-full w-auto max-w-none object-contain ${selected.crop==='right'?'right-0':'left-0'}`} onLoad={event=>{if(event.currentTarget.naturalWidth<300||event.currentTarget.naturalHeight<300){setFailed(true);onImageError();}}} onError={()=>{setFailed(true);onImageError();}}/>:<div role="img" aria-label="Illustration de classe indisponible" className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted text-center text-muted-foreground"><ImageOff className="h-12 w-12"/><span className="text-xs">Personnage indisponible</span></div>}
    </div>
    {showCaption&&<figcaption className="mt-2 text-center"><strong>{breed?.name||'Classe'}</strong><span className="block text-[11px] text-muted-foreground">Illustration officielle DOFUS Unity · {selected?.name||'variante'}</span></figcaption>}
  </figure>;
}
