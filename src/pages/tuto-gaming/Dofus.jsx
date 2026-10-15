import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft,Loader2,ChevronLeft,ChevronRight } from 'lucide-react';
import DofusFilters from '@/components/tuto-gaming/DofusFilters';
import DofusItemCard from '@/components/tuto-gaming/DofusItemCard';
import DofusItemModal from '@/components/tuto-gaming/DofusItemModal';
import useDofusCatalogue from '@/components/tuto-gaming/useDofusCatalogue';
import DofusStuffBuilder from '@/components/tuto-gaming/DofusStuffBuilder';
import DofusSetCard from '@/components/tuto-gaming/DofusSetCard';
import DofusSetModal from '@/components/tuto-gaming/DofusSetModal';
import DofusClasses from '@/components/tuto-gaming/DofusClasses';
import DofusAlmanax from '@/components/tuto-gaming/DofusAlmanax';
export default function Dofus() {
  const [query,setQuery]=useState({category:'all',typeIds:[],search:'',minLevel:0,maxLevel:0,page:1,limit:50});
  const [selectedItem,setSelectedItem]=useState(null);
  const [tab,setTab]=useState('catalogue');
  const {data,isFetching}=useDofusCatalogue(query);
  return <main className="min-h-screen bg-background text-foreground px-4 py-6"><div className="max-w-7xl mx-auto">
    <Link to="/tuto-gaming" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-5"><ArrowLeft className="w-4 h-4"/>Retour au Hub</Link>
    <h1 className="text-3xl font-bold mb-2">Univers Dofus</h1><p className="text-sm text-muted-foreground mb-6">Catalogue, builder de stuff, classes et sorts : données sourcées depuis DofusDB.</p>
    <nav aria-label="Modules Dofus" className="flex flex-wrap gap-2 mb-6">{[['catalogue','Encyclopédie'],['builder','Créateur de Stuff / Preset'],['classes','Classes et sorts'],['almanax','Almanax']].map(([id,label])=><button type="button" key={id} aria-current={tab===id?'page':undefined} onClick={()=>setTab(id)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab===id?'bg-primary text-primary-foreground':'bg-secondary text-secondary-foreground'}`}>{label}</button>)}</nav>
    {tab==='builder'&&<DofusStuffBuilder/>}
    {tab==='classes'&&<DofusClasses/>}
    {tab==='almanax'&&<DofusAlmanax/>}
    <section hidden={tab!=='catalogue'}>
    <DofusFilters query={query} onChange={setQuery}/>
    {data.source==='reference'&&<p role="status" className="mb-4 text-sm text-muted-foreground">Catalogue de référence sauvegardé : statistiques et recettes consultables immédiatement.{data.message?' DofusDB est temporairement indisponible.':''}</p>}
    {isFetching&&<p className="flex items-center gap-2 mb-4 text-xs text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin"/>Actualisation DofusDB en cours...</p>}
    {data.items.length?<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">{data.items.map(item=>query.category==='sets'?<DofusSetCard key={item.id} set={item} onClick={()=>setSelectedItem(item)}/>:<DofusItemCard key={item.id} item={item} onClick={()=>setSelectedItem(item)}/>)}</div>:<p className="text-center py-12 text-muted-foreground">{data.message&&['monsters','sets','resources'].includes(query.category)?'Cette section est temporairement indisponible.':'Aucun objet ne correspond à ces filtres.'}</p>}
    <div className="flex items-center justify-center gap-4 mt-8"><button aria-label="Page précédente" disabled={query.page<=1||isFetching} onClick={()=>setQuery({...query,page:query.page-1})} className="p-2 rounded-lg bg-secondary disabled:opacity-30"><ChevronLeft className="w-5 h-5"/></button><span className="text-sm text-muted-foreground">Page {query.page} · {data.total} résultats</span><button aria-label="Page suivante" disabled={!data.has_more||isFetching} onClick={()=>setQuery({...query,page:query.page+1})} className="p-2 rounded-lg bg-secondary disabled:opacity-30"><ChevronRight className="w-5 h-5"/></button></div>
    {selectedItem&&(selectedItem.category==='sets'?<DofusSetModal set={selectedItem} onClose={()=>setSelectedItem(null)}/>:<DofusItemModal item={selectedItem} category={query.category} onClose={()=>setSelectedItem(null)}/>)}
    </section>
  </div></main>;
}