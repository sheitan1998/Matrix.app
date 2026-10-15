import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const themes=[
  ['all','Tout'],
  ['equipment','Équipements'],
  ['weapons','Armes'],
  ['consumables','Consommables'],
  ['resources','Ressources'],
  ['monsters','Bestiaire'],
  ['sets','Panoplies'],
];

export default function DofusFilters({query,onChange}) {
  const [search,setSearch]=useState(query.search||'');
  const [minLevel,setMinLevel]=useState(query.minLevel||'');
  const [maxLevel,setMaxLevel]=useState(query.maxLevel||'');
  const supportsEquipmentTypes=['all','equipment','weapons'].includes(query.category);
  const {data,isError}=useQuery({
    queryKey:['dofus-item-types'],
    staleTime:24*60*60*1000,
    retry:false,
    queryFn:async()=>{
      const {data}=await base44.functions.invoke('dofusApi',{action:'getItemTypes',lang:'fr'});
      if(data.error)throw new Error(data.error);
      return data;
    },
  });
  const types=useMemo(()=>(data?.types||[]).filter(type=>query.category==='all'||type.theme===query.category),[data,query.category]);

  useEffect(()=>{
    const timeout=setTimeout(()=>onChange(previous=>{
      const nextMin=Math.max(0,Math.min(200,Number(minLevel)||0));
      const nextMax=Math.max(0,Math.min(200,Number(maxLevel)||0));
      const nextSearch=search.trim();
      if(previous.search===nextSearch&&previous.minLevel===nextMin&&previous.maxLevel===nextMax)return previous;
      return {...previous,search:nextSearch,minLevel:nextMin,maxLevel:nextMax,page:1};
    }),250);
    return()=>clearTimeout(timeout);
  },[search,minLevel,maxLevel,onChange]);

  function changeTheme(category) {
    onChange(previous=>({...previous,category,typeIds:[],page:1}));
  }
  function toggleType(id) {
    onChange(previous=>{
      const selected=new Set(previous.typeIds||[]);
      if(selected.has(id))selected.delete(id);else selected.add(id);
      return {...previous,typeIds:[...selected].sort((a,b)=>a-b),page:1};
    });
  }

  return <section aria-labelledby="dofus-filters-title" className="space-y-4 mb-6">
    <div>
      <h2 id="dofus-filters-title" className="sr-only">Filtres du catalogue</h2>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Thème</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Thème du catalogue">
        {themes.map(([id,label])=><button key={id} type="button" aria-pressed={query.category===id} onClick={()=>changeTheme(id)} className={`px-3 py-2 rounded-lg text-sm font-semibold ${query.category===id?'bg-primary text-primary-foreground':'bg-secondary text-secondary-foreground'}`}>{label}</button>)}
      </div>
    </div>
    <div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_7rem_7rem]">
      <label className="flex items-center gap-2 border rounded-lg bg-card px-3"><Search aria-hidden="true" className="w-4 h-4 text-muted-foreground"/><span className="sr-only">Recherche instantanée</span><input aria-label="Rechercher dans le catalogue Dofus" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Recherche instantanée..." className="w-full py-3 bg-transparent outline-none"/></label>
      <label className="grid gap-1 text-xs text-muted-foreground"><span>Niveau min.</span><input aria-label="Niveau minimum" type="number" inputMode="numeric" min="0" max="200" value={minLevel} onChange={event=>setMinLevel(event.target.value)} className="min-w-0 px-3 py-2 rounded-lg border bg-card text-foreground"/></label>
      <label className="grid gap-1 text-xs text-muted-foreground"><span>Niveau max.</span><input aria-label="Niveau maximum" type="number" inputMode="numeric" min="0" max="200" value={maxLevel} onChange={event=>setMaxLevel(event.target.value)} className="min-w-0 px-3 py-2 rounded-lg border bg-card text-foreground"/></label>
    </div>
    {supportsEquipmentTypes&&<div className="rounded-xl border bg-card p-3">
      <div className="flex items-center gap-2 mb-3"><SlidersHorizontal aria-hidden="true" className="w-4 h-4"/><h3 className="text-sm font-semibold">Catégories d’équipement</h3></div>
      {isError?<p role="alert" className="text-xs text-destructive">Les catégories détaillées sont temporairement indisponibles. Le filtre par thème reste actif.</p>:<div className="flex flex-wrap gap-2" role="group" aria-label="Catégories d’équipement">
        {types.map(type=><label key={type.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs ${query.typeIds?.includes(type.id)?'border-primary bg-primary/10 text-primary':'bg-background'}`}><input className="sr-only" type="checkbox" checked={query.typeIds?.includes(type.id)||false} onChange={()=>toggleType(type.id)}/>{type.name}</label>)}
        {!data&&<p role="status" className="text-xs text-muted-foreground">Chargement des catégories…</p>}
      </div>}
    </div>}
    <p aria-live="polite" className="text-xs text-muted-foreground">{query.typeIds?.length||0} catégorie(s) sélectionnée(s) · filtres appliqués automatiquement.</p>
  </section>;
}
