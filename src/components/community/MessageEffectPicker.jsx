import React, { useState } from "react";
import { Sparkles, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { MESSAGE_EFFECTS } from "@/lib/messageEffects";
import { cn } from "@/lib/utils";

export default function MessageEffectPicker({ value, onChange, locked, accent, disabled }) {
  const [open, setOpen] = useState(false);
  const active = value && value !== "none";

  const select = (key) => {
    onChange(key);
    setOpen(false);
  };

  const handleClick = () => {
    if (locked) {
      toast.error("Effets visuels sur les messages : Niveau 2 de boost requis");
      return;
    }
    setOpen((o) => !o);
  };

  return (
    <div className="relative">
      <button onClick={handleClick} disabled={disabled} title={locked ? "Niveau 2 de boost requis" : "Effets visuels"}
        className={cn("relative w-8 h-8 rounded-xl flex items-center justify-center transition disabled:opacity-30", !active && "text-white/40 hover:text-white")}
        style={active ? { color: accent, background: accent + "20" } : {}}>
        <Sparkles className="w-4 h-4" />
        {locked && <Lock className="w-2.5 h-2.5 absolute bottom-0.5 right-0.5 text-white/50" />}
      </button>

      {open && !locked && (
        <div className="absolute bottom-full left-0 mb-3 w-56 rounded-2xl p-2 z-50" style={{ background: "#13101a", border: `1px solid ${accent}40` }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-1 mb-1.5">Effet du message</p>
          <div className="grid grid-cols-2 gap-1">
            {MESSAGE_EFFECTS.map((fx) => (
              <button key={fx.key} onClick={() => select(value === fx.key ? "none" : fx.key)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition hover:bg-white/5 tap-sm"
                style={value === fx.key ? { background: accent + "25", outline: `1px solid ${accent}` } : {}}>
                <span className="text-sm">{fx.icon}</span>
                <span className={cn("text-[11px] text-white", fx.className)} style={{ "--fx-accent": accent }}>{fx.label}</span>
              </button>
            ))}
          </div>
          {active && (
            <button onClick={() => select("none")} className="w-full mt-1.5 py-1 text-[10px] text-white/40 hover:text-white flex items-center justify-center gap-1 tap-sm">
              <X className="w-3 h-3" /> Retirer l'effet
            </button>
          )}
        </div>
      )}
    </div>
  );
}