import React from 'react';
import { motion } from 'framer-motion';
import { useProgression } from '@/context/ProgressionContext';
import { ACHIEVEMENTS } from '@/lib/progressionData';
import { Coins, Zap, Award } from 'lucide-react';

export default function AchievementsList() {
  const { progress } = useProgression();
  if (!progress) return null;
  const owned = progress.achievements || [];
  const stats = progress.stats || {};

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/50">
        <span className="font-bold text-white">{owned.length}</span> / {ACHIEVEMENTS.length} succès complétés
      </p>
      <div className="space-y-2">
        {ACHIEVEMENTS.map((a, i) => {
          const completed = owned.includes(a.id);
          const current = stats[a.condition.stat] || 0;
          const percent = Math.min(100, (current / a.condition.val) * 100);

          return (
            <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="p-4 rounded-xl flex items-center gap-3"
              style={{
                background: completed ? 'rgba(168,85,247,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${completed ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)'}`,
              }}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${completed ? '' : 'grayscale opacity-40'}`}
                style={{ background: completed ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)' }}>
                {completed ? a.icon : '🔒'}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold ${completed ? 'text-white' : 'text-white/60'}`}>{a.name}</div>
                {!completed && (
                  <div className="mt-1.5">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #a855f7, #3b82f6)' }}
                        initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.8 }} />
                    </div>
                    <div className="text-[9px] text-white/30 mt-0.5 font-mono">{current.toLocaleString()} / {a.condition.val.toLocaleString()}</div>
                  </div>
                )}
                {completed && <div className="text-[10px] mt-0.5" style={{ color: '#22c55e' }}>✓ Complété</div>}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-1 text-[10px]" style={{ color: '#fbbf24' }}>
                  <Zap className="w-3 h-3" />{a.xp} XP
                </div>
                <div className="flex items-center gap-1 text-[10px]" style={{ color: '#fbbf24' }}>
                  <Coins className="w-3 h-3" />{a.coins}
                </div>
                {a.badge_reward && <div className="flex items-center gap-1 text-[10px]" style={{ color: '#a855f7' }}><Award className="w-3 h-3" />Badge</div>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}