import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import { GAME_CATEGORIES } from "@/hooks/useGameCatalog";

const SORTS = [
  { key: "popular", label: "Populaires" },
  { key: "newest", label: "Nouveautés" },
  { key: "alpha", label: "Ordre alphabétique" },
];

const FORMATS = [
  { key: "all", label: "Tous" },
  { key: "landscape", label: "Paysage" },
  { key: "portrait", label: "Portrait" },
];

const COMPATIBILITY = [
  { key: "all", label: "Toutes" },
  { key: "desktop", label: "Ordinateur" },
  { key: "mobile", label: "Mobile" },
];

const DURATIONS = [
  { key: "all", label: "Toutes" },
  { key: "short", label: "Courte" },
  { key: "long", label: "Longue" },
];

const DIFFICULTIES = [
  { key: "all", label: "Toutes" },
  { key: "easy", label: "Facile" },
  { key: "medium", label: "Moyen" },
  { key: "hard", label: "Difficile" },
];

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "#c084fc" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Pills({ options, value, onChange, columns = 2 }) {
  return (
    <div className={`grid gap-1.5 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {options.map((option) => {
        const active = value === option.key;
        return (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className="h-8 px-2 rounded-lg text-[10px] font-bold transition tap-sm truncate"
            style={{
              background: active ? "rgba(168,85,247,0.28)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${active ? "rgba(168,85,247,0.7)" : "rgba(255,255,255,0.07)"}`,
              color: active ? "#fff" : "rgba(255,255,255,0.5)",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function NexusFilters({ catalog }) {
  const {
    category, setCategory,
    sortBy, setSortBy,
    format, setFormat,
    compatibility, setCompatibility,
    duration, setDuration,
    difficulty, setDifficulty,
    filtered, activeFilterCount, resetFilters,
  } = catalog;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "rgba(15,8,24,0.9)", border: "1px solid rgba(168,85,247,0.22)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4" style={{ color: "#a855f7" }} />
        <p className="text-xs font-black uppercase tracking-wider text-white">Explorer le catalogue</p>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            title="Réinitialiser les filtres"
            className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white transition tap-sm"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <Section title="Catégories">
        <div className="grid grid-cols-3 gap-1.5">
          {["Tous", ...GAME_CATEGORIES].map((item) => {
            const active = category === item;
            return (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className="h-8 px-1 rounded-lg text-[9px] font-bold transition tap-sm truncate"
                style={{
                  background: active ? "rgba(168,85,247,0.28)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "rgba(168,85,247,0.7)" : "rgba(255,255,255,0.07)"}`,
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Trier les jeux">
        <div className="space-y-1">
          {SORTS.map((option) => {
            const active = sortBy === option.key;
            return (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className="flex w-full items-center gap-2 h-8 px-2 rounded-lg text-[10px] font-semibold transition tap-sm"
                style={{
                  background: active ? "rgba(168,85,247,0.2)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                <span
                  className="w-3 h-3 rounded-full flex items-center justify-center shrink-0"
                  style={{ border: `1.5px solid ${active ? "#a855f7" : "rgba(255,255,255,0.25)"}` }}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#a855f7" }} />}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Format">
        <Pills options={FORMATS} value={format} onChange={setFormat} columns={3} />
      </Section>

      <Section title="Compatibilité">
        <Pills options={COMPATIBILITY} value={compatibility} onChange={setCompatibility} />
      </Section>

      <Section title="Durée">
        <Pills options={DURATIONS} value={duration} onChange={setDuration} columns={3} />
      </Section>

      <Section title="Difficulté">
        <Pills options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
      </Section>

      <div
        className="rounded-xl p-3 mt-1"
        style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.22)" }}
      >
        <p className="text-[9px] font-black uppercase tracking-wider text-white/50 mb-1">Aperçu de la sélection</p>
        <p className="text-lg font-black text-white leading-none">{filtered.length}</p>
        <p className="text-[10px] text-white/40 mt-0.5">
          jeu{filtered.length !== 1 ? "x" : ""} correspondant{filtered.length !== 1 ? "s" : ""}
          {category !== "Tous" ? ` · ${category}` : ""}
        </p>
      </div>
    </div>
  );
}