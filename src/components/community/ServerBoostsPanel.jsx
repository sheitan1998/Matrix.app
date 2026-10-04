import React, { useState, useEffect } from "react";
import { Zap, Loader2, Calendar, Clock, User as UserIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysLeft(expiresAt) {
  if (!expiresAt) return 0;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function ServerBoostsPanel({ server, theme }) {
  const [boosts, setBoosts] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!server?.id) return;
    let cancelled = false;
    const fetchBoosts = async () => {
      setLoading(true);
      try {
        const records = await base44.entities.ServerBoostRecord.filter(
          { server_id: server.id },
          { sort: "-created_date", limit: 100 }
        );
        const items = records?.items || records || [];
        if (cancelled) return;
        setBoosts(items);

        const emails = [...new Set(items.map((b) => b.user_email).filter(Boolean))];
        if (emails.length > 0) {
          const userRecords = await base44.entities.User.filter({ email: { $in: emails } });
          const userMap = {};
          (Array.isArray(userRecords) ? userRecords : userRecords?.items || []).forEach((u) => {
            userMap[u.email] = u;
          });
          if (!cancelled) setUsers(userMap);
        }
      } catch {
        if (!cancelled) setBoosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBoosts();
    return () => { cancelled = true; };
  }, [server?.id]);

  const now = new Date();
  const activeBoosts = boosts.filter((b) => new Date(b.expires_at) > now);
  const expiredBoosts = boosts.filter((b) => new Date(b.expires_at) <= now);
  const accent = theme?.accent || "hsl(var(--primary))";

  // Detect legacy boosts: server.boosts counts active boosts, but some were applied
  // before the ServerBoostRecord tracking system existed — they have no individual records.
  const serverBoostCount = server?.boosts || 0;
  const legacyCount = Math.max(0, serverBoostCount - activeBoosts.length);

  const renderBoost = (b, isExpired) => {
    const u = users[b.user_email] || {};
    const name = u.pseudo || u.full_name || b.user_email?.split("@")[0] || "Utilisateur";
    const avatar = u.avatar_url;
    const dLeft = daysLeft(b.expires_at);

    return (
      <div
        key={b.id}
        className="flex items-center gap-3 p-3 rounded-xl border"
        style={{
          borderColor: isExpired ? "rgba(255,255,255,0.05)" : accent + "30",
          background: isExpired ? "rgba(255,255,255,0.02)" : accent + "08",
          opacity: isExpired ? 0.55 : 1,
        }}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: accent + "20" }}>
          {avatar
            ? <img src={avatar} alt="" className="w-full h-full object-cover" />
            : <span className="text-sm font-bold text-white">{(name || "?")[0].toUpperCase()}</span>}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white truncate">{name}</p>
            {isExpired ? (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/40 shrink-0">Expiré</span>
            ) : (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
                style={{ background: accent + "20", color: accent }}>
                <Zap className="w-2.5 h-2.5 inline mr-0.5" fill="currentColor" />
                {dLeft > 0 ? `${dLeft}j restant${dLeft > 1 ? "s" : ""}` : "Expire aujourd'hui"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-[10px] text-white/40 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formatDate(b.created_date)}
            </span>
            <span className="text-[10px] text-white/40 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDate(b.expires_at)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Boosts du serveur</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl p-3 text-center" style={{ background: accent + "10", border: `1px solid ${accent}25` }}>
          <p className="text-2xl font-black text-white">{serverBoostCount}</p>
          <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Compteur serveur</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <p className="text-2xl font-black text-green-400">{activeBoosts.length}</p>
          <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Actifs suivis</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.2)" }}>
          <p className="text-2xl font-black text-yellow-400">{legacyCount}</p>
          <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Historiques</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : boosts.length === 0 ? (
        <div className="text-center py-8">
          <Zap className="w-10 h-10 text-white/10 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Aucun boost enregistré pour ce serveur</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Legacy boosts — applied before the tracking system, no individual records */}
          {legacyCount > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" fill="currentColor" /> Boosts historiques ({legacyCount})
              </p>
              <div className="space-y-2">
                {Array.from({ length: legacyCount }).map((_, i) => (
                  <div
                    key={`legacy-${i}`}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{
                      borderColor: "rgba(250,204,21,0.2)",
                      background: "rgba(250,204,21,0.05)",
                    }}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(250,204,21,0.15)" }}>
                      <UserIcon className="w-4 h-4 text-yellow-400/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white/60">Utilisateur inconnu</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 shrink-0">
                          Antérieur au suivi
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[10px] text-white/30 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Date de début inconnue
                        </span>
                        <span className="text-[10px] text-white/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Date de fin inconnue
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/30 mt-2 italic">
                Ces boosts ont été appliqués avant la mise en place du système de suivi individuel. Le compteur du serveur les inclut, mais aucune information détaillée (utilisateur, dates) n'est disponible.
              </p>
            </div>
          )}

          {/* Active boosts */}
          {activeBoosts.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-400 mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" fill="currentColor" /> Boosts actifs suivis ({activeBoosts.length})
              </p>
              <div className="space-y-2">
                {activeBoosts.map((b) => renderBoost(b, false))}
              </div>
            </div>
          )}

          {/* Expired boosts */}
          {expiredBoosts.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2 mt-4">
                Historique ({expiredBoosts.length})
              </p>
              <div className="space-y-2">
                {expiredBoosts.map((b) => renderBoost(b, true))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}