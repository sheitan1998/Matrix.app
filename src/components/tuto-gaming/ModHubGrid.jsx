import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import ModGalleryModal from '@/components/tuto-gaming/ModGalleryModal';
import ModHubFilters from '@/components/tuto-gaming/ModHubFilters';
import ModHubResults from '@/components/tuto-gaming/ModHubResults';
import useFarmingCatalog from '@/components/tuto-gaming/useFarmingCatalog';

export default function ModHubGrid() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedMod, setSelectedMod] = useState(null);
  useEffect(() => { const timer = setTimeout(() => setSearch(query.trim()), 400); return () => clearTimeout(timer); }, [query]);
  const catalog = useFarmingCatalog(category, search);

  // Preload visible thumbnails so they render instantly when cards mount.
  useEffect(() => {
    catalog.items.slice(0, 18).forEach(mod => {
      if (mod.img) { const img = new Image(); img.src = mod.img; }
    });
  }, [catalog.items]);

  return (
    <section className="mb-8 rounded-2xl border border-border bg-background p-3 text-foreground sm:p-5" id="modhub" aria-labelledby="modhub-title">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h1 id="modhub-title" className="text-xl font-black sm:text-2xl">Catalogue de mods FS25</h1><p className="mt-1 text-xs text-muted-foreground">ModHub officiel GIANTS, toutes les pages accessibles par catégorie, sans limite de sélection.</p></div>
        <button type="button" onClick={catalog.refresh} disabled={catalog.isFetching || catalog.loading} aria-label="Actualiser le catalogue" className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${catalog.isFetching ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Actualiser</span></button>
      </div>
      <ModHubFilters query={query} setQuery={setQuery} category={category} setCategory={setCategory} categories={catalog.categories} />
      <ModHubResults catalog={catalog} onSelect={setSelectedMod} />
      {selectedMod && (
        <ModGalleryModal key={selectedMod.id} modId={selectedMod.id} initialMod={selectedMod} onClose={() => setSelectedMod(null)} />
      )}
    </section>
  );
}