import React from "react";
import { Gauge, MessageSquare, Radio, ShieldAlert } from "lucide-react";
import BotIntegrationCard from "./BotIntegrationCard";
import BotSection from "./BotSection";
import BotSwitch from "./BotSwitch";
import BotSaveBar from "./BotSaveBar";
import ConnectPlatformCard from "./ConnectPlatformCard";
import TimersEditor from "./TimersEditor";
import useBotSettingsDraft from "./useBotSettingsDraft";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

export default function YouTubeBotTab({ integration, busy, saving, onConnect, onEnable, onDisconnect, onRemove, onSave, onOpenTwitch }) {
  const { draft, setDraft, dirty, patchSection } = useBotSettingsDraft(integration);

  if (!integration) {
    return (
      <div className="space-y-4">
        <ConnectPlatformCard platform="youtube" busy={busy} onConnect={onConnect} />
        <p className="text-[11px] text-white/35 text-center">
          La gestion du live chat, du quota et des messages automatiques apparaît une fois la chaîne connectée.
        </p>
      </div>
    );
  }

  const youtube = draft?.youtube || {};

  return (
    <div className="space-y-4">
      <BotIntegrationCard
        integration={integration}
        busy={busy}
        onEnable={onEnable}
        onDisconnect={onDisconnect}
        onRemove={onRemove}
      />

      <BotSection icon={Radio} title="Live chat" description="Chat du direct YouTube.">
        <BotSwitch
          checked={youtube.liveChatEnabled !== false}
          onChange={(value) => patchSection("youtube", "liveChatEnabled", value)}
          label="Lire et modérer le live chat"
        />
        <div className="mt-2">
          <BotLabel>Identifiant de la vidéo en direct (facultatif)</BotLabel>
          <input
            value={youtube.videoId || ""}
            onChange={(e) => patchSection("youtube", "videoId", e.target.value)}
            placeholder="ex : dQw4w9WgXcQ"
            className={fieldClass}
            style={fieldStyle}
          />
          <p className="text-[10px] text-white/30 mt-1">
            Laisse vide si le worker détecte le direct tout seul. Les messages sont envoyés au nom du compte connecté.
          </p>
        </div>
      </BotSection>

      <BotSection icon={Gauge} title="Quota" description="Consommation des unités YouTube.">
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
            onChange={(e) => patchSection("youtube", "quotaLimit", Number(e.target.value))}
            className={fieldClass}
            style={fieldStyle}
          />
        </div>
      </BotSection>

      <BotSection icon={MessageSquare} title="Messages automatiques" description="Minuteurs communs aux deux plateformes.">
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
          <p className="text-[10px] text-white/30 mt-2">YouTube coupe les messages au-delà de 200 caractères.</p>
        </div>
      </BotSection>

      <button
        type="button"
        onClick={onOpenTwitch}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition tap-sm"
        style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)", color: "#d8b4fe" }}
      >
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span className="text-[11px]">Les filtres de tchat se règlent dans l'onglet Twitch (communs aux deux plateformes).</span>
      </button>

      <BotSaveBar dirty={dirty} saving={saving} onSave={() => onSave(draft)} />
    </div>
  );
}