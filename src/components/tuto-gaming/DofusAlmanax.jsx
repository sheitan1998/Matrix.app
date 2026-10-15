import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {CalendarDays,Gift,Loader2,Sparkles} from 'lucide-react';
import {base44} from '@/api/base44Client';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';

export default function DofusAlmanax(){
  const date=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Paris'});
  const {data,isLoading,isError,refetch}=useQuery({
    queryKey:['dofus-almanax',date],
    retry:1,
    staleTime:30*60*1000,
    queryFn:async()=>{const response=await base44.functions.invoke('dofusApi',{action:'getAlmanax',date,lang:'fr'});return response.data;},
  });
  if(isLoading)return <section aria-labelledby="almanax-title" className="rounded-xl border bg-card p-6"><h2 id="almanax-title" className="text-xl font-bold">Almanax du jour</h2><p role="status" className="mt-6 flex items-center gap-2 text-muted-foreground"><Loader2 aria-hidden="true" className="h-5 w-5 animate-spin"/>Chargement de l’Almanax…</p></section>;
  if(isError||!data?.almanax)return <section aria-labelledby="almanax-title" className="rounded-xl border bg-card p-6"><h2 id="almanax-title" className="text-xl font-bold">Almanax du jour</h2><div role="alert" className="mt-4 space-y-3"><p>Les données du jour sont temporairement indisponibles. Aucun résultat obsolète n’est affiché.</p><button type="button" onClick={()=>refetch()} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Réessayer</button></div></section>;
  const {almanax}=data;
  return <section aria-labelledby="almanax-title" className="space-y-4">
    <div><h2 id="almanax-title" className="flex items-center gap-2 text-xl font-bold"><CalendarDays aria-hidden="true" className="h-5 w-5"/>Almanax du jour</h2><p className="text-sm text-muted-foreground">{new Date(`${almanax.date}T12:00:00`).toLocaleDateString('fr-FR',{dateStyle:'full'})} · source {almanax.source}</p>{data.fallback&&<p role="status" className="mt-2 text-sm text-amber-600 dark:text-amber-400">Source principale indisponible : données de secours vérifiées utilisées.</p>}</div>
    <div className="grid gap-4 md:grid-cols-3">
      <article className="rounded-xl border bg-card p-5"><Sparkles aria-hidden="true" className="mb-3 h-5 w-5 text-primary"/><h3 className="text-sm text-muted-foreground">Méryde</h3><p className="text-xl font-bold">{almanax.meryde}</p>{almanax.merydeDescription&&<p className="mt-2 text-sm text-muted-foreground">{almanax.merydeDescription}</p>}</article>
      <article className="rounded-xl border bg-card p-5"><Gift aria-hidden="true" className="mb-3 h-5 w-5 text-primary"/><h3 className="text-sm text-muted-foreground">Offrande</h3><div className="mt-2 flex items-center gap-3">{almanax.offering.img&&<CatalogueImage src={almanax.offering.img} alt="" className="h-14 w-14 rounded-lg"/>}<p className="text-lg font-bold">{almanax.offering.quantity} × {almanax.offering.name}</p></div></article>
      <article className="rounded-xl border bg-card p-5"><CalendarDays aria-hidden="true" className="mb-3 h-5 w-5 text-primary"/><h3 className="text-sm text-muted-foreground">Bonus : {almanax.bonus.name}</h3><p className="mt-2 font-medium">{almanax.bonus.description}</p></article>
    </div>
  </section>;
}
