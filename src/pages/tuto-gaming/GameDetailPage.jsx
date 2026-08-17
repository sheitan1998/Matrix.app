import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Search, Loader2, ArrowLeft, BookOpen, SlidersHorizontal, X,
} from "lucide-react";
import QuestListItem from "@/components/tuto-gaming/QuestListItem";
import WikiEntryListItem from "@/components/tuto-gaming/WikiEntryListItem";
import BlockRenderer from "@/components/tuto-gaming/BlockRenderer";
import {
  WIKI_SECTIONS, SECTION_GROUPS, getSectionMeta,
} from "@/components/tuto-gaming/tutoGamingData";

export default function GameDetailPage() {
  const { gameSlug } = useParams();
  const [game, setGame] = useState(null);
  const [quests, setQuests] = useState([]);
  const [wikiEntries, setWikiEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("quetes");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    extension: "", zone: "", levelMin: "", levelMax: "", difficulty: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const games = await base44.entities.Game.filter({ slug: gameSlug });
      if (games.length > 0) setGame(games[0]);

      const allQuests = await base44.entities.Quest.filter({ game_slug: gameSlug });
      allQuests.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setQuests(allQuests);

      const allEntries = await base44.entities.WikiEntry.filter({ game_slug: gameSlug });
      allEntries.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setWikiEntries(allEntries);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [gameSlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sectionMeta = getSectionMeta(activeSection);
  const isQuestSection = sectionMeta?.entity === "quest";

  // Build filter options
  const allExtensions = [...new Set(quests.map((q) => q.extension).filter(Boolean))].sort();
  const allZones = [...new Set(quests.map((q) => q.zone).filter(Boolean))].sort();

  // Count per section
  const sectionCount = (sectionId) => {
    const s = getSectionMeta(sectionId);
    if (!s) return 0;
    if (s.entity === "quest") {
      if (s.questCategory) return quests.filter((q) => q.category === s.questCategory).length;
      return quests.length;
    }
    if (s.entryType) return wikiEntries.filter((e) => e.entry_type === s.entryType).length;
    return 0;
  };

  // Filter content
  const getDisplayItems = () => {
    if (isQuestSection) {
      return quests.filter((q) => {
        if (sectionMeta.questCategory && q.category !== sectionMeta.questCategory) return false;
        if (search) {
          const s = search.toLowerCase();
          if (!q.title.toLowerCase().includes(s) &&
              !(q.description || "").toLowerCase().includes(s) &&
              !(q.npc_name || "").toLowerCase().includes(s) &&
              !(q.zone || "").toLowerCase().includes(s) &&
              !q.tags?.some((t) => t.toLowerCase().includes(s))) return false;
        }
        if (filters.extension && q.extension !== filters.extension) return false;
        if (filters.zone && q.zone !== filters.zone) return false;
        if (filters.levelMin && (q.level_max || 999) < parseInt(filters.levelMin)) return false;
        if (filters.levelMax && (q.level_min || 0) > parseInt(filters.levelMax)) return false;
        if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
        return true;
      });
    } else {
      return wikiEntries.filter((e) => {
        if (sectionMeta.entryType && e.entry_type !== sectionMeta.entryType) return false;
        if (search) {
          const s = search.toLowerCase();
          if (!e.title.toLowerCase().includes(s) &&
              !(e.description || "").toLowerCase().includes(s) &&
              !(e.location || "").toLowerCase().includes(s) &&
              !e.tags?.some((t) => t.toLowerCase().includes(s))) return false;
        }
        return true;
      });
    }
  };

  const displayItems = getDisplayItems();
  const hasActiveFilters = filters.extension || filters.zone || filters.levelMin || filters.levelMax || filters.difficulty;

  const clearFilters = () => setFilters({ extension: "", zone: "", levelMin: "", levelMax: "", difficulty: "" });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-white/40 mb-4">Jeu introuvable</p>
        <Link to="/tuto-gaming" className="text-xs font-bold" style={{ color: "#BF5AF2" }}>
          Retour aux jeux
        </Link>
      </div>
    );
  }

  const renderSidebar = () => (
    <div className="space-y-4">
      {SECTION_GROUPS.map((group) => {
        const groupSections = WIKI_SECTIONS.filter((s) => s.group === group.id);
        if (groupSections.length === 0) return null;
        return (
          <div key={group.id}>
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 px-3 mb-1.5">
              {group.label}
            </h3>
            <div className="space-y-0.5">
              {groupSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveSection(s.id); setSearch(""); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition tap-sm ${
                    activeSection === s.id ? "text-white" : "text-white/40 hover:text-white/70"
                  }`}
                  style={
                    activeSection === s.id
                      ? { background: "rgba(191,90,242,0.12)", border: "1px solid rgba(191,90,242,0.2)" }
                      : { border: "1px solid transparent" }
                  }
                >
                  {s.label}
                  <span
                    className="text-[9px] px-1.5 rounded"
                    style={{
                      background: activeSection === s.id ? "rgba(191,90,242,0.25)" : "rgba(255,255,255,0.05)",
                      color: activeSection === s.id ? "#BF5AF2" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {sectionCount(s.id)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto pb-12">
      {/* Back */}
      <Link
        to="/tuto-gaming"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition mb-5 tap-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold">Tous les jeux</span>
      </Link>

      {/* Game header */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          Wiki {game.name}
        </h1>
        {game.description && (
          <p className="text-sm text-white/40 mt-2 leading-relaxed max-w-2xl">{game.description}</p>
        )}
      </div>

      {/* Mobile section tabs */}
      <div className="lg:hidden flex items-center gap-1.5 mb-4 overflow-x-auto no-scrollbar pb-1">
        {WIKI_SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => { setActiveSection(s.id); setSearch(""); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition tap-sm"
            style={
              activeSection === s.id
                ? { background: "rgba(191,90,242,0.15)", color: "#BF5AF2", border: "1px solid rgba(191,90,242,0.3)" }
                : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }
            }
          >
            {s.label}
            <span className="text-[9px] opacity-60">{sectionCount(s.id)}</span>
          </button>
        ))}
      </div>

      {/* Search + filter toggle */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="relative flex-1 flex items-center"
          style={{
            borderRadius: "9999px",
            background: "rgba(13,5,24,0.7)",
            border: "1.5px solid rgba(191,90,242,0.25)",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Rechercher dans ${sectionMeta?.label?.toLowerCase() || "..."}...`}
            className="w-full h-11 px-5 pr-11 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          />
          <div className="absolute right-4">
            <Search className="w-4 h-4" style={{ color: "#BF5AF2" }} />
          </div>
        </div>
        {isQuestSection && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 w-11 rounded-full flex items-center justify-center transition tap-sm shrink-0"
            style={{
              background: showFilters || hasActiveFilters ? "rgba(191,90,242,0.15)" : "rgba(13,5,24,0.7)",
              border: showFilters || hasActiveFilters
                ? "1.5px solid rgba(191,90,242,0.4)"
                : "1.5px solid rgba(191,90,242,0.25)",
            }}
          >
            <SlidersHorizontal className="w-4 h-4" style={{ color: hasActiveFilters ? "#BF5AF2" : "rgba(255,255,255,0.4)" }} />
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showFilters && isQuestSection && (
        <div
          className="mb-4 p-4 rounded-2xl"
          style={{ background: "rgba(13,5,24,0.6)", border: "1px solid rgba(191,90,242,0.12)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-white/60">Filtres avancés</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-[#BF5AF2] transition tap-sm">
                <X className="w-3 h-3" /> Effacer
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Extension */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block mb-1">Extension</label>
              <select
                value={filters.extension}
                onChange={(e) => setFilters({ ...filters, extension: e.target.value })}
                className="w-full h-9 px-2 rounded-lg text-xs text-white outline-none appearance-none cursor-pointer"
                style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.2)" }}
              >
                <option value="" style={{ background: "#0D0518" }}>Toutes</option>
                {allExtensions.map((ext) => (
                  <option key={ext} value={ext} style={{ background: "#0D0518" }}>{ext}</option>
                ))}
              </select>
            </div>
            {/* Zone */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block mb-1">Zone</label>
              <select
                value={filters.zone}
                onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
                className="w-full h-9 px-2 rounded-lg text-xs text-white outline-none appearance-none cursor-pointer"
                style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.2)" }}
              >
                <option value="" style={{ background: "#0D0518" }}>Toutes</option>
                {allZones.map((z) => (
                  <option key={z} value={z} style={{ background: "#0D0518" }}>{z}</option>
                ))}
              </select>
            </div>
            {/* Level min */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block mb-1">Niv. min</label>
              <input
                type="number"
                min="0"
                value={filters.levelMin}
                onChange={(e) => setFilters({ ...filters, levelMin: e.target.value })}
                placeholder="0"
                className="w-full h-9 px-2 rounded-lg text-xs text-white placeholder:text-white/30 outline-none"
                style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.2)" }}
              />
            </div>
            {/* Level max */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block mb-1">Niv. max</label>
              <input
                type="number"
                min="0"
                value={filters.levelMax}
                onChange={(e) => setFilters({ ...filters, levelMax: e.target.value })}
                placeholder="999"
                className="w-full h-9 px-2 rounded-lg text-xs text-white placeholder:text-white/30 outline-none"
                style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.2)" }}
              />
            </div>
          </div>
          {/* Difficulty chips */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">Difficulté:</span>
            {["facile", "moyen", "difficile"].map((d) => (
              <button
                key={d}
                onClick={() => setFilters({ ...filters, difficulty: filters.difficulty === d ? "" : d })}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold capitalize transition tap-sm"
                style={
                  filters.difficulty === d
                    ? { background: "rgba(191,90,242,0.2)", color: "#BF5AF2", border: "1px solid rgba(191,90,242,0.3)" }
                    : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {filters.extension && <FilterChip label={filters.extension} onRemove={() => setFilters({ ...filters, extension: "" })} />}
          {filters.zone && <FilterChip label={filters.zone} onRemove={() => setFilters({ ...filters, zone: "" })} />}
          {filters.levelMin && <FilterChip label={`Niv. min ${filters.levelMin}`} onRemove={() => setFilters({ ...filters, levelMin: "" })} />}
          {filters.levelMax && <FilterChip label={`Niv. max ${filters.levelMax}`} onRemove={() => setFilters({ ...filters, levelMax: "" })} />}
          {filters.difficulty && <FilterChip label={filters.difficulty} onRemove={() => setFilters({ ...filters, difficulty: "" })} />}
        </div>
      )}

      {/* Dynamic blocks from admin (accordion, banners, etc.) */}
      <div className="mb-5">
        <BlockRenderer gameSlug={gameSlug} pageKey="hub" />
      </div>

      {/* Main content: sidebar + list */}
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-20">{renderSidebar()}</div>
        </aside>

        {/* Content list */}
        <div className="flex-1 min-w-0">
          {/* Section title */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black tracking-wider uppercase text-white">
              {sectionMeta?.label}
            </h2>
            <span className="text-[10px] text-white/30">{displayItems.length} résultat{displayItems.length > 1 ? "s" : ""}</span>
          </div>

          {displayItems.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-8 h-8 text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/30">
                {search
                  ? `Aucun résultat pour "${search}"`
                  : "Aucun contenu dans cette section pour le moment"}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayItems.map((item, i) =>
                isQuestSection ? (
                  <QuestListItem key={item.id} quest={item} gameSlug={gameSlug} index={i} />
                ) : (
                  <WikiEntryListItem key={item.id} entry={item} gameSlug={gameSlug} index={i} />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition tap-sm"
      style={{ background: "rgba(191,90,242,0.1)", color: "#BF5AF2", border: "1px solid rgba(191,90,242,0.2)" }}
    >
      {label}
      <X className="w-2.5 h-2.5" />
    </button>
  );
}