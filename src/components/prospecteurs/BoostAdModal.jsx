import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Flame, Zap, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import TrixIcon from "@/components/TrixIcon";

export default function BoostAdModal({ adId, adTitle, flashBoosts, trixBalance, onBoosted, onClose }) {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState(null);

  const handleBoost = async (selectedMethod) => {
    setLoading(true);
    setMethod(selectedMethod);
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "boost",
        serverAdId: adId,
        method: selectedMethod,
      });
      if (res.data?.success) {
        toast.success("Boost envoyé ! +1 vote pour ce serveur");
        onBoosted(res.data);
        onClose();
      } else {
        toast.error(res.data?.error || "Erreur lors du boost");
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Erreur lors du boost";
      toast.error(msg);
    } finally {
      setLoading(false);
      setMethod(null);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(251,191,36,0.15)" }}>
              <Flame className="w-4 h-4" style={{ color: "#fbbf24" }} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Booster l'annonce</h2>
              <p className="text-[10px] text-white/40 truncate max-w-[200px]">{adTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-white/50 text-center mb-2">Choisis ta méthode de boost — illimité !</p>

          {/* Flash Boost option */}
          <button
            onClick={() => handleBoost("flash")}
            disabled={loading}
            className="w-full p-4 rounded-xl text-left transition hover:opacity-90 disabled:opacity-50 flex items-center gap-3"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(251,191,36,0.15)" }}>
              {loading && method === "flash" ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#fbbf24" }} /> : <Zap className="w-5 h-5" style={{ color: "#fbbf24" }} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Flash Boost</p>
              <p className="text-[10px] text-white/40">Boost + 1 vote pour le serveur</p>
            </div>
            <span className="text-xs font-bold" style={{ color: flashBoosts > 0 ? "#fbbf24" : "#ef4444" }}>
              {flashBoosts} dispo
            </span>
          </button>

          {/* Trix option */}
          <button
            onClick={() => handleBoost("trix")}
            disabled={loading || trixBalance < 200}
            className="w-full p-4 rounded-xl text-left transition hover:opacity-90 disabled:opacity-50 flex items-center gap-3"
            style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
              {loading && method === "trix" ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#a855f7" }} /> : <TrixIcon size={20} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">200 Trix</p>
              <p className="text-[10px] text-white/40">Boost + 1 vote pour le serveur</p>
            </div>
            <span className="text-xs font-bold" style={{ color: trixBalance >= 200 ? "#a855f7" : "#ef4444" }}>
              {trixBalance >= 200 ? "OK" : "Insuffisant"}
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[9px] text-white/30 text-center">
            🔁 Les boosts sont réinitialisés chaque 1er du mois
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}