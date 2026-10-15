import React,{useDeferredValue,useState} from 'react';
import {AlertTriangle,Award,Loader2} from 'lucide-react';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';
import DofusAchievementDetail from '@/components/tuto-gaming/DofusAchievementDetail';
import {DofusProgressionFilters,DofusProgressionPager} from '@/components/tuto-gaming/DofusProgressionControls';
import {useDofusAchievements,useDofusProgressionFilters} from '@/components/tuto-gaming/useDofusProgression';

const PAGE_SIZE=24;

export default function DofusAchievements({onAddXpSource}){
  const [filters,setFilters]=useState({search:'',categoryId:0,minLevel:0,maxLevel:0,page:1,limit:PAGE_SIZE});
  const [selectedId,setSelectedId]=useState(null);
  const deferredSearch=useDeferredValue(filters.search);
  const query=useDofusAchievements({...filters,search:deferredSearch});
  const filtersQuery=useDofusProgressionFilters();
  const achievements=query.data?.achievements||[];
  return <section className="space-y-5" aria-labelledby="dofus-achievements-title">
    <header><h2 id="dofus-achievements-title" className="flex items-center gap-2 text-xl font-bold"><Award className="h-5 w-5 text-primary"/>Succès</h2><p className="text-sm text-muted-foreground">Catalogue paginé de tous les succès DofusDB. Seules 24 cartes sont rendues à la fois.</p></header>
    <DofusProgressionFilters filters={filters} categories={filtersQuery.data?.achievements||[]} onChange={setFilters}/>
    {filtersQuery.isError&&<p role="alert" className="text-sm text-destructive">Les catégories sont indisponibles; le catalogue général reste utilisable.</p>}
    {query.isFetching&&<p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Chargement de la page DofusDB…</p>}
    {query.isError&&<p role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive"><AlertTriangle className="h-4 w-4"/>Les succès sont temporairement indisponibles. Aucun catalogue statique obsolète n’est substitué.</p>}
    {!query.isError&&!query.isLoading&&!achievements.length&&<p className="rounded-xl border p-8 text-center text-muted-foreground">Aucun succès ne correspond à ces filtres.</p>}
    <div aria-busy={query.isFetching} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{achievements.map(achievement=><button type="button" key={achievement.id} onClick={()=>setSelectedId(achievement.id)} className="flex min-h-32 gap-3 rounded-xl border bg-card p-4 text-left transition hover:border-primary focus-visible:ring-2 focus-visible:ring-primary"><CatalogueImage src={achievement.img} alt="" className="h-16 w-16 shrink-0 rounded-lg"/><span className="min-w-0"><span className="block font-bold">{achievement.name}</span><span className="block text-xs text-muted-foreground">{achievement.category?.parent?.name||achievement.category?.name||'Catégorie non fournie'} · niv. {achievement.level}</span><span className="mt-2 line-clamp-2 block text-sm">{achievement.description||'Description non fournie.'}</span><span className="mt-2 block text-xs font-semibold text-primary">{achievement.points} point{achievement.points>1?'s':''}</span></span></button>)}</div>
    {query.data&&<DofusProgressionPager page={filters.page} total={query.data.total} pageSize={PAGE_SIZE} busy={query.isFetching} onPage={page=>setFilters({...filters,page})}/>}
    <p className="text-xs text-muted-foreground">Données issues de DofusDB. Utilisation soumise à la LPNC-IA 1.0. Les catégories affichées sont celles réellement exposées par <code>achievement-categories</code>.</p>
    <DofusAchievementDetail id={selectedId} onClose={()=>setSelectedId(null)} onAddXpSource={onAddXpSource}/>
  </section>;
}
