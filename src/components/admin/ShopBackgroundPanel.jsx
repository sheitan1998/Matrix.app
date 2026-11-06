import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, ImageIcon } from "lucide-react";
import { SHOP_BACKGROUND, SHOP_PAGE_COLOR } from "@/components/shop/ShopBackground";

function Slider({ label, hint, value, min, max, step = 1, suffix = "%", onChange }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/35">
        {label}
        <span className="text-violet-300">{value}{suffix}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-violet-500" />
      {hint && <span className="mt-1 block text-[10px] text-white/25">{hint}</span>}
    </label>);

}

export default function ShopBackgroundPanel() {
  const [config, setConfig] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    base44.entities.MatrixShopConfig.list("-created_date", 1).
    then((rows) => setConfig(rows[0] || {})).
    catch(() => setConfig({}));
    return () => clearTimeout(saveTimer.current);
  }, []);

  const persist = async (next) => {
    const payload = {
      bg_pos_x: Number(next.bg_pos_x) || 0,
      bg_pos_y: Number(next.bg_pos_y) || 0,
      bg_scale: Number(next.bg_scale) || 100
    };
    try {
      if (next.id) {
        await base44.entities.MatrixShopConfig.update(next.id, payload);
      } else {
        const created = await base44.entities.MatrixShopConfig.create(payload);
        setConfig((current) => ({ ...current, id: created.id }));
      }
    } catch {
      toast.error("Erreur lors de l'enregistrement du fond.");
    }
  };

  const set = (patch) => {
    const next = { ...config, ...patch };
    setConfig(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(next), 500);
  };

  if (!config) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>;
  }

  const posX = config.bg_pos_x ?? 0;
  const posY = config.bg_pos_y ?? 0;
  const scale = config.bg_scale ?? 100;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-xl border border-white/8 p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
        <Slider
          label="Décalage horizontal"
          hint="0 % = image alignée à gauche (sac et titre vers la droite), 100 % = alignée à droite."
          value={posX}
          min={0}
          max={100}
          onChange={(v) => set({ bg_pos_x: v })} />
        <Slider
          label="Décalage vertical"
          hint="0 % = image alignée en haut, 100 % = alignée en bas."
          value={posY}
          min={0}
          max={100}
          onChange={(v) => set({ bg_pos_y: v })} />
        <Slider
          label="Taille (zoom)"
          hint="100 % = taille de base, jusqu'à 220 % pour agrandir l'image."
          value={scale}
          min={100}
          max={220}
          onChange={(v) => set({ bg_scale: v })} />
        <p className="text-[10px] text-white/30">Les réglages sont enregistrés automatiquement et appliqués immédiatement sur la boutique.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/8" style={{ background: SHOP_PAGE_COLOR }}>
        <div className="flex items-center gap-1.5 border-b border-white/8 px-3 py-2">
          <ImageIcon className="h-3.5 w-3.5 text-violet-300" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Aperçu</span>
        </div>
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={SHOP_BACKGROUND}
            alt=""
            className="h-full w-full object-cover"
            style={{
              objectPosition: `${posX}% ${posY}%`,
              transform: `scale(${scale / 100})`,
              transformOrigin: `${posX}% ${posY}%`
            }} />
          <div
            className="absolute inset-y-0 left-0 w-[22%] border-r border-white/10"
            style={{ background: "rgba(10,8,15,0.85)" }}>
            <div className="space-y-2 p-2">
              {[0, 1, 2, 3, 4].map((i) =>
              <div key={i} className="h-2 rounded-full bg-white/10" style={{ width: `${60 + i * 6}%` }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

}