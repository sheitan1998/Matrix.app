import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function CreatorDeleteConfirm({ creator, busy, onCancel, onConfirm }) {
  if (!creator) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,15,0.88)", backdropFilter: "blur(6px)" }}
      onClick={busy ? undefined : onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5"
        style={{ background: "#12091c", border: "1px solid rgba(239,68,68,0.35)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h2 className="text-sm font-black uppercase tracking-wider text-white">Supprimer l'annonce</h2>
        </div>
        <p className="text-xs text-white/60 leading-relaxed mb-4">
          L'annonce <span className="text-white font-bold">{creator.name}</span> sera définitivement retirée du
          classement Best Creator, avec ses votes.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 h-10 rounded-xl text-xs font-bold text-white/70 transition disabled:opacity-50 tap-sm"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 h-10 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-1.5 transition disabled:opacity-50 tap-sm"
            style={{ background: "linear-gradient(135deg, #ef4444, #b91c1c)" }}
          >
            <Trash2 className="w-4 h-4" />
            {busy ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}