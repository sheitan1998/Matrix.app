import React, { useState, useEffect } from "react";
import { Zap, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ServerBoostRow from "@/components/community/ServerBoostRow";

export default function ServerBoostsPanel({ server, theme }) {
  const [data, setData] = useState({ boosts: [], legacy_count: 0, server_boosts: 0 });
  const [loading, setLoading] = useState(true);
  const accent = theme?.accent || "#a855f7";

  // Refetch whenever the server's boost counter changes (new boost / expiry)
  useEffect(() => {
    if (!server?.id) return;
    let cancelled = false;
    setLoading(true);
    base44.functions
      .invoke("serverSearch", { action: "getServerBoosts", serverId: server.id })
      .then((res) => { if (!cancelled) setData(res.data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [server?.id, server?.boosts]);

  const active = data.boosts.filter((b) => b.is_active);
  const expired = data.boosts.filter((b) => !b.is_active);
  const legacyCount = data.legacy_count || 0;
  const totalActive = active.length + legacyCount;

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Boosts du serveur</p>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl p-3 text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <p className="text-2xl font-black text-green-400">{totalActive}</p>
          <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Actifs</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: accent + "10", border: `1px solid ${accent}25` }}>
          <p className="text-2xl font-black text-white">{active.length}</p>
          <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Suivis</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.2)" }}>
          <p className="text-2xl font-black text-yellow-400">{legacyCount}</p>
          <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Historiques</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : totalActive === 0 && expired.length === 0 ? (
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
          {expired.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Historique ({expired.length})</p>
              <div className="space-y-2">
                {expired.map((b) => <ServerBoostRow key={b.id} boost={b} accent={accent} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}