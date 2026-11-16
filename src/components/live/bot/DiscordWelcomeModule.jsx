import React from "react";
import BotSwitch from "./BotSwitch";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

export default function DiscordWelcomeModule({ discord = {}, onChange }) {
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
              <input
                value={discord.welcomeChannelId || ""}
                onChange={(event) => set({ welcomeChannelId: event.target.value })}
                placeholder="#bienvenue ou ID du salon"
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
            <div>
              <BotLabel>Rôle attribué automatiquement</BotLabel>
              <input
                value={discord.welcomeRoleId || ""}
                onChange={(event) => set({ welcomeRoleId: event.target.value })}
                placeholder="ID du rôle"
                className={fieldClass}
                style={fieldStyle}
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