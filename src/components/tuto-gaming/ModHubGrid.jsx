import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2,RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModHubDetailModal from '@/components/tuto-gaming/ModHubDetailModal';
import ModHubCard from '@/components/tuto-gaming/ModHubCard';
import { FARMING_FALLBACK } from '@/components/tuto-gaming/farmingFallback';
export default function ModHubGrid() {
  const [selectedMod,setSelectedMod]=useState(null);
  const {data,isFetching,isFetchingNextPage,hasNextPage,fetchNextPage,refetch,isError}=useInfiniteQuery({queryKey:['farming-modhub'],initialPageParam:1,initialData:{pages:[{items:FARMING_FALLBACK,page:1,has_more:false,source:'reference'}],pageParams:[1]},staleTime:0,retry:false,getNextPageParam:page=>page.has_more?page.page+1:undefined,queryFn:async({pageParam})=>{const {data}=await base44.functions.invoke('farmingModApi',{action:'getMods',page:pageParam,limit:24,filter:'latest'});if(data.error||!data.items?.length)throw new Error('ModHub indisponible');return data;}});
  const mods=data.pages.flatMap(p=>p.items);
  return <section className="mb-8 rounded-xl bg-background p-4 text-foreground" id="modhub">
    <div className="flex items-center justify-between gap-3 mb-4"><div><h2 className="text-xl font-bold">ModHub & Téléchargements</h2><p className="text-xs text-muted-foreground">Mods du ModHub GIANTS Software pour Farming Simulator 25</p></div><button onClick={()=>refetch()} disabled={isFetching} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"><RefreshCw className="w-4 h-4"/>Actualiser</button></div>
    {(data.pages[0].source==='reference'||isError)&&<p role="status" className="text-xs text-muted-foreground mb-4">Catalogue de référence sauvegardé. Les derniers mods seront affichés dès que le ModHub répondra.</p>}
    {isFetching&&<p className="flex items-center gap-2 text-xs text-muted-foreground mb-4"><Loader2 className="w-4 h-4 animate-spin"/>Actualisation du catalogue...</p>}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">{mods.map(mod=><ModHubCard key={mod.id} mod={mod} onSelect={setSelectedMod}/>)}</div>
    {hasNextPage&&<div className="flex justify-center mt-6"><button onClick={()=>fetchNextPage()} disabled={isFetching} className="bg-secondary text-secondary-foreground rounded-lg px-5 py-2 disabled:opacity-50">{isFetchingNextPage?'Chargement...':'Charger plus de mods'}</button></div>}
    {selectedMod&&<ModHubDetailModal modId={selectedMod.id} initialMod={selectedMod} onClose={()=>setSelectedMod(null)}/>}
  </section>;
}