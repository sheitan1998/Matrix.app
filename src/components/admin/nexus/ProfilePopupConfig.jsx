import React from "react";

const ACCENT = "#a855f7";

const POPUP_FIELDS = [
  { key: "show_activity", label: "Activité en temps réel", desc: "Afficher le statut d'activité (jeu, vocal, etc.)" },
  { key: "show_trophies", label: "Trophées", desc: "Afficher le nombre de trophées obtenus" },
  { key: "show_xp", label: "Points XP", desc: "Afficher le total d'XP" },
  { key: "show_level", label: "Niveau", desc: "Afficher le niveau de progression" },
  { key: "show_roles", label: "Rôles & badges", desc: "Afficher les rôles et cosmétiques équipés" },
  { key: "show_dm_input", label: "Champ de message privé", desc: "Afficher la barre d'envoi de message direct" },
  { key: "allow_reports", label: "Signalement", desc: "Autoriser le signalement de l'utilisateur" },
  { key: "show_custom_status", label: "Statut personnalisé", desc: "Afficher le statut personnalisé de l'utilisateur" },
  { key: "show_badges", label: "Badges d'achievements", desc: "Afficher les badges d'accomplissements" },
  { key: "show_friend_status", label: "Statut d'ami", desc: "Afficher le bouton d'ajout/suppression d'ami" },
];

export default function ProfilePopupConfig({ config, onUpdate, accent }) {
  const cfg = config?.profile_popup_config || {};

  const toggle = (key) => {
    const updated = { ...cfg, [key]: !cfg[key] };
    onUpdate({ profile_popup_config: updated });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-black text-white mb-1">Pop-ups de Profil Utilisateur</h3>
        <p className="text-xs text-white/40 mb-3">Configurez les éléments affichés dans les pop-ups de profil à travers tous les serveurs Nexus.</p>
      </div>

      <div className="space-y-2">
        {POPUP_FIELDS.map((f) => {
          const val = cfg[f.key] !== false;
          return (
            <div key={f.key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex-1 pr-3">
                <p className="text-sm font-bold text-white">{f.label}</p>
                <p className="text-xs text-white/40">{f.desc}</p>
              </div>
              <button
                onClick={() => toggle(f.key)}
                className={`w-10 h-5 rounded-full transition shrink-0 ${val ? "bg-green-500" : "bg-white/20"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${val ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}