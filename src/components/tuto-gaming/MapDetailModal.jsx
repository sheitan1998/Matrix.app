import React, { useCallback, useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Eye, Pencil, Share2, User, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCategoryMeta } from "@/components/tuto-gaming/fortniteMapsData";
import { useViewTracker } from "@/hooks/useViewTracker";
import LivePlayersBadge from "@/components/fortnite/LivePlayersBadge";
import FortniteMapImage from "@/components/fortnite/FortniteMapImage";
import { fortniteMapPath } from "@/lib/fortniteRoutes";
import { canonicalUrl, copyText as copyToClipboard, shareOrCopy } from "@/lib/share";

export default function MapDetailModal({ map, onClose, user, onEdit }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState("");
  const [actionError, setActionError] = useState("");
  const cat = getCategoryMeta(map?.category);
  const images = map?.gallery?.length ? map.gallery : (map?.image_url ? [map.image_url] : []);
  const { trackView } = useViewTracker();

  useEffect(() => {
    setActiveIndex(0);
    setCopied("");
    setActionError("");
  }, [map]);

  useEffect(() => {
    if (map?.id && !map.is_api) trackView("fortnite_map", map.id, "FortniteMap");
  }, [map?.id, map?.is_api, trackView]);

  const goTo = useCallback((offset) => {
    if (images.length > 1) setActiveIndex((index) => (index + offset + images.length) % images.length);
  }, [images.length]);

  const copyText = async (value, kind) => {
    try {
      await copyToClipboard(value);
      setActionError("");
      setCopied(kind);
      window.setTimeout(() => setCopied(""), 2000);
    } catch {
      setActionError("La copie a échoué. Vérifiez les autorisations du navigateur.");
    }
  };

  const share = async () => {
    const url = canonicalUrl(fortniteMapPath(map));
    const shareData = { title: map.title, text: `Carte Fortnite ${map.title}`, url };
    try {
      const outcome = await shareOrCopy(shareData);
      setActionError("");
      setCopied(outcome === "copied" ? "link" : "shared");
      window.setTimeout(() => setCopied(""), 2000);
    } catch (error) {
      if (error?.name !== "AbortError") setActionError("Le partage de ce lien a échoué.");
    }
  };

  if (!map) return null;
  const canEdit = user && map.user_email === user.email;
  const currentImageMap = { ...map, image_url: images[activeIndex] || map.image_url };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="z-[101] max-h-[94dvh] max-w-5xl gap-0 overflow-y-auto border-purple-500/30 bg-[#0D0518] p-0 text-white [&>button]:hidden md:grid md:grid-cols-[minmax(0,3fr)_minmax(20rem,2fr)] md:overflow-hidden"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") goTo(1);
          if (event.key === "ArrowLeft") goTo(-1);
        }}
      >
        <section className="min-w-0 bg-[#1a0a2e]" aria-label="Galerie de la carte">
          <div className="relative aspect-video md:h-full md:min-h-[34rem] md:aspect-auto">
            <FortniteMapImage map={currentImageMap} detail className="h-full w-full object-contain" />
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => goTo(-1)} aria-label="Image précédente" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => goTo(1)} aria-label="Image suivante" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold">
                  {activeIndex + 1} / {images.length}
                </span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {images.map((url, index) => (
                <button
                  type="button"
                  key={url}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Afficher l’image ${index + 1}`}
                  aria-current={activeIndex === index}
                  className="h-12 w-20 shrink-0 overflow-hidden rounded-md"
                  style={{ border: activeIndex === index ? "2px solid #BF5AF2" : "1px solid rgba(255,255,255,.1)" }}
                >
                  <img src={url} alt="" width="80" height="48" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="min-w-0 overflow-y-auto">
          <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-purple-500/15 bg-[#0D0518] p-5">
            <div className="min-w-0">
              <span className="mb-2 inline-flex rounded-md px-2 py-1 text-[9px] font-black uppercase tracking-wider" style={{ background: `${cat.color}25`, color: cat.color, border: `1px solid ${cat.color}40` }}>
                {cat.label}
              </span>
              <DialogTitle className="text-xl font-black leading-tight">{map.title}</DialogTitle>
              <DialogDescription className="mt-2 flex items-center gap-2 text-white/55">
                <User className="h-4 w-4" /> Créé par <strong className="text-white">{map.creator_name}</strong>
              </DialogDescription>
            </div>
            <DialogClose aria-label="Fermer" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
              <X className="h-4 w-4" />
            </DialogClose>
          </header>

          <div className="space-y-5 p-5">
            <section aria-labelledby="map-code-title" className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
              <h3 id="map-code-title" className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/50">Code de la map</h3>
              <code className="block break-all text-center font-mono text-xl font-black tracking-widest text-[#BF5AF2]">{map.map_code}</code>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => copyText(map.map_code, "code")} className="flex items-center justify-center gap-2 rounded-lg border border-purple-500/25 bg-purple-500/10 px-3 py-2.5 text-xs font-bold text-[#BF5AF2]">
                  {copied === "code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === "code" ? "Code copié" : "Copier le code"}
                </button>
                <button type="button" onClick={share} className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold">
                  {copied === "link" || copied === "shared" ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  {copied === "link" ? "Lien copié" : copied === "shared" ? "Partagé" : "Partager"}
                </button>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <LivePlayersBadge map={map} />
              {!map.is_api && (
                <span className="flex items-center gap-1.5 text-xs text-white/40">
                  <Eye className="h-3.5 w-3.5" /> {map.views || 0} vue{(map.views || 0) > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <section aria-labelledby="map-rules-title">
              <h3 id="map-rules-title" className="mb-2 text-xs font-black uppercase tracking-wider text-white/50">Règles</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                {map.rules || "Aucune règle distincte n’a été communiquée par la source."}
              </p>
            </section>

            <section aria-labelledby="map-description-title">
              <h3 id="map-description-title" className="mb-2 text-xs font-black uppercase tracking-wider text-white/50">Description</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                {map.description || map.api_description || "Aucune description communiquée par la source."}
              </p>
            </section>

            {actionError && <p role="alert" className="text-xs text-red-400">{actionError}</p>}

            {canEdit && onEdit && (
              <button type="button" onClick={() => onEdit(map)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/15 px-4 py-2.5 text-xs font-bold text-[#BF5AF2]">
                <Pencil className="h-4 w-4" /> Modifier ma map
              </button>
            )}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
