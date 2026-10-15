import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import RocketLeagueImage from '@/components/tuto-gaming/RocketLeagueImage';

export default function RocketItemModal({ item, onClose }) {
  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogTitle>{item.name}</DialogTitle>
        <DialogDescription>
          {[item.type, item.rarity, item.paint].filter(Boolean).join(' · ')}
        </DialogDescription>
        <RocketLeagueImage
          src={item.image}
          sources={item.images}
          alt={item.name}
          fallbackLabel={item.name}
          className="aspect-video w-full rounded-xl p-4"
        />
        <dl className="grid gap-3 rounded-xl bg-muted p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Source</dt>
            <dd className="font-semibold">
              {item.source === 'bakkesmod' ? 'Export BakkesMod configuré' : 'Snapshot communautaire versionné'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Prix</dt>
            <dd className="font-semibold">{item.price != null ? `${item.price} crédits` : 'Non fourni'}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">
          L’objet reste consultable dans MATRIX sans redirection vers un catalogue externe.
        </p>
      </DialogContent>
    </Dialog>
  );
}