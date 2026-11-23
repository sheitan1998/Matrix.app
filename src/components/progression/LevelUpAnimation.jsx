import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getRank, PRESTIGE_TIERS } from '@/lib/progressionData';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

// Petit carré discret en bas à droite, silencieux.
export default function LevelUpAnimation({ data, onClose }) {
  const rank = getRank(data.level);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const t = setTimeout(() => closeRef.current?.(), 5000);
    return () => clearTimeout(t);
  }, [data]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] w-36 rounded-xl p-3 text-center"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{
        background: 'linear-gradient(135deg, #12091c, #1a0e2e)',
        border: '1px solid rgba(168,85,247,0.5)',
        boxShadow: '0 0 20px rgba(168,85,247,0.35)',
      }}
    >
      <button
        type="button"
        onClick={() => closeRef.current?.()}
        aria-label="Fermer"
        className="absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center text-white/40 hover:text-white transition"
      >
        <X className="w-3 h-3" />
      </button>
      <p className="text-[9px] font-black tracking-wider uppercase" style={{ color: '#a855f7' }}>Niveau supérieur</p>
      <p
        className="text-3xl font-black leading-tight"
        style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
      >{data.level}</p>
      <p className="text-[10px] font-bold" style={{ color: rank.color }}>{rank.icon} {rank.name}</p>
      {data.prestige > 0 && (
        <p className="text-[9px] font-bold mt-0.5" style={{ color: '#fbbf24' }}>
          {PRESTIGE_TIERS.find(t => t.tier === data.prestige)?.icon} Prestige {ROMAN[data.prestige]}
        </p>
      )}
      {data.rewards?.length > 0 && (
        <p className="text-[9px] text-white/50 mt-1 truncate">
          {data.rewards.map(r => `${r.icon} ${r.name}`).join(' · ')}
        </p>
      )}
    </motion.div>
  );
}
