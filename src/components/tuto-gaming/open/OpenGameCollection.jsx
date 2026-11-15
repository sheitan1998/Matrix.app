import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import OpenGameItemCard from "@/components/tuto-gaming/open/OpenGameItemCard";
import { RARITY_LABELS, rarityMeta } from "@/lib/openGames";

const PAGE_SIZE = 24;

// Grille complète : recherche, filtre par rareté et pagination (24 fiches par page).
export default function OpenGameCollection({ items, accent, fallback, onSelect }) {
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("all");
  const [page, setPage] = useState(0);

  const rarities = useMemo(() => {
    const present = new Set(items.map((item) => rarityMeta(item.rarity).key));
    return ["all", ...Object.keys(RARITY_LABELS).filter((key) => present.has(key))];
  }, [items]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (rarity !== "all" && rarityMeta(item.rarity).key !== rarity) return false;
      if (!query) return true;
      return `${item.name} ${item.desc || ""} ${item.tag || ""}`.toLowerCase().includes(query);
    });
  }, [items, rarity, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  const chip = (key) => {
    const active = rarity === key;
    const color = key === "all" ? accent : rarityMeta(key).color;
    return (
      <button
        key={key}
        type="button"
        onClick={() => { setRarity(key); setPage(0); }}
        aria-pressed={active}
        className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider tap-sm"
        style={{
          background: active ? `${color}22` : "rgba(255,255,255,0.03)",
          color: active ? color : "rgba(255,255,255,0.45)",
          border: `1px solid ${active ? `${color}88` : "rgba(255,255,255,0.08)"}`,
        }}
      >
        {key === "all" ? "Toutes raretés" : RARITY_LABELS[key]}
      </button>
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-2.5 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-2 h-9 px-3 rounded-lg flex-1 min-w-[180px]"
            style={{ background: "rgba(13,5,24,0.8)", border: `1px solid ${accent}33` }}
          >
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Rechercher dans les fiches…"
              className="bg-transparent text-xs text-white/80 placeholder:text-white/30 outline-none w-full"
            />
          </div>
          <span className="text-[10px] font-bold text-white/35">
            {filtered.length} fiche{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {rarities.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {rarities.map(chip)}
          </div>
        )}
      </div>

      {visible.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((item, i) => (
            <OpenGameItemCard
              key={`${item.id}-${i}`}
              item={item}
              accent={accent}
              fallback={fallback}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/40 py-8 text-center">
          Aucune fiche ne correspond à cette recherche.
        </p>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="w-8 h-8 rounded-lg flex items-center justify-center tap-sm disabled:opacity-30"
            style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}44` }}
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-bold text-white/60">
            Page {currentPage + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))}
            disabled={currentPage >= pageCount - 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center tap-sm disabled:opacity-30"
            style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}44` }}
            aria-label="Page suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}