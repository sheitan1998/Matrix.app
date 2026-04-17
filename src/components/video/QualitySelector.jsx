import React, { useState } from "react";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const QUALITIES = ["Auto", "1080p", "720p", "480p", "360p", "144p"];

export default function QualitySelector({ onSelect, current = "Auto" }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-semibold transition border border-white/10"
      >
        <Settings className="w-3.5 h-3.5" />
        {current}
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-black/95 border border-white/10 rounded-xl overflow-hidden w-32 shadow-2xl z-50">
          {QUALITIES.map((q) => (
            <button
              key={q}
              onClick={() => { onSelect?.(q); setOpen(false); }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm transition",
                q === current ? "bg-white/10 text-primary font-semibold" : "text-white hover:bg-white/10"
              )}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}