import React from 'react';
import { motion } from 'framer-motion';
import { useProgression } from '@/context/ProgressionContext';
import { Zap, Coins, CheckCircle2, Clock, Trophy } from 'lucide-react';

const PERIODS = [
  { id: 'daily',   label: 'Quotidiennes', icon: '☀️', color: '#fbbf24' },
  { id: 'weekly',  label: 'Hebdomadaires', icon: '📅', color: '#3b82f6' },
];

export default function MissionsBoard() {
  const { progress, claimMission } = useProgression();
  if (!progress) return null;
  const missions = progress.missions || {};

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {PERIODS.map(period => {
        const list = missions[period.id] || [];
        const completed = list.filter(m => m.completed).length;

        return (
          <div key={period.id} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(12,12,16,0.6)', border: `1px solid ${period.color}20` }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: `${period.color}10` }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{period.icon}</span>
                <span className="text-sm font-bold" style={{ color: period.color }}>{period.label}</span>
              </div>
              <span className="text-xs font-mono" style={{ color: period.color }}>{completed}/{list.length}</span>
            </div>
            <div className="p-3 space-y-2">
              {list.length === 0 && <p className="text-xs text-white/30 text-center py-4">Aucune mission</p>}
              {list.map((m, i) => {
                const percent = Math.min(100, ((m.progress || 0) / m.target) * 100);
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-xl" style={{ background: m.claimed ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${m.claimed ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)'}` }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-xs font-bold ${m.claimed ? 'text-white/50 line-through' : 'text-white'}`}>{m.name}</span>
                      {m.completed && !m.claimed && <Clock className="w-3 h-3 shrink-0" style={{ color: period.color }} />}
                      {m.claimed && <CheckCircle2 className="w-3 h-3 shrink-0 text-green-500" />}
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: m.completed ? '#22c55e' : period.color }}
                        initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.6 }} />
                    </div>
                    <div className="flex items-center justify-between">
                    <span className="text-[9px] text-white/40 font-mono">{m.progress || 0} / {m.target}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-[9px]" style={{ color: '#fbbf24' }}><Zap className="w-2.5 h-2.5" />{m.xp}</span>
                      <span className="flex items-center gap-0.5 text-[9px]" style={{ color: '#fbbf24' }}><Coins className="w-2.5 h-2.5" />{m.coins}</span>
                      {m.trophies > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px]" style={{ color: '#00F2FF' }}>
                          {Array.from({ length: m.trophies }).map((_, ti) => <Trophy key={ti} className="w-2 h-2" fill="currentColor" />)}
                        </span>
                      )}
                    </div>
                    </div>
                    {m.completed && !m.claimed && (
                      <button onClick={() => claimMission(period.id, m.id)}
                        className="w-full mt-2 py-1.5 rounded-lg text-[10px] font-bold text-white transition hover:opacity-80"
                        style={{ background: 'linear-gradient(135deg, #a855f7, #6d28d9)' }}>
                        Récupérer
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}