import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildDofusMarkers,visibleDofusTiles} from '../src/components/tuto-gaming/dofusMapData.js';

test('full-body artwork component crops official sprite by selected gender',async()=>{
  const source=await readFile(new URL('../src/components/tuto-gaming/DofusClassArtwork.jsx',import.meta.url),'utf8');
  assert.match(source,/data-full-body-artwork/);
  assert.match(source,/selected\.crop==='right'/);
  assert.match(source,/naturalWidth<300/);
  assert.doesNotMatch(source,/crossOrigin/);
  assert.doesNotMatch(source,/rounded-full|OVERLAYS|equipment\[/);
  const builder=await readFile(new URL('../src/components/tuto-gaming/DofusStuffBuilder.jsx',import.meta.url),'utf8');
  assert.match(builder,/setAvatar\(\{breedId:next\.id,variant:next\.variants\?\.\[0\]\?\.id/);
  assert.match(builder,/variant=\{avatar\.variant\}/);
  assert.match(builder,/getBreedArtwork/);
  assert.match(builder,/artworkDataUrl/);
});

test('Leaflet map enables native pan, zoom, image overlays and category filters',async()=>{
  const source=await readFile(new URL('../src/components/tuto-gaming/DofusMap.jsx',import.meta.url),'utf8');
  assert.match(source,/MapContainer/);
  assert.match(source,/CRS\.Simple/);
  assert.match(source,/scrollWheelZoom dragging touchZoom doubleClickZoom keyboard zoomControl/);
  assert.match(source,/ImageOverlay/);
  assert.match(source,/Popup/);
  assert.match(source,/setEnabled/);
});

test('map helpers position layers and load only visible real tiles',()=>{
  const areas=[{id:1,name:'Zone',center:{x:2,y:3},dungeonPosition:{x:4,y:5},dungeonId:9,harvestableCount:2,npcCount:1,tile:{id:42,x:2,y:3,img:'https://api.dofusdb.fr/img/maps/0.25/42.jpg'}}];
  const markers=buildDofusMarkers(areas,{dungeons:true,resources:true,npcs:false});
  assert.deepEqual(markers.map(value=>[value.layer,value.position]),[['dungeons',{x:4,y:5}],['resources',{x:2,y:3}]]);
  assert.equal(visibleDofusTiles(areas,{west:0,east:4,south:0,north:4}).length,1);
  assert.equal(visibleDofusTiles(areas,{west:20,east:24,south:20,north:24}).length,0);
});
