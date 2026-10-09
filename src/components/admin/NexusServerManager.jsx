import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Server, Hash, Crown, Zap, RefreshCw, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import ChannelStructureManager from "@/components/community/ChannelStructureManager";
import RoleManager from "@/components/community/RoleManager";
import ServerAutomations from "@/components/community/ServerAutomations";

const ACCENT = "#a855f7";
const THEME = { accent: ACCENT, card: "#0f0a19", border: "rgba(255,255,255,0.08)" };

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Default template structure — the reference configuration applied to new servers
const DEFAULT_TEMPLATE = {
  name: "Template par défaut",
  description: "Structure de référence pour les nouveaux serveurs Nexus",
  is_default: true,
  channels: [
    { id: makeId(), name: "bienvenue", type: "category" },
    { id: makeId(), name: "general", type: "text", category_id: null, topic: "Salon général", permissions: { read: "everyone", write: "everyone" }, settings: {} },
    { id: makeId(), name: "annonces", type: "announce", category_id: null, topic: "Annonces officielles", permissions: { read: "everyone", write: "admin" }, settings: {} },
    { id: makeId(), name: "Général", type: "category" },
    { id: makeId(), name: "discussion", type: "text", category_id: null, topic: "Discussion libre", permissions: { read: "everyone", write: "everyone" }, settings: {} },
    { id: makeId(), name: "Salon Vocal", type: "voice", category_id: null, permissions: { read: "everyone", write: "everyone" }, settings: {} },
  ],
  custom_roles: [
    {
      id: makeId(),
      name: "Modérateur",
      color: "#3b82f6",
      icon: "",
      permissions: {
        view_channels: true, manage_channels: false, manage_roles: false, manage_emojis: false,
        view_logs: true, create_invite: true, change_nicknames: true,
        kick_members: true, accept_members: true, ban_members: false, timeout_members: true,
        send_messages: true, attach_files: true, embed_links: true,
        use_emojis: true, use_stickers: true, use_gifs: true,
        voice_connect: true, voice_move_members: true, administrator: false,
      },
    },
  ],
  welcome_enabled: true,
  welcome_message: "Bienvenue {user} sur le serveur ! 🎉",
  welcome_channel_id: null,
  interactive_buttons: [
    { id: makeId(), label: "Coucou", emoji: "👋" },
  ],
};

