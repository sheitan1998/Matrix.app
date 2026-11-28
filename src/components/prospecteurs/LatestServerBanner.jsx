import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { serverCategoryList } from "@/lib/serverCategories";

const createdAt = (server) => {
  const time = new Date(server.created_date || server.created_at || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export default function LatestServerBanner({ servers = [], className = "" }) {
  const latest = useMemo(() => {
    let best = null;
    for (const server of servers) {
      if (!best || createdAt(server) > createdAt(best)) best = server;
    }
    return best;
  }, [servers]);

  const target = latest ? latest.slug || latest.id : null;
  if (!latest || !target) return null;

  const logoUrl = latest.logo_url || latest.profile_image || latest.server_icon;
  const bannerUrl = latest.banner_url || latest.cover_image;
  const categories = serverCategoryList(latest);
  const subtitle = categories[0]?.name || latest.category || latest.game || "";

  return (
    <Link
      to={`/servers/${target}`}
      className={`relative flex items-center gap-3 h-14 px-3 rounded-xl overflow-hidden transition hover:brightness-125 tap-sm ${className}`}
      style={{ background: "rgba(18,9,28,0.7)", border: "1px solid rgba(168,85,247,0.35)" }}
    >
      {bannerUrl && (
        <img src={bannerUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-25" />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(18,9,28,0.85) 0%, rgba(18,9,28,0.4) 100%)" }} />
      <span
        className="relative shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider"
        style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", color: "#fff" }}
      >
        Nouveau
      </span>
      <div
        className="relative w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center text-sm font-black text-white shrink-0"
        style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt={`Logo du serveur ${latest.title}`} className="w-full h-full object-cover" />
        ) : (
          latest.title?.[0]?.toUpperCase() || "S"
        )}
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="text-[8px] font-bold uppercase tracking-wider text-white/40">Dernier serveur inscrit</p>
        <p className="text-xs font-black text-white truncate">
          {latest.title}
          {subtitle && <span className="ml-2 text-[10px] font-bold text-purple-300/80">{subtitle}</span>}
        </p>
      </div>
      <span className="relative shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold" style={{ color: "#a855f7" }}>
        Voir la fiche <ChevronRight className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}
