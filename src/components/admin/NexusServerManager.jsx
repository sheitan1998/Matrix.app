import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Server, Hash, Crown, Zap, RefreshCw, ChevronDown } from "lucide-react";
import ChannelStructureManager from "@/components/community/ChannelStructureManager";
import RoleManager from "@/components/community/RoleManager";
import ServerAutomations from "@/components/community/ServerAutomations";

const ACCENT = "#a855f7";
const THEME = { accent: ACCENT, card: "#0f0a19", border: "rgba(255,255,255,0.08)" };

export default function NexusServerManager() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [subTab, setSubTab] = useState("structure");
  const [saving, setSaving] = useState(false);

  // Fetch all Nexus servers
  const { data: servers = [], isLoading } = useQuery({
    queryKey: ["admin-nexus-servers"],
    queryFn: () =>
      base44.entities.Server.filter(
        { server_type: "nexus" },
        "-created_date",
        200
      ),
    select: (res) => (Array.isArray(res) ? res : res?.items || []),
  });

  // Auto-select first server
  useEffect(() => {
    if (!selectedId && servers.length > 0) setSelectedId(servers[0].id);
  }, [servers, selectedId]);

  // Fetch the selected server's full data fresh
  const { data: server } = useQuery({
    queryKey: ["admin-server", selectedId],
    queryFn: () => base44.entities.Server.get(selectedId),
    enabled: !!selectedId,
    placeholderData: (prev) => prev,
  });

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.Server.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["admin-nexus-servers"] });
      qc.invalidateQueries({ queryKey: ["admin-server", selectedId] });
    });
    return unsub;
  }, [selectedId, qc]);

  const handleUpdate = async (partial) => {
    if (!server?.id) return;
    setSaving(true);
    try {
      await base44.entities.Server.update(server.id, partial);
      qc.invalidateQueries({ queryKey: ["admin-server", server.id] });
    } catch {
      /* silent */
    }
    setSaving(false);
  };

  const channels = server?.channels || [];
  const membersCount = server?.members_count || 0;
  const boosts = server?.boosts || 0;

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
          <h2 className="text-sm font-black text-white">Serveurs Nexus</h2>
          <p className="text-[10px] text-white/40">Gestion centralisée des serveurs communautaires</p>
        </div>
        {saving && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-white/40">
            <RefreshCw className="w-3 h-3 animate-spin" /> Sync...
          </span>
        )}
      </div>

      {/* Server selector */}
      {servers.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <select
              value={selectedId || ""}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-xl text-xs font-bold text-white outline-none cursor-pointer"
              style={{ background: "rgba(15,10,25,0.8)", border: "1px solid rgba(168,85,247,0.3)" }}
            >
              {servers.map((s) => (
                <option key={s.id} value={s.id} className="bg-neutral-900">
                  {s.icon_emoji || "🏠"} {s.name} ({s.members_count || 0} membres)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40" />
          </div>
          {server && (
            <div className="flex items-center gap-2 text-[10px] text-white/40">
              <span className="px-2 py-1 rounded-lg" style={{ background: "rgba(168,85,247,0.1)" }}>
                {channels.filter((c) => c.type !== "category").length} salons
              </span>
              <span className="px-2 py-1 rounded-lg" style={{ background: "rgba(59,130,246,0.1)" }}>
                {membersCount} membres
              </span>
              <span className="px-2 py-1 rounded-lg" style={{ background: "rgba(245,158,11,0.1)" }}>
                {boosts} boosts
              </span>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-white/10 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
        </div>
      )}

      {!isLoading && servers.length === 0 && (
        <div className="text-center py-12 text-white/30">
          <Server className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucun serveur Nexus créé pour le moment.</p>
        </div>
      )}

      {/* Sub-tabs + content */}
      {server && (
        <>
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
                server={server}
                theme={THEME}
                channels={channels}
                onUpdate={handleUpdate}
                accent={ACCENT}
              />
            )}
            {subTab === "roles" && (
              <RoleManager
                server={server}
                theme={THEME}
                channels={channels}
                onUpdate={handleUpdate}
                accent={ACCENT}
              />
            )}
            {subTab === "automations" && (
              <ServerAutomations
                server={server}
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