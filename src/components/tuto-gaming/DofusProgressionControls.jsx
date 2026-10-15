import React from 'react';
import {ChevronLeft,ChevronRight,Search} from 'lucide-react';

export function DofusProgressionFilters({filters,categories,onChange,categoryLabel='Catégorie'}){
  const update=patch=>onChange({...filters,...patch,page:1});
  return <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
    <label className="space-y-1 text-sm md:col-span-2"><span className="font-medium">Recherche</span><span className="relative block"><Search aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/><input value={filters.search} onChange={event=>update({search:event.target.value})} className="w-full rounded-lg border bg-background py-2 pl-9 pr-3" placeholder="Nom dans DofusDB"/></span></label>
    <label className="space-y-1 text-sm"><span className="font-medium">{categoryLabel}</span><select value={filters.categoryId} onChange={event=>update({categoryId:Number(event.target.value)})} className="w-full rounded-lg border bg-background px-3 py-2"><option value="0">Toutes</option>{categories.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    <fieldset className="grid grid-cols-2 gap-2"><legend className="text-sm font-medium">Niveau</legend><label className="text-xs text-muted-foreground">Minimum<input type="number" min="0" max="200" value={filters.minLevel||''} onChange={event=>update({minLevel:Number(event.target.value)||0})} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"/></label><label className="text-xs text-muted-foreground">Maximum<input type="number" min="0" max="200" value={filters.maxLevel||''} onChange={event=>update({maxLevel:Number(event.target.value)||0})} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"/></label></fieldset>
  </div>;
}

export function DofusProgressionPager({page,total,pageSize,busy,onPage}){
  const maxPage=Math.max(1,Math.ceil(total/pageSize));
  return <nav aria-label="Pagination du catalogue" className="flex items-center justify-center gap-4 pt-4"><button type="button" aria-label="Page précédente" disabled={page<=1||busy} onClick={()=>onPage(page-1)} className="rounded-lg bg-secondary p-2 disabled:opacity-30"><ChevronLeft className="h-5 w-5"/></button><span className="text-sm text-muted-foreground">Page {page} sur {maxPage} · {total.toLocaleString('fr-FR')} résultats</span><button type="button" aria-label="Page suivante" disabled={page>=maxPage||busy} onClick={()=>onPage(page+1)} className="rounded-lg bg-secondary p-2 disabled:opacity-30"><ChevronRight className="h-5 w-5"/></button></nav>;
}
