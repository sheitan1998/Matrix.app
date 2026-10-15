import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronLeft, ChevronRight, Languages, Loader2, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import GamingRemoteImage from '@/components/tuto-gaming/GamingRemoteImage';
import DownloadModButton from '@/components/tuto-gaming/DownloadModButton';
import ModHubSpecs from '@/components/tuto-gaming/ModHubSpecs';
import { FARMING_FALLBACK } from '@/components/tuto-gaming/farmingFallback';
import { farmingModShareUrl } from '@/components/tuto-gaming/farmingModCatalog';

export default function ModHubDetailModal({ modId, initialMod, onClose }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [translation, setTranslation] = useState('');
  const [translationError, setTranslationError] = useState('');
  const [translating, setTranslating] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const { data: mod, isFetching, isError, error } = useQuery({
    queryKey: ['farming-mod-detail', modId],
    initialData: initialMod || FARMING_FALLBACK.find(item => item.id === String(modId)),
    initialDataUpdatedAt: 0,
    staleTime: 60 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const { data } = await base44.functions.invoke('farmingModApi', { action: 'getModDetails', modId });
      if (data.error) throw new Error(data.error);
      return data;
    },
  });

  const images = useMemo(() => {
    const values = [...(mod?.images || []), mod?.hdImg, mod?.img].filter(Boolean);
    return values.filter((value, index) => values.indexOf(value) === index);
  }, [mod]);

  useEffect(() => {
    setImageIndex(0);
    setTranslation('');
    setTranslationError('');
    setShareStatus('');
  }, [modId]);

  const moveImage = direction => {
    setImageIndex(current => (current + direction + images.length) % images.length);
  };

  const translate = async () => {
    if (!mod?.description || translating) return;
    setTranslating(true);
    setTranslationError('');
    try {
      const { data } = await base44.functions.invoke('farmingModApi', {
        action: 'translateDescription',
        description: mod.description,
      });
      if (data.error || !data.translation) throw new Error(data.error || 'Traduction vide.');
      setTranslation(data.translation);
    } catch (translateError) {
      setTranslationError(translateError instanceof Error ? translateError.message : 'Traduction indisponible.');
    } finally {
      setTranslating(false);
    }
  };

  const copyShareLink = async () => {
    const url = farmingModShareUrl(modId);
    if (!url) {
      setShareStatus('Impossible de créer le lien de partage.');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('Lien copié');
    } catch {
      setShareStatus('Copie impossible. Autorisez l’accès au presse-papiers puis réessayez.');
    }
  };

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 pr-8">
          <DialogTitle>{mod?.title || 'Détails du mod'}</DialogTitle>
          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold"
            aria-label={`Copier le lien de partage${mod?.title ? ` de ${mod.title}` : ''}`}
          >
            {shareStatus === 'Lien copié' ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {shareStatus === 'Lien copié' ? 'Lien copié' : 'Partager'}
          </button>
        </div>
        {shareStatus && shareStatus !== 'Lien copié' && <p role="alert" className="text-xs text-destructive">{shareStatus}</p>}
        <DialogDescription>
          {mod
            ? `Par ${mod.author || 'Auteur non renseigné'} · ${mod.category || 'Mod Farming Simulator 25'}`
            : 'Chargement des détails du ModHub.'}
        </DialogDescription>

        {isFetching && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
            <Loader2 className="h-4 w-4 animate-spin" /> Actualisation des détails…
          </p>
        )}
        {isError && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
            Détails indisponibles : {error?.message || 'erreur inconnue'}.
            {mod ? ' Les informations de référence restent affichées.' : ''}
          </p>
        )}

        {mod && (
          <>
            {images.length > 0 ? (
              <section aria-label={`Galerie de ${mod.title}`}>
                <div className="relative">
                  <GamingRemoteImage
                    src={images[imageIndex]}
                    alt={`${mod.title} — capture ${imageIndex + 1} sur ${images.length}`}
                    className="aspect-video w-full rounded-xl"
                    contain={false}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveImage(-1)}
                        aria-label="Capture précédente"
                        className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(1)}
                        aria-label="Capture suivante"
                        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Choisir une capture">
                    {images.map((image, index) => (
                      <button
                        key={image}
                        type="button"
                        role="tab"
                        aria-selected={imageIndex === index}
                        aria-label={`Afficher la capture ${index + 1}`}
                        onClick={() => setImageIndex(index)}
                        className={`h-2 min-w-8 rounded-full ${imageIndex === index ? 'bg-primary' : 'bg-muted'}`}
                      />
                    ))}
                  </div>
                )}
                <p className="sr-only" aria-live="polite">Capture {imageIndex + 1} sur {images.length}</p>
              </section>
            ) : (
              <p className="rounded-xl bg-muted p-8 text-center text-sm text-muted-foreground">Aucune capture fournie par GIANTS.</p>
            )}

            <section>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">Description</h3>
                {mod.description && (
                  <button
                    type="button"
                    onClick={translate}
                    disabled={translating}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold disabled:opacity-50"
                  >
                    {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                    {translation ? 'Retraduire en français' : 'Traduire en français'}
                  </button>
                )}
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {translation || mod.description || (isFetching ? 'Chargement de la description…' : 'Description non renseignée.')}
              </p>
              {translation && <p className="mt-2 text-xs text-muted-foreground">Traduction automatique — vérifiez les termes techniques.</p>}
              {translationError && <p role="alert" className="mt-2 text-xs text-destructive">{translationError}</p>}
            </section>
            <ModHubSpecs mod={mod} />
            <DownloadModButton mod={mod} />
            <p className="text-xs text-muted-foreground">
              Source et licence : fichier servi directement depuis le ModHub officiel GIANTS. Matrix.app ne réhéberge ni ne modifie le ZIP.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
