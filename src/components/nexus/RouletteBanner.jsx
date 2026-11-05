import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BANNER_IMAGE =
  'https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/c1647e5c0_croupiere-banner.png';

export default function RouletteBanner() {
  return (
    <Link
      to="/roulette"
      className="group relative mb-6 block overflow-hidden rounded-3xl"
      style={{
        border: '1px solid rgba(230,192,105,0.28)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
      }}
    >
      <img
        src={BANNER_IMAGE}
        alt="Roulette Nexus — la croupière vous attend à la table"
        className="h-auto w-full transition duration-500 group-hover:scale-[1.02]"
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,5,15,0.05) 0%, rgba(10,5,15,0.12) 46%, rgba(10,5,15,0.94) 100%)',
        }}
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 sm:p-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">Nexus Games</p>
          <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">Roulette Royale</h2>
          <p className="mt-1 max-w-md text-xs text-white/60 sm:text-sm">
            La croupière vous attend à la table : placez vos jetons et lancez la bille.
          </p>
        </div>

        <span
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wide text-black transition group-hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #f6e0a0, #d9a63c)' }}
        >
          Jouer <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}