import React,{useDeferredValue,useState} from 'react';
import {AlertTriangle,Loader2,ScrollText} from 'lucide-react';
import DofusPrerequisiteTree from '@/components/tuto-gaming/DofusPrerequisiteTree';
import DofusQuestDetail from '@/components/tuto-gaming/DofusQuestDetail';
import {DofusProgressionFilters,DofusProgressionPager} from '@/components/tuto-gaming/DofusProgressionControls';
import DofusXpCalculator from '@/components/tuto-gaming/DofusXpCalculator';
import {useDofusProgressionFilters,useDofusQuests} from '@/components/tuto-gaming/useDofusProgression';

const PAGE_SIZE=24;

export default function DofusQuests({xpSources,onAddXpSource,onRemoveXpSource}){
  const [filters,setFilters]=useState({search:'',categoryId:0,minLevel:0,maxLevel:0,page:1,limit:PAGE_SIZE});
  const [selectedId,setSelectedId]=useState(null);
  const [prerequisiteTarget,setPrerequisiteTarget]=useState(null);
  const deferredSearch=useDeferredValue(filters.search);
  const query=useDofusQuests({...filters,search:deferredSearch});
  const filtersQuery=useDofusProgressionFilters();
  const quests=query.data?.quests||[];
  return <section className="space-y-6" aria-labelledby="dofus-quests-title">
    <header><h2 id="dofus-quests-title" className="flex items-center gap-2 text-xl font-bold"><ScrollText className="h-5 w-5 text-primary"/>Quêtes</h2><p className="text-sm text-muted-foreground">Catalogue paginé DofusDB, détails d’étapes, prérequis récursifs et calcul XP.</p></header>
    <DofusProgressionFilters filters={filters} categories={filtersQuery.data?.quests||[]} onChange={setFilters} categoryLabel="Catégorie / zone"/>
    <p className="text-xs text-muted-foreground">DofusDB expose une catégorie thématique ou géographique par quête, mais aucun champ de série distinct ni filtre de zone normalisé. Aucun regroupement artificiel n’est ajouté.</p>
    {query.isFetching&&<p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Chargement de la page et de ses références…</p>}
    {query.isError&&<p role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive"><AlertTriangle className="h-4 w-4"/>Les quêtes sont temporairement indisponibles. Aucun contenu de remplacement n’est inventé.</p>}
    {!query.isError&&!query.isLoading&&!quests.length&&<p className="rounded-xl border p-8 text-center text-muted-foreground">Aucune quête ne correspond à ces filtres.</p>}
    <div aria-busy={query.isFetching} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{quests.map(quest=><button type="button" key={quest.id} onClick={()=>setSelectedId(quest.id)} className="min-h-32 rounded-xl border bg-card p-4 text-left transition hover:border-primary focus-visible:ring-2 focus-visible:ring-primary"><span className="block font-bold">{quest.name}</span><span className="block text-xs text-muted-foreground">{quest.category?.name||'Catégorie non fournie'} · niv. {quest.levelMin}{quest.levelMax!==quest.levelMin?`–${quest.levelMax}`:''}</span><span className="mt-3 block text-sm">{quest.stepCount} étape{quest.stepCount>1?'s':''}{quest.isDungeonQuest?' · donjon':''}{quest.isEvent?' · événement':''}</span><span className="mt-2 block text-xs text-primary">{quest.prerequisites.quests.length} quête{quest.prerequisites.quests.length>1?'s':''} et {quest.prerequisites.achievements.length} succès prérequis directs</span></button>)}</div>
    {query.data&&<DofusProgressionPager page={filters.page} total={query.data.total} pageSize={PAGE_SIZE} busy={query.isFetching} onPage={page=>setFilters({...filters,page})}/>}
    <div className="grid gap-5 xl:grid-cols-2"><DofusPrerequisiteTree target={prerequisiteTarget}/><DofusXpCalculator sources={xpSources} onRemoveSource={onRemoveXpSource}/></div>
    <p className="text-xs text-muted-foreground">Données issues de DofusDB. Utilisation soumise à la LPNC-IA 1.0. Le catalogue ne rend jamais plus d’une page de 24 quêtes dans le DOM.</p>
    <DofusQuestDetail id={selectedId} onClose={()=>setSelectedId(null)} onAddXpSource={onAddXpSource} onSetPrerequisiteTarget={quest=>{setPrerequisiteTarget(quest);setSelectedId(null);}}/>
  </section>;
}
