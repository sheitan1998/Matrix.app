import React from "react";

const EXPIRATION_OPTIONS = [
  { key: "never", label: "Permanent (jamais)" },
  { key: "1h", label: "1 heure" },
  { key: "24h", label: "24 heures" },
  { key: "7d", label: "7 jours" },
];

export default function InvitationConfig({ config, onUpdate, accent }) {
  const cfg = config?.invitation_config || {};

  const update = (key, val) => {
    onUpdate({ invitation_config: { ...cfg, [key]: val } });
  };

  const toggleBool = (key) => {
    onUpdate({ invitation_config: { ...cfg, [key]: !cfg[key] } });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-black text-white mb-1">Système d'Invitation</h3>
        <p className="text-xs text-white/40 mb-3">Configuration des liens et flux d'invitation aux serveurs Nexus.</p>
      </div>

      {/* Default expiration */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Expiration par défaut des liens</p>
        <div className="grid grid-cols-4 gap-2">
          {EXPIRATION_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => update("default_expiration", o.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                (cfg.default_expiration || "never") === o.key ? "text-white" : "text-white/40 hover:text-white/60"
              }`}
              style={(cfg.default_expiration || "never") === o.key ? { background: accent + "20", borderColor: accent } : { borderColor: "rgba(255,255,255,0.08)" }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Numeric settings */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-xs text-white/40 mb-1">Longueur du code d'invitation</p>
          <input
            type="number"
            min={4}
            max={20}
            value={cfg.code_length ?? 8}
            onChange={(e) => update("code_length", parseInt(e.target.value) || 8)}
            className="w-full bg-transparent text-sm font-bold text-white outline-none"
          />
        </div>
        <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-xs text-white/40 mb-1">Utilisations max (0 = illimité)</p>
          <input
            type="number"
            min={0}
            value={cfg.max_uses ?? 0}
            onChange={(e) => update("max_uses", parseInt(e.target.value) || 0)}
            className="w-full bg-transparent text-sm font-bold text-white outline-none"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex-1 pr-3">
            <p className="text-sm font-bold text-white">Autoriser les membres à inviter</p>
            <p className="text-xs text-white/40">Les membres peuvent générer et partager des liens d'invitation</p>
          </div>
          <button
            onClick={() => toggleBool("allow_member_invites")}
            className={`w-10 h-5 rounded-full transition shrink-0 ${cfg.allow_member_invites ? "bg-green-500" : "bg-white/20"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${cfg.allow_member_invites ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex-1 pr-3">
            <p className="text-sm font-bold text-white">Approbation requise</p>
            <p className="text-xs text-white/40">Les nouveaux membres doivent être approuvés par un modérateur</p>
          </div>
          <button
            onClick={() => toggleBool("require_approval")}
            className={`w-10 h-5 rounded-full transition shrink-0 ${cfg.require_approval ? "bg-green-500" : "bg-white/20"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${cfg.require_approval ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}