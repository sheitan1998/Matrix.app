import React from "react";
import { Search, TrendingUp, Clock, Trophy, X } from "lucide-react";

const SORT_OPTIONS = [
  { value: "votes_month", label: "Plus votés du mois", icon: TrendingUp },
  { value: "newest", label: "Nouveautés", icon: Clock },
  { value: "general", label: "Classement général", icon: Trophy },
];

export default function ServerSearchBar({ search, onSearchChange, sortBy, onSortChange, resultCount }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un serveur..."
          className="w-full h-9 pl-9 pr-8 rounded-lg text-xs text-white placeholder:text-white/30 outline-none"
          style={{
            background: "rgba(18,9,28,0.6)",
            border: "1px solid rgba(138,79,255,0.2)",
          }}
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-white/40 hover:text-white transition tap-sm"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Sort dropdown */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full sm:w-auto h-9 pl-3 pr-8 rounded-lg text-xs text-white outline-none appearance-none cursor-pointer"
          style={{
            background: "rgba(18,9,28,0.6)",
            border: "1px solid rgba(138,79,255,0.2)",
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: "#12091c" }}>
              {opt.label}
            </option>
          ))}
        </select>
        <Trophy className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
      </div>

      {/* Result count */}
      <span className="text-[9px] text-white/40 whitespace-nowrap hidden sm:inline">
        {resultCount} résultat{resultCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}