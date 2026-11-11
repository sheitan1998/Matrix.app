import React from "react";
import { Bell, MessageSquare, ShieldAlert } from "lucide-react";
import BotIntegrationCard from "./BotIntegrationCard";
import BotSection from "./BotSection";
import BotSwitch from "./BotSwitch";
import BotSaveBar from "./BotSaveBar";
import ConnectPlatformCard from "./ConnectPlatformCard";
import TimersEditor from "./TimersEditor";
import ChatFiltersEditor from "./ChatFiltersEditor";
import useBotSettingsDraft from "./useBotSettingsDraft";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

export default function TwitchBotTab({ integration, busy, saving, onConnect, onEnable, onDisconnect, onRemove, onSave }) {
  const { draft, setDraft, dirty, patchSection } = useBotSettingsDraft(integration);

  if (!integration) {
    return (
      <div className="space-y-4">
        <ConnectPlatformCard platform="twitch" busy={busy} onConnect={onConnect} />
        <p className="text-[11px] text-white/35 text-center">
          Les réglages Twitch (alertes, minuteurs, filtres) s'affichent une fois la chaîne connectée.
        </p>
      </div>
    );
  }

  const twitch = draft?.twitch || {};

  return (
    <div className="space-y-4">
      <BotIntegrationCard
        integration={integration}
        busy={busy}
        onEnable={onEnable}
        onDisconnect={onDisconnect}
        onRemove={onRemove}
      />

      <BotSection icon={Bell} title="Alertes de live" description="Prévenir dès que la chaîne passe en direct.">
        <BotSwitch
          checked={twitch.liveAlertEnabled === true}
          onChange={(value) => patchSection("twitch", "liveAlertEnabled", value)}
          label="Annoncer les passages en direct"
          description="Le message est publié par le worker dans le salon configuré."
        />
        {twitch.liveAlertEnabled && (
          <div className="grid gap-3 sm:grid-cols-2 mt-1">
            <div>
              <BotLabel>Salon d'annonces (ID Discord)</BotLabel>
              <input
                value={twitch.liveAlertChannelId || ""}
                onChange={(e) => patchSection("twitch", "liveAlertChannelId", e.target.value)}
                placeholder="123456789012345678"
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
            <div className="sm:col-span-2">
              <BotLabel>Message d'annonce</BotLabel>
              <textarea
                rows={2}
                value={twitch.liveAlertMessage || ""}
                onChange={(e) => patchSection("twitch", "liveAlertMessage", e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
                style={fieldStyle}
              />
              <p className="text-[10px] text-white/30 mt-1">Variables : {"{channel}"}, {"{title}"}, {"{link}"}</p>
            </div>
          </div>
        )}
      </BotSection>

      <BotSection icon={MessageSquare} title="Messages automatiques" description="Messages envoyés à tour de rôle par le bot.">
        <BotSwitch
          checked={draft?.timersOnlyWhenLive !== false}
          onChange={(value) => setDraft((prev) => ({ ...(prev || {}), timersOnlyWhenLive: value }))}
          label="Seulement quand la chaîne est en direct"
        />
        <div className="mt-2">
          <TimersEditor
            timers={draft?.timers || []}
            onChange={(timers) => setDraft((prev) => ({ ...(prev || {}), timers }))}
          />
        </div>
      </BotSection>

      <BotSection icon={ShieldAlert} title="Filtres de tchat" description="Suppression, timeout et avertissement automatiques.">
        <ChatFiltersEditor
          filters={draft?.filters || {}}
          onChange={(key, patch) => setDraft((prev) => ({
            ...(prev || {}),
            filters: { ...((prev || {}).filters || {}), [key]: { ...(((prev || {}).filters || {})[key] || {}), ...patch } },
          }))}
        />
      </BotSection>

      <BotSaveBar dirty={dirty} saving={saving} onSave={() => onSave(draft)} />
    </div>
  );
}