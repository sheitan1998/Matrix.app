import React, { useState, useEffect, useMemo } from "react";
import { X, Zap, Search, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { CREATOR_PLATFORMS } from "./CreatorPlatformCards";

const MAX_CHANNELS = 3;

export default function CreatorAutoVoteModal({ user, creators, onClose }) {
  const [config, setConfig] = useState(null);
  const [selected, setSelected] = useState([]);
  const [pseudo, setPseudo] = useState("");
  const [paused, setPaused] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const res = await base44.entities.CreatorAutoVote.filter({ user_email: user.email }, "-created_date", 1);
      const existing = (res?.items || res || [])[0] || null;
      if (!active) return;
      setConfig(existing);
      setSelected(Array.isArray(existing?.creator_ids) ? existing.creator_ids : []);
      setPseudo(existing?.pseudo || "");
      setPaused(!!existing?.paused);
      setLoading(false);
    };
    load().catch(() => setLoading(false));
    return () => { active = false; };
  }, [user.email]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? creators.filter((c) => c.name?.toLowerCase().includes(q) || c.owner_name?.toLowerCase().includes(q))
      : creators;
    return list.slice(0, 40);
  }, [creators, search]);

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_CHANNELS) {
        toast.info(`${MAX_CHANNELS} chaînes maximum en Vote Auto`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    if (!pseudo.trim()) {
      toast.error("Indique un pseudo pour le Vote Auto");
      return;
    }
    setSaving(true);
    try {
      const payload = { creator_ids: selected, pseudo: pseudo.trim(), paused };
      if (config?.id) {
        await base44.entities.CreatorAutoVote.update(config.id, payload);
      } else {
        await base44.entities.CreatorAutoVote.create({ user_email: user.email, ...payload });
      }
      toast.success("Vote Auto enregistré !");
      onClose();
    } catch {
      toast.error("Impossible d'enregistrer la configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#12091c", border: "1px solid rgba(191,0,255,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(191,0,255,0.2)" }}>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: "#d946ef" }} />
            <h2 className="text-sm font-black tracking-wider uppercase text-white">Vote Auto — Créateurs</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-[11px] text-white/40 leading-relaxed">
            Choisis jusqu'à {MAX_CHANNELS} chaînes : elles sont votées automatiquement toutes les heures (1h avec VIP, 2h sinon).
          </p>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">Pseudo de vote *</label>
            <input
              type="text"
              maxLength={30}
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Ex: ProGamer123"
              className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
              style={{ background: "rgba(191,0,255,0.05)", border: "1px solid rgba(191,0,255,0.2)" }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                Chaînes ({selected.length}/{MAX_CHANNELS})
              </label>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une chaîne..."
                className="w-full h-9 pl-8 pr-3 rounded-lg text-xs text-white placeholder:text-white/30 outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>

            <div className="max-h-52 overflow-y-auto scrollbar-thin space-y-1">
              {loading ? (
                <div className="h-16 flex items-center justify-center text-[10px] text-white/30">Chargement...</div>
              ) : visible.length === 0 ? (
                <div className="h-16 flex items-center justify-center text-[10px] text-white/30">Aucune chaîne trouvée</div>
              ) : (
                visible.map((c) => {
                  const isSelected = selected.includes(c.id);
                  const platform = CREATOR_PLATFORMS[c.platform] || CREATOR_PLATFORMS.youtube;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggle(c.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition text-left"
                      style={{
                        background: isSelected ? "rgba(191,0,255,0.12)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isSelected ? "rgba(191,0,255,0.35)" : "transparent"}`,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: platform.color, boxShadow: `0 0 6px ${platform.color}` }}
                      />
                      <span className="flex-1 text-[11px] font-bold text-white/80 truncate">{c.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "#d946ef" }} />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {config?.id && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="w-full h-9 rounded-lg text-[10px] font-black uppercase tracking-wider transition tap-sm"
              style={{
                background: paused ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.05)",
                color: paused ? "#fbbf24" : "rgba(255,255,255,0.5)",
                border: `1px solid ${paused ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {paused ? "Vote Auto en pause — réactiver" : "Mettre le Vote Auto en pause"}
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full h-10 rounded-lg text-xs font-black tracking-wider uppercase text-white transition disabled:opacity-50 tap-sm"
            style={{ background: "linear-gradient(135deg, #bf00ff, #7c3aed)", boxShadow: "0 0 15px rgba(191,0,255,0.3)" }}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}