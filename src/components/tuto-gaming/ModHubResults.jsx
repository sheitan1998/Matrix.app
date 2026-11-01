import React from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import ModHubCard from '@/components/tuto-gaming/ModHubCard';
export default function ModHubResults({ catalog, onSelect }) {
  if (catalog.loading) return <p role="status" className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Chargement des mods officiels…</p>;
  return <div className="mt-5 space-y-4">
    {catalog.offline && <p role="status" className="rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground">ModHub temporairement indisponible. Le dernier instantané officiel reste accessible ; il ne représente pas le catalogue complet.</p>}
    {catalog.isError && <p role="alert" className="text-sm text-destructive">{catalog.error?.message || 'Chargement impossible.'} <button type="button" onClick={() => catalog.refetch()} className="underline">Réessayer</button></p>}
    {catalog.items.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{catalog.items.map((mod, index) => <ModHubCard key={mod.id} mod={mod} onSelect={onSelect} priority={index < 6} />)}</div> : !catalog.isError && <p role="status" className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{catalog.hasNextPage ? 'Aucun résultat sur les pages parcourues. Chargez la suite pour poursuivre la recherche.' : 'Aucun mod ne correspond à cette recherche.'}</p>}
    {catalog.hasNextPage && <button type="button" onClick={() => catalog.fetchNextPage()} disabled={catalog.isFetchingNextPage} className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm disabled:opacity-50">{catalog.isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}Charger plus de mods</button>}
  </div>;
}