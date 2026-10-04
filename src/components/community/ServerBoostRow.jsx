import React from "react";
import { Zap, Calendar, Clock, History } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function daysLeft(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function ServerBoostRow({ boost, accent, legacy = false }) {
  const expired = !legacy && !boost.is_active;
  const dLeft = legacy || expired ? 0 : daysLeft(boost.expires_at);
  const color = legacy ? "#FACC15" : accent;
  const name = legacy ? "Boost historique" : boost.user_name;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border"
      style={{
        borderColor: expired ? "rgba(255,255,255,0.05)" : color + "30",
        background: expired ? "rgba(255,255,255,0.02)" : color + "0D",
        opacity: expired ? 0.55 : 1,
      }}
    >
      <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: color + "20" }}>
        {legacy ? <History className="w-4 h-4" style={{ color }} />
          : boost.user_avatar ? <img src={boost.user_avatar} alt="" className="w-full h-full object-cover" />
          : <span className="text-sm font-bold text-white">{(name || "?")[0].toUpperCase()}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-white truncate">{name}</p>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: expired ? "rgba(255,255,255,0.1)" : color + "20", color: expired ? "rgba(255,255,255,0.4)" : color }}>
            {legacy ? "Anonyme · antérieur au suivi" : expired ? "Expiré" : (
              <><Zap className="w-2.5 h-2.5 inline mr-0.5" fill="currentColor" />{dLeft > 1 ? `${dLeft}j restants` : dLeft === 1 ? "1j restant" : "Expire aujourd'hui"}</>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap text-[10px] text-white/40">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Début : {legacy ? "non enregistré" : formatDate(boost.started_at)}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Fin : {legacy ? "aucune expiration programmée" : formatDate(boost.expires_at)}</span>
        </div>
      </div>
    </div>
  );
}