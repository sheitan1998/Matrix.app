import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Crosshair, Palette, Loader2 } from "lucide-react";
import { useValorantData } from "@/components/tuto-gaming/useValorantData";
import ValorantAgentCard from "@/components/tuto-gaming/ValorantAgentCard";
import ValorantWeaponCard from "@/components/tuto-gaming/ValorantWeaponCard";
import GameItemModal from "@/components/tuto-gaming/GameItemModal";

const VALORANT_LOGO = "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#0f1923"/><text x="60" y="75" font-size="14" font-weight="900" fill="#FF4655" text-anchor="middle" font-family="sans-serif" style="filter:drop-shadow(0 0 8px #FF465588)">VALORANT</text></svg>`);

const VAL_TABS = [
  { id: "agents", label: "Agents", icon: Users },
  { id: "weapons", label: "Armes", icon: Crosshair },
  { id: "skins", label: "Skins", icon: Palette },
];

export default function Valorant() {
  const [tab, setTab] = useState("agents");
  const [selected, setSelected] = useState(null);
  const { data, loading, error } = useValorantData(tab);

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-12">
        <Link to="/tuto-gaming" className="inline-flex items-center gap-1.5 text-foreground/40 hover:text-foreground transition mb-6 tap-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour au Hub</span>
        </Link>

        <div className="relative overflow-hidden rounded-3xl mb-8 p-8 sm:p-12" style={{ background: "linear-gradient(135deg, #0f1923 0%, #1a2332 40%, #2a1a1f 70%, #0f1923 100%)", border: "1px solid rgba(255,70,85,0.3)", boxShadow: "0 0 40px rgba(255,70,85,0.15)" }}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Crosshair className="w-6 h-6" style={{ color: "#FF4655" }} />
              <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-foreground/50">Riot Games</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-2">VALORANT</h1>
            <p className="text-sm sm:text-base text-white/60 mb-4 max-w-2xl">FPS tactique 5v5. Agents, armes et skins depuis l'API officielle valorant-api.com.</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {VAL_TABS.map(t => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={active} className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition tap-sm"
                style={active ? { background: "linear-gradient(135deg, #FF4655, #c8323f)", color: "#fff", boxShadow: "0 0 15px rgba(255,70,85,0.4)" } : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
                <Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : error ? (
          <div className="text-center py-12 text-sm text-red-400">Erreur: {error}</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">Aucune donnée disponible</div>
        ) : tab === "agents" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {data.map(agent => <ValorantAgentCard key={agent.uuid} agent={agent} onClick={setSelected} />)}
          </div>
        ) : tab === "weapons" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.map(weapon => <ValorantWeaponCard key={weapon.uuid} weapon={weapon} onClick={setSelected} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.slice(0, 100).map(skin => (
              <button key={skin.uuid} onClick={() => setSelected(skin)} className="text-left p-3 rounded-xl transition tap-sm" style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,70,85,0.2)" }}>
                <h3 className="text-xs font-bold text-foreground truncate">{skin.displayName}</h3>
                {skin.displayIcon && <img src={skin.displayIcon} alt={skin.displayName} loading="lazy" className="w-full h-20 object-contain mt-2" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <GameItemModal
        item={selected ? {
          ...selected,
          name: selected.displayName,
          image: selected.displayIcon || selected.fullPortrait,
          desc: selected.description || selected.role?.description || selected.weaponStats?.description || "Données officielles valorant-api.com",
          tag: selected.role?.displayName || selected.category || "Skin",
          color: "#FF4655",
        } : null}
        onClose={() => setSelected(null)}
        gameName="VALORANT"
        logoUrl={VALORANT_LOGO}
        extraFields={[{ key: "role", label: "Rôle", format: (r) => r?.displayName || "" }]}
      />
    </div>
  );
}