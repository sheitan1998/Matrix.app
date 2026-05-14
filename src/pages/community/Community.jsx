import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Filter, Server, Sparkles } from "lucide-react";
import PostFeed from "@/components/community/PostFeed";
import VoiceRooms from "@/components/community/VoiceRooms";
import ServerList from "@/components/community/ServerList";
import { cn } from "@/lib/utils";

const THEMES = [
  { key: "all", label: "Tout" },
  { key: "gaming", label: "🎮 Gaming" },
  { key: "music", label: "🎵 Musique" },
  { key: "tech", label: "💻 Tech" },
  { key: "sport", label: "⚽ Sport" },
  { key: "art", label: "🎨 Art" },
  { key: "cinema", label: "🎬 Cinéma" },
  { key: "humour", label: "😂 Humour" },
  { key: "news", label: "📰 Actu" },
];

export default function Community() {
  const [theme, setTheme] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [tab, setTab] = useState("feed"); // feed | servers | voice

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl px-4 lg:px-8 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-black text-lg">
            <span className="text-premium">M</span>ATRIX Community
          </span>
          <Link to="/community/subscription"
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-premium/40 bg-premium/10 text-premium hover:bg-premium/20 transition">
            <Sparkles className="w-3.5 h-3.5" /> Nitro
          </Link>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition",
              showFilter ? "border-premium/50 bg-premium/10 text-premium" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            {theme !== "all" ? THEMES.find((t) => t.key === theme)?.label : "Thème"}
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-1">
          {[
            { key: "feed", label: "📰 Fil" },
            { key: "servers", label: "🏠 Serveurs" },
            { key: "voice", label: "🎙️ Vocal" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold transition",
                tab === t.key ? "bg-premium/15 text-premium" : "text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Theme filter row */}
        {showFilter && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTheme(t.key); setShowFilter(false); }}
                className={cn(
                  "shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition whitespace-nowrap",
                  theme === t.key
                    ? "border-premium bg-premium/10 text-premium"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {tab === "feed" && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-premium inline-block" />
                Fil d'actualité
                {theme !== "all" && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-premium/10 text-premium text-xs">
                    {THEMES.find((t) => t.key === theme)?.label}
                  </span>
                )}
              </h2>
              <PostFeed theme={theme} />
            </div>
          </div>
        )}

        {tab === "servers" && (
          <div className="max-w-xl mx-auto">
            <ServerList />
          </div>
        )}

        {tab === "voice" && (
          <div className="max-w-xl mx-auto">
            <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-live animate-live-pulse inline-block" />
              Salons Vocaux
            </h2>
            <VoiceRooms />
          </div>
        )}
      </div>
    </div>
  );
}