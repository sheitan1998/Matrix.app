import React from 'react';
import { motion } from 'framer-motion';
import { useProgression } from '@/context/ProgressionContext';
import { Coins, TrendingUp, Zap, Sparkles } from 'lucide-react';

export default function ProgressionOverview() {
  const { progress, rank, prestigeInfo } = useProgression();
  if (!progress) return null;

  const stats = progress.stats || {};

  const statItems = [
    { label: 'Vidéos publiées',   value: stats.publish_video || 0,    icon: '🎬' },
    { label: 'Lives créés',        value: stats.create_live || 0,      icon: '🔴' },
    { label: 'Messages envoyés',  value: stats.send_message || 0,     icon: '💬' },
    { label: 'Commentaires',      value: stats.comment || 0,           icon: '💭' },
    { label: 'Likes reçus',       value: stats.receive_like || 0,      icon: '❤️' },
    { label: 'Abonnés gagnés',    value: stats.receive_subscriber || 0, icon: '📊' },
    { label: 'Serveurs créés',    value: stats.create_server || 0,     icon: '🏰' },
    { label: 'Utilisations IA',   value: stats.use_ai || 0,            icon: '🤖' },
    { label: 'Amis invités',      value: stats.invite_friend || 0,     icon: '🤝' },
    { label: 'Événements',        value: stats.participate_event || 0,  icon: '🏆' },
    { label: 'Connexions',        value: stats.daily_logins || 0,      icon: '📅' },
    { label: 'Aide communauté',  value: stats.help_community || 0,    icon: '🛡' },
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
          <Coins className="w-4 h-4 mb-1.5" style={{ color: '#ff9f1c' }} />
          <div className="text-2xl font-black text-white">{(progress.coins || 0).toLocaleString()}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">Pièces Matrix</div>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.04)' }}>
          <Zap className="w-4 h-4 mb-1.5" style={{ color: '#22c55e' }} />
          <div className="text-2xl font-black text-white">{(progress.total_xp || 0).toLocaleString()}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">XP Total</div>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.04)' }}>
          <Sparkles className="w-4 h-4 mb-1.5" style={{ color: rank?.color || '#a855f7' }} />
          <div className="text-sm font-black text-white truncate">{rank?.name || 'Recrue MATRIX'}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">Rang</div>
        </div>
      </div>

      {/* Statistics grid — 3 columns */}
      <div className="grid grid-cols-3 gap-2">
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
    </div>
  );
}