import React from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ExternalLink, Gamepad2, Users } from "lucide-react";

function initials(name) {
  return (name || "?").trim().slice(0, 2).toUpperCase();
}

export default function AiRecommendationCards({ cards = [] }) {
  if (!cards.length) return null;

  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
      {cards.map((card) => (
        <Link
          key={`${card.type}-${card.id}`}
          to={card.url || (card.type === "creator" ? `/createur/${card.slug}` : `/servers/${card.slug}`)}
          className="group flex items-center gap-2.5 rounded-xl p-2 transition hover:-translate-y-0.5"
          style={{ background: "rgba(138,79,255,0.08)", border: "1px solid rgba(138,79,255,0.22)" }}
        >
          <div
            className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
          >
            {card.image ? (
              <img
                src={card.image}
                alt={`Avatar de ${card.name} sur Matrix`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              initials(card.name)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black text-white truncate">{card.name}</p>
            <p className="text-[9px] text-white/40 truncate flex items-center gap-1">
              {card.type === "creator" ? <Users className="w-2.5 h-2.5" /> : <Gamepad2 className="w-2.5 h-2.5" />}
              {card.subtitle || "Matrix"}
            </p>
            <p className="text-[9px] font-bold mt-0.5" style={{ color: "#a855f7" }}>
              <ArrowUp className="w-2.5 h-2.5 inline" /> {card.votes ?? 0} votes
            </p>
          </div>
          <span
            className="shrink-0 h-7 px-2 rounded-md flex items-center gap-1 text-[9px] font-bold transition group-hover:brightness-125"
            style={{ background: "rgba(138,79,255,0.2)", color: "#c4b5fd" }}
          >
            Voir la fiche <ExternalLink className="w-2.5 h-2.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}