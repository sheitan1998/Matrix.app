import React from "react";
import { Play, Sparkles, Plus } from "lucide-react";
import CasinoToken from "@/components/casino/CasinoToken";
import { formatBet } from "@/components/casino/slotThemes";

export const ARCADE_GAMES = [
  {
    key: "slots",
    title: "Machines à sous",
    subtitle: "Jackpot progressif — 6 univers",
    badge: "Jackpot",
    image: "/media/tuto-gaming/62275f2a2_generated_image.png",
    accent: "#a855f7",
  },
  {
    key: "wheel",
    title: "Roue de la Fortune",
    subtitle: "Tentez votre chance à chaque tour",
    badge: "Populaire",
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/f4b6e77c6_ChatGPTImage28sept202617_28_25.png",
    accent: "#c084fc",
  },
  {
    key: "roulette",
    title: "Roulette Royale",
    subtitle: "La table de casino en direct",
    badge: "Table live",
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/fa759ca67_generated_image.png",
    accent: "#e879f9",
  },
  {
    key: "scratch",
    title: "Tickets à gratter",
    subtitle: "Grattez et gagnez des jetons M",
    badge: "Tickets",
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/f1890072f_ChatGPTImage28sept202617_21_27.png",
    accent: "#fbbf24",
  },
];

export default function NexusFeaturedGames({ onOpen, balance = 0, onRecharge }) {
  return (
    <section>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4" style={{ color: "#a855f7", filter: "drop-shadow(0 0 6px rgba(168,85,247,0.8))" }} />
        <h2 className="text-xs font-black tracking-wider uppercase text-white">Jeux à la une</h2>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg"
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)" }}
          >
            <CasinoToken size={16} />
            <span className="text-[11px] font-mono font-black" style={{ color: "#c084fc" }}>{formatBet(balance)}</span>
          </span>
          <button
            onClick={onRecharge}
            className="flex items-center gap-1 h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-wide text-white transition hover:opacity-90 tap-sm"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
          >
            <Plus className="w-3.5 h-3.5" /> Jetons
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ARCADE_GAMES.map((game) => (
          <button
            key={game.key}
            onClick={() => onOpen?.(game.key)}
            className="group relative block rounded-xl overflow-hidden text-left transition hover:-translate-y-0.5 tap-sm"
            style={{ border: `1px solid ${game.accent}55`, boxShadow: `0 0 18px ${game.accent}20` }}
          >
            <div className="relative h-36 overflow-hidden">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(10,5,15,0.05) 30%, rgba(10,5,15,0.94) 100%)" }}
              />
              <span
                className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                style={{ background: "rgba(10,5,15,0.75)", color: game.accent, border: `1px solid ${game.accent}66` }}
              >
                {game.badge}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-sm font-black text-white truncate">{game.title}</p>
              <p className="text-[10px] text-white/50 truncate">{game.subtitle}</p>
              <span
                className="mt-2 inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider text-white"
                style={{ background: `linear-gradient(135deg, ${game.accent}, rgba(109,40,217,0.9))` }}
              >
                <Play className="w-3 h-3 fill-current" /> Jouer
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}