import React from 'react';
import { motion } from 'framer-motion';
import { useProgression } from '@/context/ProgressionContext';

export default function XPBar({ compact = false }) {
  const { progress, rank, xpNeeded, xpPercent, prestigeInfo } = useProgression();
  if (!progress) return null;

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md" style={{ background: `${rank.color}20`, border: `1px solid ${rank.color}30` }}>
            <span className="text-xs">{rank.icon}</span>
            <span className="text-[10px] font-bold" style={{ color: rank.color }}>Niv. {progress.level}</span>
          </div>
          {prestigeInfo && (
            <span className="text-[10px] font-bold" style={{ color: prestigeInfo.color }}>{prestigeInfo.icon} P{prestigeInfo.tier}</span>
          )}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #6c47ff, #3b82f6)' }}
            initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[9px] text-white/40 font-mono">{progress.xp.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
          <span className="text-[9px] text-white/40 font-mono">{xpPercent.toFixed(0)}%</span>
        </div>
      </div>
    );
  }

  const remaining = Math.max(0, xpNeeded - progress.xp);

  return (
    <div className="w-full p-5 rounded-2xl" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-4">
        {/* Level badge */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #4c2a85, #2a1a4a)', border: '1px solid rgba(108,71,255,0.3)' }}>
          <span className="text-3xl font-black text-white">{progress.level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold text-white">{rank.name}</span>
            <span className="text-sm font-bold text-white">{xpPercent.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #6c47ff, #3b82f6)' }}
              initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
          </div>
          <div className="mt-1.5 text-[11px] text-white/40 font-mono">{progress.xp.toLocaleString()} / {xpNeeded.toLocaleString()} XP</div>
        </div>
      </div>
      <p className="text-[11px] text-white/30 mt-3">Encore {remaining.toLocaleString()} XP avant de débloquer le rang suivant 🚀</p>
    </div>
  );
}