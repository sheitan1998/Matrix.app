import React,{useMemo,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {AlertTriangle,Castle,Loader2,MapPinned,Sprout,Users,ZoomIn,ZoomOut} from 'lucide-react';
import {base44} from '@/api/base44Client';

const LAYERS={dungeons:{label:'Donjons',icon:Castle,color:'#f97316'},resources:{label:'Zones de récolte',icon:Sprout,color:'#22c55e'},npcs:{label:'PNJ / points d’intérêt',icon:Users,color:'#38bdf8'}};

export default function DofusMap(){
  const [enabled,setEnabled]=useState({dungeons:true,resources:true,npcs:true});
  const [zoom,setZoom]=useState(1);
  const [selected,setSelected]=useState(null);
  const {data,isLoading,isError,refetch}=useQuery({queryKey:['dofus-map-layers'],staleTime:24*60*60*1000,retry:false,queryFn:async()=>{const {data:value}=await base44.functions.invoke('dofusApi',{action:'getMapLayers',lang:'fr'});if(value.error)throw new Error(value.error);return value;}});
  const markers=useMemo(()=>{
    if(!data)return[];
    return data.areas.flatMap(area=>[
      enabled.dungeons&&area.dungeonId!==null&&{...area,layer:'dungeons'},
      enabled.resources&&area.harvestableCount>0&&{...area,layer:'resources'},
      enabled.npcs&&area.npcCount>0&&{...area,layer:'npcs'},
    ].filter(Boolean));
  },[data,enabled]);
  if(isLoading)return <p role="status" className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin"/>Chargement des calques DofusDB…</p>;
  if(isError)return <div role="alert" className="rounded-xl border border-destructive/40 p-5"><p className="flex items-center gap-2"><AlertTriangle className="h-5 w-5"/>La géographie DofusDB est indisponible.</p><button type="button" onClick={()=>refetch()} className="mt-3 rounded-lg bg-primary px-4 py-2 text-primary-foreground">Réessayer</button></div>;
  return <section className="space-y-4" aria-labelledby="dofus-map-title">
    <div><h2 id="dofus-map-title" className="flex items-center gap-2 text-xl font-bold"><MapPinned className="h-5 w-5"/>Carte du Monde des Douze</h2><p className="text-sm text-muted-foreground">Vue géographique des {data.total} sous-zones publiées par {data.source}. Les marqueurs représentent le centre calculé de chaque zone, pas une entrée de bâtiment précise.</p></div>
    <div className="flex flex-wrap gap-2">{Object.entries(LAYERS).map(([id,layer])=>{const Icon=layer.icon;return <button type="button" key={id} aria-pressed={enabled[id]} onClick={()=>setEnabled(value=>({...value,[id]:!value[id]}))} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${enabled[id]?'bg-primary text-primary-foreground':'bg-card'}`}><Icon className="h-4 w-4"/>{layer.label} ({data.coverage[id==='resources'?'harvestableZones':id==='npcs'?'npcZones':'dungeons']})</button>;})}</div>
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <div className="relative h-[32rem] overflow-hidden rounded-xl border bg-[#111827]">
        <div className="absolute right-3 top-3 z-10 flex gap-1"><button type="button" aria-label="Zoomer" onClick={()=>setZoom(value=>Math.min(2.5,value+.25))} className="rounded bg-background p-2"><ZoomIn className="h-4 w-4"/></button><button type="button" aria-label="Dézoomer" onClick={()=>setZoom(value=>Math.max(.75,value-.25))} className="rounded bg-background p-2"><ZoomOut className="h-4 w-4"/></button></div>
        <svg role="img" aria-label="Carte interactive des zones du Monde des Douze" viewBox="-100 -100 200 200" className="h-full w-full" style={{transform:`scale(${zoom})`}}>
          <defs><pattern id="dofus-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="#334155" strokeWidth=".25"/></pattern></defs><rect x="-100" y="-100" width="200" height="200" fill="url(#dofus-grid)"/>
          {markers.map(marker=><circle key={`${marker.layer}-${marker.id}`} role="button" tabIndex={0} aria-label={`${LAYERS[marker.layer].label}, ${marker.name}`} onClick={()=>setSelected(marker)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setSelected(marker);}}} cx={marker.center.x} cy={marker.center.y} r={selected?.id===marker.id?2.2:1.25} fill={LAYERS[marker.layer].color} opacity=".86" className="cursor-pointer focus:outline-none"><title>{marker.name} [{marker.center.x},{marker.center.y}]</title></circle>)}
        </svg>
      </div>
      <aside className="rounded-xl border bg-card p-4"><h3 className="font-bold">Détails de la zone</h3>{selected?<dl className="mt-4 space-y-3 text-sm"><div><dt className="text-muted-foreground">Zone</dt><dd className="font-semibold">{selected.name}</dd></div><div><dt className="text-muted-foreground">Position centrale</dt><dd>[{selected.center.x}, {selected.center.y}]</dd></div><div><dt className="text-muted-foreground">Niveau de zone</dt><dd>{selected.level||'Non renseigné'}</dd></div><div><dt className="text-muted-foreground">Couverture disponible</dt><dd>{selected.dungeonId!==null?'Donjon · ':''}{selected.harvestableCount} récoltables · {selected.npcCount} PNJ/POI</dd></div></dl>:<p className="mt-3 text-sm text-muted-foreground">Sélectionnez un marqueur pour consulter les données disponibles.</p>}<p className="mt-5 border-t pt-4 text-xs text-muted-foreground">DofusDB ne fournit pas ici les noms détaillés de tous les récoltables/PNJ ni un fond de carte global réutilisable. L’architecture conserve leurs identifiants agrégés sans fabriquer de contenu.</p></aside>
    </div>
  </section>;
}
