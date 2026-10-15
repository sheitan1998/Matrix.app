import React, { useDeferredValue, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ModHubDetailModal from '@/components/tuto-gaming/ModHubDetailModal';
import ModHubCard from '@/components/tuto-gaming/ModHubCard';
import { FARMING_FALLBACK } from '@/components/tuto-gaming/farmingFallback';
import {
  cacheFarmingCatalog,
  farmingSearchWithMod,
  farmingSearchWithoutMod,
  isValidFarmingModId,
  readCachedFarmingCatalog,
} from '@/components/tuto-gaming/farmingModCatalog';

const CATEGORY_LABELS = {
  tractors: 'Tracteurs',
  trailers: 'Remorques',
  harvesters: 'Moissonneuses',
  tillage: 'Outils du sol',
  maps: 'Cartes',
  seeding: 'Semis et plantation',
  grassland: 'Fenaison',
  buildings: 'Bâtiments',
};

const REFERENCE_CATEGORIES = Object.entries(CATEGORY_LABELS).map(([id, label]) => ({
  id,
  label,
  items: FARMING_FALLBACK.filter(mod => mod.categoryId === id),
}));
const LOCAL_CATALOG = {
  categories: REFERENCE_CATEGORIES,
  source: 'référence locale',
  partial: true,
};

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr');
}

export default function ModHubGrid() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const deferredQuery = useDeferredValue(query);
  const modId = new URLSearchParams(location.search).get('mod');
  const validModId = !modId || isValidFarmingModId(modId);

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['farming-modhub-catalog'],
    initialData: () => readCachedFarmingCatalog() || LOCAL_CATALOG,
    initialDataUpdatedAt: 0,
    staleTime: 60 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      try {
        const { data: response } = await base44.functions.invoke('farmingModApi', { action: 'getCatalog' });
        if (response.error || !response.categories?.some(category => category.items?.length)) {
          throw new Error(response.error || 'Le catalogue ModHub ne contient aucun mod.');
        }
        cacheFarmingCatalog(response);
        return response;
      } catch (catalogError) {
        const fallback = readCachedFarmingCatalog() || LOCAL_CATALOG;
        return {
          ...fallback,
          partial: true,
          apiError: catalogError instanceof Error ? catalogError.message : 'Erreur inconnue.',
        };
      }
    },
  });

  const normalizedQuery = normalize(deferredQuery.trim());
  const visibleCategories = useMemo(() => data.categories
    .filter(category => activeCategory === 'all' || category.id === activeCategory)
    .map(category => ({
      ...category,
      items: category.items.filter(mod => !normalizedQuery || normalize(
        `${mod.title} ${mod.author} ${mod.brand || ''} ${category.label}`,
      ).includes(normalizedQuery)),
    }))
    .filter(category => category.items.length > 0 || (!normalizedQuery && activeCategory === category.id)),
  [activeCategory, data.categories, normalizedQuery]);

  const allMods = data.categories.flatMap(category => category.items);
  const selectedMod = modId ? allMods.find(mod => String(mod.id) === modId) : null;
  const resultCount = visibleCategories.reduce((count, category) => count + category.items.length, 0);

  const openMod = mod => {
    navigate({ pathname: location.pathname, search: farmingSearchWithMod(location.search, mod.id), hash: location.hash }, {
      state: { ...location.state, farmingModModal: true },
    });
  };

  const closeMod = () => {
    navigate(
      { pathname: location.pathname, search: farmingSearchWithoutMod(location.search), hash: location.hash },
      { replace: true, state: location.state },
    );
  };

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-background p-3 text-foreground sm:p-5" id="modhub" aria-labelledby="modhub-title">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 id="modhub-title" className="text-xl font-black sm:text-2xl">Catalogue de mods FS25</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Sélection officielle GIANTS ModHub classée par usage.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Actualiser le catalogue"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        <div>
          <label htmlFor="farming-mod-search" className="mb-1.5 block text-xs font-semibold">
            Recherche globale
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="farming-mod-search"
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Mod, marque, auteur ou catégorie…"
              autoComplete="off"
              className="min-h-11 w-full rounded-xl border border-border bg-card py-2 pl-10 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Effacer la recherche"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
            {resultCount} mod{resultCount > 1 ? 's' : ''} affiché{resultCount > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrer par catégorie">
          {[{ id: 'all', label: 'Toutes' }, ...data.categories].map(category => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={activeCategory === category.id}
              className="min-h-10 shrink-0 rounded-full border px-4 text-xs font-bold transition"
              style={activeCategory === category.id
                ? { borderColor: '#7DA627', background: 'rgba(125,166,39,.2)', color: '#b7d66c' }
                : { borderColor: 'rgba(255,255,255,.1)' }}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {(data.partial || data.apiError || isError) && (
        <p role="status" className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {data.apiError || isError
            ? `ModHub indisponible : ${data.apiError || error?.message || 'erreur inconnue'}. ${data.source === 'référence locale' ? 'Une référence locale limitée' : 'Le dernier catalogue enregistré'} reste affiché${data.source === 'référence locale' ? 'e' : ''}.`
            : 'Certaines catégories sont temporairement indisponibles et peuvent être vides.'}
        </p>
      )}
      {!validModId && (
        <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          Le lien partagé contient un identifiant de mod invalide. Choisissez un mod dans le catalogue pour obtenir un nouveau lien.
        </p>
      )}
      {isFetching && (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground" role="status">
          <Loader2 className="h-4 w-4 animate-spin" /> Actualisation du catalogue…
        </p>
      )}

      <div className="mt-5 space-y-7">
        {visibleCategories.map(category => (
          <section key={category.id} aria-labelledby={`farming-category-${category.id}`}>
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 id={`farming-category-${category.id}`} className="text-base font-black uppercase tracking-wide sm:text-lg">
                {category.label}
              </h2>
              <span className="text-xs text-muted-foreground">{category.items.length}</span>
            </div>
            {category.items.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {category.items.map(mod => <ModHubCard key={`${category.id}-${mod.id}`} mod={mod} onSelect={openMod} />)}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                Aucun mod disponible dans cette catégorie.
              </p>
            )}
          </section>
        ))}
        {!visibleCategories.length && (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground" role="status">
            Aucun mod ne correspond à « {deferredQuery} ».
          </p>
        )}
      </div>

      {modId && validModId && <ModHubDetailModal modId={modId} initialMod={selectedMod} onClose={closeMod} />}
    </section>
  );
}
