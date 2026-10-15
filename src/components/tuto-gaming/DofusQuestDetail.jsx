import React from 'react';
import {AlertTriangle,Crosshair,Loader2,Plus,Route} from 'lucide-react';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {useDofusQuestDetails} from '@/components/tuto-gaming/useDofusProgression';

export default function DofusQuestDetail({id,onClose,onAddXpSource,onSetPrerequisiteTarget}){
  const query=useDofusQuestDetails(id);
  const quest=query.data?.quest;
  const xpRewards=quest?.steps.flatMap(step=>step.rewards.filter(reward=>reward.experienceRatio>0).map(reward=>({optimalLevel:step.optimalLevel,duration:step.duration,experienceRatio:reward.experienceRatio})))||[];
  return <Dialog open={!!id} onOpenChange={open=>!open&&onClose()}><DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
    <DialogHeader className=""><DialogTitle>{quest?.name||'Détail de la quête'}</DialogTitle><DialogDescription>Étapes ordonnées, objectifs et références résolus depuis DofusDB.</DialogDescription></DialogHeader>
    {query.isLoading&&<p role="status" className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Résolution des étapes, PNJ, monstres et objets…</p>}
    {query.isError&&<p role="alert" className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4"/>Détail temporairement indisponible.</p>}
    {quest&&<div className="space-y-5">
      <header className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">{quest.category?.name||'Catégorie non fournie'} · niveaux {quest.levelMin}–{quest.levelMax}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>onSetPrerequisiteTarget(quest)} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold"><Route className="h-4 w-4"/>Calculer les prérequis</button>{xpRewards.length>0&&<button type="button" onClick={()=>onAddXpSource({id:`quest:${quest.id}`,type:'quest',name:quest.name,rewards:xpRewards})} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4"/>Ajouter au calcul XP</button>}</div></header>
      <ol className="space-y-4">{quest.steps.map((step,index)=><li key={step.id} className="rounded-xl border bg-card p-4"><h3 className="font-bold">Étape {index+1} · {step.name}</h3>{step.description&&<p className="mt-1 text-sm text-muted-foreground">{step.description}</p>}<ul className="mt-3 space-y-2">{step.objectives.map(objective=><li key={objective.id} className="rounded-lg bg-muted/60 p-3 text-sm"><span className="flex items-start gap-2">{objective.isCombat&&<Crosshair aria-label="Combat" className="mt-0.5 h-4 w-4 shrink-0 text-destructive"/>}<span>{objective.text}</span></span>{objective.coords&&<span className="mt-1 block text-xs text-muted-foreground">Coordonnées {objective.coords.x}, {objective.coords.y}{objective.mapId?` · carte ${objective.mapId}`:''}</span>}{objective.unresolvedReferences&&<span className="mt-1 block text-xs text-amber-600">Une référence brute reste absente de la réponse DofusDB.</span>}</li>)}</ul>
        {step.rewards.length>0&&<details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-primary">Récompenses de l’étape</summary><div className="mt-2 space-y-2">{step.rewards.map(reward=><div key={reward.id} className="rounded-lg border p-3 text-sm"><p>{reward.experienceRatio>0?`Ratio XP : ${reward.experienceRatio}`:'Aucune XP'} · {reward.kamasRatio>0?`Ratio kamas : ${reward.kamasRatio}`:'Aucun kama'}</p>{reward.items.length>0&&<ul className="mt-2 grid gap-2 sm:grid-cols-2">{reward.items.map(item=><li key={item.id} className="flex items-center gap-2"><CatalogueImage src={item.img} alt="" className="h-8 w-8 rounded"/>{item.quantity} × {item.name}</li>)}</ul>}</div>)}</div></details>}
      </li>)}</ol>
      {!quest.steps.length&&<p className="rounded-xl border p-4 text-muted-foreground">Aucune étape n’est fournie par DofusDB.</p>}
    </div>}
  </DialogContent></Dialog>;
}
