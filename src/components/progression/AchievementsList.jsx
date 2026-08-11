import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProgression } from '@/context/ProgressionContext';
import { ACHIEVEMENTS } from '@/lib/achievementsData';
import { Trophy } from 'lucide-react';

export default function AchievementsList() {
  const { progress, claimAchievement } = useProgression();
  const [filter, setFilter] = useState('all');
  if (!progress) return null;

  const owned = progress.achievements || [];
  const claimed = progress.claimed_achievements || [];
  const stats = progress.stats || {};

  const categories = ['all', ...Array.from(new Set(ACHIEVEMENTS.map(a => a.category)))];
  const filtered = filter === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.category === filter);
  const completedCount = ACHIEVEMENTS.filter(a => owned.includes(a.id)).length;
  const totalTrophies = ACHIEVEMENTS.filter(a => claimed.includes(a.id)).reduce((s, a) => s + (a.trophies || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-white/50">
          <span className="font-bold text-white">{completedCount}</span> / {ACHIEVEMENTS.length} succès complétés
        </p>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,242,255,0.06)', border: '1px solid rgba(0,242,255,0.2)' }}>
          <Trophy className="w-3.5 h-3.5" style={{ color: '#00F2FF' }} />
          <span className="text-xs font-bold" style={{ color: '#00F2FF' }}>{totalTrophies} Trophées</span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filter === c ? 'text-white' : 'text-white/40'}`}
            style={filter === c ? { background: 'rgba(168,85,247,0.15)' } : { background: 'rgba(255,255,255,0.03)' }}>
            {c === 'all' ? 'Tous' : c}
          </button>
        ))}
      </div>

      {/* Achievements list */}
      <div className="space-y-2">
        {filtered.map((a, i) => {
          const completed = owned.includes(a.id);
          const isClaimed = claimed.includes(a.id);
          const current = stats[a.stat] || 0;
          const percent = Math.min(100, (current / a.target) * 100);

          return (
            <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.01, 0.4) }}
              className="p-3 rounded-xl flex items-center gap-3"
              style={{
                background: isClaimed ? 'rgba(0,242,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isClaimed ? 'rgba(0,242,255,0.2)' : 'rgba(255,255,255,0.04)'}`,
              }}>
              {/* Trophy image */}
              <div className="w-16 h-16 shrink-0 flex items-center justify-center"
                style={{ filter: isClaimed ? 'drop-shadow(0 0 8px rgba(0,242,255,0.5))' : 'opacity(0.9)' }}>
                <img src={a.icon} alt="Trophée" className="w-16 h-16 object-contain" />
              </div>

              {/* Name + progress */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold ${completed ? 'text-white' : 'text-white/60'}`}>{a.name}</div>
                {!completed && (
                  <div className="mt-1.5">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #00F2FF, #9D00FF)' }}
                        initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.8 }} />
                    </div>
                    <div className="text-[9px] text-white/30 mt-0.5 font-mono">{Math.min(current, a.target).toLocaleString()} / {a.target.toLocaleString()}</div>
                  </div>
                )}
                {completed && !isClaimed && <div className="text-[10px] mt-0.5" style={{ color: '#fbbf24' }}>⚡ Récompense disponible !</div>}
                {isClaimed && <div className="text-[10px] mt-0.5" style={{ color: '#22c55e' }}>✓ Réclamé</div>}
              </div>

              {/* Total points (Trophées + XP) */}
              <div className="flex flex-col items-end gap-0.5 shrink-0 min-w-[64px]">
                <div className="text-[9px] text-white/40 font-mono uppercase">Total</div>
                <div className="text-base font-black" style={{ color: isClaimed ? '#00F2FF' : 'rgba(255,255,255,0.5)' }}>
                  {a.total.toLocaleString()}
                </div>
                <div className="text-[8px] font-mono text-white/40">
                  🏆{a.trophies} + ⚡{a.xp}
                </div>
              </div>

              {/* Claim button */}
              {completed && !isClaimed && (
                <button onClick={() => claimAchievement(a.id)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white transition hover:opacity-80 tap-sm shrink-0"
                  style={{ background: 'linear-gradient(135deg, #00F2FF, #9D00FF)' }}>
                  Récupérer
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}