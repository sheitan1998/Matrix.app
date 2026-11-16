import React from "react";
import BotSwitch from "./BotSwitch";
import TagListInput from "./TagListInput";
import { BotLabel } from "./botUi";
import DiscordChannelSelect from "./DiscordChannelSelect";

export default function DiscordModerationModule({ discord = {}, onChange, resources, guildId }) {
  const set = (patch) => onChange(patch);

  return (
    <div className="space-y-3">
      <BotSwitch
        checked={discord.moderationEnabled === true}
        onChange={(value) => set({ moderationEnabled: value })}
        label="Modération et logs Discord"
        description="Filtre les messages et publie chaque action dans le salon de logs."
      />

      {discord.moderationEnabled && (
        <>
          <div>
            <BotLabel>Salon des logs</BotLabel>
            <DiscordChannelSelect
              value={discord.moderationLogChannelId}
              onChange={(moderationLogChannelId) => set({ moderationLogChannelId })}
              resources={resources}
              guildId={guildId}
              placeholder="#logs-modération"
            />
          </div>

          <BotSwitch
            checked={discord.moderationAntiInvite !== false}
            onChange={(value) => set({ moderationAntiInvite: value })}
            label="Anti-liens d'invitation Discord"
          />
          <BotSwitch
            checked={discord.moderationAntiSpam !== false}
            onChange={(value) => set({ moderationAntiSpam: value })}
            label="Anti-spam et mentions massives"
          />

          <div>
            <BotLabel>Liste de mots interdits</BotLabel>
            <TagListInput
              value={discord.moderationWords || []}
              onChange={(moderationWords) => set({ moderationWords })}
              placeholder="mot interdit"
            />
          </div>
        </>
      )}
    </div>
  );
}