import React,{useEffect,useMemo,useRef,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {AlertTriangle,Loader2} from 'lucide-react';
import {base44} from '@/api/base44Client';
import {canEquipItem,normalizeCharacteristics,normalizeEquipment,STUFF_SLOTS,totalStuffStats} from '@/components/tuto-gaming/dofusBuilderMath';
import DofusAvatarPreview from '@/components/tuto-gaming/DofusAvatarPreview';
import DofusEquipmentSlot from '@/components/tuto-gaming/DofusEquipmentSlot';
import DofusEquipmentPicker from '@/components/tuto-gaming/DofusEquipmentPicker';
import DofusStuffStats,{DofusPrimaryStats} from '@/components/tuto-gaming/DofusStuffStats';
import DofusPresetControls from '@/components/tuto-gaming/DofusPresetControls';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';
import {captureDofusStuff,downloadDofusStuff} from '@/components/tuto-gaming/dofusImageExport';

const POSITIONS=['col-start-1 row-start-1','col-start-2 row-start-1','col-start-3 row-start-1','col-start-4 row-start-1','col-start-5 row-start-1','col-start-1 row-start-2','col-start-5 row-start-2','col-start-1 row-start-3','col-start-5 row-start-3','col-start-1 row-start-4','col-start-5 row-start-4','col-start-1 row-start-5','col-start-2 row-start-5','col-start-3 row-start-5','col-start-4 row-start-5','col-start-5 row-start-5'];

function readJson(key,fallback){
  try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}
}

function ExportCard({innerRef,equipment,totals,breed,variant}){
  const primary=[['pdv','PdV'],['pa','PA'],['pm','PM'],['range','PO'],['critical','Critique'],['initiative','Initiative']];
  return <div className="fixed -left-[10000px] top-0 z-[-1] w-[1100px] bg-zinc-950 p-8 text-zinc-50" ref={innerRef} aria-hidden="true"><header className="mb-6 flex items-center justify-between border-b border-violet-500/40 pb-4"><div><p className="text-4xl font-black tracking-[.25em] text-violet-400">MATRIX</p><p className="mt-1 text-sm text-zinc-400">Fiche de stuff Dofus</p></div><p className="text-xl font-bold">{breed?.name||'Aventurier'}</p></header><div className="grid grid-cols-[290px_1fr] gap-6"><div className="rounded-2xl border border-zinc-700 bg-zinc-900"><DofusAvatarPreview breed={breed} variant={variant} equipment={equipment} onImageError={()=>{}}/></div><div><div className="grid grid-cols-4 gap-3">{STUFF_SLOTS.map(slot=><div key={slot.id} className="rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-center">{equipment[slot.id]?<CatalogueImage src={equipment[slot.id].img} alt="" className="mx-auto h-16 w-16 rounded-lg"/>:<div className="mx-auto h-16 w-16 rounded-lg bg-zinc-800"/>}<p className="mt-1 truncate text-xs text-zinc-400">{slot.name}</p><p className="truncate text-xs font-bold">{equipment[slot.id]?.name||'Vide'}</p></div>)}</div></div></div><section className="mt-6"><h2 className="mb-3 text-lg font-bold text-violet-300">Statistiques calculées</h2><div className="grid grid-cols-6 gap-3">{primary.map(([key,label])=><div key={key} className="rounded-lg bg-zinc-900 p-3"><p className="text-xs text-zinc-400">{label}</p><p className="text-xl font-black">{totals[key]}</p></div>)}</div><div className="mt-3 grid grid-cols-5 gap-3">{['strength','intelligence','chance','agility','wisdom'].map(key=><div key={key} className="rounded-lg border border-zinc-800 p-2 text-center"><p className="text-xs capitalize text-zinc-400">{key}</p><p className="font-bold">{totals[key]}</p></div>)}</div></section><footer className="mt-6 text-right text-xs text-zinc-500">Jets maximaux et bonus disponibles · Généré par MATRIX</footer></div>;
}

