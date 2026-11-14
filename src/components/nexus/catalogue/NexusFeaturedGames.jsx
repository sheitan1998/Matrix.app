import React from "react";
import { Link } from "react-router-dom";
import { Play, Sparkles } from "lucide-react";

const FEATURED = [
  {
    key: "slots",
    title: "Machine à Sous",
    subtitle: "Diamond Slots — jackpot progressif",
    badge: "Casino",
    image: "/media/tuto-gaming/62275f2a2_generated_image.png",
    href: "/casino",
    accent: "#a855f7",
  },
  {
    key: "wheel",
    title: "Roue de la Fortune",
    subtitle: "Tentez votre chance à chaque tour",
    badge: "Populaire",
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/f4b6e77c6_ChatGPTImage28sept202617_28_25.png",
    href: "/casino?game=wheel",
    accent: "#c084fc",
  },
  {
    key: "roulette",
    title: "Roulette",
    subtitle: "La table Nexus en direct",
    badge: "Nouveauté",
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/f1890072f_ChatGPTImage28sept202617_21_27.png",
    href: "/roulette",
    accent: "#e879f9",
  },
];

export default function NexusFeaturedGames() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4" style={{ color: "#a855f7", filter: "drop-shadow(0 0 6px rgba(168,85,247,0.8))" }} />
        <h2 className="text-xs font-black tracking-wider uppercase text-white">Jeux à la une</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {FEATURED.map((game) => (
          <Link
            key={game.key}
            to={game.href}
            className="group relative block rounded-xl overflow-hidden transition hover:-translate-y-0.5"
            style={{ border: `1px solid ${game.accent}55`, boxShadow: `0 0 18px ${game.accent}20` }}
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(10,5,15,0.05) 30%, rgba(10,5,15,0.92) 100%)" }}
              />
              <span
                className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                style={{ background: "rgba(10,5,15,0.75)", color: game.accent, border: `1px solid ${game.accent}66` }}
              >
                {game.badge}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-sm font-black text-white">{game.title}</p>
              <p className="text-[10px] text-white/50 truncate">{game.subtitle}</p>
              <span
                className="mt-2 inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider text-white"
                style={{ background: `linear-gradient(135deg, ${game.accent}, rgba(109,40,217,0.9))` }}
              >
                <Play className="w-3 h-3 fill-current" /> Jouer
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}