import React,{useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {CalendarDays,ChevronLeft,ChevronRight,Gift,Loader2,Sparkles} from 'lucide-react';
import {base44} from '@/api/base44Client';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';
import {formatFrenchDate,monthDays,monthKey,moveMonth,parisToday} from '@/components/tuto-gaming/dofusCalendar';

const WEEKDAYS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

export default function DofusAlmanax(){
  const today=parisToday();
  const [selectedDate,setSelectedDate]=useState(today);
  const [visibleMonth,setVisibleMonth]=useState(monthKey(today));
  const calendar=monthDays(visibleMonth);
  const {data,isLoading,isError,refetch}=useQuery({
    queryKey:['dofus-almanax',selectedDate],
    retry:1,
    staleTime:30*60*1000,
    queryFn:async()=>{const response=await base44.functions.invoke('dofusApi',{action:'getAlmanax',date:selectedDate,lang:'fr'});if(response.data?.error)throw new Error(response.data.error);return response.data;},
  });
  function changeMonth(offset){
    const next=moveMonth(visibleMonth,offset);
    setVisibleMonth(next);
    const nextDate=`${next}-01`;
    setSelectedDate(next===monthKey(today)?today:nextDate);
  }
  const almanax=data?.almanax;
  return <section aria-labelledby="almanax-title" className="space-y-5">
    <div><h2 id="almanax-title" className="flex items-center gap-2 text-xl font-bold"><CalendarDays aria-hidden="true" className="h-5 w-5"/>Almanax mensuel</h2><p className="text-sm text-muted-foreground">Dates calculées dans le fuseau Europe/Paris. Les jours futurs sont interrogés à la demande auprès des sources existantes.</p></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(20rem,28rem)_1fr]">
      <section aria-label="Calendrier Almanax" className="rounded-xl border bg-card p-4">
        <header className="mb-4 flex items-center justify-between"><button type="button" aria-label="Mois précédent" disabled={visibleMonth<=monthKey(today)} onClick={()=>changeMonth(-1)} className="rounded-lg border p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4"/></button><h3 className="font-bold capitalize">{formatFrenchDate(`${visibleMonth}-01`,{month:'long',year:'numeric'})}</h3><button type="button" aria-label="Mois suivant" onClick={()=>changeMonth(1)} className="rounded-lg border p-2"><ChevronRight className="h-4 w-4"/></button></header>
        <div className="grid grid-cols-7 gap-1 text-center">{WEEKDAYS.map(day=><span key={day} className="py-1 text-xs font-semibold text-muted-foreground">{day}</span>)}{Array.from({length:calendar.leading},(_,index)=><span key={`empty-${index}`}/>)}
          {calendar.days.map(date=><button type="button" key={date} aria-label={formatFrenchDate(date)} aria-pressed={date===selectedDate} onClick={()=>setSelectedDate(date)} className={`aspect-square rounded-lg text-sm transition ${date===selectedDate?'bg-primary font-bold text-primary-foreground':date===today?'border border-primary text-primary':'hover:bg-muted'}`}>{Number(date.slice(-2))}</button>)}
        </div>
        <button type="button" onClick={()=>{setVisibleMonth(monthKey(today));setSelectedDate(today);}} className="mt-4 w-full rounded-lg border px-3 py-2 text-sm">Revenir à aujourd’hui</button>
      </section>
      <section aria-live="polite" className="min-w-0">
        <h3 className="mb-3 text-lg font-bold capitalize">{formatFrenchDate(selectedDate)}</h3>
        {isLoading&&<p role="status" className="flex items-center gap-2 rounded-xl border bg-card p-6 text-muted-foreground"><Loader2 aria-hidden="true" className="h-5 w-5 animate-spin"/>Chargement de l’Almanax…</p>}
        {isError&&<div role="alert" className="rounded-xl border border-destructive/40 bg-card p-6"><p>Les données de cette date sont indisponibles. La source peut ne pas encore publier les jours futurs.</p><button type="button" onClick={()=>refetch()} className="mt-3 rounded-lg bg-primary px-4 py-2 text-primary-foreground">Réessayer</button></div>}
        {almanax&&<div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border bg-card p-5"><Sparkles className="mb-3 h-5 w-5 text-primary"/><h4 className="text-sm text-muted-foreground">Méryde</h4><p className="text-xl font-bold">{almanax.meryde}</p>{almanax.merydeDescription&&<p className="mt-2 text-sm text-muted-foreground">{almanax.merydeDescription}</p>}</article>
          <article className="rounded-xl border bg-card p-5"><Gift className="mb-3 h-5 w-5 text-primary"/><h4 className="text-sm text-muted-foreground">Offrande</h4><div className="mt-2 flex items-center gap-3">{almanax.offering.img&&<CatalogueImage src={almanax.offering.img} alt="" className="h-14 w-14 rounded-lg"/>}<p className="text-lg font-bold">{almanax.offering.quantity} × {almanax.offering.name}</p></div></article>
          <article className="rounded-xl border bg-card p-5"><CalendarDays className="mb-3 h-5 w-5 text-primary"/><h4 className="text-sm text-muted-foreground">Bonus : {almanax.bonus.name}</h4><p className="mt-2 font-medium">{almanax.bonus.description}</p></article>
        </div>}
        {data?.fallback&&<p role="status" className="mt-3 text-sm text-amber-600 dark:text-amber-400">Données de secours vérifiées utilisées pour cette date.</p>}
      </section>
    </div>
  </section>;
}
