import React, { useState, useMemo } from "react";
import { X, ArrowRight } from "lucide-react";

const CATEGORIES = {
  distance: {
    label: "Distance",
    units: {
      m: 1, km: 1000, cm: 0.01, mm: 0.001, mile: 1609.34, yard: 0.9144, foot: 0.3048, inch: 0.0254,
    },
  },
  weight: {
    label: "Poids",
    units: { g: 1, kg: 1000, mg: 0.001, lb: 453.592, oz: 28.3495, t: 1000000 },
  },
  volume: {
    label: "Volume",
    units: { l: 1, ml: 0.001, gal: 3.78541, cup: 0.236588, m3: 1000, cl: 0.01 },
  },
  currency: {
    label: "Devise",
    units: { EUR: 1, USD: 1.08, GBP: 0.85, CHF: 0.95, JPY: 170, CAD: 1.47, AUD: 1.65 },
  },
  temperature: {
    label: "Température",
    units: { C: "celsius", F: "fahrenheit", K: "kelvin" },
  },
};

function convertTemp(val, from, to) {
  let c;
  if (from === "C") c = val;
  else if (from === "F") c = (val - 32) * 5 / 9;
  else c = val - 273.15;
  if (to === "C") return c;
  if (to === "F") return c * 9 / 5 + 32;
  return c + 273.15;
}

export default function UnitConverter({ onClose }) {
  const [cat, setCat] = useState("distance");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("km");
  const [input, setInput] = useState("1");

  const units = Object.keys(CATEGORIES[cat].units);

  const result = useMemo(() => {
    const val = parseFloat(input);
    if (isNaN(val)) return "—";
    if (cat === "temperature") return convertTemp(val, from, to).toFixed(2);
    const fromFactor = CATEGORIES[cat].units[from];
    const toFactor = CATEGORIES[cat].units[to];
    if (typeof fromFactor === "number" && typeof toFactor === "number") {
      return (val * fromFactor / toFactor).toFixed(4);
    }
    return "—";
  }, [input, from, to, cat]);

  const switchCat = (newCat) => {
    setCat(newCat);
    const newUnits = Object.keys(CATEGORIES[newCat].units);
    setFrom(newUnits[0]);
    setTo(newUnits[1] || newUnits[0]);
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-white">Convertisseur d'Unités</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Category selector */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
        {Object.entries(CATEGORIES).map(([key, c]) => (
          <button key={key} onClick={() => switchCat(key)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition shrink-0"
            style={cat === key
              ? { background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }
              : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wide">De</label>
          <div className="flex gap-2">
            <input type="number" value={input} onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-10 px-3 rounded-xl text-sm font-bold text-white bg-transparent outline-none"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <select value={from} onChange={(e) => setFrom(e.target.value)}
              className="h-10 px-3 rounded-xl text-sm font-bold text-white bg-transparent outline-none cursor-pointer"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {units.map(u => <option key={u} value={u} className="bg-[#13101a]">{u}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,215,0,0.1)" }}>
            <ArrowRight className="w-4 h-4 rotate-90" style={{ color: "#FFD700" }} />
          </div>
        </div>

        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wide">Vers</label>
          <div className="flex gap-2">
            <input type="text" value={result} readOnly
              className="flex-1 h-10 px-3 rounded-xl text-sm font-bold text-white bg-transparent outline-none"
              style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.15)" }} />
            <select value={to} onChange={(e) => setTo(e.target.value)}
              className="h-10 px-3 rounded-xl text-sm font-bold text-white bg-transparent outline-none cursor-pointer"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {units.map(u => <option key={u} value={u} className="bg-[#13101a]">{u}</option>)}
            </select>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-white/30 mt-4 text-center">
        {cat === "currency" ? "Taux indicatifs (mis à jour manuellement)" : "Conversions précises"}
      </p>
    </div>
  );
}