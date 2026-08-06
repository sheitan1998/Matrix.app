import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, MessageCircle, UserPlus, Shield, Crown, Zap } from "lucide-react";
import { toast } from "sonner";

export default function UserProfilePopup({ userId, userEmail, open, onClose, onOpenDm }) {
  const [profile, setProfile] = useState(null);
  const [cosmetics, setCosmetics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setCosmetics([]);
    const fetchProfile = async () => {
      try {
        const ids = userId ? [userId] : [];
        if (ids.length > 0) {
          const res = await base44.functions.invoke("serverSearch", { action: "getUsersByIds", ids });
          const u = res?.data?.users?.[0];
          if (u) {
            setProfile(u);
            // Fetch equipped cosmetics for this user
            if (u.email) {
              try {
                const userCosmetics = await base44.asServiceRole
                  ? base44.entities.UserCosmetic.filter({ user_email: u.email, is_equipped: true }, "-created_date", 50)
                  : [];
                setCosmetics(userCosmetics || []);
              } catch { setCosmetics([]); }
            }
          }
        }
      } catch {}
      setLoading(false);
    };
    fetchProfile();
  }, [open, userId, userEmail]);

  if (!open) return null;

  const displayName = profile?.full_name || profile?.pseudo || userEmail?.split("@")[0] || "Utilisateur";
  const avatar = profile?.avatar_url;
  const pseudo = profile?.pseudo || "";
  const isAdmin = profile?.role === "admin";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="h-20 relative" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(109,40,217,0.2))" }}>
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center tap-sm" style={{ background: "rgba(0,0,0,0.3)" }}>
            <X className="w-3.5 h-3.5 text-white/80" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-5 pb-5 -mt-10">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 mx-auto" style={{ borderColor: "#13101a", background: "rgba(168,85,247,0.15)" }}>
            {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{displayName?.[0]?.toUpperCase()}</div>}
          </div>
          <div className="text-center mt-2">
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="text-base font-black text-white">{displayName}</h3>
              {isAdmin && <Shield className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />}
            </div>
            {/* Pseudo without # identifier */}
            {pseudo && <p className="text-[10px] text-white/40 font-mono">{pseudo.split("#")[0]}</p>}
          </div>

          {/* Equipped cosmetics */}
          {cosmetics.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              {cosmetics.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", color: "#c084fc" }}>
                  {c.icon || "✨"} {c.item_name || c.category}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          {profile && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-sm font-black text-white">{profile.level || 1}</p>
                <p className="text-[9px] text-white/40">Niveau</p>
              </div>
              <div className="text-center p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-sm font-black text-white">{profile.total_xp || 0}</p>
                <p className="text-[9px] text-white/40">XP</p>
              </div>
              <div className="text-center p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-sm font-black text-white">{profile.friends_count || 0}</p>
                <p className="text-[9px] text-white/40">Amis</p>
              </div>
            </div>
          )}

          {/* Nitro badge */}
          {profile?.nitro && (
            <div className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-xl" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
              <Crown className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
              <span className="text-xs font-bold" style={{ color: "#a855f7" }}>Nitro</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { onOpenDm?.({ friend_email: userEmail || profile?.email, friend_name: displayName }); onClose(); }}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition hover:opacity-80 tap-sm"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <MessageCircle className="w-3.5 h-3.5" /> Message
            </button>
            <button
              onClick={() => { /* Add friend logic */ toast.info("Demande d'ami envoyée"); onClose(); }}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition hover:opacity-80 tap-sm"
              style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
            >
              <UserPlus className="w-3.5 h-3.5" /> Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}