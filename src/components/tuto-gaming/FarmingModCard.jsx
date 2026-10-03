import React from "react";
import { Download, User } from "lucide-react";

const CATEGORY_LABELS = {
  vehicles: "Véhicules",
  maps: "Maps",
  tools: "Outils",
  factories: "Usines",
  animals: "Animaux",
  scripts: "Scripts",
  others: "Autres",
};

export default function FarmingModCard({ mod, onDownload }) {
  return (
    <div
      className="rounded-xl overflow-hidden border border-white/10 flex flex-col"
      style={{ background: "#1e1e1e" }}
    >
      {/* Header */}
      <div className="p-3 border-b border-white/5 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{mod.title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            {mod.creator_avatar ? (
              <img src={mod.creator_avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-2.5 h-2.5 text-white/50" />
              </div>
            )}
            <span className="text-[10px] text-white/50 truncate">{mod.creator_name || "Créateur"}</span>
          </div>
        </div>
        <span
          className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
          style={{
            background: mod.is_free ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            color: mod.is_free ? "#4ade80" : "#f87171",
          }}
        >
          {mod.is_free ? "Libre de droit" : "Droits réservés"}
        </span>
      </div>

      {/* Description */}
      <div className="p-3 flex-1">
        <p className="text-xs text-white/60 line-clamp-3">
          {mod.description || "Aucune description"}
        </p>
      </div>

      {/* Footer */}
      <div className="p-3 pt-0 flex items-center justify-between gap-2">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">
          {CATEGORY_LABELS[mod.category] || "Autres"}
        </span>
        <button
          onClick={() => onDownload(mod)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition tap-sm"
          style={{ background: "#7DA627", color: "#0a0a0a" }}
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      </div>
    </div>
  );
}