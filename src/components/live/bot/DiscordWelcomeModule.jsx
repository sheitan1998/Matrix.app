import React from "react";
import BotSwitch from "./BotSwitch";
import { BotLabel } from "./botUi";
import DiscordChannelSelect from "./DiscordChannelSelect";
import DiscordRoleSelect from "./DiscordRoleSelect";

export default function DiscordWelcomeModule({ discord = {}, onChange, resources, guildId }) {
  const set = (patch) => onChange(patch);

  return (
    <div className="space-y-3">
      <BotSwitch
        checked={discord.welcomeEnabled === true}
        onChange={(value) => set({ welcomeEnabled: value })}
        label="Message de bienvenue"
        description="Le bot souhaite la bienvenue à chaque nouveau membre."
      />

      {discord.welcomeEnabled && (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <BotLabel>Salon de bienvenue</BotLabel>
              <DiscordChannelSelect
                value={discord.welcomeChannelId}
                onChange={(welcomeChannelId) => set({ welcomeChannelId })}
                resources={resources}
                guildId={guildId}
                placeholder="#bienvenue"
              />
            </div>
            <div>
              <BotLabel>Rôle attribué automatiquement</BotLabel>
              <DiscordRoleSelect
                value={discord.welcomeRoleId}
                onChange={(welcomeRoleId) => set({ welcomeRoleId })}
                resources={resources}
                guildId={guildId}
                placeholder="Choisir un rôle"
              />
            </div>
          </div>
          <div>
            <BotLabel>Message de bienvenue</BotLabel>
            <textarea
              rows={3}
              value={discord.welcomeMessage || ""}
              onChange={(event) => set({ welcomeMessage: event.target.value })}
              placeholder="Bienvenue {user} sur {server} ! Nous sommes {memberCount} membres."
              className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
              style={fieldStyle}
            />
            <p className="text-[10px] text-white/30 mt-1">Variables : {"{user}"}, {"{server}"}, {"{memberCount}"}</p>
          </div>
        </>
      )}
    </div>
  );
}