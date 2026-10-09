import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Server, Shield, Hash, Zap, UserSquare, Palette, Mail, Boxes, RefreshCw, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ChannelStructureManager from "@/components/community/ChannelStructureManager";
import RoleManager from "@/components/community/RoleManager";
import ServerAutomations from "@/components/community/ServerAutomations";
import ProfilePopupConfig from "@/components/admin/nexus/ProfilePopupConfig";
import ServerAppearanceConfig from "@/components/admin/nexus/ServerAppearanceConfig";
import InvitationConfig from "@/components/admin/nexus/InvitationConfig";
import CategoryExtensions from "@/components/admin/nexus/CategoryExtensions";

const ACCENT = "#a855f7";
const THEME = { accent: ACCENT, card: "#0f0a19", border: "rgba(255,255,255,0.08)" };

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const GLOBAL_CONFIG_NAME = "Nexus Global Config";

const TABS = [
  { id: "roles", label: "Rôles & Permissions", icon: Shield },
  { id: "structure", label: "Structure des Salons", icon: Hash },
  { id: "automations", label: "Automatisations", icon: Zap },
  { id: "profile", label: "Pop-ups de Profil", icon: UserSquare },
  { id: "appearance", label: "Structure & Apparence", icon: Palette },
  { id: "invitation", label: "Système d'Invitation", icon: Mail },
  { id: "extensions", label: "Extensions par Catégorie", icon: Boxes },
];

export default function NexusServerManager() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("roles");
  const [saving, setSaving] = useState(false);
  const [configId, setConfigId] = useState(null);

  // Load the single global config record
  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["nexus-global-config"],
    queryFn: () =>
      base44.entities.ServerTemplate.filter({ name: GLOBAL_CONFIG_NAME }, "-created_date", 5),
    select: (res) => (Array.isArray(res) ? res : res?.items || []),
  });

  useEffect(() => {
    if (configs.length > 0 && !configId) setConfigId(configs[0].id);
  }, [configs, configId]);

  const { data: config } = useQuery({
    queryKey: ["nexus-global-config", configId],
    queryFn: () => base44.entities.ServerTemplate.get(configId),
    enabled: !!configId,
    placeholderData: (prev) => prev,
  });

  // Create the global config on first load
  useEffect(() => {
    if (!isLoading && configs.length === 0 && !configId) {
      base44.entities.ServerTemplate.create({
        name: GLOBAL_CONFIG_NAME,
        description: "Configuration globale des serveurs Nexus",
        is_default: true,
        channels: [
          { id: makeId(), name: "bienvenue", type: "category" },
          { id: makeId(), name: "general", type: "text", topic: "Salon général", permissions: { read: "everyone", write: "everyone" }, settings: {} },
          { id: makeId(), name: "annonces", type: "announce", topic: "Annonces officielles", permissions: { read: "everyone", write: "admin" }, settings: {} },
          { id: makeId(), name: "Général", type: "category" },
          { id: makeId(), name: "discussion", type: "text", topic: "Discussion libre", permissions: { read: "everyone", write: "everyone" }, settings: {} },
        ],
        custom_roles: [
          { id: makeId(), name: "Modérateur", color: "#3b82f6", icon: "", permissions: { kick_members: true, timeout_members: true, view_logs: true, manage_messages: true } },
        ],
        welcome_enabled: true,
        welcome_message: "Bienvenue {user} sur le serveur ! 🎉",
        welcome_channel_id: null,
        interactive_buttons: [{ id: makeId(), label: "Coucou", emoji: "👋" }],
        profile_popup_config: {},
        appearance_config: {},
        invitation_config: {},
        category_extensions: [],
      }).then((rec) => {
        setConfigId(rec.id);
        qc.invalidateQueries({ queryKey: ["nexus-global-config"] });
      }).catch(() => {});
    }
  }, [isLoading, configs.length, configId, qc]);

  // Real-time sync
  useEffect(() => {
    const unsub = base44.entities.ServerTemplate.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["nexus-global-config"] });
      qc.invalidateQueries({ queryKey: ["nexus-global-config", configId] });
    });
    return unsub;
  }, [configId, qc]);

  const handleUpdate = async (partial) => {
    if (!config?.id) return;
    setSaving(true);
    try {
      await base44.entities.ServerTemplate.update(config.id, partial);
      qc.invalidateQueries({ queryKey: ["nexus-global-config", config.id] });
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  const channels = config?.channels || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)", border: "1.5px solid rgba(168,85,247,0.4)" }}>
          <Server className="w-4 h-4" style={{ color: ACCENT }} />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">Serveurs Nexus</h2>
          <p className="text-[10px] text-white/40">Gestion globale des rôles, salons, automatisations et fonctionnalités</p>
        </div>
        {saving && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-white/40">
            <RefreshCw className="w-3 h-3 animate-spin" /> Sync...
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap border-b pb-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                tab === t.id ? "text-white" : "text-white/40 hover:text-white/60"
              }`}
              style={
                tab === t.id
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

      {/* Content */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-white/10 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
        </div>
      )}

      {!isLoading && config && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(15,10,25,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {tab === "roles" && (
            <RoleManager server={config} theme={THEME} channels={channels} onUpdate={handleUpdate} accent={ACCENT} />
          )}
          {tab === "structure" && (
            <ChannelStructureManager server={config} theme={THEME} channels={channels} onUpdate={handleUpdate} accent={ACCENT} />
          )}
          {tab === "automations" && (
            <ServerAutomations server={config} theme={THEME} channels={channels} onUpdate={handleUpdate} accent={ACCENT} />
          )}
          {tab === "profile" && (
            <ProfilePopupConfig config={config} onUpdate={handleUpdate} accent={ACCENT} />
          )}
          {tab === "appearance" && (
            <ServerAppearanceConfig config={config} onUpdate={handleUpdate} accent={ACCENT} />
          )}
          {tab === "invitation" && (
            <InvitationConfig config={config} onUpdate={handleUpdate} accent={ACCENT} />
          )}
          {tab === "extensions" && (
            <CategoryExtensions config={config} onUpdate={handleUpdate} accent={ACCENT} />
          )}
        </div>
      )}
    </div>
  );
}