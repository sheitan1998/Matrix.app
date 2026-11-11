import React from "react";
import { Loader2, Save } from "lucide-react";

export default function BotSaveBar({ dirty, saving, onSave }) {
  return (
    <div className="flex items-center justify-end gap-3">
      {dirty && !saving && <span className="text-[11px] text-amber-400">Modifications non enregistrées</span>}
      <button
        type="button"
        onClick={onSave}
        disabled={saving || !dirty}
        className="h-10 px-5 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 transition disabled:opacity-40 tap-sm"
        style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", boxShadow: "0 0 18px rgba(168,85,247,0.35)" }}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}