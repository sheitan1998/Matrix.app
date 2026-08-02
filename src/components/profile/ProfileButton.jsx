import React from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

export default function ProfileButton({ user, size = "md" }) {
  const dim = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  return (
    <Link
      to="/mon-profil"
      className={`${dim} rounded-full overflow-hidden flex items-center justify-center shrink-0 transition hover:opacity-80`}
      style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}
      title="Mon Profil"
    >
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
      ) : user?.full_name?.[0] ? (
        <span className="text-xs font-bold text-white">{user.full_name[0].toUpperCase()}</span>
      ) : (
        <User className="w-4 h-4 text-white/60" />
      )}
    </Link>
  );
}