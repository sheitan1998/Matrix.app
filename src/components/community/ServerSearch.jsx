import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, UserPlus, Globe, Lock, ArrowLeft } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { getTheme } from "@/lib/visualThemes";
import { toast } from "sonner";

export default function ServerSearch({ onSelectServer, onClose }) {
  const [query, setQuery] = useState("");
  const [friendPseudo, setFriendPseudo] = useState("");
  const [tab, setTab] = useState("servers"); // "servers" | "friends"
  const [addingFriend, setAddingFriend] = useState(false);
  const [user, setUser] = useState(null);
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: allServers = [] } = useQuery({
    queryKey: ["servers-all"],
    queryFn: () => base44.entities.Server.filter({ is_public: true }, "-created_date", 50),
  });

  const filtered = query.trim()
    ? allServers.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allServers;

  const addFriend = async () => {
    const pseudo = friendPseudo.trim();
    if (!pseudo || !user) return;
    if (!pseudo.includes("#")) { toast.error("Format : Pseudo#NNNN"); return; }
    setAddingFriend(true);
    // Search users by pseudo stored on User entity
    const allUsers = await base44.entities.User.list("-created_date", 200).catch(() => []);
    const found = allUsers.find(u => u.pseudo === pseudo || u.full_name === pseudo.split("#")[0]);
    if (!found) { toast.error("Utilisateur introuvable"); setAddingFriend(false); return; }
    if (found.email === user.email) { toast.error("C'est vous !"); setAddingFriend(false); return; }
    // Check if already friends
    const existing = await base44.entities.Friend.filter({ user_email: user.email, friend_email: found.email }).catch(() => []);
    if (existing.length > 0) { toast.info("Déjà ami ou demande en cours"); setAddingFriend(false); return; }
    await base44.entities.Friend.create({
      user_email: user.email,
      friend_email: found.email,
      friend_name: found.full_name || found.email.split("@")[0],
      friend_pseudo: pseudo,
      status: "pending_sent",
    });
    // Create reciprocal
    await base44.entities.Friend.create({
      user_email: found.email,
      friend_email: user.email,
      friend_name: user.full_name || user.email.split("@")[0],
      friend_pseudo: user.pseudo || (user.full_name + "#0000"),
      status: "pending_received",
    });
    toast.success(`Demande envoyée à ${pseudo} !`);
    setFriendPseudo("");
    setAddingFriend(false);
    qc.invalidateQueries({ queryKey: ["friends"] });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: "hsl(var(--background)/0.97)", backdropFilter: "blur(20px)" }}>

      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border flex items-center gap-3">
        <button onClick={onClose} className="text-muted-foreground hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-black text-white text-base flex-1">Découvrir</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex px-4 py-2 gap-2 border-b border-border">
        {[
          { key: "servers", label: "🔍 Serveurs" },
          { key: "friends", label: "👥 Ajouter un ami" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold transition"
            style={{
              background: tab === t.key ? "hsl(var(--primary))" : "hsl(var(--secondary))",
              color: tab === t.key ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))"
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "servers" && (
        <>
          {/* Search bar */}
          <div className="px-4 py-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-border bg-secondary/40">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un serveur..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-10">
                {query ? "Aucun serveur trouvé" : "Chargement..."}
              </p>
            )}
            {filtered.map((s) => {
              const t = getTheme(s.visual_theme || "default");
              return (
                <motion.button key={s.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onSelectServer(s); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition hover:bg-secondary/50"
                  style={{ borderColor: t.border, background: t.bg + "40" }}>
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border shrink-0" style={{ borderColor: t.border }}>
                    {s.icon_url
                      ? <img src={s.icon_url} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: t.accent + "25" }}>
                          {s.icon_emoji || "🏠"}
                        </div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white truncate">{s.name}</p>
                    {s.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{s.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {s.is_public
                        ? <span className="flex items-center gap-1 text-[10px] text-green-400"><Globe className="w-2.5 h-2.5" /> Public</span>
                        : <span className="flex items-center gap-1 text-[10px] text-yellow-400"><Lock className="w-2.5 h-2.5" /> Privé</span>}
                      <span className="text-[10px] text-muted-foreground">· {s.members_count || 1} membres</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </>
      )}

      {tab === "friends" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-sm mx-auto space-y-4 pt-4">
            <div className="text-center">
              <p className="text-4xl mb-2">👥</p>
              <p className="font-black text-white text-lg">Ajouter un ami</p>
              <p className="text-xs text-muted-foreground mt-1">Entrez le Pseudo#NNNN de la personne</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-border bg-secondary/40">
              <UserPlus className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={friendPseudo}
                onChange={(e) => setFriendPseudo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFriend()}
                placeholder="Pseudo#1234"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground outline-none"
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">Format : NomUtilisateur#NNNN</p>
            <button onClick={addFriend} disabled={!friendPseudo.trim() || addingFriend}
              className="w-full py-3 rounded-2xl font-bold text-sm transition disabled:opacity-40"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              {addingFriend ? "Envoi..." : "Envoyer la demande d'ami"}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}