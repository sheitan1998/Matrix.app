import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Loader2, ArrowLeft, ListChecks, MapPin, Gift, Lightbulb,
  AlertCircle, MessageCircle, Swords, Target, Link2, User, Image as ImageIcon,
} from "lucide-react";
import QuestComments from "@/components/tuto-gaming/QuestComments";
import { getCategoryMeta, getDifficultyMeta } from "@/components/tuto-gaming/tutoGamingData";

export default function QuestDetailPage() {
  const { gameSlug, questId } = useParams();
  const [quest, setQuest] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const q = await base44.entities.Quest.get(questId);
      setQuest(q);
      base44.auth.me().then(setUser).catch(() => {});
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [questId]);

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

  if (!quest) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-white/40 mb-4">Quête introuvable</p>
        <Link to={`/tuto-gaming/${gameSlug}`} className="text-xs font-bold" style={{ color: "#BF5AF2" }}>
          Retour au jeu
        </Link>
      </div>
    );
  }

  const cat = getCategoryMeta(quest.category);
  const diff = getDifficultyMeta(quest.difficulty);

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

      {/* Title + badges */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider"
            style={{ background: `${cat.color}1a`, color: cat.color, border: `1px solid ${cat.color}30` }}
          >
            {cat.label}
          </span>
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-bold"
            style={{ background: `${diff.color}1a`, color: diff.color, border: `1px solid ${diff.color}30` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: diff.color }} />
            {diff.label}
          </span>
          {quest.extension && (
            <span className="px-2.5 py-1 rounded-md text-[9px] font-bold text-white/40" style={{ background: "rgba(255,255,255,0.04)" }}>
              {quest.extension}
            </span>
          )}
          {quest.zone && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-bold" style={{ background: "rgba(34,211,238,0.1)", color: "#22D3EE" }}>
              <MapPin className="w-2.5 h-2.5" />
              {quest.zone}
            </span>
          )}
          {(quest.level_min > 0 || quest.level_max > 0) && (
            <span className="px-2.5 py-1 rounded-md text-[9px] font-bold" style={{ background: "rgba(191,90,242,0.1)", color: "#BF5AF2" }}>
              Niv. {quest.level_min > 0 ? quest.level_min : "?"}{quest.level_max > 0 ? `-${quest.level_max}` : "+"}
            </span>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {quest.title}
        </h1>
        {quest.description && (
          <p className="text-sm text-white/50 mt-2 leading-relaxed">{quest.description}</p>
        )}
      </div>

      {/* Image placeholder */}
      {quest.image_url ? (
        <div className="mb-5 rounded-xl overflow-hidden">
          <img src={quest.image_url} alt={quest.title} className="w-full h-48 object-cover" />
        </div>
      ) : (
        <div
          className="mb-5 h-28 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(191,90,242,0.04)", border: "1px dashed rgba(191,90,242,0.15)" }}
        >
          <div className="flex flex-col items-center gap-1">
            <ImageIcon className="w-6 h-6 text-white/10" />
            <span className="text-[10px] text-white/20">Emplacement image</span>
          </div>
        </div>
      )}

      {/* Content sections */}
      <div className="space-y-4">
        {/* Prerequisites */}
        {quest.prerequisites && (
          <Section icon={AlertCircle} title="Prérequis" color="#FBBF24">
            <p className="text-sm text-white/60 leading-relaxed">{quest.prerequisites}</p>
          </Section>
        )}

        {/* NPC info */}
        {(quest.npc_name || quest.npc_location || quest.coordinates) && (
          <Section icon={User} title="PNJ & Localisation" color="#22D3EE">
            <div className="space-y-2">
              {quest.npc_name && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold w-20">PNJ</span>
                  <span className="text-sm text-white/70">{quest.npc_name}</span>
                </div>
              )}
              {quest.npc_location && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold w-20">Lieu</span>
                  <span className="text-sm text-white/70">{quest.npc_location}</span>
                </div>
              )}
              {quest.coordinates && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold w-20">Coords</span>
                  <span className="text-sm text-white/70 font-mono">{quest.coordinates}</span>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Objectives */}
        {quest.objectives && (
          <Section icon={Target} title="Objectifs" color="#4ADE80">
            <p className="text-sm text-white/60 leading-relaxed">{quest.objectives}</p>
          </Section>
        )}

        {/* Steps */}
        {quest.steps?.length > 0 && (
          <Section icon={ListChecks} title="Étapes détaillées" color="#BF5AF2">
            <div className="space-y-3">
              {quest.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                    style={{ background: "rgba(191,90,242,0.15)", color: "#BF5AF2" }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white">{step.title}</h4>
                    {step.description && (
                      <p className="text-xs text-white/50 leading-relaxed mt-0.5">{step.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Dialogues */}
        {quest.dialogues && (
          <Section icon={MessageCircle} title="Dialogues utiles" color="#A78BFA">
            <p className="text-sm text-white/60 leading-relaxed italic whitespace-pre-wrap">{quest.dialogues}</p>
          </Section>
        )}

        {/* Combats */}
        {quest.combats && (
          <Section icon={Swords} title="Combats" color="#F87171">
            <p className="text-sm text-white/60 leading-relaxed">{quest.combats}</p>
          </Section>
        )}

        {/* Map info */}
        {quest.map_info && (
          <Section icon={MapPin} title="Cartes & Positions" color="#22D3EE">
            <p className="text-sm text-white/60 leading-relaxed">{quest.map_info}</p>
          </Section>
        )}

        {/* Rewards */}
        {quest.rewards && (
          <Section icon={Gift} title="Récompenses" color="#4ADE80">
            <p className="text-sm text-white/60 leading-relaxed">{quest.rewards}</p>
          </Section>
        )}

        {/* Tips */}
        {quest.tips && (
          <Section icon={Lightbulb} title="Astuces" color="#FBBF24">
            <p className="text-sm text-white/60 leading-relaxed">{quest.tips}</p>
          </Section>
        )}

        {/* Linked quests */}
        {quest.linked_quests?.length > 0 && (
          <Section icon={Link2} title="Quêtes liées" color="#A78BFA">
            <div className="space-y-1.5">
              {quest.linked_quests.map((lq, i) => (
                <Link
                  key={i}
                  to={`/tuto-gaming/${gameSlug}/quest/${lq.quest_id}`}
                  className="block text-sm text-white/50 hover:text-[#BF5AF2] transition py-1"
                >
                  → {lq.title}
                </Link>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Comments */}
      <div
        className="mt-8 p-5 rounded-2xl"
        style={{ background: "rgba(13,5,24,0.6)", border: "1px solid rgba(191,90,242,0.15)" }}
      >
        <QuestComments questId={quest.id} currentUser={user} />
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, color, children }) {
  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: "rgba(13,5,24,0.5)", border: "1px solid rgba(191,90,242,0.1)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color }} />
        <h3 className="text-sm font-black tracking-wider uppercase" style={{ color }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}