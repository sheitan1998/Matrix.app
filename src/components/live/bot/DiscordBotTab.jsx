import React from "react";
import { Hash, LifeBuoy, Megaphone, RefreshCw, ShieldCheck, Terminal, UserPlus } from "lucide-react";
import BotConnectionCard from "./BotConnectionCard";
import BotSection from "./BotSection";
import BotSaveBar from "./BotSaveBar";
import DiscordAnnounceModule from "./DiscordAnnounceModule";
import DiscordCommandsModule from "./DiscordCommandsModule";
import DiscordConnectCard from "./DiscordConnectCard";
import DiscordModerationModule from "./DiscordModerationModule";
import DiscordPanelsModule from "./DiscordPanelsModule";
import DiscordSyncStatus from "./DiscordSyncStatus";
import DiscordWelcomeModule from "./DiscordWelcomeModule";
import useBotSettingsDraft from "./useBotSettingsDraft";
import useDiscordResources from "./useDiscordResources";

export default function DiscordBotTab({
  integration,
  config,
  busy,
  saving,
  refreshingGuilds,
  publishingKey,
  redirectUri,
  onSave,
  onRemove,
  onInvite,
  onRefreshGuilds,
  onSelectGuild,
  onConnectUser,
  onDisconnectUser,
  onPublish,
}) {
  const { draft, setDraft, dirty, reset } = useBotSettingsDraft(integration);
  const guildId = integration?.channel_id || config?.discord?.guildId || "";
  const resources = useDiscordResources(guildId);
  const pending = config?.discord?.pending || [];
  const publishedPanels = config?.discord?.panels || {};
  const guild = (config?.discord?.guilds || []).find((item) => item.id === guildId);

  const connectCard = (
    <DiscordConnectCard
      config={config}
      busy={busy}
      refreshing={refreshingGuilds}
      redirectUri={redirectUri}
      onInvite={onInvite}
      onRefreshGuilds={onRefreshGuilds}
      onSelectGuild={onSelectGuild}
      onConnectUser={onConnectUser}
      onDisconnectUser={onDisconnectUser}
    />
  );

  if (!integration) return <div className="space-y-4">{connectCard}</div>;

  const discord = draft?.discord || {};
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

      <DiscordSyncStatus pending={pending} lastSeenAt={integration.last_seen_at} guildId={guildId} />

      {guildId && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resources.reload}
            disabled={resources.loading}
            className="h-8 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition disabled:opacity-40 tap-sm"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
          >
            <RefreshCw className={`w-3 h-3 ${resources.loading ? "animate-spin" : ""}`} />
            {resources.loading ? "Chargement des salons…" : `${resources.channels.length} salons · ${resources.roles.length} rôles`}
          </button>
        </div>
      )}

      <BotSection icon={Megaphone} title="Annonces de live" description="Twitch et YouTube, avec embed personnalisé.">
        <DiscordAnnounceModule discord={discord} onChange={patch} resources={resources} guildId={guildId} />
      </BotSection>

      <BotSection icon={UserPlus} title="Bienvenue & rôles automatiques" description="Accueil des nouveaux membres.">
        <DiscordWelcomeModule discord={discord} onChange={patch} resources={resources} guildId={guildId} />
      </BotSection>

      <BotSection icon={ShieldCheck} title="Modération & logs" description="Filtres et journal des actions du bot.">
        <DiscordModerationModule discord={discord} onChange={patch} resources={resources} guildId={guildId} />
      </BotSection>

      <BotSection icon={Terminal} title="Commandes & utilitaires" description="Slash commands et réponses rapides.">
        <DiscordCommandsModule discord={discord} onChange={patch} />
      </BotSection>

      <BotSection icon={LifeBuoy} title="Panneaux Discord" description="Tickets, règlement et rôles, publiés et modifiables sans doublon.">
        <DiscordPanelsModule
          discord={discord}
          onChange={patch}
          resources={resources}
          guildId={guildId}
          publishedPanels={publishedPanels}
          onPublish={onPublish}
          publishingKey={publishingKey}
        />
      </BotSection>

      <div className="flex items-center gap-2 text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
        <Hash className="w-3 h-3" />
        Salons et rôles lus en direct avec le bot Matrix — aucune saisie d'identifiant.
      </div>

      <BotSaveBar dirty={dirty} saving={saving} onSave={() => onSave(draft)} onReset={reset} />
    </div>
  );
}