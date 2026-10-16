import React, { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import {
  ENCYCLOPEDIA_CATEGORIES,
  filterMinecraftEntries,
  MINECRAFT_DATA_VERSION,
  MINECRAFT_ENTRIES,
} from "@/lib/minecraftData";
import MinecraftVisual from "./MinecraftVisual";
import MinecraftEntryDialog from "./MinecraftEntryDialog";

const INITIAL_LIMIT = 48;

export default function MinecraftEncyclopedia() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const results = useMemo(
    () => filterMinecraftEntries(MINECRAFT_ENTRIES, query, category),
    [category, query],
  );

  function updateCategory(nextCategory) {
    setCategory(nextCategory);
    setLimit(INITIAL_LIMIT);
  }

  return (
    <>
      <section aria-labelledby="encyclopedia-title">
        <div className="mb-5">
          <h2 id="encyclopedia-title" className="flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
            <BookOpen className="h-5 w-5 text-emerald-300" />
            Encyclopédie & Guide de Craft
          </h2>
          <p className="mt-1 text-sm text-white/45">
            Données Minecraft Java {MINECRAFT_DATA_VERSION} fournies par le projet open source minecraft-data.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-emerald-300/15 bg-black/25 p-4 backdrop-blur-xl">
          <label className="relative block">
            <span className="sr-only">Rechercher un objet, un bloc, une recette, un mob ou un biome</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setLimit(INITIAL_LIMIT);
              }}
              placeholder="Rechercher un objet, un bloc, un mob ou un biome…"
              className="h-12 w-full rounded-xl border border-white/10 bg-black/35 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/20"
            />
          </label>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Catégories de l’encyclopédie">
            {ENCYCLOPEDIA_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateCategory(item.id)}
                aria-pressed={category === item.id}
                className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  category === item.id
                    ? "border-emerald-300/50 bg-emerald-300/15 text-emerald-100"
                    : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <Search className="mx-auto h-8 w-8 text-white/20" />
            <p className="mt-3 font-bold text-white/65">Aucune entrée trouvée</p>
            <p className="mt-1 text-sm text-white/35">Essayez le nom anglais officiel ou l’identifiant technique.</p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs text-white/35">{results.length.toLocaleString("fr-FR")} entrées</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.slice(0, limit).map((entry) => (
                <button
                  type="button"
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-emerald-300/35 hover:bg-emerald-300/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  <MinecraftVisual entry={entry} compact />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">{entry.displayName}</span>
                    <span className="mt-1 block truncate font-mono text-[10px] text-white/35">{entry.technicalId}</span>
                    <span className="mt-1 block text-[9px] font-bold uppercase tracking-wide text-emerald-200/55">
                      {entry.kind === "item" ? "Objet / Bloc" : entry.kind === "mob" ? "Mob" : "Biome"}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {limit < results.length && (
              <div className="mt-7 text-center">
                <button
                  type="button"
                  onClick={() => setLimit((current) => current + INITIAL_LIMIT)}
                  className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-300/20"
                >
                  Afficher plus d’entrées
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <MinecraftEntryDialog
        entry={selectedEntry}
        onOpenChange={(open) => { if (!open) setSelectedEntry(null); }}
        onSelectEntry={setSelectedEntry}
      />
    </>
  );
}

