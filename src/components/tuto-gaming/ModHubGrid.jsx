import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ModHubDetailModal from '@/components/tuto-gaming/ModHubDetailModal';
import ModHubFilters from '@/components/tuto-gaming/ModHubFilters';
import ModHubResults from '@/components/tuto-gaming/ModHubResults';
import useFarmingCatalog from '@/components/tuto-gaming/useFarmingCatalog';
import { farmingSearchWithMod, farmingSearchWithoutMod, isValidFarmingModId } from '@/components/tuto-gaming/farmingModCatalog';

export default function ModHubGrid() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  useEffect(() => { const timer = setTimeout(() => setSearch(query.trim()), 400); return () => clearTimeout(timer); }, [query]);
  const catalog = useFarmingCatalog(category, search);
  const modId = new URLSearchParams(location.search).get('mod');
  const validModId = !modId || isValidFarmingModId(modId);
  const openMod = mod => navigate({ pathname: location.pathname, search: farmingSearchWithMod(location.search, mod.id), hash: location.hash });
  const closeMod = () => navigate({ pathname: location.pathname, search: farmingSearchWithoutMod(location.search), hash: location.hash }, { replace: true });
  return (
    <section className="mb-8 rounded-2xl border border-border bg-background p-3 text-foreground sm:p-5" id="modhub" aria-labelledby="modhub-title">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h1 id="modhub-title" className="text-xl font-black sm:text-2xl">Catalogue de mods FS25</h1><p className="mt-1 text-xs text-muted-foreground">ModHub officiel GIANTS, toutes les pages accessibles par catégorie, sans limite de sélection.</p></div>
        <button type="button" onClick={catalog.refresh} disabled={catalog.isFetching || catalog.loading} aria-label="Actualiser le catalogue" className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${catalog.isFetching ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Actualiser</span></button>
      </div>
      <ModHubFilters query={query} setQuery={setQuery} category={category} setCategory={setCategory} categories={catalog.categories} />
      {!validModId && <p role="alert" className="mt-4 text-sm text-destructive">Identifiant du mod invalide. Choisissez une fiche dans le catalogue.</p>}
      <ModHubResults catalog={catalog} onSelect={openMod} />
      {modId && validModId && <ModHubDetailModal key={modId} modId={modId} initialMod={catalog.items.find(item => String(item.id) === modId)} onClose={closeMod} />}
    </section>
  );
}