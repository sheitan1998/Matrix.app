import React from "react";
import { Zap, Loader2 } from "lucide-react";
import { useServerBoosts } from "@/hooks/useServerBoosts";
import ServerBoostRow from "@/components/community/ServerBoostRow";

export default function ServerBoostsPanel({ server, theme }) {
  const accent = theme?.accent || "#a855f7";
  const { boosts, legacyCount, loading, activeCount } = useServerBoosts(server?.id, server?.boosts);

  const active = boosts.filter((b) => b.is_active);
  const expired = boosts.filter((b) => !b.is_active);
  const totalActive = activeCount;

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Boosts du serveur</p>

      <div className="rounded-xl p-4 text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
        <p className="text-3xl font-black text-green-400">{totalActive}</p>
        <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Boosts actifs du serveur</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : totalActive === 0 ? (
        <div className="text-center py-8">
          <Zap className="w-10 h-10 text-white/10 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Aucun boost pour ce serveur</p>
        </div>
      ) : (
        <div className="space-y-4">
          {totalActive > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-400 mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" fill="currentColor" /> Boosts actifs ({totalActive})
              </p>
              <div className="space-y-2">
                {active.map((b) => <ServerBoostRow key={b.id} boost={b} accent={accent} />)}
                {Array.from({ length: legacyCount }).map((_, i) => <ServerBoostRow key={`legacy-${i}`} legacy accent={accent} />)}
              </div>
              {legacyCount > 0 && (
                <p className="text-[10px] text-white/30 mt-2 italic">
                  Les boosts historiques ont été appliqués avant la mise en place du suivi : aucune donnée sur l'auteur ou les dates n'a été conservée.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}