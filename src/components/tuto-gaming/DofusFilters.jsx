import React from 'react';
import { Search } from 'lucide-react';
const tabs=[['all','Tout'],['equipment','Équipements'],['weapons','Armes'],['consumables','Consommables'],['resources','Ressources'],['monsters','Bestiaire'],['sets','Panoplies']];
export default function DofusFilters({query,onChange}) {
  const [search,setSearch]=React.useState('');
  const [minLevel,setMinLevel]=React.useState('');
  const [maxLevel,setMaxLevel]=React.useState('');
  return <div className="space-y-4 mb-6">
    <div className="flex flex-wrap gap-2">{tabs.map(([id,label])=><button key={id} onClick={()=>{setSearch('');onChange({...query,category:id,search:'',page:1});}} className={`px-3 py-2 rounded-lg text-sm font-semibold ${query.category===id?'bg-primary text-primary-foreground':'bg-secondary text-secondary-foreground'}`}>{label}</button>)}</div>
    <form className="flex flex-wrap gap-2" onSubmit={e=>{e.preventDefault();onChange({...query,search,minLevel,maxLevel,page:1});}}>
      <label className="flex flex-1 min-w-48 items-center gap-2 border rounded-lg bg-card px-3"><Search className="w-4 h-4 text-muted-foreground"/><input aria-label="Rechercher un objet Dofus" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom..." className="w-full py-3 bg-transparent outline-none"/></label>
      {!['monsters','sets'].includes(query.category)&&<><input aria-label="Niveau minimum" type="number" min="0" max="200" value={minLevel} onChange={e=>setMinLevel(e.target.value)} placeholder="Niv. min" className="w-24 px-3 rounded-lg border bg-card"/><input aria-label="Niveau maximum" type="number" min="0" max="200" value={maxLevel} onChange={e=>setMaxLevel(e.target.value)} placeholder="Niv. max" className="w-24 px-3 rounded-lg border bg-card"/></>}
      <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">Rechercher</button>
    </form>
  </div>;
}