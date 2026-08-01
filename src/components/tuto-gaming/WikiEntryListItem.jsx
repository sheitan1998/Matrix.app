import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, Star, Tag } from "lucide-react";
import { getEntryTypeMeta } from "./tutoGamingData";

export default function WikiEntryListItem({ entry, gameSlug, index = 0 }) {
  const typeMeta = getEntryTypeMeta(entry.entry_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link
        to={`/tuto-gaming/${gameSlug}/wiki/${entry.id}`}
        className="block rounded-xl overflow-hidden transition group"
        style={{
          background: "rgba(13,5,24,0.6)",
          border: "1px solid rgba(191,90,242,0.12)",
        }}
      >
        <div className="p-4 flex items-start gap-3">
          {/* Type badge */}
          <div
            className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 mt-0.5"
            style={{
              background: `${typeMeta.color}1a`,
              color: typeMeta.color,
              border: `1px solid ${typeMeta.color}30`,
            }}
          >
            {typeMeta.label}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white group-hover:text-[#BF5AF2] transition-colors truncate">
              {entry.title}
            </h3>
            <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2 mt-0.5">
              {entry.description}
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {entry.level && (
                <span className="text-[9px] text-white/30">
                  Niv. {entry.level}
                </span>
              )}
              {entry.location && (
                <span className="flex items-center gap-0.5 text-[9px] text-white/30">
                  <MapPin className="w-2.5 h-2.5" />
                  {entry.location}
                </span>
              )}
              {entry.rarity && (
                <span className="flex items-center gap-0.5 text-[9px] text-white/30">
                  <Star className="w-2.5 h-2.5" />
                  {entry.rarity}
                </span>
              )}
              {entry.tags?.length > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] text-white/30">
                  <Tag className="w-2.5 h-2.5" />
                  {entry.tags[0]}
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#BF5AF2] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </div>
      </Link>
    </motion.div>
  );
}