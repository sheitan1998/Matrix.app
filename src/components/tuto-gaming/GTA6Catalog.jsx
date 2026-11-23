import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import GTA6GalleryCard from "@/components/tuto-gaming/GTA6GalleryCard";

const ALL = "__all__";
const normalize = (value) =>
  String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");

const searchableText = (item) =>
  normalize(
    [item.name, item.desc, item.tag, item.category, item.subtitle, item.faction, item.brand, item.vehicleClass, item.ammoType]
      .filter(Boolean)
      .join(" ")
  );

export default function GTA6Catalog({ items, onSelect, label }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category || item.tag).filter(Boolean))],
    [items]
  );

  const visible = useMemo(() => {
    const needle = normalize(query).trim();
    return items.filter((item) => {
      if (category !== ALL && (item.category || item.tag) !== category) return false;
      return !needle || searchableText(item).includes(needle);
    });
  }, [items, query, category]);

  const chip = (active) =>
    active
      ? { background: "linear-gradient(135deg, #BF5AF2, #9333EA)", color: "#fff", boxShadow: "0 0 12px rgba(191,90,242,0.35)" }
      : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" };

  return (
    <div className="space-y-4 min-w-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Rechercher : ${label}`}
          aria-label={`Rechercher : ${label}`}
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-9 text-sm text-foreground outline-none focus:border-primary"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[ALL, ...categories].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              aria-pressed={category === value}
              className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition tap-sm"
              style={chip(category === value)}
            >
              {value === ALL ? "Tout" : value}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground" role="status">
        {visible.length} / {items.length} fiche{items.length > 1 ? "s" : ""}
      </p>

      {visible.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((item) => (
            <GTA6GalleryCard key={`${item.type}:${item.id}`} item={item} onClick={onSelect} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucune fiche ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
}
