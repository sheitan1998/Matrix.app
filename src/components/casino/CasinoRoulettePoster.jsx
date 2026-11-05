import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const POSTER_IMAGE = 'https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/9dcfd6d04_croupiere-banner.png';

export default function CasinoRoulettePoster() {
  return (
    <Link
      to="/roulette"
      aria-label="Jouer à la Roulette Royale"
      className="group relative block aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border-2 border-trix-gold/35 text-left shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trix-gold"
    >
      <img
        src={POSTER_IMAGE}
        alt="Roulette Royale, la croupière vous attend à la table"
        className="block h-full w-full object-cover"
      />
      <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-xl border border-trix-gold/30 bg-background/80 px-4 py-2 text-sm font-black text-trix-gold backdrop-blur-sm">
        JOUER <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}