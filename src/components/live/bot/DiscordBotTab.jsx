import React from "react";
import { LifeBuoy, Megaphone, ShieldCheck, Terminal, UserPlus } from "lucide-react";
import BotConnectionCard from "./BotConnectionCard";
import BotSection from "./BotSection";
import BotSaveBar from "./BotSaveBar";
import BotSwitch from "./BotSwitch";
import DiscordAnnounceModule from "./DiscordAnnounceModule";
import DiscordCommandsModule from "./DiscordCommandsModule";
import DiscordConnectCard from "./DiscordConnectCard";
import DiscordModerationModule from "./DiscordModerationModule";
import DiscordWelcomeModule from "./DiscordWelcomeModule";
import useBotSettingsDraft from "./useBotSettingsDraft";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

export default function DiscordBotTab({
  integration,
  config,
  busy,
  saving,
  refreshingGuilds,
  onSave,
  onRemove,
  onInvite,
  onRefreshGuilds,
  onSelectGuild,
  onCreate,
}) {
  const { draft, setDraft, dirty, reset } = useBotSettingsDraft(integration);

  const connectCard = (
    <DiscordConnectCard
      config={config}
      busy={busy}
      refreshing={refreshingGuilds}
      onInvite={onInvite}
      onRefreshGuilds={onRefreshGuilds}
      onSelectGuild={onSelectGuild}
      onCreate={onCreate}
    />
  );

  if (!integration) return <div className="space-y-4">{connectCard}</div>;

  const discord = draft?.discord || {};
  const guild = (config?.discord?.guilds || []).find((item) => item.id === integration.channel_id);
  const patch = (changes) => setDraft((prev) => ({
    ...(prev || {}),
    discord: { ...((prev || {}).discord || {}), ...changes },
  }));

  return (
    <div className="space-y-4 pb-16">
      <BotConnectionCard
        integration={integration}
        subtitle={`Serveur Discord${guild?.member_count ? ` · ${guild.member_count} membres` : ""}`}
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

      {connectCard}

      <BotSection icon={Megaphone} title="Annonces de live" description="Twitch et YouTube, avec embed personnalisé.">
        <DiscordAnnounceModule discord={discord} onChange={patch} />
      </BotSection>

      <BotSection icon={UserPlus} title="Bienvenue & rôles automatiques" description="Accueil des nouveaux membres.">
        <DiscordWelcomeModule discord={discord} onChange={patch} />
      </BotSection>

      <BotSection icon={ShieldCheck} title="Modération & logs" description="Filtres et journal des actions du bot.">
        <DiscordModerationModule discord={discord} onChange={patch} />
      </BotSection>

      <BotSection icon={Terminal} title="Commandes & utilitaires" description="Slash commands et réponses rapides.">
        <DiscordCommandsModule discord={discord} onChange={patch} />
      </BotSection>

      <BotSection icon={LifeBuoy} title="Tickets" description="Un panneau unique, toujours au même endroit.">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <BotLabel>Salon des tickets</BotLabel>
            <input
              value={discord.ticketChannelId || ""}
              onChange={(event) => patch({ ticketChannelId: event.target.value })}
              placeholder="123456789012345678"
              className={fieldClass}
              style={fieldStyle}
            />
          </div>
          <div>
            <BotLabel>ID du message du panneau</BotLabel>
            <input
              value={discord.ticketPanelMessageId || ""}
              onChange={(event) => patch({ ticketPanelMessageId: event.target.value })}
              placeholder="123456789012345678"
              className={fieldClass}
              style={fieldStyle}
            />
          </div>
          <div className="sm:col-span-2">
            <BotLabel>Titre du panneau</BotLabel>
            <input
              value={discord.ticketPanelTitle || ""}
              onChange={(event) => patch({ ticketPanelTitle: event.target.value })}
              className={fieldClass}
              style={fieldStyle}
            />
          </div>
          <div className="sm:col-span-2">
            <BotLabel>Texte du panneau</BotLabel>
            <textarea
              rows={3}
              value={discord.ticketPanelDescription || ""}
              onChange={(event) => patch({ ticketPanelDescription: event.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
              style={fieldStyle}
            />
          </div>
        </div>
        <BotSwitch
          checked={discord.ticketFixedPanel !== false}
          onChange={(value) => patch({ ticketFixedPanel: value })}
          label="Panneau fixe et unique"
          description="Le bot réutilise ce message au lieu d'en recréer un à chaque redémarrage."
        />
      </BotSection>

      <BotSaveBar dirty={dirty} saving={saving} onSave={() => onSave(draft)} onReset={reset} />
    </div>
  );
}