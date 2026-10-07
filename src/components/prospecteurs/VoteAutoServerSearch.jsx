import React, { useState, useEffect } from "react";
import { Search, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TYPE_COLORS = { nexus: "#22c55e", discord: "#5865F2" };

export default function VoteAutoServerSearch({ selectedIds, maxed, onAdd }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(true);

  // Directory list shown by default, filtered live as the user types (debounced)
  useEffect(() => {
    let active = true;
    const q = query.trim();
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke("serverSearch", { action: "searchServers", query: q });
        if (active) setResults((res.data || res).servers || []);
      } catch {
        if (active) setResults([]);
      }
      if (active) setSearching(false);
    }, q ? 250 : 0);
    return () => { active = false; clearTimeout(t); };
  }, [query]);

  return (
    <div>
      <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
        Choisir un serveur (nom, jeu, catégorie, Nexus/Discord...)
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher dans l'annuaire..."
          className="w-full h-10 pl-9 pr-9 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
          style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.2)" }}
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white/30" />}
      </div>
      <div className="mt-1.5 space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
        {!searching && results.length === 0 ? (
          <p className="text-[10px] text-white/30 text-center py-2">Aucun serveur trouvé</p>
        ) : results.map((s) => {
          const isSelected = selectedIds.has(s.id);
          const disabled = isSelected || maxed;
          const logoUrl = s.logo_url || s.profile_image;
          const color = TYPE_COLORS[s.server_type] || TYPE_COLORS.nexus;
          return (
            <button
              key={s.id}
              onClick={() => onAdd(s)}
              disabled={disabled}
              className="w-full flex items-center gap-2 p-2 rounded-lg transition tap-sm"
              style={{
                background: isSelected ? "rgba(34,197,94,0.08)" : "rgba(138,79,255,0.04)",
                border: isSelected ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(138,79,255,0.1)",
                opacity: !isSelected && maxed ? 0.4 : 1,
              }}
            >
              <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black text-white shrink-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}>
                {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-cover" /> : (s.title || "S")[0]?.toUpperCase()}
              </div>
              <span className="text-xs font-bold text-white truncate flex-1 text-left">{s.title}</span>
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded shrink-0 uppercase" style={{ background: `${color}20`, color }}>{s.server_type || "nexus"}</span>
              {isSelected ? <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "#22c55e" }} /> : <span className="text-[9px] text-white/30 shrink-0">+ Ajouter</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}