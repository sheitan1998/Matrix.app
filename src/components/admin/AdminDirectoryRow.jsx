import React from "react";
import { ExternalLink, Pencil, Trash2, Server as ServerIcon, User } from "lucide-react";

export default function AdminDirectoryRow({ item, type, busy, onEdit, onDelete }) {
  const isServer = type === "server";
  const title = isServer ? item.title : item.name;
  const image = isServer
    ? item.logo_url || item.profile_image || item.server_icon
    : item.avatar_url;
  const categories = isServer
    ? (Array.isArray(item.categories) && item.categories.length ? item.categories : (item.category ? [item.category] : []))
    : [item.platform];
  const owner = isServer ? item.author_email : item.owner_email;
  const link = isServer ? item.website_url || item.discord_link : item.channel_url;

  return (
    <div
      className="flex items-center gap-3 rounded-xl p-3"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-xs font-black text-white shrink-0"
        style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
      >
        {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : isServer ? <ServerIcon className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-white truncate">{title || "Sans titre"}</p>
        <div className="flex items-center gap-1 flex-wrap mt-0.5">
          {categories.filter(Boolean).map((category, index) => (
            <span
              key={`${category}-${index}`}
              className="text-[8px] font-bold px-1 py-0.5 rounded uppercase"
              style={{ background: "rgba(138,79,255,0.12)", color: "#a855f7" }}
            >
              {category}
            </span>
          ))}
          <span className="text-[9px] text-white/30 truncate">{owner}</span>
        </div>
      </div>

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 tap-sm"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}
          title="Ouvrir le lien"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      <button
        type="button"
        onClick={() => onEdit(item)}
        disabled={busy}
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition disabled:opacity-40 tap-sm"
        style={{ background: "rgba(138,79,255,0.16)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.3)" }}
        title="Modifier"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onDelete(item)}
        disabled={busy}
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition disabled:opacity-40 tap-sm"
        style={{ background: "rgba(239,68,68,0.14)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
        title="Supprimer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}