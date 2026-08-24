import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProgression } from '@/context/ProgressionContext';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Zap, Trophy } from 'lucide-react';
import { ACHIEVEMENTS } from '@/lib/achievementsData';
import CasinoToken from '@/components/casino/CasinoToken';

export default function ProgressionOverview() {
  const { progress, rank, prestigeInfo } = useProgression();
  const [casinoBalance, setCasinoBalance] = useState(0);

  // Fetch real casino token balance
  useEffect(() => {
    if (!progress?.user_email) return;
    base44.entities.CasinoPlayer.filter({ user_email: progress.user_email })
      .then(records => {
        if (records && records.length > 0) setCasinoBalance(records[0].balance || 0);
      })
      .catch(() => {});
  }, [progress?.user_email]);

  if (!progress) return null;

  const stats = progress.stats || {};
  const claimed = progress.claimed_achievements || [];
  const totalTrophies = ACHIEVEMENTS.filter(a => claimed.includes(a.id)).reduce((s, a) => s + (a.trophies || 0), 0);

  const statItems = [
    { label: 'Serveurs créés',    value: stats.create_server || 0,     icon: '🏰' },
    { label: 'Connexions',        value: stats.daily_logins || 0,      icon: '📅' },
  ];

  return (
    <div className="space-y-5">
      {/* Summary grid — 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.04)' }}>
          <TrendingUp className="w-4 h-4 mb-1.5" style={{ color: '#6c47ff' }} />
          <div className="text-2xl font-black text-white">{progress.level}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">Niveau</div>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.04)' }}>
          <Trophy className="w-4 h-4 mb-1.5" style={{ color: '#00F2FF' }} />
          <div className="text-2xl font-black text-white">{totalTrophies.toLocaleString()}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">Trophées</div>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.04)' }}>
          <CasinoToken size={24} className="mb-1.5" />
          <div className="text-2xl font-black text-white">{casinoBalance.toLocaleString()}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">Jetons Nexus Game</div>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.04)' }}>
          <Zap className="w-4 h-4 mb-1.5" style={{ color: '#22c55e' }} />
          <div className="text-2xl font-black text-white">{(progress.total_xp || 0).toLocaleString()}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">XP Total</div>
        </div>
      </div>

      {/* Statistics grid */}
      {statItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {statItems.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-lg shrink-0">{s.icon}</span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white">{s.value.toLocaleString()}</div>
                <div className="text-[9px] text-white/40 truncate">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}