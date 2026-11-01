import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { User } from "lucide-react";
import ProfileContent from "@/components/profile/ProfileContent";

const EXCLUDED_PREFIXES = [
"/twitch", "/nexus", "/mon-profil", "/login", "/register",
"/forgot-password", "/reset-password", "/oauth"];


export default function GlobalProfileButton() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const isExcluded = useMemo(() => {
    const p = location.pathname;
    if (p === "/live" || p.startsWith("/live/")) return true;
    return EXCLUDED_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
  }, [location.pathname]);

  // Fetch pending friend requests count
  // pending_received records have user_email = recipient (current user), friend_email = sender
  useEffect(() => {
    if (!isAuthenticated || !user || isExcluded) return;
    base44.entities.Friend.filter({ user_email: user.email, status: "pending_received" }).
    then((friends) => setPendingCount((friends || []).length)).
    catch(() => {});
  }, [isAuthenticated, user, isExcluded]);

  // Real-time subscription for friend request changes
  useEffect(() => {
    if (!isAuthenticated || !user || isExcluded) return;
    const unsubscribe = base44.entities.Friend.subscribe((event) => {
      if (event.type === "create" && event.data?.user_email === user.email && event.data?.status === "pending_received") {
        setPendingCount((prev) => prev + 1);
      } else if (event.type === "update" || event.type === "delete") {
        base44.entities.Friend.filter({ user_email: user.email, status: "pending_received" }).
        then((friends) => setPendingCount((friends || []).length)).
        catch(() => {});
      }
    });
    return unsubscribe;
  }, [isAuthenticated, user, isExcluded]);

  if (!isAuthenticated || !user || isExcluded) return null;

  return (
    <>
      {/* Fixed profile button - top right */}
      

























      

      {/* Profile overlay */}
      {open &&
      <div
        className="fixed inset-0 z-[80] overflow-y-auto"
        style={{ background: "#0a050f" }}>
        
          <ProfileContent onClose={() => setOpen(false)} />
        </div>
      }
    </>);

}