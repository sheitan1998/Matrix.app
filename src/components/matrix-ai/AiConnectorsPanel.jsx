import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Brain, CalendarDays, Link2, Loader2, Lock, MessageSquare, NotebookPen, Paperclip, Pencil, Play,
  Plus, Send, Trash2, Webhook, Workflow, X, Zap,
} from "lucide-react";
import {
  CONNECTOR_CATALOG,
  MAX_WEBHOOKS_PER_USER,
  MAX_WEBHOOK_NAME_LENGTH,
} from "../../../base44/shared/aiConnectors.ts";

const ICONS = {
  webhook: Webhook,
  slack: MessageSquare,
  telegram: Send,
  make: Workflow,
  zapier: Zap,
  n8n: Workflow,
  notion: NotebookPen,
  calendar: CalendarDays,
};

const TONES = {
  ok: { color: "#34d399", background: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.35)" },
  todo: { color: "#c4b5fd", background: "rgba(138,79,255,0.14)", border: "rgba(138,79,255,0.4)" },
  off: { color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.15)" },
  locked: { color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)" },
  warn: { color: "#f87171", background: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)" },
};

const PURPLE_BUTTON = { background: "linear-gradient(135deg, #8a4fff, #6d28d9)" };
const FIELD_CLASS = "w-full h-8 rounded-lg px-2.5 text-[11px] text-white placeholder:text-white/30 bg-white/5 border border-white/10 focus:outline-none focus:border-[#8a4fff]";

const errorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.response?.data?.error || fallback;

function StatusBadge({ tone, children }) {
  const colors = TONES[tone];
  return (
    <span
      className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black whitespace-nowrap"
      style={{ color: colors.color, background: colors.background, border: `1px solid ${colors.border}` }}
    >
      {children}
    </span>
  );
}

function Switch({ checked, onChange, label, disabled }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="shrink-0 w-8 h-[18px] rounded-full relative transition disabled:opacity-50"
      style={{ background: checked ? "#8a4fff" : "rgba(255,255,255,0.15)" }}
    >
      <span
        className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all"
        style={{ left: checked ? "16px" : "2px" }}
      />
    </button>
  );
}

function AddButton({ onClick, disabled, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed tap-sm"
      style={disabled ? { background: "rgba(255,255,255,0.06)" } : PURPLE_BUTTON}
    >
      <Plus className="w-3.5 h-3.5" />
    </button>
  );
}

function CatalogRow({ icon: Icon, name, action, badge, trailing }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl p-2.5" style={{ background: "rgba(138,79,255,0.06)", border: "1px solid rgba(138,79,255,0.18)" }}>
      <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(138,79,255,0.16)" }}>
        <Icon className="w-4 h-4" style={{ color: "#c4b5fd" }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-white">{name}</span>
          {badge}
        </div>
        <p className="text-[9px] text-white/45 leading-snug">{action}</p>
      </div>
      {trailing}
    </div>
  );
}

function Category({ label, children }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35 px-0.5">{label}</h3>
      {children}
    </section>
  );
}

