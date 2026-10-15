import React, { useEffect, useState } from 'react';
import { Check, Loader2, Share2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { getFortniteItemStyle } from '@/components/fortnite/rarityUtils';
import FortniteMedia from '@/components/fortnite/FortniteMedia';
import FortniteItemFacts from '@/components/fortnite/FortniteItemFacts';
import FortniteItemGallery from '@/components/fortnite/FortniteItemGallery';
import CosmeticReactionBar from '@/components/fortnite/CosmeticReactionBar';
import useFortniteDetail from '@/components/fortnite/useFortniteDetail';
import { fortniteCosmeticPath } from '@/lib/fortniteRoutes';
import { canonicalUrl, shareOrCopy } from '@/lib/share';

export default function FortniteItemDialog({ item, onClose, onSelect, user, fullscreen = false }) {
  const [active, setActive] = useState(item);
  const [shareStatus, setShareStatus] = useState('');
  const [shareError, setShareError] = useState('');
  useEffect(() => setActive(item), [item]);
  useEffect(() => {
    setShareStatus('');
    setShareError('');
  }, [active?.id]);
  const { full, loading, error, setItems, counts } = useFortniteDetail(active);
  const selectItem = (nextItem) => {
    setActive(nextItem);
    onSelect?.(nextItem);
  };
  const style = full ? getFortniteItemStyle(full) : {};
  const share = async () => {
    const url = canonicalUrl(fortniteCosmeticPath(full));
    try {
      const outcome = await shareOrCopy({ title: full.name, text: `Cosmétique Fortnite : ${full.name}`, url });
      setShareError('');
      setShareStatus(outcome === 'copied' ? 'Lien copié' : 'Partagé');
      window.setTimeout(() => setShareStatus(''), 2000);
    } catch (error) {
      if (error?.name !== 'AbortError') setShareError('Le partage de ce lien a échoué.');
    }
  };
  return <Dialog open={!!item} onOpenChange={open => { if (!open) onClose(); }}>
    {item && full && <DialogContent className={fullscreen
        ? 'inset-0 left-0 top-0 z-[101] flex h-[100dvh] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none border-0 p-0 sm:rounded-none md:flex-row [&>button]:hidden data-[state=open]:animate-none data-[state=closed]:animate-none'
        : 'z-[101] flex max-h-[92dvh] max-w-6xl flex-col gap-0 overflow-y-auto p-0 md:flex-row [&>button]:hidden'} aria-describedby="fortnite-media-note">
        <div className={`group/media relative shrink-0 ${fullscreen ? 'h-[45dvh] md:h-full md:w-2/3' : 'h-72 md:h-auto md:min-h-[60vh] md:w-3/5'}`} style={{ background: style.bg }}>
          <FortniteMedia key={full.id} item={full} detail />
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto bg-background text-foreground">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background p-5">
            <DialogTitle className="text-xl font-black">{full.name}</DialogTitle><DialogClose className="shrink-0 rounded-lg bg-muted p-2" aria-label="Fermer"><X className="h-5 w-5" /></DialogClose>
          </header>
          <div className="space-y-5 p-5">
            <DialogDescription id="fortnite-media-note" className="text-xs">Aperçu fourni par Fortnite-API. Le son s’active dans le lecteur ; certains objets n’ont pas de vidéo.</DialogDescription>
            {loading && <span className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Chargement des détails…</span>}
            {error && <p role="status" className="text-xs text-muted-foreground">Détails complémentaires indisponibles.</p>}
            <button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-bold">
              {shareStatus ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {shareStatus || 'Partager'}
            </button>
            {shareError && <p role="alert" className="text-xs text-destructive">{shareError}</p>}
            <FortniteItemFacts item={full} />
            <section className="border-t border-border pt-4"><h3 className="mb-2 text-xs uppercase text-muted-foreground">Réactions communautaires</h3><CosmeticReactionBar key={full.id} cosmetic={full} user={user} counts={counts} compact={false} /></section>
            <FortniteItemGallery title="Contenu de l’offre" items={full.included_items?.length > 1 ? full.included_items : []} onSelect={selectItem} />
            <FortniteItemGallery title="Même ensemble" items={setItems.filter(i => i.id !== full.id)} onSelect={selectItem} />
          </div>
        </div>
      </DialogContent>}
  </Dialog>;
}