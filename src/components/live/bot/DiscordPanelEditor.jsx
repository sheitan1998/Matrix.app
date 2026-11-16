import React from "react";
import { Loader2, Plus, Send, Trash2 } from "lucide-react";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";
import DiscordChannelSelect from "./DiscordChannelSelect";
import DiscordRoleSelect from "./DiscordRoleSelect";

const shortId = (value) => (value ? `${String(value).slice(0, 6)}…${String(value).slice(-4)}` : "");

export default function DiscordPanelEditor({
  panelKey,
  title,
  description,
  panel = {},
  onChange,
  resources,
  guildId,
  published,
  onPublish,
  publishing,
}) {
  const options = Array.isArray(panel.options) ? panel.options : [];
  const isRoles = panelKey === "roles";
  const set = (patch) => onChange(patch);
  const updateOption = (index, patch) => set({
    options: options.map((option, i) => (i === index ? { ...option, ...patch } : option)),
  });

  return (
    <div className="rounded-xl p-3 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.15)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-black text-white">{title}</p>
          <p className="text-[10px] text-white/35">{description}</p>
        </div>
        {published?.message_id && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shrink-0" style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}>
            publié {shortId(published.message_id)}
          </span>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <BotLabel>Salon de publication</BotLabel>
          <DiscordChannelSelect
            value={panel.channelId}
            onChange={(channelId) => set({ channelId })}
            resources={resources}
            guildId={guildId}
          />
        </div>
        <div>
          <BotLabel>Couleur de l'embed</BotLabel>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(panel.color || "") ? panel.color : "#5865f2"}
              onChange={(event) => set({ color: event.target.value })}
              className="w-10 h-10 rounded-xl shrink-0 tap-sm"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.22)" }}
            />
            <input value={panel.color || ""} onChange={(event) => set({ color: event.target.value })} className={fieldClass} style={fieldStyle} />
          </div>
        </div>
      </div>

      <div>
        <BotLabel>Titre</BotLabel>
        <input value={panel.title || ""} onChange={(event) => set({ title: event.target.value })} className={fieldClass} style={fieldStyle} />
      </div>

      <div>
        <BotLabel>Description</BotLabel>
        <textarea
          rows={3}
          value={panel.description || ""}
          onChange={(event) => set({ description: event.target.value })}
          className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
          style={fieldStyle}
        />
      </div>

      {isRoles ? (
        <div className="space-y-2">
          <BotLabel>Rôles proposés (sélecteur Discord)</BotLabel>
          <input
            value={panel.placeholder || ""}
            onChange={(event) => set({ placeholder: event.target.value })}
            placeholder="Choisis ton rôle"
            className={fieldClass}
            style={fieldStyle}
          />
          {options.map((option, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_60px_36px] items-center">
              <DiscordRoleSelect
                value={option.roleId}
                onChange={(roleId) => {
                  const role = (resources?.roles || []).find((item) => item.id === roleId);
                  updateOption(index, { roleId, label: option.label || role?.name || "" });
                }}
                resources={resources}
                guildId={guildId}
                placeholder="Rôle"
                allowNone={false}
              />
              <input
                value={option.label || ""}
                onChange={(event) => updateOption(index, { label: event.target.value })}
                placeholder="Libellé affiché"
                className={fieldClass}
                style={fieldStyle}
              />
              <input
                value={option.emoji || ""}
                onChange={(event) => updateOption(index, { emoji: event.target.value })}
                placeholder="🎮"
                className={fieldClass}
                style={fieldStyle}
              />
              <button
                type="button"
                onClick={() => set({ options: options.filter((_, i) => i !== index) })}
                className="w-9 h-9 rounded-xl flex items-center justify-center tap-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                title="Retirer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set({ options: [...options, { roleId: "", label: "", emoji: "" }] })}
            className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition tap-sm"
            style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.35)", color: "#c084fc" }}
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter un rôle
          </button>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <BotLabel>Libellé du bouton</BotLabel>
            <input value={panel.buttonLabel || ""} onChange={(event) => set({ buttonLabel: event.target.value })} className={fieldClass} style={fieldStyle} />
          </div>
          <div>
            <BotLabel>Emoji du bouton</BotLabel>
            <input value={panel.buttonEmoji || ""} onChange={(event) => set({ buttonEmoji: event.target.value })} placeholder="🎫" className={fieldClass} style={fieldStyle} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPublish(panelKey, panel)}
          disabled={publishing || !guildId || !panel.channelId}
          className="h-9 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider text-white flex items-center gap-1.5 transition disabled:opacity-40 tap-sm"
          style={{ background: "linear-gradient(135deg, #5865f2, #4338ca)" }}
        >
          {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Publier sur Discord maintenant
        </button>
        <span className="text-[10px] text-white/30">
          {!guildId ? "Choisis un serveur" : !panel.channelId ? "Choisis un salon" : published?.message_id ? "Republication = édition du même message" : "Première publication"}
        </span>
      </div>
    </div>
  );
}