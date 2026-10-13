import React from 'react';
import { Users } from 'lucide-react';

export default function LivePlayersBadge({ map }) {
  const known = Number.isFinite(map.live_players) && !!map.last_synced_at;
  const label = known ? `${Number(map.live_players).toLocaleString('fr-FR')} joueurs` : 'Joueurs : indisponible';
  return <span className="inline-flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-[10px] font-bold text-foreground" title={known ? `Pic sur 10 minutes, relevé le ${new Date(map.last_synced_at).toLocaleString('fr-FR')}. Cache 15 minutes, pas un compteur seconde par seconde.` : 'Aucun relevé récent fourni par la source.'}>
    <Users className="h-3 w-3 text-primary" />{label}{known && <span className="text-muted-foreground">· pic 10 min</span>}
  </span>;
}