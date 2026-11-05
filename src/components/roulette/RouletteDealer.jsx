import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { rouletteColor } from '@/lib/rouletteTable';

const DEALER_IMAGE =
  'https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/f0e85ece7_croupiere-nexus.png';

const ease = [0.22, 0.9, 0.24, 1];

/**
 * The dealer is off-screen by default and only slides in with her speech bubble
 * when a spin has been settled.
 */
export default function RouletteDealer({ message, number, visible }) {
  const color = number === null || number === undefined ? null : rouletteColor(number);
  const tone =
    color === 'red' ? '#ef4444' : color === 'black' ? '#d4d4d8' : color === 'green' ? '#22c55e' : '#a855f7';

  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          className="pointer-events-none absolute bottom-2 right-2 z-20 flex items-end gap-2 sm:bottom-3 sm:right-3"
          initial={{ opacity: 0, x: 26, y: 22, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 18, y: 16, scale: 0.94 }}
          transition={{ duration: 0.42, ease }}
        >
          {/* Speech bubble */}
          <motion.div
            className="relative mb-8 w-[178px] rounded-2xl border px-3 py-2.5 sm:mb-11 sm:w-[226px] sm:px-3.5"
            style={{
              background: 'linear-gradient(150deg, rgba(32,12,46,0.97), rgba(11,5,16,0.97))',
              borderColor: 'rgba(192,132,252,0.55)',
              boxShadow:
                '0 0 0 1px rgba(230,192,105,0.22), 0 0 24px rgba(168,85,247,0.42), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
            role="status"
            aria-live="polite"
          >
            <span
              className="absolute -right-[7px] bottom-6 h-3 w-3 rotate-45 border-b border-r"
              style={{ background: '#140a1e', borderColor: 'rgba(192,132,252,0.55)' }}
            />
            <div className="mb-1.5 flex items-center gap-1.5">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black text-white"
                style={{ background: tone, boxShadow: `0 0 12px ${tone}80` }}
              >
                {number ?? '—'}
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-300">Croupière</span>
              <Volume2 className="ml-auto h-3 w-3 text-purple-300/70" />
            </div>
            <p className="text-[11px] font-semibold leading-snug text-white/95 sm:text-[12px]">{message}</p>
          </motion.div>

          {/* Dealer portrait */}
          <motion.div
            className="relative shrink-0"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease, delay: 0.06 }}
          >
            <div
              className="absolute inset-0 -z-10 rounded-t-[999px] blur-xl"
              style={{ background: 'radial-gradient(circle at 50% 70%, rgba(168,85,247,0.55), transparent 70%)' }}
            />
            <div
              className="h-[104px] w-[78px] overflow-hidden rounded-t-[999px] rounded-b-2xl border sm:h-[124px] sm:w-[92px]"
              style={{
                borderColor: 'rgba(230,192,105,0.55)',
                boxShadow: '0 0 0 1px rgba(168,85,247,0.35), 0 18px 34px rgba(0,0,0,0.6)',
                background: 'radial-gradient(circle at 50% 15%, #2a1330, #08050b)',
              }}
            >
              <img
                src={DEALER_IMAGE}
                alt="Croupière Nexus"
                className="h-full w-full scale-105 object-cover object-top"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}