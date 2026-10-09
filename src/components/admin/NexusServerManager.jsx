import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Shield, Zap, UserSquare, Boxes, RefreshCw, Plus, Trash2, Edit3, Check, X } from "lucide-react";
import { toast } from "sonner";
import PermissionBuilder from "@/components/admin/nexus/PermissionBuilder";
import AutomationRuleBuilder from "@/components/admin/nexus/AutomationRuleBuilder";
import ProfileBlockBuilder from "@/components/admin/nexus/ProfileBlockBuilder";
import GlobalExtensionBuilder from "@/components/admin/nexus/GlobalExtensionBuilder";

const ACCENT = "#a855f7";

const TABS = [
  { id: "permissions", label: "Permissions Dynamiques", icon: Shield },
  { id: "automations", label: "Règles d'Automatisation", icon: Zap },
  { id: "profile", label: "Blocs de Pop-up Profil", icon: UserSquare },
  { id: "extensions", label: "Extensions Globales", icon: Boxes },
];

export default function NexusServerManager() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("permissions");
  const [saving, setSaving] = useState(false);

  // Real-time sync for all dynamic entities
  useEffect(() => {
    const unsubs = [
      base44.entities.NexusPermission.subscribe(() => qc.invalidateQueries({ queryKey: ["nexus-permissions"] })),
      base44.entities.NexusAutomationRule.subscribe(() => qc.invalidateQueries({ queryKey: ["nexus-automation-rules"] })),
      base44.entities.NexusProfileBlock.subscribe(() => qc.invalidateQueries({ queryKey: ["nexus-profile-blocks"] })),
      base44.entities.NexusGlobalExtension.subscribe(() => qc.invalidateQueries({ queryKey: ["nexus-global-extensions"] })),
    ];
    return () => unsubs.forEach((u) => u && u());
  }, [qc]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)", border: "1.5px solid rgba(168,85,247,0.4)" }}>
          <Shield className="w-4 h-4" style={{ color: ACCENT }} />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">Serveurs Nexus — Générateur de Règles</h2>
          <p className="text-[10px] text-white/40">Création dynamique de permissions, automatisations et extensions — appliquées en temps réel à tous les serveurs</p>
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
              style={tab === t.id ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { border: "1px solid transparent" }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(15,10,25,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {tab === "permissions" && <PermissionBuilder accent={ACCENT} />}
        {tab === "automations" && <AutomationRuleBuilder accent={ACCENT} />}
        {tab === "profile" && <ProfileBlockBuilder accent={ACCENT} />}
        {tab === "extensions" && <GlobalExtensionBuilder accent={ACCENT} />}
      </div>
    </div>
  );
}