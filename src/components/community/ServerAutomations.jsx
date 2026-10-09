import React, { useState } from "react";
import { Plus, Trash2, MessageSquare, Zap, Eye, ToggleLeft, ToggleRight, Send, UserMinus, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNexusAutomationRules } from "@/hooks/useNexusAutomationRules";

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const EMOJI_CHOICES = ["👋", "🎉", "🔥", "❤️", "😄", "✨", "🚀", "💎", "🎮", "⚡", "🤝", "💯"];

const TRIGGER_ICONS = {
  member_join: Send,
  member_leave: UserMinus,
  boost_received: Rocket,
  message_sent: MessageSquare,
  role_assigned: Zap,
  channel_created: Plus,
  custom: Zap,
};

const TRIGGER_LABELS = {
  member_join: "Membre rejoint",
  member_leave: "Membre quitte",
  boost_received: "Boost recu",
  message_sent: "Message envoye",
  role_assigned: "Role attribue",
  channel_created: "Salon cree",
  custom: "Personnalise",
};

export default function ServerAutomations({ server, theme, channels = [], onUpdate, accent }) {
  const [newBtnLabel, setNewBtnLabel] = useState("");
  const [newBtnEmoji, setNewBtnEmoji] = useState("👋");
  const { rules: globalRules = [] } = useNexusAutomationRules();

  const interactiveButtons = server.interactive_buttons || [];
  const automationConfigs = server.automation_configs || [];

  const textChannels = (channels || []).filter((c) => c.type === "text" || c.type === "announce");

  // Helper: get config for a rule key (with backward compat for legacy welcome_* fields)
  const getConfig = (ruleKey) => {
    const config = automationConfigs.find((c) => c.rule_key === ruleKey);
    if (config) return config;
    // Backward compat: legacy welcome fields
    if (ruleKey === "welcome_message") {
      return {
        rule_key: ruleKey,
        channel_id: server.welcome_channel_id || "",
        message: server.welcome_message || "",
        enabled: server.welcome_enabled || false,
      };
    }
    return { rule_key: ruleKey, channel_id: "", message: "", enabled: false };
  };

  // Helper: update config for a rule key
  const updateConfig = (ruleKey, data) => {
    const existing = automationConfigs.find((c) => c.rule_key === ruleKey);
    if (existing) {
      onUpdate({
        automation_configs: automationConfigs.map((c) =>
          c.rule_key === ruleKey ? { ...c, ...data } : c
        ),
      });
    } else {
      onUpdate({
        automation_configs: [
          ...automationConfigs,
          { rule_key: ruleKey, channel_id: "", message: "", enabled: false, ...data },
        ],
      });
    }
  };

  const toggleRule = (ruleKey) => {
    const config = getConfig(ruleKey);
    updateConfig(ruleKey, { enabled: !config.enabled });
    toast.success(!config.enabled ? "Automatisation activée" : "Automatisation désactivée");
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

  // Only show rules that send messages (they need channel + message config)
  const messageRules = globalRules.filter((r) => r.action_type === "send_message");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Automatisations</p>
        <p className="text-xs text-muted-foreground">Configurez le salon cible et le message de chaque automatisation. Si le message est laissé vide, un message par défaut s'applique.</p>
      </div>

      {/* Per-rule automation configs */}
      {messageRules.length > 0 ? (
        <div className="space-y-3">
          {messageRules.map((rule) => {
            const config = getConfig(rule.key);
            const TrigIcon = TRIGGER_ICONS[rule.trigger_type] || Zap;
            const defaultMsg = rule.config?.message || "";
            const effectiveMessage = config.message || defaultMsg;
            const previewMessage = effectiveMessage.replace(/\{user\}/g, "NouveauMembre");

            return (
              <div key={rule.id} className="rounded-2xl border overflow-hidden" style={{ borderColor: config.enabled ? accent + "40" : theme?.border, background: config.enabled ? accent + "05" : "rgba(255,255,255,0.03)" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <TrigIcon className="w-4 h-4 shrink-0" style={{ color: accent }} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{rule.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: accent + "15", color: accent }}>
                      {TRIGGER_LABELS[rule.trigger_type] || rule.trigger_type}
                    </span>
                    <button
                      onClick={() => toggleRule(rule.key)}
                      className={cn("w-10 h-5 rounded-full transition tap-sm", config.enabled ? "bg-green-500" : "bg-white/20")}
                    >
                      <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", config.enabled ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </div>
                </div>

                {/* Config body */}
                {config.enabled && (
                  <div className="p-3 space-y-3">
                    {/* Channel selector */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Salon cible</label>
                      <select
                        value={config.channel_id}
                        onChange={(e) => updateConfig(rule.key, { channel_id: e.target.value })}
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
                        Message <span className="text-white/30">(vide = message par défaut)</span>
                      </label>
                      <textarea
                        value={config.message}
                        onChange={(e) => updateConfig(rule.key, { message: e.target.value })}
                        rows={2}
                        placeholder={defaultMsg || "Bienvenue {user} ! 🎉"}
                        className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder:text-white/20 outline-none resize-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      />
                      {!config.message && defaultMsg && (
                        <p className="text-[9px] text-muted-foreground mt-0.5">Par défaut : <span className="italic">"{defaultMsg}"</span></p>
                      )}
                    </div>

                    {/* Preview */}
                    {config.channel_id && (
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
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground py-4">Aucune règle d'automatisation disponible.</p>
      )}

      {/* Non-message rules (assign_role, etc.) */}
      {globalRules.filter((r) => r.action_type !== "send_message").length > 0 && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.03)" }}>
          <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <Zap className="w-4 h-4" style={{ color: accent }} />
            <span className="text-sm font-bold text-white">Autres automatisations</span>
          </div>
          <div className="p-3 space-y-1.5">
            {globalRules.filter((r) => r.action_type !== "send_message").map((rule) => {
              const config = getConfig(rule.key);
              const isEnabled = config.enabled;
              return (
                <div key={rule.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: isEnabled ? accent + "08" : "transparent" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{rule.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{rule.description}</p>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.key)}
                    className={cn("shrink-0 tap-sm", !rule.is_active && "opacity-40 cursor-not-allowed")}
                    disabled={!rule.is_active}
                  >
                    {isEnabled ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-4 text-white/20" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Buttons */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Zap className="w-4 h-4" style={{ color: accent }} />
          <span className="text-sm font-bold text-white">Boutons interactifs</span>
          <span className="text-[9px] text-muted-foreground ml-auto">{interactiveButtons.length}/5</span>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-[11px] text-muted-foreground">Ces boutons apparaissent sous le message de bienvenue. Les membres peuvent cliquer pour réagir instantanément.</p>

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