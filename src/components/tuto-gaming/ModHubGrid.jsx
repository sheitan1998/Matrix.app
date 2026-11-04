import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import ModHubDetailModal from '@/components/tuto-gaming/ModHubDetailModal';
import ModHubFilters from '@/components/tuto-gaming/ModHubFilters';
import ModHubResults from '@/components/tuto-gaming/ModHubResults';
import useFarmingCatalog from '@/components/tuto-gaming/useFarmingCatalog';
import { FARMING_FALLBACK } from '@/components/tuto-gaming/farmingFallback';
import { farmingSearchWithMod, farmingSearchWithoutMod, isValidFarmingModId } from '@/components/tuto-gaming/farmingModCatalog';

export default function ModHubGrid() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedMod, setSelectedMod] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { const timer = setTimeout(() => setSearch(query.trim()), 400); return () => clearTimeout(timer); }, [query]);
  const catalog = useFarmingCatalog(category, search);
  const modParam = new URLSearchParams(location.search).get('mod');

  // Lien partagé : ouvre automatiquement la fiche du mod présent dans l'URL.
  useEffect(() => {
    if (!isValidFarmingModId(modParam)) return;
    setSelectedMod(current => {
      if (current && String(current.id) === String(modParam)) return current;
      return catalog.items.find(item => String(item.id) === String(modParam))
        || FARMING_FALLBACK.find(item => String(item.id) === String(modParam))
        || { id: String(modParam) };
    });
  }, [modParam, catalog.items]);

  const openMod = mod => {
    setSelectedMod(mod);
    if (mod?.id) {
      navigate({ pathname: location.pathname, search: farmingSearchWithMod(location.search, mod.id) }, { replace: true });
    }
  };

  const closeMod = () => {
    setSelectedMod(null);
    const nextSearch = farmingSearchWithoutMod(location.search);
    if (nextSearch !== location.search) {
      navigate({ pathname: location.pathname, search: nextSearch }, { replace: true });
    }
  };

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
      <ModHubResults catalog={catalog} onSelect={openMod} />
      {selectedMod && (
        <ModHubDetailModal key={selectedMod.id} modId={selectedMod.id} initialMod={selectedMod} onClose={closeMod} />
      )}
    </section>
  );
}