import React from "react";
import { Gamepad2, PenLine, Flame, Lightbulb, Sparkles, Image as ImageIcon } from "lucide-react";

export const QUICK_PROMPTS = [
  { icon: Gamepad2, label: "Trouve-moi un serveur actif sur Fortnite ou GTA" },
  { icon: PenLine, label: "Aide-moi à rédiger une annonce attractive pour mon serveur" },
  { icon: Flame, label: "Quels sont les créateurs tendance sur Matrix en ce moment ?" },
  { icon: Lightbulb, label: "Donne-moi 5 idées de concepts vidéos/streams gaming" },
  { icon: ImageIcon, label: "Génère une image : un setup gaming néon violet futuriste", image: true },
];

export default function AiEmptyState({ onSelectPrompt }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 py-8 flex flex-col items-center justify-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: "linear-gradient(135deg, #8a4fff, #22d3ee)",
          boxShadow: "0 0 40px rgba(138,79,255,0.45)",
        }}
      >
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-xl sm:text-2xl font-black text-white text-center">
        Matrix <span style={{ color: "#a855f7" }}>AI</span>
      </h1>
      <p className="mt-1.5 text-xs sm:text-sm text-white/45 text-center max-w-md">
        Ton assistant gaming : serveurs, créateurs, annonces et idées de contenu — branché en direct sur la base Matrix.
      </p>

      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl">
        {QUICK_PROMPTS.map((prompt) => {
          const Icon = prompt.icon;
          return (
            <button
              key={prompt.label}
              onClick={() => onSelectPrompt(prompt.label, { image: Boolean(prompt.image) })}
              className="text-left rounded-xl p-3 flex items-start gap-2.5 transition hover:-translate-y-0.5"
              style={{
                background: "rgba(138,79,255,0.07)",
                border: "1px solid rgba(138,79,255,0.2)",
              }}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(138,79,255,0.18)", color: "#c4b5fd" }}
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-bold text-white/75 leading-snug">{prompt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}