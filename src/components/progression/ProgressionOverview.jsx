import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProgression } from '@/context/ProgressionContext';
import { BADGES, RARITIES, BADGE_CATEGORIES, LEVEL_REWARDS, PRESTIGE_TIERS, getRank } from '@/lib/progressionData';
import { Coins, TrendingUp, Calendar, Zap } from 'lucide-react';

export default function ProgressionOverview() {
  const { progress, rank, prestigeInfo } = useProgression();
  const [tab, setTab] = useState('stats');
  if (!progress) return null;

  const ownedBadges = progress.badges || [];
  const ownedAchievements = progress.achievements || [];
  const stats = progress.stats || {};
  const unlockedRewards = progress.unlocked_rewards || [];

  const statItems = [
    { label: 'Vidéos publiées', value: stats.publish_video || 0, icon: '🎬' },
    { label: 'Lives créés', value: stats.create_live || 0, icon: '🔴' },
    { label: 'Messages envoyés', value: stats.send_message || 0, icon: '💬' },
    { label: 'Commentaires', value: stats.comment || 0, icon: '💭' },
    { label: 'Likes reçus', value: stats.receive_like || 0, icon: '❤️' },
    { label: 'Abonnés gagnés', value: stats.receive_subscriber || 0, icon: '📊' },
    { label: 'Serveurs créés', value: stats.create_server || 0, icon: '🏰' },
    { label: 'Utilisations IA', value: stats.use_ai || 0, icon: '🤖' },
    { label: 'Amis invités', value: stats.invite_friend || 0, icon: '🤝' },
    { label: 'Événements', value: stats.participate_event || 0, icon: '🏆' },
    { label: 'Connexions', value: stats.daily_logins || 0, icon: '📅' },
    { label: 'Aide communauté', value: stats.help_community || 0, icon: '🛡' },
  ];

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
          <TrendingUp className="w-4 h-4 mb-1" style={{ color: '#a855f7' }} />
          <div className="text-2xl font-black" style={{ color: '#a855f7' }}>{progress.level}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide">Niveau</div>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <Coins className="w-4 h-4 mb-1" style={{ color: '#fbbf24' }} />
          <div className="text-2xl font-black" style={{ color: '#fbbf24' }}>{(progress.coins || 0).toLocaleString()}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide">Pièces MATRIX</div>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <Zap className="w-4 h-4 mb-1" style={{ color: '#22c55e' }} />
          <div className="text-2xl font-black" style={{ color: '#22c55e' }}>{(progress.total_xp || 0).toLocaleString()}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide">XP Total</div>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(232,121,249,0.06)', border: '1px solid rgba(232,121,249,0.15)' }}>
          <span className="text-base mb-1 block">{rank.icon}</span>
          <div className="text-sm font-black truncate" style={{ color: rank.color }}>{rank.name}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide">Rang</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {[
          { id: 'stats', label: 'Statistiques' },
          { id: 'rewards', label: 'Récompenses' },
          { id: 'badges', label: `Badges (${ownedBadges.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition ${tab === t.id ? 'text-white' : 'text-white/40'}`}
            style={tab === t.id ? { background: 'rgba(168,85,247,0.15)' } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {statItems.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-lg">{s.icon}</span>
              <div>
                <div className="text-sm font-bold text-white">{s.value.toLocaleString()}</div>
                <div className="text-[9px] text-white/40">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'rewards' && (
        <div className="space-y-2">
          {LEVEL_REWARDS.map(r => {
            const unlocked = progress.level >= r.level;
            return (
              <div key={r.level} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: unlocked ? 'rgba(168,85,247,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${unlocked ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)'}` }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${unlocked ? '' : 'grayscale opacity-30'}`}
                  style={{ background: unlocked ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)' }}>
                  {unlocked ? r.icon : '🔒'}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-bold ${unlocked ? 'text-white' : 'text-white/40'}`}>{r.name}</div>
                  <div className="text-[10px] text-white/30">Niveau {r.level}</div>
                </div>
                {unlocked && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Débloqué</span>}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'badges' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {BADGES.filter(b => ownedBadges.includes(b.id)).map((b, i) => {
            const rarity = RARITIES[b.rarity];
            return (
              <motion.div key={b.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                className="flex flex-col items-center p-2 rounded-xl text-center"
                style={{ background: `${rarity.color}10`, border: `1px solid ${rarity.color}30`, boxShadow: rarity.glow ? `0 0 12px ${rarity.color}30` : 'none' }}>
                <span className="text-2xl mb-1" style={rarity.glow ? { filter: `drop-shadow(0 0 6px ${rarity.color})` } : {}}>{b.icon}</span>
                <span className="text-[9px] font-bold text-white/80 leading-tight">{b.name}</span>
                <span className="text-[8px] mt-0.5" style={{ color: rarity.color }}>{rarity.icon} {rarity.name}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}