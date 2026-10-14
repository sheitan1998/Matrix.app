import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog,DialogContent,DialogTitle,DialogDescription } from '@/components/ui/dialog';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';
import DownloadModButton from '@/components/tuto-gaming/DownloadModButton';
import ModHubSpecs from '@/components/tuto-gaming/ModHubSpecs';
import { FARMING_FALLBACK } from '@/components/tuto-gaming/farmingFallback';
export default function ModHubDetailModal({modId,initialMod,onClose}) {
  const {data:mod,isFetching,isError}=useQuery({queryKey:['farming-mod-detail',modId],initialData:initialMod||FARMING_FALLBACK.find(m=>m.id===String(modId)),staleTime:0,retry:false,queryFn:async()=>{const {data}=await base44.functions.invoke('farmingModApi',{action:'getModDetails',modId});if(data.error)throw new Error(data.error);return data;}});
  return <Dialog open onOpenChange={open=>!open&&onClose()}><DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
    <DialogTitle>{mod?.title||'Détails du mod'}</DialogTitle><DialogDescription>{mod?`Par ${mod.author||'Auteur non renseigné'} · ${mod.category||'Mod Farming Simulator 25'}`:'Chargement des détails du ModHub.'}</DialogDescription>
    {isFetching&&<p className="flex gap-2 items-center text-xs text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin"/>Actualisation des détails...</p>}
    {isError&&<p role="alert" className="text-xs text-destructive">Détails du ModHub indisponibles. Les informations sauvegardées restent affichées.</p>}
    {mod&&<><CatalogueImage src={mod.hdImg||mod.img} alt={mod.title} kind="farming" className="w-full aspect-video rounded-xl"/><section><h3 className="font-semibold mb-2">Description</h3><p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{mod.description||(isFetching?'Chargement de la description...':'Description non renseignée.')}</p></section><ModHubSpecs mod={mod}/><DownloadModButton mod={mod}/></>}
  </DialogContent></Dialog>;
}