import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SLOT_THEMES } from "@/components/casino/slotThemes";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { normalizeAppAssetUrl } from "@/lib/urlUtils";

export default function SlotSymbolEditor({ themeKey }) {
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!themeKey) return;
    setLoading(true);
    const fetchSymbols = () => {
      base44.entities.SlotSymbol.filter({ theme_key: themeKey })
        .then(records => {
          setSymbols(records.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    fetchSymbols();
    const unsub = base44.entities.SlotSymbol.subscribe(() => fetchSymbols());
    return () => { if (unsub) unsub(); };
  }, [themeKey]);

  const updateSymbol = async (id, data) => {
    try {
      await base44.entities.SlotSymbol.update(id, data);
    } catch {
      toast.error("Erreur de mise à jour");
    }
  };

  const addSymbol = async () => {
    try {
      await base44.entities.SlotSymbol.create({
        theme_key: themeKey,
        symbol: "🌟",
        label: "Nouveau symbole",
        color: "#ffffff",
        glow: "#ffffff",
        mult: 2,
        mult_3: 2,
        mult_4: 3,
        mult_5: 4,
        rare: 5,
        is_wild: false,
        is_text: false,
        sort_order: symbols.length,
      });
      toast.success("Symbole ajouté");
    } catch {
      toast.error("Erreur d'ajout");
    }
  };

  const deleteSymbol = async (id) => {
    try {
      await base44.entities.SlotSymbol.delete(id);
      toast.success("Symbole supprimé");
    } catch {
      toast.error("Erreur de suppression");
    }
  };

  const handleUpload = async (symbolId, file) => {
    if (!file) return;
    try {
      const result = await base44.integrations.Core.UploadPublicFile({ file });
      await base44.entities.SlotSymbol.update(symbolId, { image_url: normalizeAppAssetUrl(result.file_url) });
      toast.success("Image uploadée");
    } catch {
      toast.error("Erreur d'upload");
    }
  };

  const theme = SLOT_THEMES[themeKey];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(15,10,25,0.6)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-white uppercase">Éditeur de symboles</h3>
          <p className="text-[10px] text-white/40">{theme?.name} — {symbols.length} symboles</p>
        </div>
        <button
          onClick={addSymbol}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${theme?.frameAccent}, ${theme?.frameAccent}cc)` }}
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter
        </button>
      </div>

      {/* ─── Table de transparence des multiplicateurs ─── */}
      <div className="rounded-xl border border-white/10 p-3 mb-3" style={{ background: "rgba(15,10,25,0.4)" }}>
        <p className="text-[10px] font-black text-white/60 uppercase mb-2">Table des gains (par mise)</p>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-white/40 border-b border-white/5">
                <th className="text-left px-2 py-1 font-bold">Symbole</th>
                <th className="text-right px-2 py-1 font-bold">Base</th>
                <th className="text-right px-2 py-1 font-bold">3 alignés</th>
                <th className="text-right px-2 py-1 font-bold">4 alignés</th>
                <th className="text-right px-2 py-1 font-bold">5 alignés</th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((sym) => {
                const m3 = sym.mult_3 ?? sym.mult ?? 1;
                const m4 = sym.mult_4 ?? sym.mult ?? 1;
                const m5 = sym.mult_5 ?? sym.mult ?? 1;
                const over = m5 > 50;
                return (
                  <tr key={sym.id} className="border-b border-white/5">
                    <td className="px-2 py-1 font-bold text-white/80">
                      {sym.image_url ? (
                        <img src={normalizeAppAssetUrl(sym.image_url)} alt="" className="inline-block w-4 h-4 object-contain align-middle mr-1" />
                      ) : null}
                      {sym.symbol}
                    </td>
                    <td className="px-2 py-1 text-right text-white/50">{sym.mult ?? 1}x</td>
                    <td className="px-2 py-1 text-right text-white/70">{m3}x</td>
                    <td className="px-2 py-1 text-right text-white/70">{m4}x</td>
                    <td className={`px-2 py-1 text-right font-black ${over ? "text-red-400" : "text-white"}`}>{m5}x {over && "⚠️"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[9px] text-white/30 mt-2">Plafond: 50x par symbole | Gain max: 100x la mise par spin | Calcul linéaire (mise × multiplicateur)</p>
      </div>

      <div className="space-y-2">
        {symbols.map((sym) => (
          <div key={sym.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Emoji/text */}
            <input
              type="text"
              value={sym.symbol}
              onChange={(e) => updateSymbol(sym.id, { symbol: e.target.value })}
              className="w-12 text-center px-1 py-1.5 rounded-lg text-lg bg-white/5 border border-white/10 text-white"
            />

            {/* Image preview */}
            {sym.image_url ? (
              <img
                src={normalizeAppAssetUrl(sym.image_url)}
                alt=""
                className="w-8 h-8 object-contain rounded"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : null}

            {/* Image URL / Upload */}
            <div className="flex-1 flex items-center gap-1.5">
              <input
                type="text"
                value={sym.image_url || ""}
                onChange={(e) => updateSymbol(sym.id, { image_url: e.target.value })}
                placeholder="URL image (optionnel)"
                className="flex-1 px-2 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white placeholder-white/30"
              />
              <label className="cursor-pointer px-2 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white/60 hover:text-white transition">
                <Upload className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(sym.id, file);
                  }}
                />
              </label>
            </div>

            {/* Label */}
            <input
              type="text"
              value={sym.label || ""}
              onChange={(e) => updateSymbol(sym.id, { label: e.target.value })}
              placeholder="Label"
              className="w-20 px-2 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white placeholder-white/30"
            />

            {/* Mult 3 alignés */}
            <input
              type="number"
              step="0.1"
              value={sym.mult_3 ?? sym.mult ?? 1}
              onChange={(e) => updateSymbol(sym.id, { mult_3: parseFloat(e.target.value) || 0 })}
              className="w-12 px-1 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white text-center"
              title="Multiplicateur 3 alignés"
            />
            {/* Mult 4 alignés */}
            <input
              type="number"
              step="0.1"
              value={sym.mult_4 ?? sym.mult ?? 1}
              onChange={(e) => updateSymbol(sym.id, { mult_4: parseFloat(e.target.value) || 0 })}
              className="w-12 px-1 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white text-center"
              title="Multiplicateur 4 alignés"
            />
            {/* Mult 5 alignés */}
            <input
              type="number"
              step="0.1"
              value={sym.mult_5 ?? sym.mult ?? 1}
              onChange={(e) => updateSymbol(sym.id, { mult_5: parseFloat(e.target.value) || 0 })}
              className="w-12 px-1 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white text-center"
              title="Multiplicateur 5 alignés"
            />

            {/* Rare (weight) */}
            <input
              type="number"
              value={sym.rare || 1}
              onChange={(e) => updateSymbol(sym.id, { rare: parseInt(e.target.value) || 1 })}
              className="w-12 px-1 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white text-center"
              title="Rareté (poids)"
            />

            {/* Rarity tier */}
            <select
              value={sym.rarity || "Commun"}
              onChange={(e) => updateSymbol(sym.id, { rarity: e.target.value })}
              className="px-1.5 py-1.5 rounded-lg text-[10px] bg-white/5 border border-white/10 text-white"
              style={{ colorScheme: 'dark' }}
              title="Niveau de rareté"
            >
              <option value="Commun">Commun</option>
              <option value="Rare">Rare</option>
              <option value="Épique">Épique</option>
              <option value="Légendaire">Légendaire</option>
            </select>

            {/* Wild */}
            <button
              onClick={() => updateSymbol(sym.id, { is_wild: !sym.is_wild })}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition ${sym.is_wild ? "text-white" : "text-white/30"}`}
              style={sym.is_wild ? { background: `${theme?.frameAccent}30`, border: `1px solid ${theme?.frameAccent}80` } : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)" }}
              title="Symbole Wild"
            >
              WILD
            </button>

            {/* Delete */}
            <button
              onClick={() => deleteSymbol(sym.id)}
              className="px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-red-400 transition"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}