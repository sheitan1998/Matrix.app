import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Search, Server as ServerIcon, Sparkles } from "lucide-react";
import AdminDirectoryRow from "./AdminDirectoryRow";
import CreateAdModal from "@/components/prospecteurs/CreateAdModal";
import CreateCreatorModal from "@/components/prospecteurs/CreateCreatorModal";
import { slugify, detectServerType } from "@/lib/serverDirectory";

const TABS = [
  { key: "servers", label: "Serveurs", icon: ServerIcon },
  { key: "channels", label: "Chaînes / Créateurs", icon: Sparkles },
];

export default function AdminDirectoryManager() {
  const [tab, setTab] = useState("servers");
  const [servers, setServers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingServer, setEditingServer] = useState(null);
  const [editingChannel, setEditingChannel] = useState(null);
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    try {
      const [adList, channelList] = await Promise.all([
        base44.entities.ServerAd.filter({ type: "server" }, "-created_date", 300),
        base44.entities.CreatorChannel.list("-created_date", 300),
      ]);
      setServers(Array.isArray(adList) ? adList : adList?.items || []);
      setChannels(Array.isArray(channelList) ? channelList : channelList?.items || []);
    } catch {
      toast.error("Chargement impossible");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveServer = async (data) => {
    if (!editingServer) return;
    try {
      const payload = {
        ...data,
        slug: slugify(data.title),
        server_type: detectServerType(data.discord_link),
      };
      const res = await base44.functions.invoke("serverSearch", {
        action: "updateAd",
        serverAdId: editingServer.id,
        data: payload,
      });
      if (res.data?.error) {
        toast.error(res.data.error);
        return;
      }
      const updated = res.data?.ad || { ...editingServer, ...payload };
      setServers((prev) => prev.map((s) => (s.id === editingServer.id ? { ...s, ...updated } : s)));
      setEditingServer(null);
      toast.success("Annonce serveur enregistrée");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Enregistrement impossible");
    }
  };

  const deleteServer = async (server) => {
    if (!window.confirm(`Supprimer l'annonce « ${server.title} » ?`)) return;
    setBusyId(server.id);
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "deleteAd", serverAdId: server.id });
      if (res.data?.error) throw new Error(res.data.error);
      setServers((prev) => prev.filter((s) => s.id !== server.id));
      toast.success("Annonce supprimée");
    } catch {
      toast.error("Suppression impossible");
    } finally {
      setBusyId("");
    }
  };

  const deleteChannel = async (channel) => {
    if (!window.confirm(`Supprimer la chaîne « ${channel.name} » ?`)) return;
    setBusyId(channel.id);
    try {
      await base44.entities.CreatorChannel.delete(channel.id);
      setChannels((prev) => prev.filter((c) => c.id !== channel.id));
      toast.success("Chaîne supprimée");
    } catch {
      toast.error("Suppression impossible");
    } finally {
      setBusyId("");
    }
  };

  const visibleServers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return servers;
    return servers.filter((s) =>
      (s.title || "").toLowerCase().includes(query) ||
      (s.description || "").toLowerCase().includes(query) ||
      (s.author_email || "").toLowerCase().includes(query) ||
      (Array.isArray(s.tags) && s.tags.some((tag) => (tag || "").toLowerCase().includes(query)))
    );
  }, [servers, search]);

  const visibleChannels = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return channels;
    return channels.filter((c) =>
      (c.name || "").toLowerCase().includes(query) ||
      (c.description || "").toLowerCase().includes(query) ||
      (c.owner_email || "").toLowerCase().includes(query)
    );
  }, [channels, search]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">Annonces serveurs & chaînes</h3>
        <p className="text-[10px] text-white/40">
          Modifie ou supprime n'importe quelle publication, même celle d'un autre auteur.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="h-8 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1.5 tap-sm"
              style={tab === key
                ? { background: "rgba(168,85,247,0.2)", color: "#fff", border: "1px solid rgba(168,85,247,0.4)" }
                : { color: "rgba(255,255,255,0.45)" }}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un titre, un auteur..."
            className="w-full h-9 pl-9 pr-3 rounded-lg text-xs text-white placeholder:text-white/25 outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
          ))}
        </div>
      ) : tab === "servers" ? (
        <div className="space-y-2">
          {visibleServers.length === 0 ? (
            <p className="text-xs text-white/40 py-6 text-center">Aucune annonce serveur</p>
          ) : visibleServers.map((server) => (
            <AdminDirectoryRow
              key={server.id}
              item={server}
              type="server"
              busy={busyId === server.id}
              onEdit={setEditingServer}
              onDelete={deleteServer}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {visibleChannels.length === 0 ? (
            <p className="text-xs text-white/40 py-6 text-center">Aucune chaîne</p>
          ) : visibleChannels.map((channel) => (
            <AdminDirectoryRow
              key={channel.id}
              item={channel}
              type="channel"
              busy={busyId === channel.id}
              onEdit={setEditingChannel}
              onDelete={deleteChannel}
            />
          ))}
        </div>
      )}

      {editingServer && (
        <CreateAdModal
          initialType="server"
          editAd={editingServer}
          onClose={() => setEditingServer(null)}
          onSubmit={saveServer}
        />
      )}

      {editingChannel && (
        <CreateCreatorModal
          channel={editingChannel}
          onClose={() => setEditingChannel(null)}
          onSaved={(channel) => {
            if (channel) setChannels((prev) => prev.map((c) => (c.id === channel.id ? { ...c, ...channel } : c)));
            setEditingChannel(null);
            toast.success("Chaîne mise à jour");
          }}
        />
      )}
    </div>
  );
}