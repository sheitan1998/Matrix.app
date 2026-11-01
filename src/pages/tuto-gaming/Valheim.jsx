import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Skull, Sword, Map } from "lucide-react";
import { VALHEIM_TABS, VALHEIM_BOSSES, VALHEIM_BIOMES, VALHEIM_WEAPONS, VALHEIM_ARMORS, VALHEIM_FOOD } from "@/components/tuto-gaming/valheimData";
import ValheimBossCard from "@/components/tuto-gaming/ValheimBossCard";
import ValheimEquipmentCard from "@/components/tuto-gaming/ValheimEquipmentCard";
import ValheimSeedShare from "@/components/tuto-gaming/ValheimSeedShare";
import GameItemModal from "@/components/tuto-gaming/GameItemModal";

const VALHEIM_LOGO = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#0a050f"/><text x="60" y="55" font-size="14" font-weight="900" fill="#8B7355" text-anchor="middle" font-family="serif" style="filter:drop-shadow(0 0 6px #8B735588)">VALHEIM</text><text x="60" y="80" font-size="22" font-weight="900" fill="#4ADE80" text-anchor="middle" font-family="serif" style="filter:drop-shadow(0 0 8px #4ADE8088)">&#9876;</text></svg>`);

export default function Valheim() {
  const [tab, setTab] = useState("bosses");
  const [selected, setSelected] = useState(null);

  const renderGrid = (items, CardComponent) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map(item => <CardComponent key={item.name} item={item} onClick={setSelected} />)}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-12">
        <Link to="/tuto-gaming" className="inline-flex items-center gap-1.5 text-foreground/40 hover:text-foreground transition mb-6 tap-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour au Hub</span>
        </Link>

        <div className="relative overflow-hidden rounded-3xl mb-8 p-8 sm:p-12" style={{ background: "linear-gradient(135deg, #0a150f 0%, #1a3a1a 40%, #0d2515 70%, #0a050f 100%)", border: "1px solid rgba(74,222,128,0.3)", boxShadow: "0 0 40px rgba(74,222,128,0.15)" }}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Skull className="w-6 h-6" style={{ color: "#4ADE80" }} />
              <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-foreground/50">Iron Gate AB</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-2">VALHEIM</h1>
            <p className="text-sm sm:text-base text-white/60 mb-4 max-w-2xl">Explorez, survivez et conquérez les neuf mondes de la mythologie nordique.</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {VALHEIM_TABS.map(t => {
            const active = tab === t.id;
            const icon = t.id === "bosses" ? <Skull className="w-3.5 h-3.5" /> : t.id === "equipment" ? <Sword className="w-3.5 h-3.5" /> : <Map className="w-3.5 h-3.5" />;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={active} className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition tap-sm"
                style={active ? { background: "linear-gradient(135deg, #4ADE80, #22C55E)", color: "#fff", boxShadow: "0 0 15px rgba(74,222,128,0.4)" } : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
                {icon}{t.label}
              </button>
            );
          })}
        </div>

        {tab === "bosses" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-foreground mb-3">Boss</h2>
              {renderGrid(VALHEIM_BOSSES, ValheimBossCard)}
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground mb-3">Biomes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {VALHEIM_BIOMES.map(b => (
                  <button key={b.name} onClick={() => setSelected(b)} className="text-left p-4 rounded-xl transition tap-sm" style={{ background: "hsl(var(--card))", border: `1px solid ${b.color}44` }}>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase mb-2" style={{ background: `${b.color}22`, color: b.color }}>{b.category}</span>
                    <h3 className="text-sm font-bold text-foreground">{b.name}</h3>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "equipment" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-foreground mb-3">Armes</h2>
              {renderGrid(VALHEIM_WEAPONS, ValheimEquipmentCard)}
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground mb-3">Armures</h2>
              {renderGrid(VALHEIM_ARMORS, ValheimEquipmentCard)}
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground mb-3">Nourriture</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {VALHEIM_FOOD.map(f => (
                  <button key={f.name} onClick={() => setSelected(f)} className="text-left p-4 rounded-xl transition tap-sm" style={{ background: "hsl(var(--card))", border: `1px solid ${f.color}44` }}>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase mb-2" style={{ background: `${f.color}22`, color: f.color }}>T{f.tier}</span>
                    <h3 className="text-sm font-bold text-foreground">{f.name}</h3>
                    <p className="text-[10px] text-muted-foreground">+{f.health} HP / +{f.stamina} STA</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "seeds" && <ValheimSeedShare />}
      </div>

      <GameItemModal item={selected} onClose={() => setSelected(null)} gameName="VALHEIM" logoUrl={VALHEIM_LOGO}
        extraFields={[
          { key: "biome", label: "Biome" },
          { key: "hp", label: "Points de vie" },
          { key: "summon", label: "Invocation" },
          { key: "weakness", label: "Faiblesse" },
          { key: "damage", label: "Dégâts" },
          { key: "armor", label: "Armure" },
          { key: "health", label: "Santé" },
          { key: "stamina", label: "Endurance" },
          { key: "tier", label: "Niveau" },
          { key: "type", label: "Type" },
        ]}
      />
    </div>
  );
}