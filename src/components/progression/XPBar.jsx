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
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #a855f7, #3b82f6, #22c55e)' }}
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[9px] text-white/40 font-mono">{progress.xp.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
          <span className="text-[9px] text-white/40 font-mono">{xpPercent.toFixed(0)}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 rounded-2xl" style={{ background: 'rgba(12,12,16,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `linear-gradient(135deg, ${rank.color}30, ${rank.color}10)`, border: `1.5px solid ${rank.color}40` }}>
          <span className="text-xl font-black" style={{ color: rank.color }}>{progress.level}</span>
          {prestigeInfo && (
            <span className="absolute -top-1.5 -right-1.5 text-xs px-1 rounded-full" style={{ background: prestigeInfo.color, color: '#000' }}>
              {prestigeInfo.tier}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{rank.icon}</span>
            <span className="text-sm font-bold truncate" style={{ color: rank.color }}>{rank.name}</span>
            {prestigeInfo && <span className="text-xs font-bold" style={{ color: prestigeInfo.color }}>{prestigeInfo.name}</span>}
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full relative"
              style={{ background: 'linear-gradient(90deg, #a855f7, #3b82f6, #22c55e)' }}
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'shimmer 2s infinite' }} />
            </motion.div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-white/40 font-mono">{progress.xp.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
            <span className="text-[10px] font-bold" style={{ color: rank.color }}>{xpPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}