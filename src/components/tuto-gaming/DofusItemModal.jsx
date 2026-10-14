import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog,DialogContent,DialogTitle,DialogDescription } from '@/components/ui/dialog';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';
import { formatDofusEffect } from '@/components/tuto-gaming/dofusEffects';
export default function DofusItemModal({item,onClose,category}) {
  const isItem=!['monsters','sets'].includes(category);
  const {data:details,isFetching,isError}=useQuery({queryKey:['dofus-details',item.id],enabled:isItem&&item.source!=='reference',initialData:item,staleTime:0,retry:false,queryFn:async()=>{const {data}=await base44.functions.invoke('dofusApi',{action:'getItemDetails',id:item.id,lang:'fr'});if(data.error)throw new Error(data.error);return data;}});
  return <Dialog open onOpenChange={open=>!open&&onClose()}><DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
    <div className="flex items-center gap-4 pr-8"><CatalogueImage src={details.img||item.img} alt={item.name} kind={item.category} className="w-24 h-24 rounded-xl shrink-0"/><div><DialogTitle>{item.name}</DialogTitle><DialogDescription>{details.type||item.type} · Niveau {item.level||0}</DialogDescription></div></div>
    <p className="text-sm text-muted-foreground whitespace-pre-line">{details.description||item.description}</p>
    {isFetching&&<p className="flex gap-2 text-xs text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin"/>Actualisation des détails...</p>}
    {(isError||details.source==='reference')&&<p role="status" className="text-xs text-muted-foreground">Données de référence sauvegardées ; le service est temporairement indisponible.</p>}
    <section><h3 className="font-semibold mb-2">Statistiques et effets</h3>{details.effects?.length?details.effects.map((e,i)=><p key={i} className="text-sm text-primary">{formatDofusEffect(e)}</p>):<p className="text-sm text-muted-foreground">Aucun effet renseigné.</p>}</section>
    {isItem&&<section><h3 className="font-semibold mb-2">Recette de fabrication</h3>{details.recipes?.length?<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{details.recipes.map(r=><div key={r.id} className="flex items-center gap-2 bg-muted rounded-lg p-2"><CatalogueImage src={r.ingredientImg} alt={r.ingredientName} className="h-10 w-10 shrink-0 rounded"/><p className="text-sm">{r.quantity} × {r.ingredientName}</p></div>)}</div>:<p className="text-sm text-muted-foreground">{isFetching?'Chargement de la recette...':details.recipeUnavailable?'Recette temporairement indisponible.':'Aucune recette de fabrication renseignée.'}</p>}</section>}
  </DialogContent></Dialog>;
}