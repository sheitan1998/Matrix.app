import React from "react";
import { Search, Trash2, Activity, AlertCircle } from "lucide-react";
import { formatRelative } from "@/lib/relativeTime";

export const MAX_SERVERS = 3;

export default function VoteAutoSlots({ servers, onRemove }) {
  const slots = servers.slice(0, MAX_SERVERS);
  while (slots.length < MAX_SERVERS) slots.push(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">Mes 3 serveurs</label>
        <span className="text-[9px] font-bold" style={{ color: "#a855f7" }}>{servers.length}/{MAX_SERVERS}</span>
      </div>
      <div className="space-y-1.5">
        {slots.map((s, i) => s ? (
          <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg" style={s.missing
            ? { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }
            : { background: "rgba(138,79,255,0.12)", border: "1px solid rgba(138,79,255,0.35)" }}>
            <span className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black shrink-0" style={{ background: "rgba(138,79,255,0.3)", color: "#a855f7" }}>{i + 1}</span>
            <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-black text-white shrink-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}>
              {s.missing ? <AlertCircle className="w-3.5 h-3.5" /> : (s.logo_url || s.profile_image) ? <img src={s.logo_url || s.profile_image} alt="" className="w-full h-full object-cover" /> : (s.title || "S")[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{s.title}</p>
              <div className="flex items-center gap-1.5 text-[9px] text-white/40">
                <span className="flex items-center gap-0.5"><Activity className="w-2.5 h-2.5" />{s.votes_month || 0} votes/mois</span>
                {s.last_auto_voted_at && <span style={{ color: "#a855f7" }}>• voté {formatRelative(s.last_auto_voted_at)}</span>}
              </div>
            </div>
            {onRemove && (
              <button onClick={() => onRemove(s.id)} className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-red-400 transition tap-sm" title="Retirer ce serveur">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div key={`empty-${i}`} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(138,79,255,0.03)", border: "1px dashed rgba(138,79,255,0.2)" }}>
            <span className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black shrink-0 text-white/20">{i + 1}</span>
            <div className="w-7 h-7 rounded flex items-center justify-center text-white/20 shrink-0" style={{ background: "rgba(138,79,255,0.05)" }}>
              <Search className="w-3 h-3" />
            </div>
            <p className="text-[10px] text-white/30 flex-1">{onRemove ? "Slot libre — choisis un serveur ci-dessous" : "Slot libre"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}