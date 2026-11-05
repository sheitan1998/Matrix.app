import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { rouletteColor } from '@/lib/rouletteTable';

const DEALER_IMAGE =
  'https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/f0e85ece7_croupiere-nexus.png';

export default function RouletteDealer({ message, number, visible }) {
  const color = number === null || number === undefined ? null : rouletteColor(number);
  const tone = color === 'red' ? '#ef4444' : color === 'black' ? '#d4d4d8' : color === 'green' ? '#22c55e' : '#a855f7';

  return (
    <div className="relative w-full max-w-[430px]">
      <div className="flex items-end gap-3">
        <div className="relative shrink-0">
          <div
            className="h-20 w-20 overflow-hidden rounded-2xl border sm:h-24 sm:w-24"
            style={{
              borderColor: 'rgba(230,192,105,0.45)',
              boxShadow: '0 0 24px rgba(168,85,247,0.28)',
              background: 'radial-gradient(circle at 50% 20%, #241228, #08050b)',
            }}
          >
            <img
              src={DEALER_IMAGE}
              alt="Croupière Nexus"
              className="h-full w-full scale-110 object-cover object-top"
              loading="lazy"
            />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-purple-400/50 bg-[#150a1f] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-200">
            Nexus
          </span>
        </div>

        <AnimatePresence>
          {visible && message && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="relative mb-3 flex-1 rounded-2xl border px-3.5 py-2.5"
              style={{
                background: 'linear-gradient(150deg, rgba(24,10,34,0.96), rgba(10,5,16,0.96))',
                borderColor: 'rgba(168,85,247,0.55)',
                boxShadow: '0 0 18px rgba(168,85,247,0.3), inset 0 0 14px rgba(230,192,105,0.08)',
              }}
              role="status"
              aria-live="polite"
            >
              <span
                className="absolute -left-1.5 top-5 h-3 w-3 rotate-45 border-b border-l"
                style={{ background: '#160b21', borderColor: 'rgba(168,85,247,0.55)' }}
              />
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black text-white"
                  style={{ background: tone, boxShadow: `0 0 12px ${tone}80` }}
                >
                  {number ?? '—'}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-amber-300/80">Croupière</span>
              </div>
              <p className="text-[12px] font-semibold leading-snug text-white/90">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}