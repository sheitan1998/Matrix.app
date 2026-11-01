import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Server, Calculator, Hammer } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { RUST_TABS, RUST_SERVER_FILTERS, RUST_BUILDING_GUIDES, RUST_FALLBACK_SERVERS } from "@/components/tuto-gaming/rustData";
import RustServerCard from "@/components/tuto-gaming/RustServerCard";
import RustRaidCalculator from "@/components/tuto-gaming/RustRaidCalculator";
import GameItemModal from "@/components/tuto-gaming/GameItemModal";

const RUST_LOGO = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#0a050f"/><text x="60" y="75" font-size="48" font-weight="900" fill="#CE422B" text-anchor="middle" font-family="sans-serif" style="filter:drop-shadow(0 0 8px #CE422B88)">RUST</text></svg>`);

export default function Rust() {
  const [tab, setTab] = useState("servers");
  const [servers, setServers] = useState([]);
  const [loadingServers, setLoadingServers] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchServers = useCallback(async (resetPage = false) => {
    setLoadingServers(true);
    try {
      const res = await base44.functions.invoke("rustApi", {
        action: "getServers",
        search,
        filter,
        page: resetPage ? 1 : page,
        pageSize: 20,
      });
      const newServers = res?.data?.servers || [];
      setServers(resetPage ? newServers : [...servers, ...newServers]);
      setHasMore(res?.data?.hasMore || false);
    } catch {
      // Battlemetrics API nécessite un abonnement — fallback serveurs locaux
      let local = RUST_FALLBACK_SERVERS;
      if (search) local = local.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
      if (filter === "official") local = local.filter(s => s.isOfficial);
      if (filter === "modded") local = local.filter(s => !s.isOfficial);
      if (filter === "solo") local = local.filter(s => s.name.toLowerCase().includes("solo") || s.name.toLowerCase().includes("duo"));
      setServers(resetPage ? local : [...servers, ...local]);
      setHasMore(false);
    } finally {
      setLoadingServers(false);
    }
  }, [search, filter, page, servers]);

  useEffect(() => {
    if (tab === "servers") {
      setPage(1);
      fetchServers(true);
    }
  }, [tab, search, filter]);

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-12">
        <Link to="/tuto-gaming" className="inline-flex items-center gap-1.5 text-foreground/40 hover:text-foreground transition mb-6 tap-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour au Hub</span>
        </Link>

        <div className="relative overflow-hidden rounded-3xl mb-8 p-8 sm:p-12" style={{ background: "linear-gradient(135deg, #1a0a0a 0%, #3a1a0a 40%, #2a0d0d 70%, #0a050f 100%)", border: "1px solid rgba(206,66,43,0.3)", boxShadow: "0 0 40px rgba(206,66,43,0.15)" }}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-6 h-6" style={{ color: "#CE422B" }} />
              <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-foreground/50">Facepunch Studios</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-2">RUST</h1>
            <p className="text-sm sm:text-base text-white/60 mb-4 max-w-2xl">Survie, raid et construction dans un monde ouvert impitoyable.</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {RUST_TABS.map(t => {
            const active = tab === t.id;
            const icon = t.id === "servers" ? <Server className="w-3.5 h-3.5" /> : t.id === "raid" ? <Calculator className="w-3.5 h-3.5" /> : <Hammer className="w-3.5 h-3.5" />;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={active} className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition tap-sm"
                style={active ? { background: "linear-gradient(135deg, #CE422B, #a33322)", color: "#fff", boxShadow: "0 0 15px rgba(206,66,43,0.4)" } : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
                {icon}{t.label}
              </button>
            );
          })}
        </div>

        {tab === "servers" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un serveur..." className="flex-1 px-4 py-2 rounded-full text-sm bg-transparent text-foreground" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {RUST_SERVER_FILTERS.map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)} className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition tap-sm"
                    style={filter === f.id ? { background: `${f.color}22`, color: f.color, border: `1px solid ${f.color}55` } : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingServers ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : servers.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Aucun serveur trouvé</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{servers.map(s => <RustServerCard key={s.id} server={s} />)}</div>
                {hasMore && (
                  <button onClick={() => { setPage(p => p + 1); fetchServers(false); }} className="w-full py-2.5 rounded-xl text-xs font-bold text-foreground transition tap-sm" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
                    Charger plus de serveurs
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {tab === "raid" && <RustRaidCalculator />}

        {tab === "building" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RUST_BUILDING_GUIDES.map(g => (
              <button key={g.name} onClick={() => setSelected(g)} className="text-left p-4 rounded-xl transition tap-sm" style={{ background: "hsl(var(--card))", border: `1px solid ${(g?.color || "#CE422B")}44` }}>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase mb-2" style={{ background: `${(g?.color || "#CE422B")}22`, color: g?.color || "#CE422B" }}>{g?.category}</span>
                <h3 className="text-sm font-bold text-foreground mb-1">{g.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{g.desc}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <GameItemModal item={selected} onClose={() => setSelected(null)} gameName="RUST" logoUrl={RUST_LOGO} extraFields={[{ key: "status", label: "Niveau" }, { key: "category", label: "Catégorie" }]} />
    </div>
  );
}