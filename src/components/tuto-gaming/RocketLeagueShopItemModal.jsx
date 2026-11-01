import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { rarityNeon, DAILY_SHOP_CATEGORY_LABELS } from './rocketLeagueShopData';
import RocketLeaguePaintSwatches, { ROCKET_PAINTS } from './RocketLeaguePaintSwatches';
import { Play, ImageIcon } from 'lucide-react';

export default function RocketLeagueShopItemModal({ item, onClose }) {
  const [paintId, setPaintId] = useState(item?.selectedPaintId || 'default');
  const [showVideo, setShowVideo] = useState(false);
  if (!item) return null;
  const neon = rarityNeon(item.rarity, item.rarityColor);
  const categoryLabel = DAILY_SHOP_CATEGORY_LABELS[item.category] || item.category || 'Objet';
  const until = item.availableUntil ? new Date(item.availableUntil).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : null;
  const selectedPaint = ROCKET_PAINTS.find(p => p.id === paintId);
  const overlayColor = selectedPaint?.color;
  const hasVideo = Boolean(item.videoUrl);

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto" style={{ border: `2px solid ${neon.color}`, boxShadow: `0 0 30px ${neon.glow}` }}>
        <DialogTitle className="text-xl font-black" style={{ color: neon.color }}>{item.name}</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {item.type} · {neon.label}
        </DialogDescription>

        {/* Media area: image with paint overlay, or video */}
        <div className="relative mx-auto aspect-video w-full max-w-md overflow-hidden rounded-xl" style={{ background: '#0a0a0f', border: `1px solid ${neon.color}` }}>
          {showVideo && hasVideo ? (
            <video src={item.videoUrl} controls autoPlay loop muted className="absolute inset-0 h-full w-full object-contain" />
          ) : (
            <>
              {item.image ? (
                <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-contain p-4" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-3xl font-black" style={{ color: neon.color }}>RL</div>
              )}
              {overlayColor && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: overlayColor, mixBlendMode: 'multiply', opacity: 0.45 }} />
              )}
            </>
          )}
        </div>

        {/* Video toggle */}
        {hasVideo && (
          <button
            type="button"
            onClick={() => setShowVideo(v => !v)}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold"
          >
            {showVideo ? <><ImageIcon className="h-3.5 w-3.5" /> Voir l'image fixe</> : <><Play className="h-3.5 w-3.5" /> Voir l'aperçu animé / Vidéo</>}
          </button>
        )}

        {/* Paint selector */}
        <div className="rounded-xl bg-muted p-3">
          <p className="mb-2 text-xs font-bold text-muted-foreground">Peinture / Variante</p>
          <RocketLeaguePaintSwatches selected={paintId} onSelect={setPaintId} />
          {selectedPaint && (
            <p className="mt-1 text-[10px] text-muted-foreground">Aperçu: {selectedPaint.name}</p>
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
              <dt className="text-muted-foreground">Peinture boutique</dt>
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
        <p className="text-xs text-muted-foreground">
          Source: itemshop.gg · Boutique du jour Rocket League.
        </p>
      </DialogContent>
    </Dialog>
  );
}