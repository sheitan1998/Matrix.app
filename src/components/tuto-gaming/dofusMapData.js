/** @returns {import('leaflet').LatLngBoundsExpression} */
export function getWorldBounds(world) {
  const width=world.totalWidth*world.minScale;
  const height=world.totalHeight*world.minScale;
  return [[-height,0],[0,width]];
}

/** @returns {import('leaflet').LatLngTuple|null} */
export function gamePositionToLeaflet(position,world) {
  if(!position||!world)return null;
  const x=(world.originX+Number(position.x)*world.mapWidth)*world.minScale;
  const y=(world.originY+Number(position.y)*world.mapHeight)*world.minScale;
  if(!Number.isFinite(x)||!Number.isFinite(y))return null;
  return [-y,x];
}

export function worldTileIndex(bank,x,y) {
  if(!bank||x<0||y<0||x>=bank.columns||y>=bank.rows)return null;
  return y*bank.columns+x+1;
}

export function worldTileUrl(world,bank,x,y) {
  const index=worldTileIndex(bank,x,y);
  return index===null?null:`${world.tileUrlBase}/${bank.scale}/${index}.jpg`;
}

export function enumerateWorldTiles(world,zoom=0) {
  const bank=world?.tileBanks?.find(value=>value.zoom===zoom);
  if(!bank)return[];
  return Array.from({length:bank.rows},(_,y)=>Array.from({length:bank.columns},(_,x)=>({
    x,y,index:worldTileIndex(bank,x,y),url:worldTileUrl(world,bank,x,y),
  }))).flat();
}

function filteredResources(area,jobId,resourceId) {
  return (area.resources||[]).filter(resource=>
    (!jobId||Number(resource.jobId)===Number(jobId))
    &&(!resourceId||Number(resource.id)===Number(resourceId)));
}

export function buildDofusMarkers(areas,enabled,world,filters={}) {
  return (areas||[]).flatMap(area=>{
    const center=gamePositionToLeaflet(area.center,world);
    if(!center)return[];
    const resources=filteredResources(area,filters.jobId,filters.resourceId);
    return [
      enabled.dungeons&&area.dungeonId!==null&&{
        ...area,
        layer:'dungeons',
        position:gamePositionToLeaflet(area.dungeonPosition||area.center,world)||center,
      },
      enabled.resources&&resources.length>0&&{
        ...area,
        resources,
        resourceCount:resources.reduce((sum,resource)=>sum+resource.count,0),
        layer:'resources',
        position:center,
      },
      enabled.npcs&&area.npcCount>0&&{...area,layer:'npcs',position:center},
    ].filter(Boolean);
  });
}

export function clusterResourceMarkers(markers,zoom=0) {
  const passthrough=markers.filter(marker=>marker.layer!=='resources');
  const resources=markers.filter(marker=>marker.layer==='resources');
  const cellSize=[240,120,60][zoom]||60;
  const buckets=new Map();
  for(const marker of resources){
    const key=`${Math.floor(marker.position[0]/cellSize)}:${Math.floor(marker.position[1]/cellSize)}`;
    if(!buckets.has(key))buckets.set(key,[]);
    buckets.get(key).push(marker);
  }
  const clustered=[...buckets.values()].map(group=>{
    if(group.length===1)return group[0];
    const resourceIds=new Set(group.flatMap(marker=>marker.resources.map(resource=>resource.id)));
    return {
      id:`resource-cluster-${group.map(marker=>marker.id).join('-')}`,
      name:`${group.length} sous-zones`,
      layer:'resources',
      cluster:true,
      areas:group,
      resourceCount:group.reduce((sum,marker)=>sum+marker.resourceCount,0),
      resourceTypeCount:resourceIds.size,
      position:[
        group.reduce((sum,marker)=>sum+marker.position[0],0)/group.length,
        group.reduce((sum,marker)=>sum+marker.position[1],0)/group.length,
      ],
    };
  });
  return [...passthrough,...clustered];
}
