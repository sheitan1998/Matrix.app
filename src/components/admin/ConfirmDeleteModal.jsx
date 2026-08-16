import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDeleteModal({ title, onConfirm, onCancel }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onCancel}
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 p-6 text-center"
        style={{ background: "#0d0518" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2">
          Supprimer cet élément ?
        </h3>
        <p className="text-xs text-white/50 mb-5">
          « {title} » sera définitivement supprimé. Cette action est irréversible.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg text-xs font-bold text-white/70 border border-white/10 hover:bg-white/5 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
            style={{ background: "#ef4444" }}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}