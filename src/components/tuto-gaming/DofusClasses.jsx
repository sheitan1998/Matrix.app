import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';

function SpellLevel({level}) {
  return <div className="rounded-lg bg-muted/60 p-3 space-y-2">
    <h5 className="font-semibold">Rang {level.grade} · niveau {level.minPlayerLevel}</h5>
    <p className="text-xs text-muted-foreground">{level.apCost} PA · portée {level.minRange}–{level.range} · {level.maxCastPerTurn||'∞'} lancer(s)/tour · {level.maxCastPerTarget||'∞'} par cible{level.criticalHitProbability?` · ${level.criticalHitProbability}% critique`:''}</p>
    <ul className="space-y-1">{level.effects.map((effect,index)=><li key={`${effect.effectId}-${index}`} className="text-sm">{effect.description}{effect.duration?` (${effect.duration} tour${effect.duration>1?'s':''})`:''}</li>)}</ul>
    {level.criticalEffects.length>0&&<details><summary className="cursor-pointer text-xs font-semibold text-primary">Effets critiques</summary><ul className="mt-1 space-y-1">{level.criticalEffects.map((effect,index)=><li key={`${effect.effectId}-${index}`} className="text-sm">{effect.description}{effect.duration?` (${effect.duration} tour${effect.duration>1?'s':''})`:''}</li>)}</ul></details>}
  </div>;
}

function SpellCard({spell}) {
  return <details className="rounded-xl border bg-card open:ring-1 open:ring-primary/30">
    <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
      <CatalogueImage src={spell.img} alt={spell.name} className="h-14 w-14 shrink-0 rounded-lg"/>
      <span><span className="block font-semibold">{spell.name}</span><span className="line-clamp-2 text-xs text-muted-foreground">{spell.description||'Description indisponible dans la source.'}</span></span>
    </summary>
    <div className="border-t p-3 space-y-3">
      <p className="text-sm">{spell.description||'La source DofusDB ne fournit pas de description pour ce sort.'}</p>
      {spell.levels.length?<div className="grid gap-3 xl:grid-cols-3">{spell.levels.map(level=><SpellLevel key={level.id} level={level}/>)}</div>:<p role="alert" className="text-sm text-destructive">Les rangs et effets détaillés de ce sort sont indisponibles dans la source.</p>}
    </div>
  </details>;
}

export default function DofusClasses() {
  const [selectedId,setSelectedId]=useState(null);
  const classesQuery=useQuery({
    queryKey:['dofus-classes'],
    staleTime:24*60*60*1000,
    retry:false,
    queryFn:async()=>{const {data}=await base44.functions.invoke('dofusApi',{action:'getBreeds',lang:'fr'});if(data.error)throw new Error(data.error);return data;},
  });
  const selected=classesQuery.data?.breeds.find(breed=>breed.id===selectedId)||null;
  const spellsQuery=useQuery({
    queryKey:['dofus-class-spells',selectedId],
    enabled:!!selectedId,
    staleTime:24*60*60*1000,
    retry:false,
    queryFn:async()=>{const {data}=await base44.functions.invoke('dofusApi',{action:'getBreedSpells',breedId:selectedId,lang:'fr'});if(data.error)throw new Error(data.error);return data;},
  });

  if(classesQuery.isLoading)return <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/>Chargement des classes DofusDB…</p>;
  if(classesQuery.isError)return <p role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"><AlertTriangle className="h-4 w-4"/>Les classes sont indisponibles : DofusDB ne répond pas. Aucune donnée de remplacement n’est inventée.</p>;

  return <section className="space-y-6" aria-labelledby="dofus-classes-title">
    <div><h2 id="dofus-classes-title" className="text-xl font-bold">Classes et sorts</h2><p className="text-sm text-muted-foreground">Visuels, descriptions et liste complète des sorts fournis en français par DofusDB.</p></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{classesQuery.data.breeds.map(breed=><button type="button" key={breed.id} aria-pressed={selectedId===breed.id} onClick={()=>setSelectedId(breed.id)} className={`rounded-xl border bg-card p-3 text-center ${selectedId===breed.id?'border-primary ring-2 ring-primary/30':'hover:border-primary/60'}`}><CatalogueImage src={breed.img} alt={`Visuel de la classe ${breed.name}`} className="mx-auto aspect-square w-full max-w-32 rounded-lg"/><span className="mt-2 block font-semibold">{breed.name}</span><span className="text-xs text-muted-foreground">{breed.spellCount} sorts</span></button>)}</div>
    {selected&&<article className="space-y-5" aria-labelledby={`breed-${selected.id}`}>
      <header className="grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-[10rem_1fr]">
        <CatalogueImage src={selected.img} alt={`Visuel HD de ${selected.name} fourni par DofusDB`} className="aspect-square w-full rounded-xl"/>
        <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">{selected.gameplay||'Rôle non renseigné'}</p><h3 id={`breed-${selected.id}`} className="text-2xl font-bold">{selected.name}</h3><p className="mt-2 text-sm leading-relaxed">{selected.description||'Description indisponible dans la source DofusDB.'}</p><p className="mt-3 text-xs text-muted-foreground">Visuel diffusé depuis l’API DofusDB ; aucune copie locale ni donnée non sourcée.</p></div>
      </header>
      {spellsQuery.isLoading&&<p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/>Chargement des {selected.spellCount} sorts et de leurs effets…</p>}
      {spellsQuery.isError&&<p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">Les sorts détaillés de {selected.name} sont temporairement indisponibles. Aucune description de remplacement n’est affichée.</p>}
      {spellsQuery.data&&<section aria-labelledby={`spells-${selected.id}`} className="space-y-3"><div className="flex flex-wrap items-baseline justify-between gap-2"><h4 id={`spells-${selected.id}`} className="text-lg font-bold">Sorts de {selected.name}</h4><p className="text-xs text-muted-foreground">{spellsQuery.data.spells.length}/{selected.spellCount} sorts fournis par la source</p></div>{spellsQuery.data.spells.length!==selected.spellCount&&<p role="alert" className="text-sm text-destructive">La source annonce {selected.spellCount} sorts mais n’en a retourné que {spellsQuery.data.spells.length}. La liste est affichée sans compléter artificiellement les données.</p>}<div className="space-y-3">{spellsQuery.data.spells.map(spell=><SpellCard key={spell.id} spell={spell}/>)}</div></section>}
    </article>}
  </section>;
}
