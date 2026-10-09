import React, { useState } from "react";
import { Plus, Trash2, MessageSquare, Zap, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNexusAutomationRules } from "@/hooks/useNexusAutomationRules";

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const EMOJI_CHOICES = ["👋", "🎉", "🔥", "❤️", "😄", "✨", "🚀", "💎", "🎮", "⚡", "🤝", "💯"];

export default function ServerAutomations({ server, theme, channels = [], onUpdate, accent }) {
  const [newBtnLabel, setNewBtnLabel] = useState("");
  const [newBtnEmoji, setNewBtnEmoji] = useState("👋");
  const { rules: globalRules = [] } = useNexusAutomationRules();

  const welcomeEnabled = server.welcome_enabled || false;
  const welcomeMessage = server.welcome_message || "";
  const welcomeChannelId = server.welcome_channel_id || "";
  const interactiveButtons = server.interactive_buttons || [];
  const enabledRules = server.enabled_automation_rules || [];

  const textChannels = (channels || []).filter((c) => c.type === "text" || c.type === "announce");

  const toggleWelcome = () => {
    onUpdate({ welcome_enabled: !welcomeEnabled });
    toast.success(!welcomeEnabled ? "Message de bienvenue activé" : "Message de bienvenue désactivé");
  };

  const updateWelcomeMessage = (msg) => {
    onUpdate({ welcome_message: msg });
  };

  const updateWelcomeChannel = (channelId) => {
    onUpdate({ welcome_channel_id: channelId });
  };

  const addButton = () => {
    const label = newBtnLabel.trim();
    if (!label) return;
    if (interactiveButtons.length >= 5) {
      toast.error("Maximum 5 boutons interactifs");
      return;
    }
    const btn = { id: makeId(), label, emoji: newBtnEmoji };
    onUpdate({ interactive_buttons: [...interactiveButtons, btn] });
    setNewBtnLabel("");
    toast.success("Bouton ajouté");
  };

  const removeButton = (id) => {
    onUpdate({ interactive_buttons: interactiveButtons.filter((b) => b.id !== id) });
  };

  const updateButton = (id, data) => {
    onUpdate({
      interactive_buttons: interactiveButtons.map((b) => (b.id === id ? { ...b, ...data } : b)),
    });
  };

  const toggleRule = (ruleKey) => {
    const newRules = enabledRules.includes(ruleKey)
      ? enabledRules.filter((k) => k !== ruleKey)
      : [...enabledRules, ruleKey];
    onUpdate({ enabled_automation_rules: newRules });
  };

  const previewMessage = welcomeMessage.replace(/\{user\}/g, "NouveauMembre") || "Bienvenue {user} ! 🎉";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Automatisations</p>
        <p className="text-xs text-muted-foreground">Configurez le message de bienvenue automatique et les boutons d'interaction personnalisés.</p>
      </div>

      {/* Global automation rules from admin panel */}
      {globalRules.length > 0 && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.03)" }}>
          <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <Zap className="w-4 h-4" style={{ color: accent }} />
            <span className="text-sm font-bold text-white">Règles d'automatisation globales</span>
            <span className="text-[9px] text-muted-foreground ml-auto">{enabledRules.length}/{globalRules.length} actives</span>
          </div>
          <div className="p-3 space-y-1.5">
            <p className="text-[11px] text-muted-foreground mb-1">Règles définies par l'administration. Activez celles que vous souhaitez appliquer sur ce serveur.</p>
            {globalRules.map((rule) => {
              const isEnabled = enabledRules.includes(rule.key);
              return (
                <div key={rule.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: isEnabled ? accent + "08" : "transparent" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{rule.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{rule.description}</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: accent + "15", color: accent }}>
                    {rule.trigger_type}
                  </span>
                  <button onClick={() => toggleRule(rule.key)} className={cn("shrink-0 tap-sm", !rule.is_active && "opacity-40 cursor-not-allowed")} disabled={!rule.is_active} title={rule.is_active ? (isEnabled ? "Désactiver" : "Activer") : "Règle désactivée par l'admin"}>
                    {isEnabled ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-4 text-white/20" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Welcome Message */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-center justify-between px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" style={{ color: accent }} />
            <span className="text-sm font-bold text-white">Message de bienvenue</span>
          </div>
          <button
            onClick={toggleWelcome}
            className={cn("w-10 h-5 rounded-full transition", welcomeEnabled ? "bg-green-500" : "bg-white/20")}
          >
            <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", welcomeEnabled ? "translate-x-5" : "translate-x-0.5")} />
          </button>
        </div>

        {welcomeEnabled && (
          <div className="p-3 space-y-3">
            {/* Channel selector */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Salon de bienvenue</label>
              <select
                value={welcomeChannelId}
                onChange={(e) => updateWelcomeChannel(e.target.value)}
                className="w-full h-8 px-2 rounded-lg text-xs text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <option value="">— Choisir un salon —</option>
                {textChannels.map((ch) => (
                  <option key={ch.id} value={ch.id}>#{ch.name}</option>
                ))}
              </select>
              {textChannels.length === 0 && (
                <p className="text-[10px] text-orange-400 mt-1">Aucun salon textuel disponible. Créez-en un d'abord.</p>
              )}
            </div>

            {/* Message text */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                Message <span className="text-white/30">(utilisez {"{user}"} pour le pseudo)</span>
              </label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => updateWelcomeMessage(e.target.value)}
                rows={3}
                placeholder="Bienvenue {user} ! 🎉 N'hésite pas à te présenter."
                className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder:text-white/20 outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {/* Preview */}
            {welcomeChannelId && welcomeMessage && (
              <div className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1.5 flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> Aperçu</p>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: accent + "30" }}>
                    🤖
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-white/80">MATRIX Bot</p>
                    <p className="text-xs text-white/70 mt-0.5">{previewMessage}</p>
                  </div>
                </div>
                {/* Button preview */}
                {interactiveButtons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                    {interactiveButtons.map((b) => (
                      <span key={b.id} className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white" style={{ background: accent + "20", border: `1px solid ${accent}40` }}>
                        {b.emoji} {b.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Buttons */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Zap className="w-4 h-4" style={{ color: accent }} />
          <span className="text-sm font-bold text-white">Boutons interactifs</span>
          <span className="text-[9px] text-muted-foreground ml-auto">{interactiveButtons.length}/5</span>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-[11px] text-muted-foreground">Ces boutons apparaissent sous le message de bienvenue. Les membres peuvent cliquer pour réagir instantanément.</p>

          {/* Existing buttons */}
          {interactiveButtons.map((btn) => (
            <div key={btn.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <select
                value={btn.emoji}
                onChange={(e) => updateButton(btn.id, { emoji: e.target.value })}
                className="w-9 h-7 rounded text-sm text-center bg-white/5 text-white outline-none border border-white/10"
              >
                {EMOJI_CHOICES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <input
                value={btn.label}
                onChange={(e) => updateButton(btn.id, { label: e.target.value })}
                className="flex-1 h-7 px-2 text-xs rounded outline-none text-white"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <button onClick={() => removeButton(btn.id)} className="text-muted-foreground hover:text-red-400 transition shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add new button */}
          {interactiveButtons.length < 5 && (
            <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed" style={{ borderColor: accent + "40" }}>
              <select
                value={newBtnEmoji}
                onChange={(e) => setNewBtnEmoji(e.target.value)}
                className="w-9 h-7 rounded text-sm text-center bg-white/5 text-white outline-none border border-white/10"
              >
                {EMOJI_CHOICES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <input
                value={newBtnLabel}
                onChange={(e) => setNewBtnLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addButton()}
                placeholder="Ex: Coucou"
                className="flex-1 h-7 px-2 text-xs rounded outline-none text-white placeholder:text-white/20"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
              <button
                onClick={addButton}
                disabled={!newBtnLabel.trim()}
                className="h-7 px-3 rounded-lg text-xs font-bold text-black flex items-center gap-1 disabled:opacity-40"
                style={{ background: accent }}
              >
                <Plus className="w-3 h-3" /> Ajouter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}