import React from "react";
import BotSwitch from "./BotSwitch";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";
import DiscordChannelSelect from "./DiscordChannelSelect";
import DiscordRoleSelect from "./DiscordRoleSelect";

const MENTIONS = [
  { value: "none", label: "Aucune mention" },
  { value: "everyone", label: "@everyone" },
  { value: "here", label: "@here" },
];

export default function DiscordAnnounceModule({ discord = {}, onChange, resources, guildId }) {
  const set = (patch) => onChange(patch);

  return (
    <div className="space-y-3">
      <BotSwitch
        checked={discord.announceLiveEnabled === true}
        onChange={(value) => set({ announceLiveEnabled: value })}
        label="Annonces de live automatiques (Twitch & YouTube)"
        description="Le bot publie un embed dès qu'une chaîne connectée passe en direct."
      />

      {discord.announceLiveEnabled && (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <BotLabel>Salon d'annonce</BotLabel>
              <DiscordChannelSelect
                value={discord.announceChannelId}
                onChange={(announceChannelId) => set({ announceChannelId })}
                resources={resources}
                guildId={guildId}
                placeholder="#annonces-live"
              />
            </div>
            <div>
              <BotLabel>Rôle à mentionner</BotLabel>
              <DiscordRoleSelect
                value={discord.announceMention || "none"}
                onChange={(announceMention) => set({ announceMention: announceMention || "none" })}
                resources={resources}
                guildId={guildId}
                allowNone={false}
                extras={MENTIONS}
                placeholder="Aucune mention"
              />
            </div>
          </div>

          <div>
            <BotLabel>Message d'annonce</BotLabel>
            <textarea
              rows={2}
              value={discord.announceMessage || ""}
              onChange={(event) => set({ announceMessage: event.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
              style={fieldStyle}
            />
            <p className="text-[10px] text-white/30 mt-1">Variables : {"{channel}"}, {"{platform}"}, {"{title}"}, {"{link}"}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <BotLabel>Titre de l'embed (facultatif)</BotLabel>
              <input
                value={discord.announceEmbedTitle || ""}
                onChange={(event) => set({ announceEmbedTitle: event.target.value })}
                placeholder="🔴 {channel} est en live"
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
            <div>
              <BotLabel>Couleur de l'embed</BotLabel>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(discord.announceEmbedColor || "") ? discord.announceEmbedColor : "#a855f7"}
                  onChange={(event) => set({ announceEmbedColor: event.target.value })}
                  className="w-10 h-10 rounded-xl shrink-0 tap-sm"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.22)" }}
                />
                <input
                  value={discord.announceEmbedColor || "#a855f7"}
                  onChange={(event) => set({ announceEmbedColor: event.target.value })}
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          <BotSwitch
            checked={discord.announceShowThumbnail !== false}
            onChange={(value) => set({ announceShowThumbnail: value })}
            label="Aperçu de la miniature du stream"
          />
          <BotSwitch
            checked={discord.announceWatchButton !== false}
            onChange={(value) => set({ announceWatchButton: value })}
            label="Bouton « Regarder le live »"
          />
          <BotSwitch
            checked={discord.announceDeleteAfterLive === true}
            onChange={(value) => set({ announceDeleteAfterLive: value })}
            label="Supprimer l'annonce à la fin du live"
          />
        </>
      )}
    </div>
  );
}