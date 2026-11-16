import React from "react";
import { Loader2, Save, Undo2 } from "lucide-react";

// Barre flottante : apparaît dès qu'une modification est en attente.
export default function BotSaveBar({ dirty, saving, onSave, onReset }) {
  if (!dirty && !saving) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-5 z-40 w-[calc(100%-1.5rem)] max-w-xl">
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
        style={{ background: "rgba(18,9,28,0.97)", border: "1px solid rgba(168,85,247,0.4)", boxShadow: "0 12px 40px rgba(0,0,0,0.55)" }}
      >
        <span className="text-[11px] font-bold text-amber-400 flex-1 min-w-0 truncate">Modifications non enregistrées</span>
        <button
          type="button"
          onClick={onReset}
          disabled={saving}
          className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition disabled:opacity-40 tap-sm"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)" }}
        >
          <Undo2 className="w-3.5 h-3.5" /> Annuler
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="h-9 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider text-white flex items-center gap-1.5 transition disabled:opacity-40 tap-sm"
          style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", boxShadow: "0 0 18px rgba(168,85,247,0.35)" }}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? "Enregistrement" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}