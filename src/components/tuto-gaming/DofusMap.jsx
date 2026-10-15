import React,{useMemo,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import L from 'leaflet';
import {ImageOverlay,MapContainer,Marker,Popup,Tooltip,useMapEvents} from 'react-leaflet';
import {AlertTriangle,Castle,Loader2,MapPinned,Sprout,Users} from 'lucide-react';
import {base44} from '@/api/base44Client';
import {buildDofusMarkers,MAP_BOUNDS,visibleDofusTiles} from '@/components/tuto-gaming/dofusMapData';

const LAYERS={
  dungeons:{label:'Donjons',icon:Castle,color:'#f97316',symbol:'D'},
  resources:{label:'Zones de récolte',icon:Sprout,color:'#22c55e',symbol:'R'},
  npcs:{label:'PNJ / points d’intérêt',icon:Users,color:'#38bdf8',symbol:'P'},
};

/** @returns {import('leaflet').LatLngTuple} */
function toLeafletPosition(position){
  return [-position.y-.5,position.x+.5];
}

function markerIcon(layer){
  const definition=LAYERS[layer];
  return L.divIcon({
    className:'dofus-map-marker',
    html:`<span style="--marker-color:${definition.color}" aria-hidden="true">${definition.symbol}</span>`,
    iconSize:[30,30],
    iconAnchor:[15,15],
    popupAnchor:[0,-16],
  });
}

function MapTiles({areas,onTileError}){
  const map=useMapEvents({moveend:update,zoomend:update});
  const [bounds,setBounds]=useState(()=>{
    const value=map.getBounds();
    return {west:value.getWest(),east:value.getEast(),south:-value.getNorth(),north:-value.getSouth()};
  });
  function update(){
    const value=map.getBounds();
    setBounds({west:value.getWest(),east:value.getEast(),south:-value.getNorth(),north:-value.getSouth()});
  }
  return visibleDofusTiles(areas,bounds).map(tile=><ImageOverlay key={tile.id} url={tile.img} crossOrigin bounds={[[-tile.y-1,tile.x],[-tile.y,tile.x+1]]} opacity={1} eventHandlers={{error:onTileError}}/>);
}

export default function DofusMap(){
  const [enabled,setEnabled]=useState({dungeons:true,resources:true,npcs:true});
  const [tileErrors,setTileErrors]=useState(0);
  const {data,isLoading,isError,refetch}=useQuery({queryKey:['dofus-map-layers-v2'],staleTime:24*60*60*1000,retry:false,queryFn:async()=>{const {data:value}=await base44.functions.invoke('dofusApi',{action:'getMapLayers',lang:'fr'});if(value.error)throw new Error(value.error);return value;}});
  const markers=useMemo(()=>buildDofusMarkers(data?.areas,enabled),[data,enabled]);
  if(isLoading)return <p role="status" className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin"/>Chargement de la carte DofusDB…</p>;
  if(isError)return <div role="alert" className="rounded-xl border border-destructive/40 p-5"><p className="flex items-center gap-2"><AlertTriangle className="h-5 w-5"/>La géographie DofusDB est indisponible.</p><button type="button" onClick={()=>refetch()} className="mt-3 rounded-lg bg-primary px-4 py-2 text-primary-foreground">Réessayer</button></div>;
  return <section className="space-y-4" aria-labelledby="dofus-map-title">
    <div><h2 id="dofus-map-title" className="flex items-center gap-2 text-xl font-bold"><MapPinned className="h-5 w-5"/>Carte du Monde des Douze</h2><p className="text-sm text-muted-foreground">Carte Leaflet composée des images de maps DofusDB à leurs coordonnées réelles. Glissez ou pincez pour vous déplacer, utilisez la molette ou les contrôles pour zoomer.</p></div>
    <div className="flex flex-wrap gap-2">{Object.entries(LAYERS).map(([id,layer])=>{const Icon=layer.icon;return <button type="button" key={id} aria-pressed={enabled[id]} onClick={()=>setEnabled(value=>({...value,[id]:!value[id]}))} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${enabled[id]?'bg-primary text-primary-foreground':'bg-card'}`}><Icon className="h-4 w-4"/>{layer.label} ({data.coverage[id==='resources'?'harvestableZones':id==='npcs'?'npcZones':'dungeons']})</button>;})}</div>
    <div className="overflow-hidden rounded-xl border">
      <MapContainer crs={L.CRS.Simple} center={[5,0]} zoom={6} minZoom={3} maxZoom={8} maxBounds={MAP_BOUNDS} maxBoundsViscosity={1} scrollWheelZoom dragging touchZoom doubleClickZoom keyboard zoomControl className="h-[34rem] w-full bg-[#111827]" aria-label="Carte interactive Dofus">
        <MapTiles areas={data.areas} onTileError={()=>setTileErrors(value=>value+1)}/>
        {markers.map(marker=><Marker key={`${marker.layer}-${marker.id}`} position={toLeafletPosition(marker.position)} icon={markerIcon(marker.layer)} riseOnHover>
          <Tooltip direction="top" offset={[0,-12]}>{marker.name} [{marker.position.x},{marker.position.y}]</Tooltip>
          <Popup><div className="min-w-48"><strong>{marker.name}</strong><p className="mt-1">Position [{marker.position.x}, {marker.position.y}]</p><p>Niveau {marker.level||'non renseigné'}</p>{marker.layer==='dungeons'&&<p>Donjon #{marker.dungeonId}</p>}{marker.layer==='resources'&&<p>{marker.harvestableCount} ressource(s) référencée(s)</p>}{marker.layer==='npcs'&&<p>{marker.npcCount} PNJ / point(s) d’intérêt</p>}</div></Popup>
        </Marker>)}
      </MapContainer>
    </div>
    {tileErrors>0&&<p role="status" className="text-sm text-amber-600">Certaines images de maps ne sont pas disponibles ({tileErrors} échec(s)); les marqueurs et le déplacement restent actifs.</p>}
    <p className="text-xs text-muted-foreground">Couverture : une map DofusDB représentative par sous-zone ({data.areas.filter(area=>area.tile?.img).length}/{data.total}), chargée uniquement lorsqu’elle entre dans le viewport. DofusDB ne publie pas de fond mondial assemblé ni le nom détaillé de chaque récoltable/PNJ ; aucune entrée n’est inventée.</p>
  </section>;
}
