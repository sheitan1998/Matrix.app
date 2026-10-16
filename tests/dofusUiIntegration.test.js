import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildDofusMarkers,clusterResourceMarkers,enumerateWorldTiles,gamePositionToLeaflet,worldTileIndex} from '../src/components/tuto-gaming/dofusMapData.js';

test('full-body artwork component crops official sprite by selected gender',async()=>{
  const source=await readFile(new URL('../src/components/tuto-gaming/DofusClassArtwork.jsx',import.meta.url),'utf8');
  assert.match(source,/data-full-body-artwork/);
  assert.match(source,/selected\.crop==='right'/);
  assert.match(source,/naturalWidth<300/);
  assert.doesNotMatch(source,/crossOrigin/);
  assert.doesNotMatch(source,/rounded-full|OVERLAYS|equipment\[/);
  const builder=await readFile(new URL('../src/components/tuto-gaming/DofusStuffBuilder.jsx',import.meta.url),'utf8');
  const classes=await readFile(new URL('../src/components/tuto-gaming/DofusClasses.jsx',import.meta.url),'utf8');
  assert.match(builder,/setAvatar\(\{breedId:next\.id,variant:next\.variants\?\.\[0\]\?\.id/);
  assert.match(builder,/variant=\{avatar\.variant\}/);
  assert.match(builder,/getBreedArtwork/);
  assert.match(builder,/artworkDataUrl/);
  assert.match(classes,/variant="male"/);
  assert.match(classes,/variant=\{variant\}/);
  assert.doesNotMatch(builder,/crop:\s*['"](?:left|right)['"]/);
  assert.doesNotMatch(classes,/crop:\s*['"](?:left|right)['"]/);
});

test('Leaflet map enables pan, zoom, official world tiles and layered resource filters',async()=>{
  const source=await readFile(new URL('../src/components/tuto-gaming/DofusMap.jsx',import.meta.url),'utf8');
  assert.match(source,/MapContainer/);
  assert.match(source,/CRS\.Simple/);
  assert.match(source,/scrollWheelZoom dragging touchZoom doubleClickZoom keyboard zoomControl/);
  assert.match(source,/GridLayer/);
  assert.match(source,/active<6/);
  assert.match(source,/WorldTileLayer/);
  assert.match(source,/Popup/);
  assert.match(source,/setEnabled/);
  assert.match(source,/setJobId/);
  assert.match(source,/setResourceId/);
  assert.match(source,/MARKER_SVGS/);
  assert.doesNotMatch(source,/symbol:'D'|>D</);
});

test('world tile helpers fill the initial bank without index gaps',()=>{
  const world={tileUrlBase:'https://api.dofusdb.fr/img/worlds/1',tileBanks:[{zoom:0,scale:0.2,columns:8,rows:7}]};
  const tiles=enumerateWorldTiles(world,0);
  assert.equal(tiles.length,56);
  assert.equal(new Set(tiles.map(tile=>tile.index)).size,56);
  assert.equal(tiles[0].url,'https://api.dofusdb.fr/img/worlds/1/0.2/1.jpg');
  assert.equal(tiles.at(-1).url,'https://api.dofusdb.fr/img/worlds/1/0.2/56.jpg');
  assert.equal(worldTileIndex(world.tileBanks[0],8,0),null);
});

test('map helpers transform coordinates, filter resources, cluster density and retain positioned NPC fixtures',()=>{
  const world={originX:0,originY:0,mapWidth:1,mapHeight:1,totalWidth:1000,totalHeight:1000,minScale:0.2};
  const resources=[
    {id:303,name:'Bois de Frêne',jobId:2,jobName:'Bûcheron',count:28},
    {id:312,name:'Fer',jobId:24,jobName:'Mineur',count:8},
  ];
  const areas=[{id:1,name:'Zone',center:{x:2,y:3},dungeonPosition:{x:4,y:5},dungeonId:9,resources,resourceCount:36,harvestableCount:2,npcs:[{id:7,name:'Kerubim'}],npcCount:1}];
  const markers=buildDofusMarkers(areas,{dungeons:true,resources:true,npcs:true},world,{jobId:2});
  assert.deepEqual(gamePositionToLeaflet({x:4,y:5},world),[-1,0.8]);
  assert.deepEqual(markers.map(value=>value.layer),['dungeons','resources','npcs']);
  assert.deepEqual(markers.find(value=>value.layer==='resources').resources.map(value=>value.id),[303]);
  assert.equal(markers.find(value=>value.layer==='resources').resourceCount,28);
  assert.equal(markers.find(value=>value.layer==='npcs').npcs[0].name,'Kerubim');
  assert.equal(clusterResourceMarkers(markers,0).length,3);
});

test('Dofus navigation exposes keyboard tabs for achievements and quests',async()=>{
  const source=await readFile(new URL('../src/pages/tuto-gaming/Dofus.jsx',import.meta.url),'utf8');
  assert.match(source,/\['map','Carte'\],\['achievements','Succès'\],\['quests','Quêtes'\]/);
  assert.match(source,/role="tablist"/);
  assert.match(source,/ArrowLeft','ArrowRight','Home','End/);
  assert.match(source,/DofusAchievements/);
  assert.match(source,/DofusQuests/);
});

test('progression catalogues paginate and expose loading, error and empty states',async()=>{
  const achievements=await readFile(new URL('../src/components/tuto-gaming/DofusAchievements.jsx',import.meta.url),'utf8');
  const quests=await readFile(new URL('../src/components/tuto-gaming/DofusQuests.jsx',import.meta.url),'utf8');
  assert.match(achievements,/const PAGE_SIZE=24/);
  assert.match(achievements,/query\.isFetching/);
  assert.match(achievements,/query\.isError/);
  assert.match(achievements,/Aucun succès/);
  assert.match(quests,/const PAGE_SIZE=24/);
  assert.match(quests,/DofusPrerequisiteTree/);
  assert.match(quests,/DofusXpCalculator/);
  assert.match(quests,/aucun champ de série distinct/);
});
