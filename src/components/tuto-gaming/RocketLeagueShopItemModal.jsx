import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { rarityNeon } from './rocketLeagueShopData';
import { DAILY_SHOP_CATEGORY_LABELS } from './rocketLeagueShopData';

export default function RocketLeagueShopItemModal({ item, onClose }) {
  if (!item) return null;
  const neon = rarityNeon(item.rarity, item.rarityColor);
  const categoryLabel = DAILY_SHOP_CATEGORY_LABELS[item.category] || item.category || 'Objet';
  const until = item.availableUntil ? new Date(item.availableUntil).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : null;

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto" style={{ border: `2px solid ${neon.color}`, boxShadow: `0 0 30px ${neon.glow}` }}>
        <DialogTitle className="text-xl font-black" style={{ color: neon.color }}>{item.name}</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {item.type} · {neon.label}
        </DialogDescription>
        <div className="relative mx-auto aspect-video w-full max-w-md overflow-hidden rounded-xl" style={{ background: '#0a0a0f', border: `1px solid ${neon.color}` }}>
          {item.image ? (
            <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-contain p-4" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-3xl font-black" style={{ color: neon.color }}>RL</div>
          )}
        </div>
        <dl className="grid gap-3 rounded-xl bg-muted p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Catégorie</dt>
            <dd className="font-semibold">{categoryLabel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Rareté</dt>
            <dd className="font-semibold" style={{ color: neon.color }}>{neon.label}</dd>
          </div>
          {item.paint && (
            <div>
              <dt className="text-muted-foreground">Peinture / Variante</dt>
              <dd className="font-semibold" style={{ color: item.paintColor || neon.color }}>{item.paint}</dd>
            </div>
          )}
          <div>
            <dt className="text-muted-foreground">Prix</dt>
            <dd className="font-semibold">{item.price != null ? `${item.price} crédits` : 'Non disponible'}</dd>
          </div>
          {item.section && (
            <div>
              <dt className="text-muted-foreground">Section boutique</dt>
              <dd className="font-semibold">{item.section}</dd>
            </div>
          )}
          {until && (
            <div>
              <dt className="text-muted-foreground">Disponible jusqu'au</dt>
              <dd className="font-semibold">{until}</dd>
            </div>
          )}
        </dl>
        {item.sourceUrl && (
          <p className="text-xs text-muted-foreground">
            Source: itemshop.gg · Boutique du jour Rocket League.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}