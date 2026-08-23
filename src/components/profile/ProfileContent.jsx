import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Edit3, Check, X, Camera, Zap, Coins, Clapperboard, Award, Users, ShoppingBag, Lock, ChevronRight, ArrowLeft, Trophy, Zap as ZapIcon, LifeBuoy, Rocket } from "lucide-react";
import { ACHIEVEMENTS as ALL_ACHIEVEMENTS } from "@/lib/achievementsData";
import { toast } from "sonner";
import { formatTrix } from "@/lib/format";
import { useProgression } from "@/context/ProgressionContext";
import FriendsPanel from "@/components/profile/FriendsPanel";
import CosmeticsPanel from "@/components/profile/CosmeticsPanel";
import TransactionHistory from "@/components/profile/TransactionHistory";
import PrivacyPanel from "@/components/profile/PrivacyPanel";
import ProfileAnimationLayer from "@/components/profile/ProfileAnimationLayer";
import TrixIcon from "@/components/TrixIcon";
import PWAInstallButton from "@/components/PWAInstallButton";
import SupportTicketModal from "@/components/profile/SupportTicketModal";
import ImageCropModal from "@/components/profile/ImageCropModal";

const TABS = [
{ key: "overview", label: "Vue d'ensemble", icon: Zap },
{ key: "friends", label: "Amis", icon: Users },
{ key: "cosmetics", label: "Cosmétiques", icon: Award },
{ key: "wallet", label: "Transactions", icon: Coins },
{ key: "privacy", label: "Confidentialité", icon: Lock }];


