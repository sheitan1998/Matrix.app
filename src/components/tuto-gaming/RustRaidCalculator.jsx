import React, { useState } from "react";
import { RUST_BUILDING_MATERIALS, RUST_RAID_COSTS } from "@/components/tuto-gaming/rustData";

export default function RustRaidCalculator() {
  const [selectedWall, setSelectedWall] = useState(RUST_RAID_COSTS[1]);
  const [quantity, setQuantity] = useState(1);

  const totalC4 = (selectedWall.c4 || 0) * quantity;
  const totalRockets = (selectedWall.rockets || 0) * quantity;
  const totalSatchel = (selectedWall.satchel || 0) * quantity;

  const explosiveCards = [
    { name: "C4 (Charge Sapeur)", count: totalC4, color: "#FF4444", icon: "💣" },
    { name: "Roquettes", count: totalRockets, color: "#FBBF24", icon: "🚀" },
    { name: "Satchel Charges", count: totalSatchel, color: "#22D3EE", icon: "📦" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        <h3 className="text-sm font-black text-foreground mb-4">Sélectionnez la cible</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {RUST_RAID_COSTS.map((cost) => (
            <button
              key={cost.wall}
              onClick={() => setSelectedWall(cost)}
              className="text-left p-2 rounded-lg transition tap-sm"
              style={{
                background: selectedWall.wall === cost.wall ? `${cost.color}22` : "hsl(var(--muted))",
                border: `1px solid ${selectedWall.wall === cost.wall ? cost.color : "transparent"}`,
              }}
            >
              <span className="text-xs font-bold text-foreground">{cost.wall}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-muted-foreground">Quantité:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-20 px-3 py-1.5 rounded-lg text-sm text-foreground bg-transparent"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}
          />
          <span className="text-xs text-muted-foreground">murs/structures</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {explosiveCards.map((exp) => (
          <div
            key={exp.name}
            className="rounded-xl p-4 text-center"
            style={{ background: "hsl(var(--card))", border: `1px solid ${exp.color}44` }}
          >
            <div className="text-2xl mb-1">{exp.icon}</div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{exp.name}</p>
            <p className="text-2xl font-black" style={{ color: exp.color }}>{exp.count}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-4" style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.2)" }}>
        <h4 className="text-xs font-black text-foreground mb-2">Résistance des matériaux</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RUST_BUILDING_MATERIALS.map((mat) => (
            <div key={mat.id} className="text-center p-2 rounded-lg" style={{ background: `${mat.color}11` }}>
              <p className="text-[10px] text-muted-foreground">{mat.name}</p>
              <p className="text-sm font-bold" style={{ color: mat.color }}>{mat.hp} HP</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}