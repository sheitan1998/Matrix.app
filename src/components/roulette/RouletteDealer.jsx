import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { rouletteColor } from '@/lib/rouletteTable';

const DEALER_IMAGE =
  'https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/f0e85ece7_croupiere-nexus.png';

const ease = [0.22, 0.9, 0.24, 1];

export default function RouletteDealer({ message, number }) {
  const color = number === null || number === undefined ? null : rouletteColor(number);
  const tone =
    color === 'red' ? '#ef4444' : color === 'black' ? '#d4d4d8' : color === 'green' ? '#22c55e' : '#a855f7';

  return (
    <div className="flex w-full flex-col items-center">
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

      {/* Portrait en grand */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="relative mt-4 w-full max-w-[320px]"
      >
        <div
          className="absolute inset-x-2 top-6 bottom-0 -z-10 rounded-[999px] blur-2xl"
          style={{ background: 'radial-gradient(circle at 50% 60%, rgba(168,85,247,0.55), transparent 70%)' }}
        />

        <div
          className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-3xl border-2"
          style={{
            borderColor: 'rgba(230,192,105,0.55)',
            boxShadow: '0 0 0 1px rgba(168,85,247,0.35), 0 24px 44px rgba(0,0,0,0.65)',
            background: 'radial-gradient(circle at 50% 12%, #2a1330, #08050b)',
          }}
        >
          <img
            src={DEALER_IMAGE}
            alt="Croupière Nexus"
            className="h-full w-full scale-105 object-cover object-top"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(180deg, transparent 62%, rgba(6,3,9,0.75) 100%)' }}
          />
        </div>
      </motion.div>
    </div>
  );
}