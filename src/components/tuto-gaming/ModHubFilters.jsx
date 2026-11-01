import React from 'react';
import { Search, X } from 'lucide-react';
export default function ModHubFilters({ query, setQuery, category, setCategory, categories }) {
  return <div className="space-y-3">
    <label htmlFor="farming-mod-search" className="block text-xs font-semibold">Recherche dans le ModHub complet</label>
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input id="farming-mod-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un mod…" className="min-h-11 w-full rounded-xl border border-border bg-card py-2 pl-10 pr-12 text-sm" />
      {query && <button type="button" onClick={() => setQuery('')} aria-label="Effacer la recherche" className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center"><X className="h-4 w-4" /></button>}
    </div>
    <div className="flex flex-wrap gap-2" aria-label="Filtrer par catégorie">
      {[{ id: 'all', label: 'Tous les mods' }, ...categories].map(item => <button key={item.id} type="button" onClick={() => setCategory(item.id)} aria-pressed={category === item.id} className={`rounded-full border px-3 py-2 text-xs font-semibold ${category === item.id ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-card text-muted-foreground'}`}>{item.label}</button>)}
    </div>
  </div>;
}