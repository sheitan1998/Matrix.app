import React, { useState } from 'react';
import { Package, Sword, FlaskConical, Tractor, Car, CircleDot, Sparkles } from 'lucide-react';
const ICONS = { equipment:Package, weapons:Sword, consumables:FlaskConical, farming:Tractor, 'Châssis':Car, 'Roues':CircleDot, 'Explosion de but':Sparkles };
export default function CatalogueImage({src,alt,kind='equipment',className=''}) {
  const [failedSrc,setFailedSrc]=useState(null);
  const Icon=ICONS[kind]||Package;
  return <div className={`relative flex items-center justify-center overflow-hidden bg-muted ${className}`}>
    {src && failedSrc!==src ? <img src={src} alt={alt} loading="lazy" className="w-full h-full object-contain" onError={()=>setFailedSrc(src)}/> : <div className="flex flex-col items-center justify-center gap-2 p-3 text-primary"><Icon className="h-14 w-14"/><span className="text-xs text-muted-foreground text-center">{kind==='farming'?'Farming Simulator 25':alt}</span></div>}
  </div>;
}