export default function NexusServerManager() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [subTab, setSubTab] = useState("structure");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  // Fetch all templates (NOT user servers)
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["admin-server-templates"],
    queryFn: () =>
      base44.entities.ServerTemplate.filter({}, "-is_default,-created_date", 50),
    select: (res) => (Array.isArray(res) ? res : res?.items || []),
  });

  // Auto-select the default template
  useEffect(() => {
    if (!selectedId && templates.length > 0) {
      const def = templates.find((t) => t.is_default) || templates[0];
      setSelectedId(def.id);
    }
  }, [templates, selectedId]);

  // Fetch the selected template fresh
  const { data: template } = useQuery({
    queryKey: ["admin-server-template", selectedId],
    queryFn: () => base44.entities.ServerTemplate.get(selectedId),
    enabled: !!selectedId,
    placeholderData: (prev) => prev,
  });

  // Real-time subscription — any template change anywhere syncs instantly
  useEffect(() => {
    const unsub = base44.entities.ServerTemplate.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["admin-server-templates"] });
      qc.invalidateQueries({ queryKey: ["admin-server-template", selectedId] });
    });
    return unsub;
  }, [selectedId, qc]);

  // Persist changes to the template — connected to the database in real-time
  const handleUpdate = async (partial) => {
    if (!template?.id) return;
    setSaving(true);
    try {
      await base44.entities.ServerTemplate.update(template.id, partial);
      qc.invalidateQueries({ queryKey: ["admin-server-template", template.id] });
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const created = await base44.entities.ServerTemplate.create({
        name,
        description: "",
        is_default: false,
        channels: [],
        custom_roles: [],
        welcome_enabled: false,
        welcome_message: "",
        welcome_channel_id: null,
        interactive_buttons: [],
      });
      setSelectedId(created.id);
      setNewName("");
      toast.success("Template créé");
      qc.invalidateQueries({ queryKey: ["admin-server-templates"] });
    } catch {
      toast.error("Erreur lors de la création");
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.ServerTemplate.delete(id);
      if (selectedId === id) setSelectedId(null);
      toast.success("Template supprimé");
      qc.invalidateQueries({ queryKey: ["admin-server-templates"] });
    } catch {
      toast.error("Suppression impossible");
    }
  };

  const handleSetDefault = async (id) => {
    // Unset all other defaults, then set the selected one
    setSaving(true);
    try {
      for (const t of templates) {
        if (t.is_default && t.id !== id) {
          await base44.entities.ServerTemplate.update(t.id, { is_default: false });
        }
      }
      await base44.entities.ServerTemplate.update(id, { is_default: true });
      qc.invalidateQueries({ queryKey: ["admin-server-templates"] });
      toast.success("Template par défaut mis à jour");
    } catch {
      toast.error("Erreur");
    }
    setSaving(false);
  };

  // Ensure a default template exists on first load
  useEffect(() => {
    if (!isLoading && templates.length === 0) {
      base44.entities.ServerTemplate.create(DEFAULT_TEMPLATE).then(() => {
        qc.invalidateQueries({ queryKey: ["admin-server-templates"] });
      }).catch(() => {});
    }
  }, [isLoading, templates.length, qc]);

  const channels = template?.channels || [];

  const subTabs = [
    { id: "structure", label: "Structure", icon: Hash },
    { id: "roles", label: "Rôles & Permissions", icon: Crown },
    { id: "automations", label: "Automatisations", icon: Zap },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)", border: "1.5px solid rgba(168,85,247,0.4)" }}>
          <Server className="w-4 h-4" style={{ color: ACCENT }} />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">Templates Serveurs Nexus</h2>
          <p className="text-[10px] text-white/40">Modèles globaux de structure, rôles et automatisations</p>
        </div>
        {saving && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-white/40">
            <RefreshCw className="w-3 h-3 animate-spin" /> Sync...
          </span>
        )}
      </div>

      {/* Template list + create */}
      <div className="space-y-2">
        {templates.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 p-2.5 rounded-xl transition cursor-pointer"
            style={{
              background: selectedId === t.id ? "rgba(168,85,247,0.12)" : "rgba(15,10,25,0.6)",
              border: selectedId === t.id ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
            }}
            onClick={() => setSelectedId(t.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">{t.name}</span>
                {t.is_default && (
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black text-white" style={{ background: ACCENT }}>
                    DÉFAUT
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/40 truncate">
                {(t.channels || []).filter((c) => c.type !== "category").length} salons · {(t.custom_roles || []).length} rôles
                {t.welcome_enabled ? " · Bienvenue actif" : ""}
              </p>
            </div>
            {!t.is_default && (
              <button
                onClick={(e) => { e.stopPropagation(); handleSetDefault(t.id); }}
                className="px-2 py-1 rounded-lg text-[9px] font-bold text-white/40 hover:text-white transition tap-sm"
                style={{ background: "rgba(255,255,255,0.05)" }}
                title="Définir comme template par défaut"
              >
                <Check className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400/60 hover:text-red-400 transition tap-sm"
              style={{ background: "rgba(239,68,68,0.08)" }}
              title="Supprimer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Create new template */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: "rgba(15,10,25,0.4)", border: "1px dashed rgba(255,255,255,0.1)" }}>
          <Plus className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            placeholder="Nouveau template..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/30 outline-none"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white transition disabled:opacity-30 tap-sm"
            style={{ background: ACCENT }}
          >
            Créer
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-white/10 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
        </div>
      )}

      {/* Sub-tabs + content */}
      {template && (
        <>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xs font-black text-white">{template.name}</h3>
            {template.is_default && (
              <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black text-white" style={{ background: ACCENT }}>DÉFAUT</span>
            )}
          </div>

          <div className="flex gap-1.5 border-b pb-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {subTabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setSubTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                    subTab === t.id ? "text-white" : "text-white/40 hover:text-white/60"
                  }`}
                  style={
                    subTab === t.id
                      ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }
                      : { border: "1px solid transparent" }
                  }
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl p-4" style={{ background: "rgba(15,10,25,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {subTab === "structure" && (
              <ChannelStructureManager
                server={template}
                theme={THEME}
                channels={channels}
                onUpdate={handleUpdate}
                accent={ACCENT}
              />
            )}
            {subTab === "roles" && (
              <RoleManager
                server={template}
                theme={THEME}
                channels={channels}
                onUpdate={handleUpdate}
                accent={ACCENT}
              />
            )}
            {subTab === "automations" && (
              <ServerAutomations
                server={template}
                theme={THEME}
                channels={channels}
                onUpdate={handleUpdate}
                accent={ACCENT}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}