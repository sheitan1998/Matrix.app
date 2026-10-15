import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import RocketLeagueImage from '@/components/tuto-gaming/RocketLeagueImage';
import RocketItemModal from '@/components/tuto-gaming/RocketItemModal';

async function fetchShop() {
  const { data } = await base44.functions.invoke('rocketLeagueApi', { action: 'getItemShop' });
  if (!Array.isArray(data?.items)) throw new Error('Réponse de catalogue invalide.');
  return data;
}

export default function RocketLeagueShop() {
  const [selectedItem, setSelectedItem] = useState(null);
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['rocket-league-catalog'],
    queryFn: fetchShop,
    retry: false,
    staleTime: 15 * 60 * 1000,
  });

  return (
    <section aria-labelledby="rocket-shop-title" className="space-y-4">
      <h2 id="rocket-shop-title" className="text-xl font-bold">Boutique du jour</h2>
      {isPending && (
        <p className="flex items-center gap-2 rounded-xl bg-muted p-4 text-sm text-muted-foreground" role="status">
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          Chargement de la boutique Tracker…
        </p>
      )}
      {isError && (
        <div className="rounded-xl border border-destructive/40 bg-card p-4">
          <p className="text-sm text-destructive" role="alert">
            {error instanceof Error ? error.message : 'La boutique Rocket League est indisponible.'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Aucun catalogue de remplacement n’est affiché.</p>
          <button type="button" onClick={() => refetch()} className="mt-3 rounded-lg border px-3 py-2 text-sm font-semibold">
            Réessayer
          </button>
        </div>
      )}
      {data && (
        <>
          <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground" role="status">
            Données et visuels fournis par Tracker Network. MATRIX n’affiche que les objets présents dans la réponse actuelle.
          </p>
          {data.items.length === 0 ? (
            <p className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
              Aucun objet n’est actuellement fourni par Tracker.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {data.items.map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="overflow-hidden rounded-xl border bg-card text-left transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <RocketLeagueImage src={item.image} alt={item.name} className="aspect-square w-full p-2" />
                  <span className="block space-y-1 p-3">
                    <span className="block text-sm font-bold">{item.name}</span>
                    <span className="block text-xs text-muted-foreground">{item.type}</span>
                    {item.rarity && <span className="block text-xs text-primary">{item.rarity}</span>}
                    <span className="block text-xs text-muted-foreground">
                      {item.price != null ? `${item.price} crédits` : 'Prix non fourni'}
                    </span>
                    <span className="mt-2 block text-xs">Voir dans MATRIX</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {isFetching && !isPending && <p className="text-xs text-muted-foreground" role="status">Actualisation de la boutique…</p>}
      {selectedItem && <RocketItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </section>
  );
}