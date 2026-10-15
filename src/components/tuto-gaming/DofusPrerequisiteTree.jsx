import React,{useEffect,useMemo,useState} from 'react';
import {AlertTriangle,CheckCircle2,Loader2,RotateCcw,Route} from 'lucide-react';
import {analyzePrerequisites} from '@/components/tuto-gaming/dofusProgression';
import {useDofusQuestPrerequisites} from '@/components/tuto-gaming/useDofusProgression';

const STORAGE_KEY='matrix:dofus:completed-quests:v1';

function readCompleted(){
  try{
    const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    return Array.isArray(value)?value.map(Number).filter(Number.isInteger):[];
  }catch{return [];}
}

function TreeNode({node,rootId,onToggle}){
  const label=<span className="flex min-w-0 items-start gap-2"><span className="min-w-0"><span className="block font-medium">{node.name}</span><span className="block text-xs text-muted-foreground">{node.type==='achievement'?'Succès':`Quête · niveau ${node.level||'?'}`}{node.shared?' · déjà référencée ailleurs':''}{node.cycle?' · cycle détecté':''}</span></span></span>;
  if(node.missing||node.cycle)return <li className="rounded-lg border border-amber-500/40 p-2 text-sm">{label}</li>;
  return <li className="rounded-lg border bg-card p-2 text-sm">{node.type==='quest'&&node.id!==rootId?<label className="flex cursor-pointer items-start gap-2"><input type="checkbox" checked={!!node.completed} onChange={()=>onToggle(node.id)} className="mt-1"/>{label}</label>:label}{node.children.length>0&&<details className="mt-2" open={node.id===rootId}><summary className="cursor-pointer text-xs font-semibold text-primary">{node.children.length} prérequis direct{node.children.length>1?'s':''}</summary><ul className="mt-2 space-y-2 border-l pl-3">{node.children.map((child,index)=><TreeNode key={`${child.type}-${child.id}-${index}`} node={child} rootId={rootId} onToggle={onToggle}/>)}</ul></details>}</li>;
}

export default function DofusPrerequisiteTree({target}){
  const [completed,setCompleted]=useState(readCompleted);
  const query=useDofusQuestPrerequisites(target?.id||null);
  useEffect(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(completed));},[completed]);
  const analysis=useMemo(()=>query.data?analyzePrerequisites(query.data,completed):null,[query.data,completed]);
  const toggle=id=>setCompleted(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);
  return <section className="space-y-3 rounded-xl border bg-muted/20 p-4" aria-labelledby="dofus-prerequisites-title"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 id="dofus-prerequisites-title" className="flex items-center gap-2 font-bold"><Route className="h-4 w-4 text-primary"/>Calculateur de prérequis</h3><p className="text-sm text-muted-foreground">{target?`Cible : ${target.name}`:'Ouvrez une quête puis choisissez « Calculer les prérequis ».'}</p></div>{completed.length>0&&<button type="button" onClick={()=>setCompleted([])} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"><RotateCcw className="h-4 w-4"/>Réinitialiser</button>}</div>
    {query.isLoading&&<p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/>Résolution récursive et déduplication…</p>}
    {query.isError&&<p role="alert" className="flex items-center gap-2 text-sm text-destructive"><AlertTriangle className="h-4 w-4"/>Impossible de charger cet arbre.</p>}
    {analysis&&<><div className="grid gap-2 sm:grid-cols-3"><p className="rounded-lg bg-card p-3 text-sm"><strong>{analysis.total}</strong><span className="block text-xs text-muted-foreground">quêtes prérequises uniques</span></p><p className="rounded-lg bg-card p-3 text-sm"><strong>{analysis.done}</strong><span className="block text-xs text-muted-foreground">marquées accomplies</span></p><p className="rounded-lg bg-card p-3 text-sm"><strong>{analysis.remaining}</strong><span className="block text-xs text-muted-foreground">restantes</span></p></div>{analysis.remaining===0&&analysis.total>0&&<p role="status" className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4"/>Tous les prérequis de quête sont cochés.</p>}<ul><TreeNode node={analysis.tree} rootId={query.data.rootId} onToggle={toggle}/></ul>{analysis.cycles.length>0&&<p role="alert" className="text-sm text-amber-600">{analysis.cycles.length} cycle{analysis.cycles.length>1?'s':''} détecté{analysis.cycles.length>1?'s':''}; la récursion a été arrêtée sur ces branches.</p>}{analysis.missing.length>0&&<p role="status" className="text-sm text-amber-600">{analysis.missing.length} référence{analysis.missing.length>1?'s':''} absente{analysis.missing.length>1?'s':''} de DofusDB.</p>}{query.data.truncated&&<p role="alert" className="text-sm text-destructive">Arbre interrompu à 500 quêtes pour protéger l’interface.</p>}</>}
    <p className="text-xs text-muted-foreground">Seuls <code>need.quests</code>, <code>need.achievements</code> et <code>levelMin</code> sont utilisés. Les critères bruts non décodés ne sont pas transformés en dépendances supposées.</p>
  </section>;
}
