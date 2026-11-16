import React, { useState } from "react";
import { Bell, Gauge, Shield, Terminal, Timer, Wand2 } from "lucide-react";
import { toast } from "sonner";
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
import { YOUTUBE_ACTIONS, YOUTUBE_ALERTS } from "./botDefaults";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

const SUBTABS = [
  { key: "commands", label: "Commandes", icon: Terminal },
  { key: "moderation", label: "Auto-modération", icon: Shield },
  { key: "timers", label: "Minuteurs", icon: Timer },
  { key: "alerts", label: "Alertes chat", icon: Bell },
];

const VARIABLES = [
  { token: "{user}", label: "Pseudo" },
  { token: "{title}", label: "Titre" },
  { token: "{channel}", label: "Chaîne" },
];

const ALERT_FIELDS = [
  { key: "member", label: "Nouveau membre (Sponsor)", description: "Message envoyé à chaque nouvel abonnement à la chaîne." },
  { key: "superChat", label: "Super Chat" },
  { key: "superSticker", label: "Super Sticker" },
];

const clone = (value) => JSON.parse(JSON.stringify(value || null));

export default function YouTubeBotTab({ integration, busy, saving, onConnect, onDisconnect, onRemove, onSave, onRefreshLive, refreshing }) {
  const { draft, setDraft, dirty, reset } = useBotSettingsDraft(integration);
  const [sub, setSub] = useState("commands");

  if (!integration) {
    return (
      <div className="space-y-4">
        <ConnectPlatformCard platform="youtube" busy={busy} onConnect={onConnect} />
        <p className="text-[11px] text-white/35 text-center">
          Les réglages YouTube (commandes, filtres, minuteurs, alertes) s'affichent une fois la chaîne connectée.
        </p>
      </div>
    );
  }

  const settings = draft || {};
  const youtube = settings.youtube || {};

  const patchYoutube = (patch) => setDraft((prev) => ({
    ...(prev || {}),
    youtube: { ...((prev || {}).youtube || {}), ...patch },
  }));

  const syncFromTwitch = () => {
    setDraft((prev) => {
      const base = prev || {};
      return {
        ...base,
        youtube: {
          ...(base.youtube || {}),
          commands: clone(base.commands) || [],
          filters: clone(base.filters) || {},
          timers: clone(base.timers) || [],
          alerts: clone(base.alerts) || {},
          moderation: clone(base.moderation) || {},
        },
      };
    });
    toast.success("Configuration Twitch copiée — enregistre pour appliquer.");
  };

  return (
    <div className="space-y-4 pb-16">
      <BotConnectionCard
        integration={integration}
        subtitle={`Chaîne ${integration.channel_id}${integration.is_live ? " · en direct" : " · en attente d'un live"}`}
        onDisconnect={onDisconnect}
        onRefreshLive={onRefreshLive}
        refreshing={refreshing}
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

      <SubTabs items={SUBTABS} value={sub} onChange={setSub} accent="#ef4444" />

      <button
        type="button"
        onClick={syncFromTwitch}
        className="w-full h-10 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition tap-sm"
        style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#d8b4fe" }}
      >
        <Wand2 className="w-4 h-4" /> Synchroniser la configuration depuis Twitch
      </button>

      {sub === "commands" && (
        <BotSection icon={Terminal} title="Commandes personnalisées" description="Réponses du bot dans le chat du direct.">
          <CommandsEditor
            commands={youtube.commands || []}
            variables={VARIABLES}
            prefix={settings.prefix || "!"}
            onChange={(commands) => patchYoutube({ commands })}
          />
          <p className="text-[10px] text-white/30 mt-2">YouTube coupe les messages au-delà de 200 caractères.</p>
        </BotSection>
      )}

      {sub === "moderation" && (
        <BotSection icon={Shield} title="Auto-modération et filtres" description="Les timeouts YouTube consomment du quota.">
          <ModerationEditor
            value={{ filters: youtube.filters || {}, moderation: youtube.moderation || {} }}
            actions={YOUTUBE_ACTIONS}
            note="Sur YouTube, un timeout coûte 200 unités de quota, une suppression 20. Le streamer et les modérateurs sont toujours exemptés."
            onChange={(patch) => patchYoutube(patch)}
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
              timers={youtube.timers || []}
              onChange={(timers) => patchYoutube({ timers })}
            />
          </div>
        </BotSection>
      )}

      {sub === "alerts" && (
        <BotSection icon={Bell} title="Alertes chat live" description="Messages automatiques envoyés dans le tchat du direct.">
          <AlertsEditor
            value={youtube.alerts || {}}
            fields={ALERT_FIELDS}
            defaults={YOUTUBE_ALERTS}
            onChange={(alerts) => patchYoutube({ alerts })}
          />
        </BotSection>
      )}

      <BotSection icon={Gauge} title="Quota YouTube" description="Consommation des unités de l'API.">
        <div className="flex items-center justify-between text-[11px] text-white/50 mb-1.5">
          <span>Utilisé aujourd'hui</span>
          <span className="font-mono">{integration.quota_used || 0} / {integration.quota_limit || 10000}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${integration.quota_limit ? Math.min(100, Math.round(((integration.quota_used || 0) / integration.quota_limit) * 100)) : 0}%`,
              background: "linear-gradient(90deg,#a855f7,#22d3ee)",
            }}
          />
        </div>
        <div className="mt-3">
          <BotLabel>Quota quotidien (unités)</BotLabel>
          <input
            type="number"
            min={0}
            value={youtube.quotaLimit ?? 10000}
            onChange={(event) => patchYoutube({ quotaLimit: Number(event.target.value) })}
            className={fieldClass}
            style={fieldStyle}
          />
        </div>
      </BotSection>

      <BotSaveBar dirty={dirty} saving={saving} onSave={() => onSave(draft)} onReset={reset} />
    </div>
  );
}