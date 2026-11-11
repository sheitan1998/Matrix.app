import React, { useState } from "react";
import { Hash, LifeBuoy, Loader2, Megaphone } from "lucide-react";
import BotIntegrationCard from "./BotIntegrationCard";
import BotSection from "./BotSection";
import BotSwitch from "./BotSwitch";
import BotSaveBar from "./BotSaveBar";
import useBotSettingsDraft from "./useBotSettingsDraft";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

export default function DiscordBotTab({ integration, busy, saving, onRemove, onSave, onCreate }) {
  const { draft, dirty, patchSection } = useBotSettingsDraft(integration);
  const [name, setName] = useState("");
  const [serverId, setServerId] = useState("");

  if (!integration) {
    return (
      <section className="rounded-2xl p-5" style={{ background: "rgba(18,9,28,0.8)", border: "1px solid rgba(88,101,242,0.45)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(88,101,242,0.18)", border: "1px solid rgba(88,101,242,0.5)" }}>
            <Hash className="w-5 h-5" style={{ color: "#818cf8" }} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Configurer Discord</h2>
            <p className="text-[11px] text-white/40">Salon d'annonces et tickets — aucune connexion OAuth nécessaire.</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <BotLabel>Nom du serveur Discord</BotLabel>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex : Matrix Community" className={fieldClass} style={fieldStyle} />
          </div>
          <div>
            <BotLabel>Identifiant du serveur (facultatif)</BotLabel>
            <input value={serverId} onChange={(e) => setServerId(e.target.value)} placeholder="123456789012345678" className={fieldClass} style={fieldStyle} />
          </div>
          <button
            type="button"
            disabled={busy || name.trim().length < 2}
            onClick={() => onCreate({ channel_name: name, channel_id: serverId })}
            className="h-10 px-5 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 transition disabled:opacity-40 tap-sm"
            style={{ background: "linear-gradient(135deg, #5865f2, #4338ca)" }}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
            Enregistrer le serveur
          </button>
        </div>
      </section>
    );
  }

  const discord = draft?.discord || {};

  return (
    <div className="space-y-4">
      <BotIntegrationCard integration={integration} busy={busy} onEnable={() => {}} onRemove={onRemove} />

      <BotSection icon={Megaphone} title="Salon d'annonces" description="Annonces générales et passages en direct.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <BotLabel>Identifiant du salon d'annonces</BotLabel>
            <input
              value={discord.announceChannelId || ""}
              onChange={(e) => patchSection("discord", "announceChannelId", e.target.value)}
              placeholder="123456789012345678"
              className={fieldClass}
              style={fieldStyle}
            />
          </div>
          <div className="sm:col-span-2">
            <BotLabel>Message d'annonce de live</BotLabel>
            <textarea
              rows={2}
              value={discord.announceMessage || ""}
              onChange={(e) => patchSection("discord", "announceMessage", e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
              style={fieldStyle}
            />
            <p className="text-[10px] text-white/30 mt-1">Variables : {"{channel}"}, {"{platform}"}, {"{title}"}, {"{link}"}</p>
          </div>
        </div>
        <BotSwitch
          checked={discord.announceLiveEnabled === true}
          onChange={(value) => patchSection("discord", "announceLiveEnabled", value)}
          label="Annoncer les lives Twitch et YouTube"
          description="Le worker publie dans ce salon dès qu'une chaîne passe en direct."
        />
      </BotSection>

      <BotSection icon={LifeBuoy} title="Tickets" description="Un panneau unique, toujours au même endroit.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <BotLabel>Salon des tickets</BotLabel>
            <input
              value={discord.ticketChannelId || ""}
              onChange={(e) => patchSection("discord", "ticketChannelId", e.target.value)}
              placeholder="123456789012345678"
              className={fieldClass}
              style={fieldStyle}
            />
          </div>
          <div>
            <BotLabel>Identifiant du message du panneau</BotLabel>
            <input
              value={discord.ticketPanelMessageId || ""}
              onChange={(e) => patchSection("discord", "ticketPanelMessageId", e.target.value)}
              placeholder="123456789012345678"
              className={fieldClass}
              style={fieldStyle}
            />
          </div>
          <div>
            <BotLabel>Titre du panneau</BotLabel>
            <input
              value={discord.ticketPanelTitle || ""}
              onChange={(e) => patchSection("discord", "ticketPanelTitle", e.target.value)}
              className={fieldClass}
              style={fieldStyle}
            />
          </div>
          <div className="sm:col-span-2">
            <BotLabel>Texte du panneau</BotLabel>
            <textarea
              rows={3}
              value={discord.ticketPanelDescription || ""}
              onChange={(e) => patchSection("discord", "ticketPanelDescription", e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
              style={fieldStyle}
            />
          </div>
        </div>

        <BotSwitch
          checked={discord.ticketFixedPanel !== false}
          onChange={(value) => patchSection("discord", "ticketFixedPanel", value)}
          label="Panneau fixe et unique"
          description="Le bot réutilise ce message et le met à jour au lieu d'en recréer un à chaque redémarrage."
        />
        {discord.ticketFixedPanel !== false && !discord.ticketPanelMessageId && (
          <p className="text-[10px] px-2.5 py-2 rounded-lg" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)", color: "#fde68a" }}>
            Renseigne l'identifiant du message pour garantir un panneau unique et fixe.
          </p>
        )}
      </BotSection>

      <BotSaveBar dirty={dirty} saving={saving} onSave={() => onSave(draft)} />
    </div>
  );
}