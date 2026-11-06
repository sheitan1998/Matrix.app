import React from "react";
import { ArrowLeftRight, Trash2, Coins, CheckCircle2 } from "lucide-react";

export default function CosmeticOwnerRow({ owner, user, onAction }) {
  const name = user?.pseudo
    ? `${user.pseudo}${user.pseudo_tag ? `#${user.pseudo_tag}` : ""}`
    : user?.full_name || owner.user_email;

  const acquired = owner.created_date
    ? new Date(owner.created_date).toLocaleDateString("fr-FR")
    : "—";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/5 px-3 py-2.5" style={{ background: "#16121d" }}>
      <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-black text-white" style={{ background: "rgba(168,85,247,0.18)" }}>
        {(user?.pseudo || user?.full_name || owner.user_email || "?").slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-xs font-bold text-white truncate">{name}</p>
          {owner.is_equipped && (
            <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5 shrink-0">
              <CheckCircle2 className="w-3 h-3" /> Équipé
            </span>
          )}
        </div>
        <p className="text-[10px] text-white/35 truncate">
          {owner.user_email} · obtenu le {acquired}
        </p>
      </div>

      <span className="text-[10px] font-mono font-bold shrink-0 px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
        ×{owner.quantity || 1}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onAction("replace", owner)}
          className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-[#a855f7] hover:bg-white/10"
          title="Remplacer cet article"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onAction("compensate", owner)}
          className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-amber-400 hover:bg-white/10"
          title="Créditer un dédommagement"
        >
          <Coins className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onAction("remove", owner)}
          className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-white/10"
          title="Retirer l'article"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}