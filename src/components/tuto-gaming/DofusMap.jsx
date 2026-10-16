import React,{useEffect,useMemo,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import L from 'leaflet';
import {MapContainer,Marker,Popup,Tooltip,useMap,useMapEvents} from 'react-leaflet';
import {AlertTriangle,Castle,Loader2,MapPinned,Sprout,Users} from 'lucide-react';
import {base44} from '@/api/base44Client';
import {buildDofusMarkers,clusterResourceMarkers,gamePositionToLeaflet,getWorldBounds,worldTileUrl} from '@/components/tuto-gaming/dofusMapData';

const LAYERS={
  dungeons:{label:'Donjons',icon:Castle,color:'#f97316'},
  resources:{label:'Zones de récolte',icon:Sprout,color:'#22c55e'},
  npcs:{label:'PNJ positionnés',icon:Users,color:'#38bdf8'},
};

const MARKER_SVGS={
  dungeons:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V8l3-3 2 3 2-5 2 5 2-3 3 3v12H5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 20v-6a3 3 0 0 1 6 0v6M12 14v2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  resources:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20c8 0 14-5 14-14C10 6 5 11 5 20Zm0 0c3-5 6-7 10-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  npcs:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 20c0-4 2-7 6-7s6 3 6 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};

function markerIcon(layer,cluster=false){
  const definition=LAYERS[layer];
  return L.divIcon({
    className:'dofus-map-marker',
    html:`<span style="--marker-color:${definition.color}" aria-hidden="true">${MARKER_SVGS[layer]}${cluster?'<i></i>':''}</span>`,
    iconSize:[34,34],
    iconAnchor:[17,17],
    popupAnchor:[0,-18],
  });
}

function WorldTileLayer({world,onTileError}){
  const map=useMap();
  useEffect(()=>{
    const queue=[];
    const requests=new WeakMap();
    let active=0;
    let disposed=false;
    const pump=()=>{
      while(!disposed&&active<6&&queue.length){
        const request=queue.shift();
        if(request.cancelled)continue;
        active+=1;
        const img=document.createElement('img');
        request.img=img;
        img.alt='';
        img.crossOrigin='anonymous';
        img.decoding='async';
        img.style.width='100%';
        img.style.height='100%';
        img.onload=()=>finish(request,null);
        img.onerror=()=>finish(request,new Error(`Tuile DofusDB indisponible : ${request.url}`));
        request.tile.appendChild(img);
        img.src=request.url;
      }
    };
    const finish=(request,error)=>{
      if(request.finished)return;
      request.finished=true;
      active=Math.max(0,active-1);
      if(error)onTileError();
      request.done(error,request.tile);
      pump();
    };
    class DofusWorldGridLayer extends L.GridLayer {
      createTile(coords,done){
        const tile=document.createElement('div');
        tile.style.background='linear-gradient(135deg,#172033,#111827)';
        const bank=world.tileBanks.find(value=>value.zoom===coords.z);
        const url=bank?worldTileUrl(world,bank,coords.x,coords.y):null;
        if(!url){
          queueMicrotask(()=>done(null,tile));
          return tile;
        }
        const request={cancelled:false,coords,done,finished:false,img:null,tile,url};
        requests.set(tile,request);
        queue.push(request);
        pump();
        return tile;
      }
    }
    const layer=new DofusWorldGridLayer({
      attribution:'DofusDB',
      bounds:getWorldBounds(world),
      keepBuffer:1,
      maxZoom:world.tileBanks.at(-1)?.zoom||0,
      minZoom:0,
      noWrap:true,
      tileSize:world.tileSize,
      updateWhenIdle:true,
    });
    layer.on('tileunload',event=>{
      const request=requests.get(event.tile);
      if(!request||request.finished)return;
      request.cancelled=true;
      if(request.img){
        request.img.onload=null;
        request.img.onerror=null;
        request.img.src='';
        finish(request,null);
      }
    });
    layer.addTo(map);
    return()=>{
      disposed=true;
      queue.forEach(request=>{request.cancelled=true;});
      layer.remove();
    };
  },[map,onTileError,world]);
  return null;
}

function ZoomReporter({onZoom}){
  const map=useMapEvents({zoomend:()=>onZoom(map.getZoom())});
  useEffect(()=>onZoom(map.getZoom()),[map,onZoom]);
  return null;
}

function MarkerDetails({marker}){
  if(marker.cluster)return <div className="min-w-48"><strong>{marker.name}</strong><p>{marker.resourceTypeCount} type(s), {marker.resourceCount.toLocaleString('fr-FR')} récoltes référencées.</p><p className="text-xs">Zoomez pour séparer les sous-zones.</p></div>;
  return <div className="min-w-48"><strong>{marker.name}</strong><p>Niveau {marker.level||'non renseigné'}</p>{marker.layer==='dungeons'&&<p>Donjon #{marker.dungeonId}</p>}{marker.layer==='resources'&&<><p>{marker.resourceCount.toLocaleString('fr-FR')} récoltes référencées dans cette sous-zone.</p><ul className="mt-1 max-h-40 overflow-y-auto">{marker.resources.slice(0,12).map(resource=><li key={`${resource.jobId}-${resource.id}`}><strong>{resource.name}</strong> · {resource.jobName} ({resource.count})</li>)}</ul>{marker.resources.length>12&&<p>+ {marker.resources.length-12} autres ressources</p>}</>}{marker.layer==='npcs'&&<ul>{marker.npcs.map(npc=><li key={npc.id}>{npc.name}</li>)}</ul>}</div>;
}

export default function DofusMap(){
  const [enabled,setEnabled]=useState({dungeons:true,resources:true,npcs:true});
  const [jobId,setJobId]=useState('');
  const [resourceId,setResourceId]=useState('');
  const [zoom,setZoom]=useState(0);
  const [tileErrors,setTileErrors]=useState(0);
  const {data,isLoading,isError,error,refetch}=useQuery({queryKey:['dofus-map-layers-v3'],staleTime:24*60*60*1000,retry:false,queryFn:async()=>{const {data:value}=await base44.functions.invoke('dofusApi',{action:'getMapLayers',lang:'fr'});if(value.error)throw new Error(value.error);return value;}});
  const selectedJob=useMemo(()=>data?.resourceJobs.find(job=>job.id===Number(jobId))||null,[data,jobId]);
  const rawMarkers=useMemo(()=>buildDofusMarkers(data?.areas,enabled,data?.world,{jobId,resourceId}),[data,enabled,jobId,resourceId]);
  const markers=useMemo(()=>clusterResourceMarkers(rawMarkers,zoom),[rawMarkers,zoom]);
  const onTileError=useMemo(()=>()=>setTileErrors(value=>value+1),[]);
  if(isLoading)return <p role="status" className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin"/>Chargement de la carte DofusDB…</p>;
  if(isError)return <div role="alert" className="rounded-xl border border-destructive/40 p-5"><p className="flex items-center gap-2"><AlertTriangle className="h-5 w-5"/>La géographie DofusDB est indisponible : {error?.message||'erreur inconnue'}.</p><button type="button" onClick={()=>refetch()} className="mt-3 rounded-lg bg-primary px-4 py-2 text-primary-foreground">Réessayer</button></div>;
  const worldBounds=getWorldBounds(data.world);
  const center=gamePositionToLeaflet({x:0,y:0},data.world);
  return <section className="space-y-4" aria-labelledby="dofus-map-title">
    <div><h2 id="dofus-map-title" className="flex items-center gap-2 text-xl font-bold"><MapPinned className="h-5 w-5"/>Carte du Monde des Douze</h2><p className="text-sm text-muted-foreground">Pyramide mondiale officielle DofusDB. Glissez ou pincez pour vous déplacer, utilisez la molette ou les contrôles pour zoomer.</p></div>
    <div className="flex flex-wrap gap-2">{Object.entries(LAYERS).map(([id,layer])=>{const Icon=layer.icon;const count=id==='resources'?data.coverage.resourceZones:id==='npcs'?data.coverage.positionedNpcs:data.coverage.dungeons;return <button type="button" key={id} aria-pressed={enabled[id]} onClick={()=>setEnabled(value=>({...value,[id]:!value[id]}))} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${enabled[id]?'bg-primary text-primary-foreground':'bg-card'}`}><Icon className="h-4 w-4"/>{layer.label} ({count})</button>;})}</div>
    <div className="grid gap-3 rounded-xl border bg-card p-3 sm:grid-cols-2">
      <label className="text-sm font-medium">Métier
        <select value={jobId} onChange={event=>{setJobId(event.target.value);setResourceId('');}} className="mt-1 w-full rounded-lg border bg-background px-3 py-2">
          <option value="">Tous les métiers ({data.resourceJobs.length})</option>
          {data.resourceJobs.map(job=><option key={job.id} value={job.id}>{job.name} · {job.zoneCount} zones · {job.count.toLocaleString('fr-FR')}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">Ressource
        <select value={resourceId} disabled={!selectedJob} onChange={event=>setResourceId(event.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 disabled:opacity-50">
          <option value="">Toutes les ressources{selectedJob?` (${selectedJob.resources.length})`:''}</option>
          {selectedJob?.resources.map(resource=><option key={resource.id} value={resource.id}>{resource.name} · niv. {resource.level} · {resource.zoneCount} zones</option>)}
        </select>
      </label>
    </div>
    <div className="overflow-hidden rounded-xl border">
      <MapContainer crs={L.CRS.Simple} center={center} zoom={0} minZoom={0} maxZoom={data.world.tileBanks.at(-1)?.zoom||0} maxBounds={worldBounds} maxBoundsViscosity={1} scrollWheelZoom dragging touchZoom doubleClickZoom keyboard zoomControl className="h-[34rem] w-full bg-[#111827]" aria-label="Carte interactive Dofus">
        <WorldTileLayer world={data.world} onTileError={onTileError}/>
        <ZoomReporter onZoom={setZoom}/>
        {markers.map(marker=><Marker key={`${marker.layer}-${marker.id}`} position={marker.position} icon={markerIcon(marker.layer,marker.cluster)} riseOnHover>
          <Tooltip direction="top" offset={[0,-14]}>{marker.name}{marker.layer==='resources'?` · ${marker.resourceCount.toLocaleString('fr-FR')}`:''}</Tooltip>
          <Popup><MarkerDetails marker={marker}/></Popup>
        </Marker>)}
      </MapContainer>
    </div>
    {tileErrors>0&&<p role="status" className="text-sm text-amber-600">Certaines tuiles mondiales ne sont pas disponibles ({tileErrors} échec(s)). Un placeholder cohérent est conservé et le déplacement reste actif.</p>}
    <div className="space-y-1 text-xs text-muted-foreground">
      <p>Fond : banques {data.world.tileBanks.map(bank=>bank.scale).join(', ')} de <code>/img/worlds/1/&#123;scale&#125;/&#123;index&#125;.jpg</code>, chargées à 6 requêtes simultanées maximum. La banque initiale contient {data.world.tileBanks[0].columns*data.world.tileBanks[0].rows} tuiles et seules celles du viewport sont demandées.</p>
      <p>Récolte : {data.coverage.resourceTypes} ressources, {data.coverage.resourceZones} sous-zones et {data.coverage.resourceInstances.toLocaleString('fr-FR')} instances référencées via <code>skills.item.resourcesBySubarea</code>. DofusDB ne publie pas leurs cellules exactes : les marqueurs représentent donc des sous-zones, pas de faux emplacements précis.</p>
      <p role="note">{data.coverage.unplacedNpcDefinitions.toLocaleString('fr-FR')} définitions de PNJ et {data.coverage.unplacedPointsOfInterest.toLocaleString('fr-FR')} POI ne sont pas positionnables : les endpoints publics ne donnent pas de coordonnées et les <code>subareas.npcsIds</code> live sont vides. Aucun marqueur n’est inventé.</p>
    </div>
  </section>;
}
