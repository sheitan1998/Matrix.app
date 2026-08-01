import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Loader2, ArrowLeft, MapPin, Tag, Link2, Image as ImageIcon,
} from "lucide-react";
import QuestComments from "@/components/tuto-gaming/QuestComments";
import { getEntryTypeMeta } from "@/components/tuto-gaming/tutoGamingData";

export default function WikiEntryDetailPage() {
  const { gameSlug, entryId } = useParams();
  const [entry, setEntry] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const e = await base44.entities.WikiEntry.get(entryId);
      setEntry(e);
      base44.auth.me().then(setUser).catch(() => {});
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [entryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-white/40 mb-4">Fiche introuvable</p>
        <Link to={`/tuto-gaming/${gameSlug}`} className="text-xs font-bold" style={{ color: "#BF5AF2" }}>
          Retour au wiki
        </Link>
      </div>
    );
  }

  const typeMeta = getEntryTypeMeta(entry.entry_type);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-3xl mx-auto pb-12">
      {/* Back */}
      <Link
        to={`/tuto-gaming/${gameSlug}`}
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition mb-5 tap-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold">Retour au wiki</span>
      </Link>

      {/* Title + badge */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider"
            style={{
              background: `${typeMeta.color}1a`,
              color: typeMeta.color,
              border: `1px solid ${typeMeta.color}30`,
            }}
          >
            {typeMeta.label}
          </span>
          {entry.rarity && (
            <span className="text-[10px] text-white/40 font-bold">{entry.rarity}</span>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {entry.title}
        </h1>
        {entry.description && (
          <p className="text-sm text-white/50 mt-2 leading-relaxed">{entry.description}</p>
        )}
      </div>

      {/* Image placeholder */}
      {entry.image_url ? (
        <div className="mb-5 rounded-xl overflow-hidden">
          <img src={entry.image_url} alt={entry.title} className="w-full h-48 object-cover" />
        </div>
      ) : (
        <div
          className="mb-5 h-32 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(191,90,242,0.04)",
            border: "1px dashed rgba(191,90,242,0.15)",
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <ImageIcon className="w-6 h-6 text-white/10" />
            <span className="text-[10px] text-white/20">Emplacement image</span>
          </div>
        </div>
      )}

      {/* Info badges */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        {entry.level && (
          <span className="px-3 py-1 rounded-lg text-[10px] font-bold" style={{ background: "rgba(191,90,242,0.1)", color: "#BF5AF2" }}>
            Niveau {entry.level}
          </span>
        )}
        {entry.location && (
          <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold" style={{ background: "rgba(34,211,238,0.1)", color: "#22D3EE" }}>
            <MapPin className="w-3 h-3" />
            {entry.location}
          </span>
        )}
        {entry.coordinates && (
          <span className="px-3 py-1 rounded-lg text-[10px] font-bold" style={{ background: "rgba(74,222,128,0.1)", color: "#4ADE80" }}>
            {entry.coordinates}
          </span>
        )}
      </div>

      {/* Content */}
      {entry.content && (
        <div
          className="mb-6 p-5 rounded-2xl"
          style={{
            background: "rgba(13,5,24,0.5)",
            border: "1px solid rgba(191,90,242,0.1)",
          }}
        >
          <h3 className="text-sm font-black tracking-wider uppercase text-[#BF5AF2] mb-3">
            Description
          </h3>
          <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
        </div>
      )}

      {/* Tags */}
      {entry.tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {entry.tags.map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] text-white/40"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Related entries */}
      {entry.related_entries?.length > 0 && (
        <div
          className="mb-6 p-5 rounded-2xl"
          style={{ background: "rgba(13,5,24,0.5)", border: "1px solid rgba(191,90,242,0.1)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4" style={{ color: "#A78BFA" }} />
            <h3 className="text-sm font-black tracking-wider uppercase text-[#A78BFA]">
              Voir aussi
            </h3>
          </div>
          <div className="space-y-1.5">
            {entry.related_entries.map((rel, i) => (
              <Link
                key={i}
                to={`/tuto-gaming/${gameSlug}/wiki/${rel.entry_id}`}
                className="block text-xs text-white/50 hover:text-[#BF5AF2] transition py-1"
              >
                → {rel.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div
        className="mt-8 p-5 rounded-2xl"
        style={{
          background: "rgba(13,5,24,0.6)",
          border: "1px solid rgba(191,90,242,0.15)",
        }}
      >
        <QuestComments wikiEntryId={entry.id} currentUser={user} />
      </div>
    </div>
  );
}