export default function ProfileContent({ onClose }) {
  const nav = useNavigate();
  const { progress, rank, xpNeeded, xpPercent } = useProgression();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [editPseudo, setEditPseudo] = useState("");
  const [showSupport, setShowSupport] = useState(false);
  const [cropModal, setCropModal] = useState(null);

  useEffect(() => {
    base44.auth.me().then((me) => {
      setUser(me);
      setEditBio(me?.bio || "");
      setEditPseudo(me?.pseudo || "");
    }).catch(() => {});
  }, []);

  const { data: cosmetics = [] } = useQuery({
    queryKey: ["user-cosmetics", user?.email],
    queryFn: () => base44.entities.UserCosmetic.filter({ user_email: user.email }, "-created_date", 200),
    enabled: !!user?.email
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["mp-projects", user?.email],
    queryFn: () => base44.entities.VideoProject.filter({ owner_email: user.email }, "-created_date", 50),
    enabled: !!user?.email
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["mp-transactions-count", user?.email],
    queryFn: () => base44.entities.TrixTransaction.filter({ user_email: user.email }, "-created_date", 200),
    enabled: !!user?.email
  });

  const isDonator = transactions.some((t) => t.type === "donation");

  const equippedTitle = cosmetics.find((c) => c.is_equipped && (c.category === "title" || c.category === "animated_title"));
  const equippedFrame = cosmetics.find((c) => c.is_equipped && (c.category === "frame" || c.category === "animated_frame"));
  const equippedBadge = cosmetics.find((c) => c.is_equipped && c.category === "badge");
  const equippedBadges = cosmetics.filter((c) => c.is_equipped && c.category === "badge");
  const equippedAnimation = cosmetics.find((c) => c.is_equipped && c.category === "avatar_animation");
  const equippedCover = cosmetics.find((c) => c.is_equipped && c.category === "profile_cover");
  const equippedCount = cosmetics.filter((c) => c.is_equipped).length;

  const goTo = (path) => {
    if (onClose) onClose();
    nav(path);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updates = { bio: editBio.trim(), pseudo: editPseudo.trim() };
      if (!user.pseudo_tag) updates.pseudo_tag = String(Math.floor(1000 + Math.random() * 9000));
      await base44.auth.updateMe(updates);
      setUser((u) => ({ ...u, ...updates }));
      setEditing(false);
      toast.success("Profil mis à jour");
    } catch {toast.error("Erreur");}
    setSaving(false);
  };

  const uploadImage = async (file, field) => {
    setUploading(field);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ [field]: file_url });
      setUser((u) => ({ ...u, [field]: file_url }));
      toast.success(field === "avatar_url" ? "Photo de profil mise à jour" : "Bannière mise à jour");
    } catch {toast.error("Erreur lors de l'upload");}
    setUploading(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a050f" }}>
        <div className="w-9 h-9 border-4 border-white/10 rounded-full animate-spin" style={{ borderTopColor: "#a855f7" }} />
      </div>);

  }

  const claimedAchievements = progress?.claimed_achievements || [];
  const achievementTrophies = ALL_ACHIEVEMENTS.filter((a) => claimedAchievements.includes(a.id)).reduce((s, a) => s + (a.trophies || 0), 0);
  const totalTrophies = achievementTrophies;

  const stats = [
  { icon: Zap, label: "Niveau", value: progress?.level || 1, color: "#a855f7", link: "/progression" },
  { icon: Trophy, label: "Trophées", value: totalTrophies, color: "#00F2FF", link: "/progression" },
  { icon: Coins, label: "TRIX", value: formatTrix(user.trix_balance || 0), color: "#f59e0b", link: "/wallet" },
  { icon: Clapperboard, label: "Projets", value: projects.length, color: "#3b82f6" },
  { icon: Award, label: "Cosmétiques", value: cosmetics.length, color: "#22C55E" }];


  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden" style={{ backgroundColor: "#0a050f" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(168,85,247,0.08), transparent 60%)" }} />

      <div className="relative z-10 min-h-screen flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            {onClose ?
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <ArrowLeft className="w-4 h-4 text-white/60" />
              </button> :
            null}
            <button onClick={() => goTo("/")} className="flex items-center gap-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">MATRIX</h1>
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => goTo("/boutique-nexus")} className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold text-white transition hover:opacity-90 tap-sm" style={{ background: "rgba(168,85,247,0.15)", border: "1.5px solid rgba(168,85,247,0.4)", boxShadow: "0 0 12px rgba(168,85,247,0.15)" }}>
              <Zap className="w-3.5 h-3.5" fill="currentColor" /> <span className="hidden sm:inline">Boutique Nexus</span><span className="sm:hidden">Nexus</span>
            </button>
            <button onClick={() => goTo("/boutique-matrix")} className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold text-white transition hover:opacity-90 tap-sm" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", boxShadow: "0 0 12px rgba(168,85,247,0.25)" }}>
              <ShoppingBag className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Cosmétiques</span><span className="sm:hidden">Cosmétiques</span>
            </button>
            <button onClick={() => goTo("/trix-store")} className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold text-white transition hover:opacity-90 tap-sm" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 0 12px rgba(251,191,36,0.25)" }}>
              <TrixIcon size={16} /> <span className="hidden sm:inline">Trix</span><span className="sm:hidden">Trix</span>
            </button>
          </div>
        </header>

        {/* Banner / Profile cover */}
        <div className="relative mx-auto rounded-2xl overflow-hidden" style={{ width: "100%", maxWidth: "1200px", height: "300px", background: "rgba(168,85,247,0.1)" }}>
          {equippedCover?.video_url ?
          <video src={equippedCover.video_url} autoPlay loop muted playsInline className="w-full h-full" style={{ objectFit: "cover", objectPosition: "center" }} /> :
          equippedCover?.preview_image ?
          <img src={equippedCover.preview_image} alt="" className="w-full h-full object-cover" /> :
          user.banner_url ?
          <img src={user.banner_url} alt="" className="w-full h-full object-cover" /> :

          <div className="w-full h-full" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(109,40,217,0.1))" }} />
          }
          <label className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
            {uploading === "banner_url" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && setCropModal({ file: e.target.files[0], field: "banner_url" })} />
          </label>
        </div>

        {/* Profile header */}
        <div className="px-4 sm:px-6 -mt-12 relative">
          <div className="flex items-end gap-4 mb-4">
            {/* Avatar with frame */}
            <div className="relative shrink-0 overflow-visible">
              <div className="w-24 h-24 rounded-full p-1" style={{
                background: equippedFrame ? `linear-gradient(135deg, ${equippedFrame.icon || "#a855f7"}, #6d28d9)` : "rgba(168,85,247,0.2)",
                boxShadow: equippedFrame ? "0 0 20px rgba(168,85,247,0.4)" : "none"
              }}>
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
                  {user.avatar_url ?
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> :

                  <span className="text-3xl font-black text-white">{user.full_name?.[0]?.toUpperCase() || "U"}</span>
                  }
                </div>
              </div>
              <ProfileAnimationLayer cosmetic={equippedAnimation} size={96} />
              <label className="absolute bottom-0 right-0 z-20 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={{ background: "#6d28d9", border: "2px solid #0a050f" }}>
                {uploading === "avatar_url" ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && setCropModal({ file: e.target.files[0], field: "avatar_url" })} />
              </label>
              {equippedBadge &&
              <div className="absolute -top-1 -left-1 z-20 text-xl" title={equippedBadge.item_name}>{equippedBadge.icon || "🏅"}</div>
              }
            </div>

            {/* Name + title */}
            <div className="flex-1 min-w-0 pb-2 pl-4 sm:pl-6">
              {editing ?
              <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input value={editPseudo} onChange={(e) => setEditPseudo(e.target.value)} placeholder="Pseudo" autoFocus
                  className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none font-mono"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.3)" }} />
                    <span className="text-sm font-mono font-bold text-white/40 shrink-0">#{user.pseudo_tag || "????"}</span>
                  </div>
                  <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Bio..." rows={2}
                className="w-full px-3 py-1.5 rounded-lg text-xs text-white outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.3)" }} />
                  <div className="flex gap-2">
                    <button onClick={saveProfile} disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                      <Check className="w-3 h-3" /> {saving ? "..." : "OK"}
                    </button>
                    <button onClick={() => {setEditing(false);setEditBio(user.bio || "");setEditPseudo(user.pseudo || "");}} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/60" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div> :

              <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-white leading-tight font-mono">
                      {user.pseudo || "Pseudo non défini"}<span className="text-white/40">#{user.pseudo_tag || "????"}</span>
                    </h2>
                    <button onClick={() => setEditing(true)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <Edit3 className="w-3.5 h-3.5 text-white/50" />
                    </button>
                  </div>
                  {equippedTitle &&
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(109,40,217,0.15))", border: "1px solid rgba(168,85,247,0.3)", color: "#c084fc" }}>
                      {equippedTitle.icon || "✨"} {equippedTitle.item_name}
                    </span>
                }
                  {isDonator &&
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#4ade80" }}>
                      <Trophy className="w-2.5 h-2.5" /> Donateur
                    </span>
                }
                  <p className="text-xs text-white/50 leading-relaxed">{user.bio || "Aucune bio. Cliquez sur le crayon pour en ajouter une."}</p>
                  {/* Badges */}
                  {equippedBadges.length > 0 &&
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {equippedBadges.map((b) =>
                  <span key={b.id} className="text-lg leading-none" title={b.item_name}>{b.icon || "🏅"}</span>
                  )}
                    </div>
                }
                </div>
              }
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {stats.map((s, i) => {
              const content =
              <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <s.icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</p>
                  <p className="text-lg font-black text-white mt-0.5">{s.value}</p>
                </div>;

              return s.link ? <button key={i} onClick={() => goTo(s.link)} className="text-left">{content}</button> : <div key={i}>{content}</div>;
            })}
          </div>

          {/* XP Boosters inventory */}
          <div className="mb-4">
            <button
              onClick={() => goTo("/progression")}
              className="w-full flex items-center gap-3 p-4 rounded-2xl transition hover:opacity-90"
              style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(251,191,36,0.15)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(251,191,36,0.15)" }}>
                <Rocket className="w-4 h-4" style={{ color: "#fbbf24" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-white">Boosters XP</p>
                <p className="text-[10px] text-white/40">
                  {progress?.active_xp_boost
                    ? `x${progress.active_xp_boost.multiplier} actif`
                    : `${progress?.xp_boosters?.length || 0} en stock`}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
            </button>
          </div>

          {/* PWA Install */}
          <div className="mb-4">
            <PWAInstallButton />
          </div>

          {/* Contact Support */}
          <div className="mb-4">
            <button
              onClick={() => setShowSupport(true)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl transition hover:opacity-90"
              style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
              
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
                <LifeBuoy className="w-4 h-4" style={{ color: "#a855f7" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-white">Contacter le Support</p>
                <p className="text-[10px] text-white/40">Un bug, un problème de paiement, un signalement ? Écrivez-nous.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
            </button>
          </div>

          {/* XP / Level progress bar */}
          {progress &&
          <div className="p-4 rounded-2xl mb-6" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Niveau {progress.level || 1}</span>
                  {rank &&
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${rank.color}20`, color: rank.color }}>
                      {rank.icon} {rank.name}
                    </span>
                }
                </div>
                <span className="text-[10px] text-white/40 font-mono">
                  {progress.xp || 0} / {xpNeeded} XP
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${xpPercent}%`,
                  background: "linear-gradient(90deg, #a855f7, #6d28d9)",
                  boxShadow: "0 0 10px rgba(168,85,247,0.5)"
                }} />
              
              </div>
            </div>
          }

          {/* Tabs */}
          <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar border-b border-white/5 pb-1">
            {TABS.map((t) =>
            <button key={t.key} onClick={() => setTab(t.key)}
            className={`relative px-3 py-2.5 font-bold whitespace-nowrap transition text-base [font-family:'Inter',_system-ui,_sans-serif] ${tab === t.key ? "text-white" : "text-white/40 hover:text-white/60"}`}>
                <t.icon className="w-3.5 h-3.5 inline mr-1" /> {t.label}
                {tab === t.key && <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: "#a855f7" }} />}
              </button>
            )}
          </div>

          {/* Tab content */}
          <div className="pb-8">
            {tab === "overview" &&
            <div className="space-y-4">
                <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
                  <h3 className="text-sm font-bold text-white mb-3">Cosmétiques équipés ({equippedCount})</h3>
                  <div className="flex flex-wrap gap-3">
                    {equippedCount === 0 && <p className="text-xs text-white/40">Aucun cosmétique équipé.</p>}
                    {cosmetics.filter((c) => c.is_equipped).map((c) =>
                  <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
                        <span className="text-lg">{c.icon || "✨"}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{c.item_name}</p>
                          <p className="text-[9px] text-white/40">{c.category}</p>
                        </div>
                      </div>
                  )}
                  </div>
                  <button onClick={() => setTab("cosmetics")} className="mt-3 text-xs font-bold text-white/50 hover:text-white flex items-center gap-1">
                    Gérer mes cosmétiques <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <h3 className="text-sm font-bold text-white mb-3">Activité récente</h3>
                  {transactions.length === 0 ?
                <p className="text-xs text-white/40">Aucune activité</p> :

                <div className="space-y-2">
                      {transactions.slice(0, 5).map((tx) =>
                  <div key={tx.id} className="flex items-center justify-between text-xs">
                          <span className="text-white/60 truncate flex-1">{tx.description}</span>
                          <span className="font-mono font-bold shrink-0 ml-2" style={{ color: tx.amount > 0 ? "#22C55E" : "#ef4444" }}>
                            {tx.amount > 0 ? "+" : ""}{formatTrix(tx.amount)}
                          </span>
                        </div>
                  )}
                    </div>
                }
                  <button onClick={() => setTab("wallet")} className="mt-3 text-xs font-bold text-white/50 hover:text-white flex items-center gap-1">
                    Voir tout l'historique <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            }
            {tab === "friends" && <FriendsPanel user={user} onClose={onClose} />}
            {tab === "cosmetics" && <CosmeticsPanel user={user} />}
            {tab === "wallet" && <TransactionHistory user={user} />}
            {tab === "privacy" && <PrivacyPanel user={user} onUpdate={setUser} />}
          </div>
        </div>
      </div>

      {showSupport && <SupportTicketModal user={user} onClose={() => setShowSupport(false)} />}
      {cropModal && (
        <ImageCropModal
          file={cropModal.file}
          aspect={cropModal.field === "avatar_url" ? 1 : 3}
          onCrop={(croppedFile) => { uploadImage(croppedFile, cropModal.field); setCropModal(null); }}
          onClose={() => setCropModal(null)}
        />
      )}
    </div>);

}