import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, MapPin } from "lucide-react";
import { getCategoryMeta, getDifficultyMeta } from "./tutoGamingData";

export default function QuestListItem({ quest, gameSlug, index = 0 }) {
  const cat = getCategoryMeta(quest.category);
  const diff = getDifficultyMeta(quest.difficulty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/tuto-gaming/${gameSlug}/quest/${quest.id}`}
        className="block rounded-xl overflow-hidden transition group"
        style={{
          background: "rgba(13,5,24,0.6)",
          border: "1px solid rgba(191,90,242,0.12)",
        }}
      >
        <div className="p-4 flex items-start gap-3">
          {/* Category badge */}
          <div
            className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 mt-0.5"
            style={{
              background: `${cat.color}1a`,
              color: cat.color,
              border: `1px solid ${cat.color}30`,
            }}
          >
            {cat.label}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white group-hover:text-[#BF5AF2] transition-colors truncate">
              {quest.title}
            </h3>
            <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2 mt-0.5">
              {quest.description}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span
                className="flex items-center gap-1 text-[9px] font-bold"
                style={{ color: diff.color }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: diff.color }}
                />
                {diff.label}
              </span>
              {quest.map_info && (
                <span className="flex items-center gap-0.5 text-[9px] text-white/30">
                  <MapPin className="w-2.5 h-2.5" />
                  Carte
                </span>
              )}
              {quest.steps?.length > 0 && (
                <span className="text-[9px] text-white/30">
                  {quest.steps.length} étape{quest.steps.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight
            className="w-4 h-4 text-white/20 group-hover:text-[#BF5AF2] group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
          />
        </div>
      </Link>
    </motion.div>
  );
}