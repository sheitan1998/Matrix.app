import React, { useState, useEffect } from "react";
import { X, Pencil, Key, ExternalLink, Server as ServerIcon, Loader2, Copy, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { fetchUniverseServers } from "@/lib/serverDirectory";
import ServerApiPanel from "@/components/prospecteurs/ServerApiPanel";

export default function MyServersModal({ user, onClose, onEdit }) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("nexus");
  const [apiPanelServer, setApiPanelServer] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch both universes, then filter by author_email
        const [nexus, discord] = await Promise.all([
          fetchUniverseServers("nexus"),
          fetchUniverseServers("discord"),
        ]);
        const all = [...(nexus || []), ...(discord || [])].filter(
          (s) => s.author_email === user.email
        );
        setServers(all);
      } catch {
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.email]);

  const tabServers = servers.filter((s) => s.server_type === activeTab);

  const handleRegenerateKey = async (serverId) => {
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "regenerateApiKey",
        serverAdId: serverId,
      });
      if (res.data?.success) {
        toast.success("Clé API régénérée");
        setServers((prev) =>
          prev.map((s) => (s.id === serverId ? { ...s, api_key: res.data.api_key } : s))
        );
      }
    } catch {
      toast.error("Erreur lors de la régénération");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{ background: "#12091c", border: "1px solid rgba(138,79,255,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(138,79,255,0.2)" }}
        >
          <h2 className="text-sm font-black tracking-wider uppercase text-white">Mes serveurs</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {apiPanelServer ? (
          <div className="overflow-y-auto scrollbar-thin flex-1">
            <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(138,79,255,0.1)" }}>
              <button
                onClick={() => setApiPanelServer(null)}
                className="text-[10px] font-bold text-white/50 hover:text-white transition tap-sm"
              >
                ← Retour
              </button>
              <span className="text-xs font-bold text-white truncate">{apiPanelServer.title}</span>
            </div>
            <div className="p-5">
              <ServerApiPanel server={apiPanelServer} />
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 p-1 mx-5 mt-3 rounded-lg shrink-0" style={{ background: "rgba(138,79,255,0.05)" }}>
              {["nexus", "discord"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className="flex-1 h-8 rounded-md text-[10px] font-bold tracking-wider uppercase transition tap-sm"
                  style={activeTab === t
                    ? { background: "linear-gradient(135deg, #8a4fff, #5b21b6)", color: "#fff" }
                    : { color: "rgba(255,255,255,0.4)" }}
                >
                  {t === "nexus" ? "Nexus" : "Discord"}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="overflow-y-auto scrollbar-thin flex-1 p-5">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : tabServers.length === 0 ? (
                <div className="text-center py-8">
                  <ServerIcon className="w-8 h-8 mx-auto mb-2 text-white/20" />
                  <p className="text-xs text-white/40">Aucun serveur {activeTab} publié</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tabServers.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl p-3 flex items-center gap-3"
                      style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center text-xs font-black text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
                      >
                        {(s.logo_url || s.profile_image) ? (
                          <img src={s.logo_url || s.profile_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          s.title?.[0]?.toUpperCase() || "S"
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{s.title}</p>
                        <div className="flex items-center gap-2 text-[9px] text-white/40">
                          <span className="flex items-center gap-0.5">
                            <ServerIcon className="w-2.5 h-2.5" /> {s.votes_month || 0} votes/mois
                          </span>
                          {s.is_boosted && (
                            <span className="text-amber-400 font-bold">BOOSTÉ</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onEdit(s)}
                          className="w-7 h-7 rounded flex items-center justify-center transition tap-sm"
                          style={{ background: "rgba(138,79,255,0.15)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
                          title="Modifier"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setApiPanelServer(s)}
                          className="w-7 h-7 rounded flex items-center justify-center transition tap-sm"
                          style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}
                          title="Clé API"
                        >
                          <Key className="w-3 h-3" />
                        </button>
                        <a
                          href={`${window.location.origin}/servers/${s.slug || s.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded flex items-center justify-center transition tap-sm"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                          title="Voir la fiche"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}