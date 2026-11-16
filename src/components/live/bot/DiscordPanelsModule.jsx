import React from "react";
import { AlertTriangle } from "lucide-react";
import DiscordPanelEditor from "./DiscordPanelEditor";
import { discordErrorMessage } from "@/lib/discordErrors";

const DEFAULT_PANELS = {
  tickets: {
    channelId: "",
    title: "Support Matrix",
    description: "Ouvre un ticket, un membre de l’équipe te répondra.",
    color: "#5865f2",
    buttonLabel: "Ouvrir un ticket",
    buttonEmoji: "🎫",
  },
  rules: {
    channelId: "",
    title: "Règlement du serveur",
    description: "Merci de lire et respecter ces règles.",
    color: "#22c55e",
    buttonLabel: "J’accepte le règlement",
    buttonEmoji: "✅",
  },
  roles: {
    channelId: "",
    title: "Choisis tes rôles",
    description: "Sélectionne le rôle qui te correspond.",
    color: "#a855f7",
    placeholder: "Choisis ton rôle",
    options: [],
  },
};

const META = {
  tickets: { title: "Panneau de tickets", description: "Un seul message avec le bouton d'ouverture." },
  rules: { title: "Message de règlement", description: "Embed + bouton d'acceptation." },
  roles: { title: "Sélecteur de rôles", description: "Menu déroulant des rôles du serveur." },
};

export default function DiscordPanelsModule({
  discord = {},
  onChange,
  resources,
  guildId,
  publishedPanels = {},
  onPublish,
  publishingKey = "",
}) {
  const panels = discord.panels || {};

  const patchPanel = (key, patch) => onChange({
    panels: { ...panels, [key]: { ...(DEFAULT_PANELS[key] || {}), ...(panels[key] || {}), ...patch } },
  });

  return (
    <div className="space-y-3">
      {resources?.error && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-semibold">{discordErrorMessage(resources.error)}</span>
        </div>
      )}

      {Object.keys(META).map((key) => (
        <DiscordPanelEditor
          key={key}
          panelKey={key}
          title={META[key].title}
          description={META[key].description}
          panel={{ ...(DEFAULT_PANELS[key] || {}), ...(panels[key] || {}) }}
          onChange={(patch) => patchPanel(key, patch)}
          resources={resources}
          guildId={guildId}
          published={publishedPanels[key]}
          onPublish={onPublish}
          publishing={publishingKey === key}
        />
      ))}
    </div>
  );
}