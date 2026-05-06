import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileSelect({ value, onChange, options, placeholder = "Sélectionner" }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.key === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-11 px-3 rounded-md border border-input bg-transparent text-sm flex items-center justify-between select-none"
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full bg-card border-t border-border rounded-t-3xl max-h-[70vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <p className="text-sm font-bold px-5 pb-3 shrink-0 text-muted-foreground">{placeholder}</p>
            <div className="overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => { onChange(opt.key); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-4 text-sm font-medium border-b border-border/40 last:border-0 transition select-none",
                    value === opt.key ? "text-primary" : "text-foreground hover:bg-secondary/40"
                  )}
                >
                  {opt.label}
                  {value === opt.key && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}