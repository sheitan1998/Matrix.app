import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mic, MicOff, Headphones, HeadphoneOff, Settings } from "lucide-react";
import { stripPseudoTag } from "@/lib/format";

export default function UserBar({ user, progress, rank, onOpenProfile }) {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);

  const displayName = stripPseudoTag(user?.full_name) || user?.email?.split("@")[0] || "Utilisateur";

  return (
    <div className="shrink-0 flex items-center gap-1 px-2 py-1.5" style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <button onClick={onOpenProfile} className="flex items-center gap-2 flex-1 min-w-0 px-1.5 py-1 rounded-lg hover:bg-white/5 transition">
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden" style={{ border: rank ? `1.5px solid ${rank.color}40` : "1.5px solid rgba(255,255,255,0.1)" }}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-secondary">{displayName?.[0]?.toUpperCase()}</div>
            )}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{ background: "#22C55E", borderColor: "rgba(0,0,0,0.3)" }} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-bold text-white truncate leading-tight">{displayName}</p>
          <p className="text-[10px] truncate leading-tight" style={{ color: rank?.color || "rgba(255,255,255,0.4)" }}>
            {rank ? `${rank.icon} Niv. ${progress?.level || 1}` : "En ligne"}
          </p>
        </div>
      </button>
      <button
        onClick={() => setMuted(!muted)}
        className="w-7 h-7 rounded-md flex items-center justify-center transition hover:bg-white/10 shrink-0 tap-sm"
        style={{ background: muted ? "rgba(239,68,68,0.15)" : "transparent" }}
        title={muted ? "Activer le micro" : "Couper le micro"}
      >
        {muted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-white/60" />}
      </button>
      <button
        onClick={() => setDeafened(!deafened)}
        className="w-7 h-7 rounded-md flex items-center justify-center transition hover:bg-white/10 shrink-0 tap-sm"
        style={{ background: deafened ? "rgba(239,68,68,0.15)" : "transparent" }}
        title={deafened ? "Activer le son" : "Couper le son"}
      >
        {deafened ? <HeadphoneOff className="w-3.5 h-3.5 text-red-400" /> : <Headphones className="w-3.5 h-3.5 text-white/60" />}
      </button>
      <Link
        to="/mon-profil"
        className="w-7 h-7 rounded-md flex items-center justify-center transition hover:bg-white/10 shrink-0 tap-sm"
        title="Paramètres du compte"
      >
        <Settings className="w-3.5 h-3.5 text-white/60" />
      </Link>
    </div>
  );
}