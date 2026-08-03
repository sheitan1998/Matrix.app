import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { User } from "lucide-react";
import ProfileContent from "@/components/profile/ProfileContent";

const EXCLUDED_PREFIXES = [
  "/twitch", "/community", "/mon-profil", "/login", "/register",
  "/forgot-password", "/reset-password", "/stream", "/trending",
  "/subscriptions", "/category", "/search", "/watch", "/channel",
  "/premium", "/upload", "/profile", "/studio", "/dashboard",
];

export default function GlobalProfileButton() {
  const location = useLocation();
  const nav = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const isExcluded = useMemo(() => {
    const p = location.pathname;
    if (p === "/live" || p.startsWith("/live/")) return true;
    return EXCLUDED_PREFIXES.some(prefix => p === prefix || p.startsWith(prefix + "/"));
  }, [location.pathname]);

  // Fetch pending friend requests count
  useEffect(() => {
    if (!isAuthenticated || !user || isExcluded) return;
    base44.entities.Friend.filter({ friend_email: user.email, status: "pending_received" })
      .then(friends => setPendingCount((friends || []).length))
      .catch(() => {});
  }, [isAuthenticated, user, isExcluded]);

  // Real-time subscription for friend request changes
  useEffect(() => {
    if (!isAuthenticated || !user || isExcluded) return;
    const unsubscribe = base44.entities.Friend.subscribe((event) => {
      if (event.type === "create" && event.data?.friend_email === user.email && event.data?.status === "pending_received") {
        setPendingCount(prev => prev + 1);
      } else if (event.type === "update" || event.type === "delete") {
        base44.entities.Friend.filter({ friend_email: user.email, status: "pending_received" })
          .then(friends => setPendingCount((friends || []).length))
          .catch(() => {});
      }
    });
    return unsubscribe;
  }, [isAuthenticated, user, isExcluded]);

  if (!isAuthenticated || !user || isExcluded) return null;

  return (
    <>
      {/* Fixed profile button - top right */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-2.5 right-2.5 z-[55] w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition hover:scale-105 active:scale-95"
        style={{
          background: "rgba(18,9,28,0.85)",
          border: "1.5px solid rgba(168,85,247,0.4)",
          boxShadow: "0 4px 16px rgba(168,85,247,0.2)",
          backdropFilter: "blur(12px)",
        }}
        title="Mon Profil"
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : user.full_name?.[0] ? (
          <span className="text-xs font-bold text-white">{user.full_name[0].toUpperCase()}</span>
        ) : (
          <User className="w-4 h-4 text-white/70" />
        )}
        {pendingCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#22C55E", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }}
          >
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </button>

      {/* Profile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[80] overflow-y-auto"
          style={{ background: "#0a050f" }}
        >
          <ProfileContent onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}