import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Coins, Crown, LogOut, Radio, History, LayoutDashboard, Upload, Trash2, AlertTriangle, Wallet, Sparkles, Check, X, Edit3, Heart, Users, Film, Clapperboard, ArrowLeft } from "lucide-react";
import { formatTrix, formatTimeAgo } from "@/lib/format";
import NitroAvatarPicker, { NitroAvatar } from "@/components/NitroAvatarPicker";
import FriendsList from "@/components/profile/FriendsList";
import XPBar from "@/components/progression/XPBar";
import { useProgression } from "@/context/ProgressionContext";

const TABS = [
  { key: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { key: "videos", label: "Vidéos", icon: Film },
  { key: "projects", label: "Projets Studio", icon: Clapperboard },
  { key: "subs", label: "Abonnements", icon: Heart },
  { key: "friends", label: "Amis", icon: Users },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [videos, setVideos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const { progress } = useProgression();

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      setUser(me);
      setEditName(me?.full_name || "");
      setEditBio(me?.bio || "");
      if (me) {
        const tx = await base44.entities.TrixTransaction.filter({ user_email: me.email }, "-created_date", 20);
        setTransactions(tx);
        loadTabData(me);
      }
    })();
  }, []);

  const loadTabData = async (u) => {
    try {
      const [vids, projs, subs] = await Promise.all([
        base44.entities.Video.filter({ channel_id: u.email }, "-created_date", 50).catch(() => []),
        base44.entities.VideoProject.filter({ owner_email: u.email }, "-created_date", 50).catch(() => []),
        base44.entities.Subscription.filter({ user_email: u.email }, "-created_date", 50).catch(() => []),
      ]);
      setVideos(vids);
      setProjects(projs);
      setSubscriptions(subs);
    } catch (e) { /* ignore */ }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: editName.trim(), bio: editBio.trim() });
      setUser(u => ({ ...u, full_name: editName.trim(), bio: editBio.trim() }));
      setEditing(false);
    } catch (e) { /* ignore */ }
    setSaving(false);
  };

  if (!user) return <div className="p-8 text-muted-foreground">Chargement...</div>;

  return (
    <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto space-y-6">
      {/* Header with editing */}
      <div className="flex flex-col md:flex-row md:items-center gap-5 p-6 rounded-2xl bg-card border border-border">
        <button onClick={() => setShowAvatarPicker(true)} className="shrink-0 relative group">
          <NitroAvatar url={user.animated_avatar || user.avatar_url} name={user.full_name} size="xl" />
          {user.is_premium && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-premium flex items-center justify-center border-2 border-background">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
        </button>

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Pseudo" className="font-bold text-lg" />
              <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Ta bio..." rows={2} className="resize-none text-sm" />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveProfile} disabled={saving || !editName.trim()} className="rounded-full">
                  <Check className="w-3.5 h-3.5 mr-1" /> {saving ? "Sauvegarde..." : "Enregistrer"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditName(user.full_name || ""); setEditBio(user.bio || ""); }} className="rounded-full">
                  <X className="w-3.5 h-3.5 mr-1" /> Annuler
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black truncate">{user.full_name || user.email?.split("@")[0]}</h1>
                {user.is_premium && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full gradient-premium text-white text-xs font-bold">
                    <Crown className="w-3 h-3" /> PREMIUM
                  </div>
                )}
                <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="rounded-full h-7 px-2.5">
                  <Edit3 className="w-3 h-3 mr-1" /> Modifier
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.bio && <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{user.bio}</p>}
              {!user.bio && <p className="text-xs text-muted-foreground italic mt-1">Aucune bio. Clique sur "Modifier" pour en ajouter une.</p>}
            </>
          )}
        </div>

        <div className="flex gap-2 flex-wrap md:flex-col">
          <Button variant="outline" onClick={() => base44.auth.logout()} className="rounded-full">
            <LogOut className="w-4 h-4 mr-1.5" /> Déconnexion
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 mr-1.5" /> Supprimer
          </Button>
        </div>
      </div>

      {/* Progression XP Bar */}
      {progress && (
        <Link to="/progression" className="block">
          <XPBar />
        </Link>
      )}

      {/* Quick stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/wallet" className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition">
          <Wallet className="w-5 h-5 text-primary" />
          <p className="text-xs text-muted-foreground mt-2">Portefeuille</p>
          <p className="text-xl font-black font-mono mt-0.5">{formatTrix(user.trix_balance || 0)} 🪙</p>
        </Link>
        <div className="p-5 rounded-2xl bg-card border border-border">
          <Film className="w-5 h-5 text-blue-400" />
          <p className="text-xs text-muted-foreground mt-2">Vidéos</p>
          <p className="text-xl font-black mt-0.5">{videos.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border">
          <Clapperboard className="w-5 h-5 text-violet-400" />
          <p className="text-xs text-muted-foreground mt-2">Projets</p>
          <p className="text-xl font-black mt-0.5">{projects.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border">
          <Heart className="w-5 h-5 text-red-400" />
          <p className="text-xs text-muted-foreground mt-2">Abonnements</p>
          <p className="text-xl font-black mt-0.5">{subscriptions.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === t.key ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"
            }`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Creator tools */}
          <div className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-bold text-lg mb-4">Espace Créateur</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <Link to="/dashboard" className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition">
                <LayoutDashboard className="w-6 h-6 text-primary" />
                <div><p className="font-semibold text-sm">Dashboard</p><p className="text-xs text-muted-foreground">Stats & gestion</p></div>
              </Link>
              <Link to="/upload" className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition">
                <Upload className="w-6 h-6 text-primary" />
                <div><p className="font-semibold text-sm">Publier</p><p className="text-xs text-muted-foreground">Mise en ligne</p></div>
              </Link>
              <Link to="/studio" className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border hover:border-live/40 hover:bg-live/5 transition">
                <Radio className="w-6 h-6 text-live" />
                <div><p className="font-semibold text-sm">Live</p><p className="text-xs text-muted-foreground">Diffusion</p></div>
              </Link>
            </div>
          </div>

          {/* Transaction history */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-5">
              <History className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-bold text-lg">Historique TRIX</h2>
            </div>
            <div className="space-y-2">
              {transactions.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucune transaction</p>}
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(tx.created_date)}</p>
                  </div>
                  <span className={`font-mono font-bold ${tx.amount > 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {tx.amount > 0 ? "+" : ""}{formatTrix(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "videos" && (
        <div className="space-y-3">
          {videos.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-card border border-border">
              <Film className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Aucune vidéo publiée</p>
              <Link to="/upload"><Button variant="outline" size="sm" className="mt-4 rounded-full">Publier une vidéo</Button></Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((v) => (
                <Link key={v.id} to={`/watch/${v.id}`} className="rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 transition group">
                  <div className="relative aspect-video">
                    {v.thumbnail_url ? <img src={v.thumbnail_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-secondary" />}
                    <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded bg-black/70">{v.duration || "0:00"}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold truncate">{v.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{v.views || 0} vues · {formatTimeAgo(v.created_date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "projects" && (
        <div className="space-y-3">
          {projects.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-card border border-border">
              <Clapperboard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Aucun projet Studio</p>
              <Link to="/video-studio"><Button variant="outline" size="sm" className="mt-4 rounded-full">Ouvrir Video Studio</Button></Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <Link key={p.id} to="/video-studio" className="rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 transition group">
                  <div className="relative aspect-video">
                    {p.thumbnail_url ? <img src={p.thumbnail_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center"><Clapperboard className="w-10 h-10 text-violet-400" /></div>}
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-purple-600/80">{p.resolution}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.duration || "0:00"} · {formatTimeAgo(p.updated_date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "subs" && (
        <div className="space-y-2">
          {subscriptions.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-card border border-border">
              <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Aucun abonnement</p>
            </div>
          ) : (
            subscriptions.map((s) => (
              <Link key={s.id} to={`/channel/${s.channel_id}`} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">{s.channel_name?.[0] || "?"}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{s.channel_name}</p>
                  <p className="text-xs text-muted-foreground">Abonné {formatTimeAgo(s.created_date)}</p>
                </div>
                {s.tier !== "free" && <span className="text-[9px] font-black px-2 py-1 rounded-full bg-premium/20 text-premium">{s.tier?.toUpperCase()}</span>}
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === "friends" && (
        <div className="p-6 rounded-2xl bg-card border border-border">
          <FriendsList user={user} />
        </div>
      )}

      {showAvatarPicker && (
        <NitroAvatarPicker user={user} onClose={() => setShowAvatarPicker(false)} onSave={(url) => setUser((u) => ({ ...u, animated_avatar: url }))} />
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-destructive/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div><h3 className="font-black text-lg">Supprimer le compte</h3><p className="text-xs text-muted-foreground">Cette action est irréversible</p></div>
            </div>
            <p className="text-sm text-muted-foreground">Toutes tes données seront définitivement supprimées.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-full">Annuler</Button>
              <Button onClick={() => { setShowDeleteConfirm(false); base44.auth.logout(); }} className="flex-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}