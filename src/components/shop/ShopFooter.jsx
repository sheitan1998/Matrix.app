import React from "react";
import { Info, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";

export default function ShopFooter() {
  return (
    <footer
      className="mt-8 flex flex-col items-start justify-between gap-3 rounded-2xl px-4 py-4 sm:flex-row sm:items-center"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.18)" }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
          <Info className="h-4 w-4 text-violet-300" />
        </span>
        <div>
          <p className="text-xs font-black text-white">Besoin d'aide ?</p>
          <p className="text-[11px] text-white/40">Consultez notre FAQ ou contactez notre support.</p>
        </div>
      </div>

      <Link
        to="/contact"
        className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-black text-white transition hover:opacity-90"
        style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", border: "1px solid rgba(196,181,253,0.35)" }}
      >
        <LifeBuoy className="h-3.5 w-3.5" />
        Accéder au support
      </Link>
    </footer>
  );
}