import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, User, Images } from "lucide-react";
import { getCategoryMeta } from "@/components/tuto-gaming/fortniteMapsData";
import VoteButtons from "@/components/tuto-gaming/VoteButtons";
import LivePlayersBadge from '@/components/fortnite/LivePlayersBadge';
import FortniteMapImage from "@/components/fortnite/FortniteMapImage";

export default function FortniteMapCard({ map, index = 0, onClick, user, featured = false }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const cat = getCategoryMeta(map.category);
  const imageCount = (map.gallery?.length || 0) || (map.image_url ? 1 : 0);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(map.map_code);
      setCopyError("");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("Impossible de copier le code.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={() => onClick?.(map)}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick?.(map);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Voir les détails de ${map.title}`}
      className="group rounded-xl overflow-hidden flex flex-col cursor-pointer transition hover:border-purple-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400"
      style={{
        background: "#0D0518",
        border: "1px solid rgba(191,90,242,0.15)",
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden" style={{ background: "#1a0a2e" }}>
        <FortniteMapImage map={map} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        {/* Category badge */}
        <span
          className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider"
          style={{ background: `${cat.color}25`, color: cat.color, border: `1px solid ${cat.color}40` }}
        >
          {featured ? "★ Vedette" : cat.label}
        </span>
        {/* Gallery count badge */}
        {imageCount > 1 && (
          <span
            className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white/80"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <Images className="w-2.5 h-2.5" /> {imageCount}
          </span>
        )}
        {/* Live players badge */}
        <div className="absolute bottom-2 right-2"><LivePlayersBadge map={map} /></div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3">
        <h3 className="text-sm font-black text-white truncate mb-1">{map.title}</h3>
        <div className="flex items-center gap-1 mb-2">
          <User className="w-3 h-3 text-white/30" />
          <span className="text-[11px] text-white/50 truncate">{map.creator_name}</span>
        </div>
        {map.description && (
          <p className="text-[11px] text-white/50 line-clamp-3 mb-3 leading-relaxed">{map.description}</p>
        )}

        {/* Map code + copy */}
        <div className="mt-auto flex items-center gap-2">
          <code
            className="flex-1 px-2 py-1.5 rounded-md text-[11px] font-mono font-bold tracking-wider text-center"
            style={{ background: "rgba(191,90,242,0.08)", border: "1px solid rgba(191,90,242,0.15)", color: "#BF5AF2" }}
          >
            {map.map_code}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition tap-sm"
            style={{
              background: copied ? "rgba(34,197,94,0.15)" : "rgba(191,90,242,0.1)",
              border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(191,90,242,0.2)"}`,
            }}
            title="Copier le code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" style={{ color: "#BF5AF2" }} />
            )}
          </button>
        </div>
        {copied && (
          <span className="text-[9px] text-green-400 text-center mt-1 font-bold">Copié !</span>
        )}
        {copyError && <span role="alert" className="mt-1 text-center text-[9px] text-red-400">{copyError}</span>}
        {!map.is_api && <VoteButtons
          contentType="fortnite_map"
          contentId={map.id}
          likes={map.likes || 0}
          dislikes={map.dislikes || 0}
          user={user}
        />}
      </div>
    </motion.div>
  );
}