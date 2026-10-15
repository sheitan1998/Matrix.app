import React from 'react';
import { Loader2 } from 'lucide-react';
import FortniteMapCard from '@/components/tuto-gaming/FortniteMapCard';
import useCreativeMaps from '@/components/fortnite/useCreativeMaps';

export default function ApiFeaturedMaps({ search = '', category = 'all', user, onSelect }) {
  const mode = 'popular';
  const { maps, loading, error, cachedAt, hasMore, loadingMore, loadMore, retry } = useCreativeMaps(search, category, mode);
  return <section className="mb-8">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-black text-foreground">{search ? 'Recherche Créatif / UEFN' : 'Îles populaires du moment'}</h2>
    </div>
    <p className="mb-3 text-[11px] text-muted-foreground">Classements Epic Games. Joueurs : dernier pic sur 10 minutes, cache 15 minutes.{cachedAt ? ` Relevé consulté à ${new Date(cachedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.` : ''} <a href="https://fortnite.fyi" target="_blank" rel="noreferrer" className="underline">data by fortnite.fyi</a></p>
    {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      : error ? <p role="alert" className="py-5 text-sm text-destructive">La découverte Créatif est indisponible. <button onClick={retry} className="underline">Réessayer</button></p>
      : maps.length === 0 ? <p className="py-5 text-sm text-muted-foreground">Aucune île disponible pour cette recherche.</p>
      : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{maps.map((map, index) => <FortniteMapCard key={map.map_code} map={map} index={index} onClick={onSelect} user={user} />)}</div>}
    {hasMore && <div className="mt-4 text-center"><button onClick={loadMore} disabled={loadingMore} className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">{loadingMore ? 'Chargement…' : 'Voir plus d’îles'}</button></div>}
  </section>;
}