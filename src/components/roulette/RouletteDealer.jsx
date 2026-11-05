import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { rouletteColor } from '@/lib/rouletteTable';

const DEALER_IMAGE =
  'https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/f0e85ece7_croupiere-nexus.png';

const ease = [0.22, 0.9, 0.24, 1];

export default function RouletteDealer({ message, number, scale = 100 }) {
  const color = number === null || number === undefined ? null : rouletteColor(number);
  const tone =
    color === 'red' ? '#ef4444' : color === 'black' ? '#d4d4d8' : color === 'green' ? '#22c55e' : '#a855f7';

  const safeScale = Math.min(200, Math.max(50, Number(scale) || 100));

  return (
    <div
      className="mx-auto flex w-full flex-col items-center"
      style={{ maxWidth: `${Math.round(320 * (safeScale / 100))}px` }}
    >
      {/* Bulle de dialogue */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.3, ease }}
          className="relative w-full rounded-2xl border px-3.5 py-3"
          style={{
            background: 'linear-gradient(150deg, rgba(40,16,56,0.97), rgba(11,5,16,0.97))',
            borderColor: 'rgba(192,132,252,0.55)',
            boxShadow:
              '0 0 0 1px rgba(230,192,105,0.22), 0 0 28px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
          role="status"
          aria-live="polite"
        >
          <span
            className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r"
            style={{ background: '#160a1e', borderColor: 'rgba(192,132,252,0.55)' }}
          />

          <div className="mb-1.5 flex items-center gap-1.5">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black text-white"
              style={{ background: tone, boxShadow: `0 0 12px ${tone}80` }}
            >
              {number ?? '—'}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-300">Croupière Nexus</span>
            <Volume2 className="ml-auto h-3 w-3 text-purple-300/70" />
          </div>

          <p className="text-[12px] font-semibold leading-snug text-white/95 sm:text-[13px]">{message}</p>
        </motion.div>
      </AnimatePresence>

      {/* Portrait flottant — aucun cadre ni fond de conteneur */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="relative mt-4 w-full"
      >
        <div
          className="absolute inset-x-4 bottom-6 top-10 -z-10 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle at 50% 58%, rgba(168,85,247,0.42), transparent 72%)' }}
        />

        <img
          src={DEALER_IMAGE}
          alt="Croupière Nexus"
          className="relative h-auto w-full object-contain"
          style={{
            filter: 'drop-shadow(0 22px 38px rgba(0,0,0,0.5))',
            WebkitMaskImage:
              'radial-gradient(ellipse 82% 88% at 50% 40%, #000 68%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 82% 88% at 50% 40%, #000 68%, transparent 100%)',
          }}
        />
      </motion.div>
    </div>
  );
}