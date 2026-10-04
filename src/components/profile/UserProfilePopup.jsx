import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { base44 } from "@/api/base44Client";
import { X, MessageCircle, UserPlus, UserMinus, Ban, Shield, Crown, Send } from "lucide-react";
import { toast } from "sonner";
import { ACHIEVEMENTS } from "@/lib/achievementsData";
import ProfileAnimationLayer from "@/components/profile/ProfileAnimationLayer";
import { getCosmeticIconImageUrl } from "@/lib/cosmeticAssetUrl";
import { isUserOnline, getActivityIcon } from "@/hooks/usePresence";
import ReportContentModal from "@/components/admin/ReportContentModal";

const PANEL_ID = "user-profile-side-panel";

const RARITY_COLORS = {
  common: "#9ca3af", rare: "#3b82f6", epic: "#a855f7", legendary: "#f59e0b",
};

export default function UserProfilePopup({ userId, userEmail, open, onClose, onOpenDm }) {
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [cosmetics, setCosmetics] = useState([]);
  const [friendStatus, setFriendStatus] = useState("none");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [dmInput, setDmInput] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (!open || (!userId && !userEmail)) return;
    setLoading(true);
    setProfile(null);
    setProgress(null);
    setCosmetics([]);
    setFriendStatus("none");

    const fetchProfile = async () => {
      try {
        const me = await base44.auth.me();
        setCurrentUser(me);
        let u;
        if (userId) {
          const res = await base44.functions.invoke("serverSearch", { action: "getUsersByIds", ids: [userId] });
          u = res?.data?.users?.[0];
        } else if (userEmail) {
          const res = await base44.functions.invoke("serverSearch", { action: "searchUser", email: userEmail });
          u = res?.data?.user;
        }
        if (u) {
          setProfile(u);
          const targetId = u.id || userId;
          const lookupEmail = u.email || userEmail;
          if (lookupEmail) {
            try {
              const userCosmetics = await base44.entities.UserCosmetic.filter({ user_email: lookupEmail, is_equipped: true }, "-created_date", 50);
              setCosmetics(userCosmetics || []);
            } catch { setCosmetics([]); }
            try {
              const progressRecords = await base44.entities.UserProgress.filter({ user_email: lookupEmail });
              if (progressRecords.length > 0) setProgress(progressRecords[0]);
            } catch { /* silent */ }
          }
          if (targetId) {
            try {
              const statusRes = await base44.functions.invoke("serverSearch", { action: "getFriendStatus", friend_user_id: targetId });
              setFriendStatus(statusRes?.data?.status || "none");
            } catch { /* silent */ }
          }
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchProfile();
  }, [open, userId, userEmail]);

  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => { if (e.key === "Escape") onClose(); };
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    const timer = setTimeout(() => document.addEventListener("click", handleClickOutside), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  const displayName = profile?.pseudo?.split("#")[0] || profile?.full_name || userEmail?.split("@")[0] || "Utilisateur";
  const pseudoTag = profile?.pseudo_tag || profile?.pseudo?.split("#")[1] || "";
  const avatar = profile?.avatar_url;
  const isAdmin = profile?.role === "admin";
  const level = progress?.level || 1;
  const targetUserId = profile?.id || userId;
  const targetEmail = profile?.email || userEmail;

  // Trophies — same calculation as ProfileContent (claimed_achievements)
  const claimed = progress?.claimed_achievements || [];
  const trophies = ACHIEVEMENTS.filter(a => claimed.includes(a.id)).reduce((s, a) => s + (a.trophies || 0), 0);

  const equippedAnimation = cosmetics.find(c => c.is_equipped && c.category === "avatar_animation");
  const equippedBadges = cosmetics.filter(c => c.is_equipped && c.category === "badge");

  const handleAddFriend = async () => {
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "sendFriendRequest", target_user_id: targetUserId });
      if (res?.data?.success) { setFriendStatus("pending_sent"); toast.success("Demande d'ami envoyée"); }
      else { toast.error(res?.data?.error || "Erreur"); }
    } catch { toast.error("Erreur lors de l'envoi"); }
    setActionLoading(false);
  };

  const handleRemoveFriend = async () => {
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "removeFriend", friend_user_id: targetUserId });
      if (res?.data?.success) { setFriendStatus("none"); toast.success("Ami supprimé"); }
      else { toast.error("Erreur"); }
    } catch { toast.error("Erreur"); }
    setActionLoading(false);
  };

  const handleBlock = async () => {
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "blockFriend", friend_user_id: targetUserId });
      if (res?.data?.success) { setFriendStatus("blocked"); toast.success("Utilisateur bloqué"); }
      else { toast.error("Erreur"); }
    } catch { toast.error("Erreur"); }
    setActionLoading(false);
  };

  const handleUnblock = async () => {
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "removeFriend", friend_user_id: targetUserId });
      if (res?.data?.success) { setFriendStatus("none"); toast.success("Utilisateur débloqué"); }
      else { toast.error("Erreur"); }
    } catch { toast.error("Erreur"); }
    setActionLoading(false);
  };

  const handleSendDm = async () => {
    if (!dmInput.trim() || !currentUser) return;
    try {
      await base44.entities.DirectMessage.create({
        sender_email: currentUser.email,
        sender_name: currentUser.full_name || currentUser.email?.split("@")[0],
        sender_avatar: currentUser.avatar_url || "",
        recipient_email: targetEmail,
        recipient_name: displayName,
        content: dmInput.trim(),
      });
      toast.success("Message envoyé !");
      setDmInput("");
      onClose();
    } catch {
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  if (loading) {
    return createPortal(
      <div
        id={PANEL_ID}
        className="fixed right-4 top-20 z-[90] w-80 max-w-[calc(100vw-2rem)]"
        style={{ background: "#18191c", borderRadius: "16px", border: "1px solid rgba(168,85,247,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", padding: "24px" }}
      >
        <div className="flex items-center justify-center">
          <div className="w-9 h-9 border-4 border-white/10 rounded-full animate-spin" style={{ borderTopColor: "#a855f7" }} />
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={panelRef}
      id={PANEL_ID}
      className="fixed right-4 top-20 z-[90] w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin rounded-2xl"
      style={{ background: "#18191c", border: "1px solid rgba(168,85,247,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
    >
      <div
        className="w-full flex flex-col"
      >
        {/* Header banner */}
        <div className="h-20 relative" style={{ background: "linear-gradient(135deg, #a5a1d7, #8b87c4)" }}>
          <div className="absolute top-3 right-3 flex gap-1.5">
            {friendStatus !== "blocked" && (
              <button
                onClick={() => { window.dispatchEvent(new CustomEvent("matrix-open-chat", { detail: { friendEmail: targetEmail } })); onClose(); }}
                className="w-7 h-7 rounded-full flex items-center justify-center tap-sm"
                style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
                title="Envoyer un message"
              >
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center tap-sm" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}>
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Avatar + identity */}
        <div className="px-5 pb-3 -mt-10">
          <div className="relative inline-block overflow-visible">
            <div className="w-20 h-20 rounded-full border-4 overflow-hidden flex items-center justify-center" style={{ borderColor: "#18191c", background: "rgba(168,85,247,0.15)" }}>
              {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-white">{displayName?.[0]?.toUpperCase()}</span>}
            </div>
            <ProfileAnimationLayer cosmetic={equippedAnimation} size={80} />
            {/* Status indicator */}
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: "#18191c", background: "#fbbf24" }}>
              <span className="text-[8px]">🌙</span>
            </div>
          </div>

          {/* Username + tag */}
          <div className="mt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-black text-white">{displayName}</h3>
              {isAdmin && <Shield className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-white/40 font-mono">{displayName}</span>
              {pseudoTag && <span className="text-[11px] text-white/30 font-mono">#{pseudoTag}</span>}
              {/* Achievement icons */}
              {trophies > 0 && (
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="text-[10px]" title="Trophées">🏆</span>
                  <span className="text-[10px] text-white/40 font-bold">{trophies}</span>
                </span>
              )}
            </div>
          </div>

          {/* Activity status (Discord-style) */}
          {(() => {
            const online = isUserOnline(profile?.last_seen);
            const showActivity = profile?.show_game_activity !== false;
            const activity = showActivity ? profile?.current_activity : "";
            const activityType = showActivity ? (profile?.current_activity_type || "idle") : "idle";
            const customStatus = profile?.custom_status;
            const isCustom = activityType === "custom" || !!customStatus;

            if (online && customStatus) {
              return (
                <div className="mt-3 p-2.5 rounded-xl flex items-center gap-2" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}>
                  <span className="text-base shrink-0">{getActivityIcon("custom")}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold truncate" style={{ color: "#c084fc" }}>{customStatus}</p>
                    <p className="text-[9px] text-white/40">Statut personnalisé</p>
                  </div>
                  <span className="ml-auto w-2 h-2 rounded-full shrink-0" style={{ background: "#44ff88" }} />
                </div>
              );
            }
            if (online && activity) {
              const isGaming = activityType === "gaming";
              return (
                <div className="mt-3 p-2.5 rounded-xl flex items-center gap-2" style={{ background: isGaming ? "rgba(59,130,246,0.08)" : "rgba(168,85,247,0.08)", border: isGaming ? "1px solid rgba(59,130,246,0.15)" : "1px solid rgba(168,85,247,0.15)" }}>
                  <span className="text-base shrink-0">{getActivityIcon(activityType)}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-white/80 truncate">{activity}</p>
                    <p className="text-[9px] text-white/40">{isGaming ? "En jeu" : "Activité en cours"}</p>
                  </div>
                  <span className="ml-auto w-2 h-2 rounded-full shrink-0" style={{ background: "#44ff88" }} />
                </div>
              );
            }
            return (
              <div className="mt-3 p-2.5 rounded-xl flex items-center gap-2" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="text-base shrink-0 opacity-50">💤</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-white/50">{online ? "En ligne" : "Hors ligne"}</p>
                  <p className="text-[9px] text-white/30">{online ? "Aucune activité" : "Inactif"}</p>
                </div>
              </div>
            );
          })()}

          {/* Stats card (activity-like section) */}
          <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-base font-black text-white">{level}</p>
                <p className="text-[9px] text-white/40 uppercase">Niveau</p>
              </div>
              <div>
                <p className="text-base font-black" style={{ color: "#fbbf24" }}>{trophies}</p>
                <p className="text-[9px] text-white/40 uppercase">Trophées</p>
              </div>
              <div>
                <p className="text-base font-black text-white">{progress?.total_xp || 0}</p>
                <p className="text-[9px] text-white/40 uppercase">XP</p>
              </div>
            </div>
          </div>

          {/* Roles / equipped cosmetics */}
          {cosmetics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {equippedBadges.slice(0, 3).map((b) => {
                const iconImageUrl = getCosmeticIconImageUrl(b.icon);
                return (
                  <span key={b.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(255,255,255,0.04)", color: "#b9bbbe" }}>
                    {iconImageUrl ? (
                      <img src={iconImageUrl} alt="" className="w-3 h-3 rounded object-cover" />
                    ) : (
                      <span>{b.icon || "✨"}</span>
                    )}
                    {b.item_name}
                  </span>
                );
              })}
              {cosmetics.filter(c => c.is_equipped && c.category !== "badge" && c.category !== "avatar_animation").map((c) => {
                const iconImageUrl = getCosmeticIconImageUrl(c.icon);
                return (
                  <span key={c.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(168,85,247,0.1)", color: "#c084fc" }}>
                    {iconImageUrl ? (
                      <img src={iconImageUrl} alt="" className="w-3 h-3 rounded object-cover" />
                    ) : (
                      <span>{c.icon || "✨"}</span>
                    )}
                    {c.item_name}
                  </span>
                );
              })}
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc" }}>
                  <Crown className="w-2.5 h-2.5" /> Fondateur
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            {friendStatus !== "blocked" && (
              <button
                onClick={() => { window.dispatchEvent(new CustomEvent("matrix-open-chat", { detail: { friendEmail: targetEmail } })); onClose(); }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition hover:opacity-80 tap-sm"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <MessageCircle className="w-3.5 h-3.5" /> Message
              </button>
            )}
            {friendStatus === "accepted" && (
              <button onClick={handleRemoveFriend} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition hover:opacity-80 tap-sm"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                <UserMinus className="w-3.5 h-3.5" /> Supprimer
              </button>
            )}
            {friendStatus === "none" && (
              <button onClick={handleAddFriend} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition hover:opacity-80 tap-sm"
                style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                <UserPlus className="w-3.5 h-3.5" /> Ajouter
              </button>
            )}
            {friendStatus === "pending_sent" && (
              <button disabled className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white/50 flex items-center justify-center gap-1.5 tap-sm" style={{ background: "rgba(255,255,255,0.03)" }}>
                En attente...
              </button>
            )}
            {friendStatus !== "blocked" ? (
              <button onClick={handleBlock} disabled={actionLoading}
                className="w-10 py-2.5 rounded-xl flex items-center justify-center transition hover:opacity-80 tap-sm"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                title="Bloquer">
                <Ban className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
              </button>
            ) : (
              <button onClick={handleUnblock} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition hover:opacity-80 tap-sm"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                <Ban className="w-3.5 h-3.5" /> Débloquer
              </button>
            )}
          </div>

          {friendStatus === "blocked" && (
            <p className="text-center text-[10px] text-white/30 mt-2">Cet utilisateur est bloqué.</p>
          )}
          {friendStatus !== "blocked" && (
            <button onClick={() => setShowReportModal(true)} className="text-[10px] text-white/30 hover:text-red-400 transition mx-auto block mt-1">
              Signaler cet utilisateur
            </button>
          )}
        </div>

        {/* Footer — DM input */}
        {friendStatus !== "blocked" && friendStatus === "accepted" && (
          <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-2">
              <input
                value={dmInput}
                onChange={e => setDmInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendDm(); } }}
                placeholder={`Envoyer un message à @${displayName}`}
                className="flex-1 px-3 py-2 rounded-xl text-xs text-white placeholder:text-white/30 outline-none"
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <button onClick={handleSendDm} disabled={!dmInput.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition disabled:opacity-30 shrink-0 tap-sm"
                style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showReportModal && (
        <ReportContentModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          contentType="other"
          contentId={targetUserId}
          contentPreview={`Profil utilisateur: ${displayName}${pseudoTag ? `#${pseudoTag}` : ""}`}
          authorEmail={targetEmail}
          authorName={displayName}
          reporterUser={currentUser}
        />
      )}
    </div>,
    document.body
  );
}