function WebhookForm({ initial, busy, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [url, setUrl] = useState("");
  const editing = Boolean(initial);

  const submit = (event) => {
    event.preventDefault();
    onSubmit({ name, url });
  };

  return (
    <form onSubmit={submit} className="rounded-xl p-2.5 space-y-2" style={{ background: "rgba(138,79,255,0.1)", border: "1px solid rgba(138,79,255,0.35)" }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={MAX_WEBHOOK_NAME_LENGTH}
        placeholder="Nom (ex. Discord annonces)"
        aria-label="Nom du webhook"
        className={FIELD_CLASS}
        required
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        type="url"
        inputMode="url"
        autoComplete="off"
        placeholder={editing ? `Nouvelle URL (laisser vide pour garder ${initial.url_preview})` : "https://discord.com/api/webhooks/…"}
        aria-label="URL du webhook"
        className={FIELD_CLASS}
        required={!editing}
      />
      <p className="text-[9px] text-white/35 leading-snug">
        URL https publique uniquement (Discord, Make, Zapier, n8n ou autre). Elle est stockée côté serveur et jamais réaffichée en entier.
      </p>
      <div className="flex gap-1.5">
        <button
          type="submit"
          disabled={busy}
          className="h-7 px-3 rounded-lg text-[10px] font-black text-white disabled:opacity-50 tap-sm"
          style={PURPLE_BUTTON}
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : "Enregistrer"}
        </button>
        <button type="button" onClick={onCancel} className="h-7 px-3 rounded-lg text-[10px] font-bold text-white/60 hover:text-white tap-sm">
          Annuler
        </button>
      </div>
    </form>
  );
}

function WebhookItem({ webhook, busyId, onToggle, onTest, onEdit, onDelete }) {
  const busy = busyId === webhook.id;
  const failed = webhook.status === "error";
  return (
    <div className="rounded-lg px-2.5 py-2 space-y-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-white/85 truncate flex-1">{webhook.name}</span>
        {!webhook.enabled ? <StatusBadge tone="off">Désactivé</StatusBadge>
          : failed ? <StatusBadge tone="warn">Erreur</StatusBadge>
          : <StatusBadge tone="ok">Actif</StatusBadge>}
        <Switch checked={webhook.enabled} onChange={() => onToggle(webhook)} disabled={busy} label={`Activer ${webhook.name}`} />
      </div>
      <p className="text-[9px] text-white/35 truncate">{webhook.url_preview}</p>
      {failed && webhook.last_error && <p className="text-[9px] text-red-300 leading-snug">{webhook.last_error}</p>}
      <div className="flex items-center gap-3 pt-0.5">
        <button onClick={() => onTest(webhook)} disabled={busy} className="flex items-center gap-1 text-[10px] font-bold text-white/65 hover:text-white disabled:opacity-50 tap-sm">
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Tester
        </button>
        <button onClick={() => onEdit(webhook)} className="flex items-center gap-1 text-[10px] font-bold text-white/65 hover:text-white tap-sm">
          <Pencil className="w-3 h-3" /> Modifier
        </button>
        <button onClick={() => onDelete(webhook)} disabled={busy} className="ml-auto flex items-center gap-1 text-[10px] font-bold text-red-300 disabled:opacity-50 tap-sm" aria-label={`Supprimer ${webhook.name}`}>
          <Trash2 className="w-3 h-3" /> Supprimer
        </button>
      </div>
    </div>
  );
}

export default function AiConnectorsPanel({ open, onClose, quota, refreshToken = 0, onUpgrade, onMemoryToggled }) {
  const [webhooks, setWebhooks] = useState([]);
  const [eligible, setEligible] = useState(Boolean(quota?.features?.connectors));
  const [formMode, setFormMode] = useState(null); // null | "new" | id du webhook en édition
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [memories, setMemories] = useState([]);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const memoryEligible = Boolean(quota?.features?.memory);
  const memoryEnabled = Boolean(quota?.memory_enabled);

  const applyPayload = (data) => {
    if (!data) return;
    setWebhooks(data.webhooks || []);
    setEligible(Boolean(data.eligible));
  };

  const call = (action, params = {}) => base44.functions.invoke("aiConnectors", { action, ...params });

  const loadConnectors = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("aiConnectors", { action: "status" });
      setWebhooks(res.data?.webhooks || []);
      setEligible(Boolean(res.data?.eligible));
    } catch {
      setWebhooks([]);
    }
  }, []);

  const loadMemories = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("matrixAi", { action: "memory_list" });
      setMemories(res.data?.memories || []);
    } catch {
      setMemories([]);
    }
  }, []);

  useEffect(() => {
    if (open) loadConnectors();
  }, [open, loadConnectors, refreshToken, quota?.plan_tier]);

  useEffect(() => {
    if (open && memoryOpen) loadMemories();
  }, [open, memoryOpen, loadMemories]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const saveWebhook = async ({ name, url }) => {
    setSaving(true);
    try {
      const editing = formMode !== "new" ? formMode : null;
      const res = await call("webhook_save", { id: editing, name, ...(url.trim() ? { url } : {}) });
      applyPayload(res.data);
      setFormMode(null);
      toast.success(editing ? "Webhook mis à jour" : "Webhook ajouté");
    } catch (err) {
      toast.error(errorMessage(err, "Impossible d'enregistrer le webhook"));
    } finally {
      setSaving(false);
    }
  };

  const toggleWebhook = async (webhook) => {
    setBusyId(webhook.id);
    try {
      const res = await call("webhook_toggle", { id: webhook.id, enabled: !webhook.enabled });
      applyPayload(res.data);
    } catch (err) {
      toast.error(errorMessage(err, "Impossible de modifier le webhook"));
    } finally {
      setBusyId("");
    }
  };

  const testWebhook = async (webhook) => {
    setBusyId(webhook.id);
    try {
      const res = await call("webhook_test", { id: webhook.id });
      applyPayload(res.data);
      const result = res.data?.result;
      if (result?.ok) toast.success(result.message);
      else toast.error(result?.message || "Échec de l'envoi du test");
    } catch (err) {
      toast.error(errorMessage(err, "Impossible de tester le webhook"));
    } finally {
      setBusyId("");
    }
  };

  const deleteWebhook = async (webhook) => {
    setBusyId(webhook.id);
    try {
      const res = await call("webhook_delete", { id: webhook.id });
      applyPayload(res.data);
      if (formMode === webhook.id) setFormMode(null);
      toast.success("Webhook supprimé");
    } catch (err) {
      toast.error(errorMessage(err, "Impossible de supprimer le webhook"));
    } finally {
      setBusyId("");
    }
  };

  const toggleMemory = async () => {
    try {
      const res = await base44.functions.invoke("matrixAi", { action: "memory_toggle", enabled: !memoryEnabled });
      onMemoryToggled?.(Boolean(res.data?.enabled));
    } catch (err) {
      toast.error(errorMessage(err, "Impossible de modifier la mémoire"));
    }
  };

  const deleteMemory = async (memory) => {
    try {
      await base44.functions.invoke("matrixAi", { action: "memory_delete", memory_id: memory.id });
      setMemories((prev) => prev.filter((item) => item.id !== memory.id));
    } catch {
      toast.error("Impossible de supprimer ce souvenir");
    }
  };

  const clearMemories = async () => {
    try {
      await base44.functions.invoke("matrixAi", { action: "memory_clear" });
      setMemories([]);
      toast.success("Mémoire effacée");
    } catch {
      toast.error("Impossible d'effacer la mémoire");
    }
  };

  if (!open) return null;

  const activeCount = webhooks.filter((w) => w.enabled && w.status !== "error").length;
  const limitReached = webhooks.length >= MAX_WEBHOOKS_PER_USER;
  const editingWebhook = formMode && formMode !== "new" ? webhooks.find((w) => w.id === formMode) : null;

  const webhookBadge = !eligible ? <StatusBadge tone="locked">Matrix Plus</StatusBadge>
    : activeCount > 0 ? <StatusBadge tone="ok">Actif</StatusBadge>
    : <StatusBadge tone="todo">À configurer</StatusBadge>;

  const onAddWebhook = () => {
    if (!eligible) onUpgrade?.();
    else setFormMode("new");
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label="Connecteurs">
      <button
        aria-label="Fermer les connecteurs"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-default"
      />
      <div
        className="relative w-full max-w-sm h-full overflow-y-auto scrollbar-thin px-4 py-5 space-y-4"
        style={{
          background: "linear-gradient(180deg, #0c0716 0%, #05030a 100%)",
          borderLeft: "1px solid rgba(138,79,255,0.4)",
          boxShadow: "-10px 0 60px rgba(138,79,255,0.25)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">Matrix AI</p>
            <h2 className="text-base font-black text-white">Connecteurs</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white tap-sm" aria-label="Fermer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-white/45 leading-snug">
          Chaque demande qui déclenche un connecteur consomme un message de ton quota Matrix AI, comme une demande normale.
        </p>

        {CONNECTOR_CATALOG.map((category) => (
          <Category key={category.id} label={category.label}>
            {category.items.map((item) => {
              const Icon = ICONS[item.id] || Webhook;
              if (item.id !== "webhook") {
                return (
                  <CatalogRow
                    key={item.id}
                    icon={Icon}
                    name={item.name}
                    action={item.action}
                    badge={<StatusBadge tone="off">Bientôt disponible</StatusBadge>}
                    trailing={<AddButton disabled label={`${item.name} bientôt disponible`} />}
                  />
                );
              }
              return (
                <div key={item.id} className="space-y-1.5">
                  <CatalogRow
                    icon={Icon}
                    name={item.name}
                    action={eligible ? item.action : "Inclus à partir de Matrix Plus."}
                    badge={webhookBadge}
                    trailing={
                      <AddButton
                        onClick={onAddWebhook}
                        disabled={eligible && (limitReached || formMode === "new")}
                        label="Ajouter un webhook"
                      />
                    }
                  />
                  {!eligible && (
                    <button onClick={onUpgrade} className="h-7 px-2.5 rounded-lg text-[10px] font-black text-white tap-sm" style={PURPLE_BUTTON}>
                      Passer à Matrix Plus
                    </button>
                  )}
                  {eligible && limitReached && formMode === null && (
                    <p className="text-[9px] text-white/40">Limite de {MAX_WEBHOOKS_PER_USER} webhooks atteinte.</p>
                  )}
                  {eligible && formMode === "new" && (
                    <WebhookForm busy={saving} onSubmit={saveWebhook} onCancel={() => setFormMode(null)} />
                  )}
                  {eligible && webhooks.map((webhook) =>
                    editingWebhook?.id === webhook.id ? (
                      <WebhookForm key={webhook.id} initial={webhook} busy={saving} onSubmit={saveWebhook} onCancel={() => setFormMode(null)} />
                    ) : (
                      <WebhookItem
                        key={webhook.id}
                        webhook={webhook}
                        busyId={busyId}
                        onToggle={toggleWebhook}
                        onTest={testWebhook}
                        onEdit={(w) => setFormMode(w.id)}
                        onDelete={deleteWebhook}
                      />
                    ),
                  )}
                </div>
              );
            })}
          </Category>
        ))}

        <Category label="Intégré à Matrix AI">
          <div className="rounded-xl p-2.5 space-y-1.5" style={{ background: "rgba(138,79,255,0.06)", border: "1px solid rgba(138,79,255,0.18)" }}>
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" style={{ color: "#c4b5fd" }} />
              <span className="text-[11px] font-bold text-white/85">Mémoire des discussions</span>
              <span className="ml-auto">
                {memoryEligible ? (
                  <Switch checked={memoryEnabled} onChange={toggleMemory} label="Activer la mémoire" />
                ) : (
                  <Lock className="w-3 h-3 text-white/30" />
                )}
              </span>
            </div>
            <p className="text-[9px] text-white/45 leading-snug">
              {memoryEligible
                ? "Matrix AI retient tes préférences d'une discussion à l'autre. Tu peux tout effacer à tout moment."
                : "Mémoire persistante incluse à partir de Matrix Plus."}
            </p>
            {memoryEligible ? (
              <button onClick={() => setMemoryOpen((v) => !v)} className="text-[10px] font-bold text-white/60 hover:text-white tap-sm">
                {memoryOpen ? "Masquer les souvenirs" : "Voir mes souvenirs"}
              </button>
            ) : (
              <button onClick={onUpgrade} className="h-7 px-2.5 rounded-lg text-[10px] font-black text-white tap-sm" style={PURPLE_BUTTON}>
                Passer à Matrix Plus
              </button>
            )}
            {memoryEligible && memoryOpen && (
              <div className="space-y-1">
                {memories.length === 0 ? (
                  <p className="text-[9px] text-white/30">Aucun souvenir pour le moment.</p>
                ) : (
                  <>
                    {memories.map((memory) => (
                      <div key={memory.id} className="flex items-start gap-1.5">
                        <p className="flex-1 text-[10px] text-white/60 leading-snug">{memory.content}</p>
                        <button onClick={() => deleteMemory(memory)} className="text-white/30 hover:text-red-400 tap-sm" aria-label="Supprimer ce souvenir">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button onClick={clearMemories} className="text-[10px] font-bold text-red-300 tap-sm">
                      Tout effacer
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <CatalogRow
            icon={Link2}
            name="Lecture de liens"
            action="Colle jusqu'à 3 liens https dans ton message : Matrix AI lit la page. Adresses internes refusées."
            badge={<StatusBadge tone="ok">Actif</StatusBadge>}
          />
          <CatalogRow
            icon={Paperclip}
            name="Fichiers joints"
            action="Images, PDF, texte, code et données (4 fichiers de 10 Mo max) via le trombone."
            badge={<StatusBadge tone="ok">Actif</StatusBadge>}
          />
        </Category>
      </div>
    </div>
  );
}
