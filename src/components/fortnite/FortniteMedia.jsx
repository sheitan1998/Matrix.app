import React, { useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';

export default function FortniteMedia({ item, detail = false, active = false }) {
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const image = item.image || item.images?.featured || item.images?.icon || item.images?.smallIcon;
  const youtube = /^[\w-]{11}$/.test(item.showcase_video || '') ? item.showcase_video : null;
  const direct = item.video || (/\.(mp4|webm)(\?|$)/i.test(item.images?.animated || '') ? item.images.animated : null);
  const animated = !direct && item.images?.animated;
  const playing = !failed && (detail || active);
  return <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
    {playing && direct ? <video key={direct} src={direct} poster={image} autoPlay loop muted={muted} playsInline controls={detail} preload={detail ? 'metadata' : 'none'} onError={() => setFailed(true)} className="h-full w-full object-contain" aria-label={`Aperçu de ${item.name}`} />
      : detail && youtube ? <iframe key={`${youtube}:${muted}`} src={`https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${youtube}&controls=1&playsinline=1&rel=0`} title={`Vidéo de présentation de ${item.name}`} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="aspect-video w-full border-0" />
      : image || animated ? <img src={playing && animated ? animated : image || animated} alt={item.name} loading={detail ? 'eager' : 'lazy'} className="h-full w-full object-contain p-2" />
      : <span className="text-sm text-muted-foreground">Image non fournie</span>}
    {!detail && (direct || youtube || animated) && <span className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-foreground"><Play className="h-3 w-3" /></span>}
    {detail && (direct || youtube) && !failed && <button onClick={() => setMuted(value => !value)} className="absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-background/90 px-3 py-2 text-xs text-foreground" aria-label={muted ? 'Activer le son de la vidéo' : 'Couper le son de la vidéo'}>
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}{muted ? 'Activer le son' : 'Couper le son'}
    </button>}
    {detail && !direct && !youtube && !animated && <p className="absolute bottom-3 rounded-lg bg-background/90 px-3 py-2 text-xs text-muted-foreground">Animation non fournie par la source pour cet objet.</p>}
    {detail && failed && <p role="status" className="absolute bottom-3 bg-background/90 p-2 text-xs text-muted-foreground">Vidéo indisponible.</p>}
  </div>;
}