export default function DofusStuffBuilder(){
  const [equipment,setEquipment]=useState(()=>normalizeEquipment(readJson('matrix:dofus:active-stuff:v2',{})));
  const [characteristics,setCharacteristics]=useState(()=>normalizeCharacteristics(readJson('matrix:dofus:characteristics:v1',{})));
  const [avatar,setAvatar]=useState(()=>readJson('matrix:dofus:avatar:v1',{breedId:null,variant:'male'}));
  const [slot,setSlot]=useState(null);
  const [message,setMessage]=useState('');
  const [exporting,setExporting]=useState(false);
  const exportRef=useRef(null);
  useEffect(()=>{try{localStorage.setItem('matrix:dofus:active-stuff:v2',JSON.stringify(equipment));}catch{setMessage('La sauvegarde automatique locale est indisponible.');}},[equipment]);
  useEffect(()=>{try{localStorage.setItem('matrix:dofus:characteristics:v1',JSON.stringify(characteristics));}catch{setMessage('La sauvegarde automatique locale est indisponible.');}},[characteristics]);
  useEffect(()=>{try{localStorage.setItem('matrix:dofus:avatar:v1',JSON.stringify(avatar));}catch{setMessage('La sauvegarde de l’avatar est indisponible.');}},[avatar]);
  const ids=useMemo(()=>[...new Set(Object.values(equipment).filter(Boolean).map(item=>item.itemSetId).filter(id=>id>0))].sort((a,b)=>a-b),[equipment]);
  const bonusesQuery=useQuery({queryKey:['stuff-set-bonuses',ids.join(',')],enabled:ids.length>0,retry:false,staleTime:3600000,queryFn:async()=>{const {data}=await base44.functions.invoke('dofusApi',{action:'getSetBonuses',ids,lang:'fr'});return data;}});
  const classesQuery=useQuery({queryKey:['dofus-classes'],staleTime:24*60*60*1000,retry:false,queryFn:async()=>{const {data}=await base44.functions.invoke('dofusApi',{action:'getBreeds',lang:'fr'});if(data.error)throw new Error(data.error);return data;}});
  const breed=classesQuery.data?.breeds.find(value=>value.id===avatar.breedId)||classesQuery.data?.breeds[0]||null;
  useEffect(()=>{if(breed&&!avatar.breedId)setAvatar({breedId:breed.id,variant:breed.variants?.[0]?.id||'male'});},[breed,avatar.breedId]);
  const totals=useMemo(()=>totalStuffStats(equipment,bonusesQuery.data?.sets||[],characteristics),[equipment,bonusesQuery.data,characteristics]);
  function updateCharacteristic(key,kind,value){setCharacteristics(previous=>normalizeCharacteristics({...previous,[key]:{...previous[key],[kind]:value}}));}
  async function exportImage(name){
    if(!exportRef.current||exporting)return 'Une exportation est déjà en cours.';
    setExporting(true);
    try{await document.fonts?.ready;const {default:html2canvas}=await import('html2canvas');const blob=await captureDofusStuff(exportRef.current,html2canvas);downloadDofusStuff(blob,name);return 'Fiche PNG téléchargée en haute résolution.';}catch(error){return `Export impossible : ${error instanceof Error?error.message:'erreur de rendu ou CORS'}`;}finally{setExporting(false);}
  }
  return <section className="space-y-5"><div><h2 className="text-xl font-bold">Créateur de Stuff / Preset</h2><p className="mt-1 text-sm text-muted-foreground">16 emplacements, avatar de classe, aperçu d’équipement et statistiques recalculées en temps réel.</p>{message&&<p role="alert" className="mt-2 text-xs text-destructive">{message}</p>}</div>
    <div className="grid items-start gap-5 xl:grid-cols-[19rem_minmax(38rem,1fr)_20rem]"><DofusPrimaryStats totals={totals} characteristics={characteristics} onCharacteristicsChange={updateCharacteristic}/><div className="min-w-0 space-y-5">
      <div className="rounded-xl border bg-gradient-to-b from-muted/20 to-muted/60 p-3"><div className="mb-3 flex flex-wrap items-end gap-3"><label className="text-sm font-semibold">Classe<select value={breed?.id||''} disabled={classesQuery.isLoading||classesQuery.isError} onChange={event=>{const next=classesQuery.data.breeds.find(value=>value.id===Number(event.target.value));setAvatar({breedId:next.id,variant:next.variants?.[0]?.id||'male'});}} className="mt-1 block rounded-lg border bg-background px-3 py-2 font-normal">{classesQuery.data?.breeds.map(value=><option key={value.id} value={value.id}>{value.name}</option>)}</select></label>{breed?.variants?.length>0&&<div role="group" aria-label="Variante d’avatar" className="flex gap-2">{breed.variants.map(value=><button type="button" key={value.id} aria-pressed={avatar.variant===value.id} onClick={()=>setAvatar(current=>({...current,variant:value.id}))} className={`rounded-lg border px-3 py-2 text-sm ${avatar.variant===value.id?'bg-primary text-primary-foreground':'bg-background'}`}>{value.name}</button>)}</div>}{classesQuery.isLoading&&<span className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Classes…</span>}{classesQuery.isError&&<span role="alert" className="flex items-center gap-2 text-xs text-destructive"><AlertTriangle className="h-4 w-4"/>Avatars indisponibles</span>}</div>
        <div className="overflow-x-auto"><div aria-label="Avatar et 16 emplacements d’équipement" className="mx-auto grid min-w-[600px] max-w-3xl grid-cols-5 grid-rows-5 gap-2">{STUFF_SLOTS.map((value,index)=><div key={value.id} className={POSITIONS[index]}><DofusEquipmentSlot compact slot={value} item={equipment[value.id]} onChoose={()=>setSlot(value)} onRemove={()=>setEquipment(previous=>{const next={...previous};delete next[value.id];return next;})}/></div>)}<div className="col-start-2 col-end-5 row-start-2 row-end-5 rounded-[3rem] border-2 border-primary/20 bg-background/50"><DofusAvatarPreview breed={breed} variant={avatar.variant} equipment={equipment} onImageError={()=>setMessage('Le visuel de cet avatar n’a pas pu être chargé ; le fallback reste exportable.')}/></div></div></div></div>
      <DofusPresetControls equipment={equipment} avatar={avatar} exporting={exporting} onExportImage={exportImage} onLoad={preset=>{setEquipment(normalizeEquipment(preset.equipment));if(preset.avatar)setAvatar(preset.avatar);}}/>
    </div><DofusStuffStats totals={totals} loadingBonuses={bonusesQuery.isFetching} errorBonuses={bonusesQuery.isError}/></div>
    <ExportCard innerRef={exportRef} equipment={equipment} totals={totals} breed={breed} variant={avatar.variant}/>
    {slot&&<DofusEquipmentPicker slot={slot} equipment={equipment} onClose={()=>setSlot(null)} onSelect={item=>{if(!canEquipItem(slot,item)){setMessage(`L’objet ${item.name} n’est pas compatible avec l’emplacement ${slot.name}.`);return;}const next=normalizeEquipment({...equipment,[slot.id]:item});if(next[slot.id]?.id!==item.id){setMessage(`L’objet ${item.name} est déjà équipé ou ne respecte pas les règles de doublon.`);return;}setEquipment(next);setMessage('');setSlot(null);}}/>}
  </section>;
}
