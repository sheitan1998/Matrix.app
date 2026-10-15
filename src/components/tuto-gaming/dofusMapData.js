/** @type {import('leaflet').LatLngBoundsExpression} */
export const MAP_BOUNDS=[[-60,-90],[70,90]];

export function buildDofusMarkers(areas,enabled) {
  return (areas||[]).flatMap(area=>[
    enabled.dungeons&&area.dungeonId!==null&&{...area,layer:'dungeons',position:area.dungeonPosition||area.center},
    enabled.resources&&area.harvestableCount>0&&{...area,layer:'resources',position:area.center},
    enabled.npcs&&area.npcCount>0&&{...area,layer:'npcs',position:area.center},
  ].filter(Boolean));
}

export function visibleDofusTiles(areas,bounds) {
  if(!bounds)return[];
  const seen=new Set();
  return (areas||[]).map(area=>area.tile).filter(tile=>{
    if(!tile?.img||seen.has(`${tile.x}:${tile.y}`))return false;
    const visible=tile.x>=bounds.west-1&&tile.x<=bounds.east+1&&tile.y>=bounds.south-1&&tile.y<=bounds.north+1;
    if(visible)seen.add(`${tile.x}:${tile.y}`);
    return visible;
  });
}
