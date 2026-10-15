import React from 'react';
import {AlertTriangle,Loader2,Plus} from 'lucide-react';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {useDofusAchievementDetails} from '@/components/tuto-gaming/useDofusProgression';

export default function DofusAchievementDetail({id,onClose,onAddXpSource}){
  const query=useDofusAchievementDetails(id);
  const achievement=query.data?.achievement;
  const xpRewards=achievement?.rewards.filter(reward=>reward.experienceRatio>0)||[];
  return <Dialog open={!!id} onOpenChange={open=>!open&&onClose()}><DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
    <DialogHeader className=""><DialogTitle>{achievement?.name||'Détail du succès'}</DialogTitle><DialogDescription>Fiche issue du schéma DofusDB actuel.</DialogDescription></DialogHeader>
    {query.isLoading&&<p role="status" className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Chargement des objectifs et récompenses…</p>}
    {query.isError&&<p role="alert" className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4"/>Détail temporairement indisponible.</p>}
    {achievement&&<div className="space-y-5">
      <header className="flex gap-4 rounded-xl border bg-card p-4"><CatalogueImage src={achievement.img} alt="" className="h-20 w-20 rounded-lg"/><div><p className="text-sm text-muted-foreground">{achievement.category?.parent?.name||achievement.category?.name} · niveau {achievement.level}</p><p className="mt-1">{achievement.description||'Description absente de DofusDB.'}</p><p className="mt-2 font-semibold text-primary">{achievement.points} point{achievement.points>1?'s':''}</p></div></header>
      <section aria-labelledby="achievement-objectives"><h3 id="achievement-objectives" className="font-bold">Sous-objectifs</h3>{achievement.objectives.length?<ol className="mt-2 space-y-2">{achievement.objectives.map(objective=><li key={objective.id} className="rounded-lg bg-muted/60 p-3 text-sm">{objective.name}</li>)}</ol>:<p className="mt-2 text-sm text-muted-foreground">Aucun objectif détaillé n’est fourni.</p>}</section>
      <section aria-labelledby="achievement-rewards"><div className="flex flex-wrap items-center justify-between gap-2"><h3 id="achievement-rewards" className="font-bold">Récompenses</h3>{xpRewards.length>0&&<button type="button" onClick={()=>onAddXpSource({id:`achievement:${achievement.id}`,type:'achievement',name:achievement.name,rewards:xpRewards.map(reward=>({optimalLevel:achievement.level,duration:1,experienceRatio:reward.experienceRatio}))})} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4"/>Ajouter au calcul XP</button>}</div>
        <div className="mt-2 space-y-3">{achievement.rewards.map(reward=><article key={reward.id} className="rounded-lg border p-3"><p className="text-sm">{reward.experienceRatio>0?`Ratio XP DofusDB : ${reward.experienceRatio}`:'Aucune XP'} · {reward.kamasRatio>0?`Ratio kamas : ${reward.kamasRatio}`:'Aucun kama'}</p>{reward.criterions&&<p className="mt-1 text-xs text-muted-foreground">Condition brute : {reward.criterions}</p>}{reward.items.length>0&&<ul className="mt-2 grid gap-2 sm:grid-cols-2">{reward.items.map(item=><li key={item.id} className="flex items-center gap-2 text-sm"><CatalogueImage src={item.img} alt="" className="h-9 w-9 rounded"/>{item.quantity} × {item.name}</li>)}</ul>}</article>)}</div>
      </section>
    </div>}
  </DialogContent></Dialog>;
}
