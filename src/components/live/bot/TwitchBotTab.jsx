import React, { useState } from "react";
import { Bell, Shield, Terminal, Timer } from "lucide-react";
import BotConnectionCard from "./BotConnectionCard";
import BotSection from "./BotSection";
import BotSaveBar from "./BotSaveBar";
import BotSwitch from "./BotSwitch";
import CommandsEditor from "./CommandsEditor";
import ConnectPlatformCard from "./ConnectPlatformCard";
import ModerationEditor from "./ModerationEditor";
import AlertsEditor from "./AlertsEditor";
import SubTabs from "./SubTabs";
import TimersEditor from "./TimersEditor";
import useBotSettingsDraft from "./useBotSettingsDraft";
import { TWITCH_ACTIONS, TWITCH_ALERTS } from "./botDefaults";

const SUBTABS = [
  { key: "commands", label: "Commandes", icon: Terminal },
  { key: "moderation", label: "Auto-modération", icon: Shield },
  { key: "timers", label: "Minuteurs", icon: Timer },
  { key: "alerts", label: "Alertes chat", icon: Bell },
];

const VARIABLES = [
  { token: "{user}", label: "Pseudo" },
  { token: "{uptime}", label: "Uptime" },
  { token: "{game}", label: "Jeu" },
  { token: "{title}", label: "Titre" },
];

const ALERT_FIELDS = [
  { key: "follow", label: "Nouveau follow", description: "Message envoyé à chaque nouveau follower." },
  { key: "sub", label: "Nouvel abonnement (Sub)" },
  { key: "giftSub", label: "Sub cadeau" },
  { key: "raid", label: "Raid", description: "Annonce l'arrivée d'un raid.", minViewers: true },
  { key: "bits", label: "Bits / dons" },
];

export default function TwitchBotTab({ integration, busy, saving, onConnect, onDisconnect, onRemove, onSave }) {
  const { draft, setDraft, dirty, reset } = useBotSettingsDraft(integration);
  const [sub, setSub] = useState("commands");

  if (!integration) {
    return (
      <div className="space-y-4">
        <ConnectPlatformCard platform="twitch" busy={busy} onConnect={onConnect} />
        <p className="text-[11px] text-white/35 text-center">
          Les réglages Twitch (commandes, modération, minuteurs, alertes) s'affichent une fois la chaîne connectée.
        </p>
      </div>
    );
  }

  const settings = draft || {};

  return (
    <div className="space-y-4 pb-16">
      <BotConnectionCard
        integration={integration}
        subtitle={`ID ${integration.channel_id}${integration.account_mode === "bot" ? " · compte bot modérateur" : ""}`}
        onDisconnect={onDisconnect}
        extra={(
          <button
            type="button"
            onClick={onRemove}
            className="h-9 px-3 rounded-xl text-[11px] font-bold transition tap-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
          >
            Supprimer
          </button>
        )}
      />

      <SubTabs items={SUBTABS} value={sub} onChange={setSub} />

      {sub === "commands" && (
        <BotSection icon={Terminal} title="Commandes personnalisées" description="Réponses du bot aux messages du chat.">
          <CommandsEditor
            commands={settings.commands || []}
            variables={VARIABLES}
            prefix={settings.prefix || "!"}
            onChange={(commands) => setDraft((prev) => ({ ...(prev || {}), commands }))}
          />
        </BotSection>
      )}

      {sub === "moderation" && (
        <BotSection icon={Shield} title="Auto-modération et filtres" description="Suppression, timeout et bannissement automatiques.">
          <ModerationEditor
            value={{ filters: settings.filters || {}, moderation: settings.moderation || {} }}
            actions={TWITCH_ACTIONS}
            onChange={(patch) => setDraft((prev) => ({ ...(prev || {}), ...patch }))}
          />
        </BotSection>
      )}

      {sub === "timers" && (
        <BotSection icon={Timer} title="Minuteurs" description="Messages récurrents envoyés automatiquement.">
          <BotSwitch
            checked={settings.timersOnlyWhenLive !== false}
            onChange={(value) => setDraft((prev) => ({ ...(prev || {}), timersOnlyWhenLive: value }))}
            label="Seulement quand la chaîne est en direct"
          />
          <div className="mt-2">
            <TimersEditor
              timers={settings.timers || []}
              onChange={(timers) => setDraft((prev) => ({ ...(prev || {}), timers }))}
            />
          </div>
        </BotSection>
      )}

      {sub === "alerts" && (
        <BotSection icon={Bell} title="Alertes chat en direct" description="Messages automatiques déclenchés par les évènements de la chaîne.">
          <AlertsEditor
            value={settings.alerts || {}}
            fields={ALERT_FIELDS}
            defaults={TWITCH_ALERTS}
            onChange={(alerts) => setDraft((prev) => ({ ...(prev || {}), alerts }))}
          />
        </BotSection>
      )}

      <BotSaveBar dirty={dirty} saving={saving} onSave={() => onSave(draft)} onReset={reset} />
    </div>
  );
}