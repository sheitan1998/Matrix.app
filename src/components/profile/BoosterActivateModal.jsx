import React, { useState } from "react";
import { Zap, Clock, X, Check } from "lucide-react";

function formatRemaining(expiresAt) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expiré";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export default function BoosterActivateModal({ stack, booster, activeBoost, activating, onConfirm, onClose }) {
  const maxQty = stack.quantity || 1;
  const [qty, setQty] = useState(1);

  const meta = stack;
  const color = meta.color;
  const totalHours = (booster.duration_hours || 1) * qty;
  const isActive = activeBoost?.booster_id === booster.id;
  const remainingStr = isActive ? formatRemaining(activeBoost.expires_at) : null;

  const newTotal = isActive
    ? `${remainingStr} + ${totalHours}h = cumulé`
    : `${totalHours}h`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-5" style={{ background: "#0f0a19", border: `1px solid ${color}40` }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20`, boxShadow: `0 0 12px ${color}30` }}>
              <Zap className="w-5 h-5" style={{ color }} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{meta.name}</h3>
              <p className="text-[10px] text-white/40">{meta.subtitle} · {maxQty} en stock</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 tap-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active boost status */}
        {isActive && remainingStr && (
          <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
            <Clock className="w-4 h-4 shrink-0" style={{ color }} />
            <div>
              <p className="text-[10px] font-bold text-white/60">Booster actif en cours</p>
              <p className="text-xs font-black" style={{ color }}>Temps restant : {remainingStr}</p>
            </div>
          </div>
        )}

        {/* Quantity selector */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Quantité à activer</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white disabled:opacity-30 transition tap-sm"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-black" style={{ color }}>{qty}</span>
            </div>
            <button onClick={() => setQty(Math.min(maxQty, qty + 1))} disabled={qty >= maxQty}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white disabled:opacity-30 transition tap-sm"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              +
            </button>
          </div>
          {/* Quick select buttons */}
          {maxQty > 1 && (
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 5, maxQty].filter((v, i, arr) => v <= maxQty && arr.indexOf(v) === i).map(v => (
                <button key={v} onClick={() => setQty(v)}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition tap-sm"
                  style={qty === v ? { background: `${color}30`, color } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                  {v === maxQty ? `Tout (${v})` : v}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Duration summary */}
        <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <Clock className="w-4 h-4 text-white/40 shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] text-white/40">Durée {isActive ? "à ajouter" : "totale"}</p>
            <p className="text-xs font-bold text-white">
              {booster.duration_hours * qty}h
              {isActive && <span className="text-white/40 font-normal"> (cumul avec le booster actif)</span>}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-lg text-xs font-bold text-white/60" style={{ background: "rgba(255,255,255,0.05)" }}>
            Annuler
          </button>
          <button onClick={() => onConfirm(qty)} disabled={activating}
            className="flex-1 h-10 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
            {activating ? "..." : (<><Zap className="w-3.5 h-3.5" /> Activer {qty > 1 ? `x${qty}` : ""}</>)}
          </button>
        </div>
      </div>
    </div>
  );
}