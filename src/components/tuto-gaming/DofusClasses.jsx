import React,{useEffect,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {AlertTriangle,Loader2} from 'lucide-react';
import {base44} from '@/api/base44Client';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';
import DofusClassArtwork from '@/components/tuto-gaming/DofusClassArtwork';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '@/components/ui/dialog';

function SpellLevel({level}) {
  const castRules=[
    level.castInLine&&'Lancer en ligne',
    level.castInDiagonal&&'Lancer en diagonale',
    level.castTestLos?'Ligne de vue requise':'Sans ligne de vue',
    level.rangeCanBeBoosted&&'Portée modifiable',
    level.minCastInterval>0&&`Relance minimale : ${level.minCastInterval} tour(s)`,
    level.initialCooldown>0&&`Relance initiale : ${level.initialCooldown} tour(s)`,
    level.globalCooldown>0&&`Relance globale : ${level.globalCooldown} tour(s)`,
    level.maxGlobalCastPerTurn>0&&`${level.maxGlobalCastPerTurn} lancer(s) global(aux)/tour`,
    level.maxGlobalCastPerTarget>0&&`${level.maxGlobalCastPerTarget} lancer(s) global(aux)/cible`,
    level.needFreeCell&&'Cellule libre requise',
    level.needTakenCell&&'Cellule occupée requise',
    level.needVisibleEntity&&'Entité visible requise',
    level.needCellWithoutPortal&&'Cellule sans portail requise',
    level.portalProjectionForbidden&&'Projection par portail interdite',
  ].filter(Boolean);
  return <div className="space-y-2 rounded-lg bg-muted/60 p-3"><h5 className="font-semibold">Rang {level.grade} · niveau {level.minPlayerLevel}</h5><p className="text-xs text-muted-foreground">{level.apCost} PA · portée {level.minRange}–{level.range} · {level.maxCastPerTurn||'∞'} lancer(s)/tour · {level.maxCastPerTarget||'∞'} par cible{level.criticalHitProbability?` · ${level.criticalHitProbability}% critique`:''}</p>{castRules.length>0&&<ul aria-label="Règles de lancement" className="flex flex-wrap gap-1">{castRules.map(rule=><li key={rule} className="rounded-full border bg-background px-2 py-1 text-[11px] text-muted-foreground">{rule}</li>)}</ul>}<ul className="space-y-1">{level.effects.map((effect,index)=><li key={`${effect.effectId}-${index}`} className="text-sm">{effect.description}{effect.duration?` (${effect.duration} tour${effect.duration>1?'s':''})`:''}</li>)}</ul>{level.criticalEffects.length>0&&<details><summary className="cursor-pointer text-xs font-semibold text-primary">Effets critiques</summary><ul className="mt-1 space-y-1">{level.criticalEffects.map((effect,index)=><li key={`${effect.effectId}-${index}`} className="text-sm">{effect.description}</li>)}</ul></details>}</div>;
}

function SpellCard({spell}) {
  return <details className="rounded-xl border bg-card open:ring-1 open:ring-primary/30"><summary className="flex cursor-pointer list-none items-center gap-3 p-3"><CatalogueImage src={spell.img} alt={spell.name} className="h-14 w-14 shrink-0 rounded-lg"/><span className="min-w-0"><span className="block font-semibold">{spell.name}</span>{spell.variant?.pairedSpellName&&<span className="block text-xs font-medium text-primary">Variante de {spell.variant.pairedSpellName}</span>}<span className="line-clamp-2 text-xs text-muted-foreground">{spell.description||'Description indisponible dans la source.'}</span></span></summary><div className="space-y-3 border-t p-3"><p className="text-sm">{spell.description||'La source DofusDB ne fournit pas de description pour ce sort.'}</p>{spell.levels.length?<div className="grid gap-3 xl:grid-cols-3">{spell.levels.map(level=><SpellLevel key={level.id} level={level}/>)}</div>:<p role="alert" className="text-sm text-destructive">Rangs et effets indisponibles dans la source.</p>}</div></details>;
}

export default function DofusClasses(){
  const [selectedId,setSelectedId]=useState(null);
  const [variant,setVariant]=useState('male');
  const classesQuery=useQuery({queryKey:['dofus-classes'],staleTime:24*60*60*1000,retry:false,queryFn:async()=>{const {data}=await base44.functions.invoke('dofusApi',{action:'getBreeds',lang:'fr'});if(data.error)throw new Error(data.error);return data;}});
  const selected=classesQuery.data?.breeds.find(breed=>breed.id===selectedId)||null;
  useEffect(()=>{setVariant(selected?.variants?.[0]?.id||'male');},[selectedId,selected]);
  const spellsQuery=useQuery({queryKey:['dofus-class-spells',selectedId],enabled:!!selectedId,staleTime:24*60*60*1000,retry:false,queryFn:async()=>{const {data}=await base44.functions.invoke('dofusApi',{action:'getBreedSpells',breedId:selectedId,lang:'fr'});if(data.error)throw new Error(data.error);return data;}});
  if(classesQuery.isLoading)return <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/>Chargement des classes DofusDB…</p>;
  if(classesQuery.isError)return <p role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"><AlertTriangle className="h-4 w-4"/>Les classes sont indisponibles. Aucune donnée de remplacement n’est inventée.</p>;
  return <section className="space-y-6" aria-labelledby="dofus-classes-title"><div><h2 id="dofus-classes-title" className="text-xl font-bold">Classes et sorts</h2><p className="text-sm text-muted-foreground">Illustrations officielles DOFUS Unity et données de sorts actualisées depuis DofusDB.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{classesQuery.data.breeds.map(breed=><button type="button" key={breed.id} onClick={()=>setSelectedId(breed.id)} className="rounded-xl border bg-card p-3 text-center transition hover:border-primary focus-visible:ring-2 focus-visible:ring-primary"><DofusClassArtwork breed={breed} variant="male" className="mx-auto h-44 max-w-24" onImageError={()=>{}} showCaption={false}/><span className="mt-2 block font-semibold">{breed.name}</span><span className="text-xs text-muted-foreground">{breed.spellCount} sorts</span></button>)}</div>
    <Dialog open={!!selected} onOpenChange={open=>!open&&setSelectedId(null)}><DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto p-4 sm:p-6"><DialogHeader className=""><DialogTitle className="text-2xl">{selected?.name}</DialogTitle><DialogDescription>{selected?.gameplay||'Rôle non renseigné'} · illustration Ankama, sorts DofusDB</DialogDescription></DialogHeader>{selected&&<div className="space-y-5"><header className="grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-[14rem_1fr]"><DofusClassArtwork breed={selected} variant={variant} className="h-[360px]" onImageError={()=>{}} showCaption/><div><div role="group" aria-label="Genre du personnage" className="mb-3 flex flex-wrap gap-2">{selected.variants.map(value=><button type="button" key={value.id} aria-pressed={variant===value.id} onClick={()=>setVariant(value.id)} className={`rounded-lg border px-3 py-2 text-sm ${variant===value.id?'bg-primary text-primary-foreground':'bg-background'}`}>{value.name}</button>)}</div><p className="text-sm leading-relaxed">{selected.description||'Description indisponible dans la source.'}</p><p className="mt-3 text-xs text-muted-foreground">Le sprite officiel mesure 345×385 px et contient les deux genres. Il est affiché à sa hauteur native maximale pour éviter le flou d’agrandissement.</p></div></header>{spellsQuery.isLoading&&<p role="status" className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Chargement des sorts, variantes et effets…</p>}{spellsQuery.isError&&<p role="alert" className="rounded-xl border border-destructive/40 p-4 text-destructive">DofusDB live n’a pas pu fournir les sorts Unity : {spellsQuery.error?.message||'erreur inconnue'}.</p>}{spellsQuery.data&&<section className="space-y-3"><div className="flex flex-wrap justify-between gap-2"><h3 className="text-lg font-bold">Sorts de {selected.name}</h3><p className="text-xs text-muted-foreground">{spellsQuery.data.spells.length}/{selected.spellCount} fournis · source mise à jour {spellsQuery.data.updatedAt?new Date(spellsQuery.data.updatedAt).toLocaleDateString('fr-FR'):'DofusDB live'}</p></div>{!spellsQuery.data.spells.length&&<p className="rounded-xl border p-4 text-muted-foreground">Aucun sort n’est fourni pour cette classe.</p>}{spellsQuery.data.spells.length!==selected.spellCount&&<p role="status" className="text-sm text-amber-600">Liste partielle retournée par la source ; aucun sort artificiel n’a été ajouté.</p>}{spellsQuery.data.spells.map(spell=><SpellCard key={spell.id} spell={spell}/>)}</section>}</div>}</DialogContent></Dialog>
  </section>;
}
