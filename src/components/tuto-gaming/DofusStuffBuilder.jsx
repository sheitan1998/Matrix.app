import React,{useMemo,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import {STUFF_SLOTS,totalStuffStats} from '@/components/tuto-gaming/dofusBuilderMath';
import DofusEquipmentSlot from '@/components/tuto-gaming/DofusEquipmentSlot';
import DofusEquipmentPicker from '@/components/tuto-gaming/DofusEquipmentPicker';
import DofusStuffStats from '@/components/tuto-gaming/DofusStuffStats';
import DofusPresetControls from '@/components/tuto-gaming/DofusPresetControls';
export default function DofusStuffBuilder(){
  const [equipment,setEquipment]=useState({});const [slot,setSlot]=useState(null);
  const ids=useMemo(()=>[...new Set(Object.values(equipment).filter(Boolean).map(i=>i.itemSetId).filter(id=>id>0))].sort((a,b)=>a-b),[equipment]);
  const {data,isFetching,isError}=useQuery({queryKey:['stuff-set-bonuses',ids.join(',')],enabled:ids.length>0,retry:false,staleTime:3600000,queryFn:async()=>{const {data}=await base44.functions.invoke('dofusApi',{action:'getSetBonuses',ids,lang:'fr'});return data;}});
  const totals=useMemo(()=>totalStuffStats(equipment,data?.sets||[]),[equipment,data]);
  return <section className="space-y-5"><div><h2 className="text-xl font-bold">Créateur de Stuff / Preset</h2><p className="text-sm text-muted-foreground mt-1">Choisissez les objets de chaque emplacement. Les statistiques se recalculent automatiquement.</p></div><div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-5 items-start"><div className="space-y-5"><div className="grid sm:grid-cols-2 gap-3">{STUFF_SLOTS.map(s=><DofusEquipmentSlot key={s.id} slot={s} item={equipment[s.id]} onChoose={()=>setSlot(s)} onRemove={()=>setEquipment(prev=>({...prev,[s.id]:null}))}/>)}</div><DofusPresetControls equipment={equipment} onLoad={setEquipment} totals={totals}/></div><DofusStuffStats totals={totals} loadingBonuses={isFetching} errorBonuses={isError}/></div>{slot&&<DofusEquipmentPicker slot={slot} equipment={equipment} onClose={()=>setSlot(null)} onSelect={item=>{setEquipment(prev=>({...prev,[slot.id]:item}));setSlot(null);}}/>}</section>;
}