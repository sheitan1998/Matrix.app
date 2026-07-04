import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProgression } from '@/context/ProgressionContext';
import { BADGES, RARITIES, BADGE_CATEGORIES } from '@/lib/progressionData';

export default function BadgesGrid() {
  const { progress } = useProgression();
  const [category, setCategory] = useState('all');
  if (!progress) return null;
  const owned = progress.badges || [];

  const filtered = BADGES.filter(b => {
    if (category === 'all') return true;
    return b.category === category;
  });

  const totalUnlocked = BADGES.filter(b => owned.includes(b.id)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          <span className="font-bold text-white">{totalUnlocked}</span> / {BADGES.length} badges débloqués
        </p>
        <div className="flex gap-1">
          {Object.entries(RARITIES).map(([key, r]) => (
            <span key={key} className="text-xs" title={r.name} style={{ color: r.color }}>{r.icon}</span>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${category === 'all' ? 'text-white' : 'text-white/40'}`}
          style={category === 'all' ? { background: 'rgba(168,85,247,0.15)' } : { background: 'rgba(255,255,255,0.03)' }}>
          Tous
        </button>
        {BADGE_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${category === c.id ? 'text-white' : 'text-white/40'}`}
            style={category === c.id ? { background: 'rgba(168,85,247,0.15)' } : { background: 'rgba(255,255,255,0.03)' }}>
            <span>{c.icon}</span>{c.name}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {filtered.map((b, i) => {
          const isOwned = owned.includes(b.id);
          const rarity = RARITIES[b.rarity];
          const isSecret = b.secret && !isOwned;

          return (
            <motion.div key={b.id}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
              className="flex flex-col items-center p-3 rounded-xl text-center relative overflow-hidden"
              style={{
                background: isOwned ? `${rarity.color}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isOwned ? `${rarity.color}40` : 'rgba(255,255,255,0.04)'}`,
                boxShadow: isOwned && rarity.glow ? `0 0 15px ${rarity.color}25` : 'none',
              }}>
              {isOwned && rarity.glow && (
                <motion.div className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 50%, ${rarity.color}15, transparent 70%)` }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
                />
              )}
              <div className="relative z-10">
                <span className="text-3xl block mb-1" style={{
                  filter: isOwned ? (rarity.glow ? `drop-shadow(0 0 8px ${rarity.color})` : 'none') : 'grayscale(1) opacity(0.3)',
                }}>
                  {isSecret ? '❓' : b.icon}
                </span>
                <span className="text-[9px] font-bold text-white/80 leading-tight block">
                  {isSecret ? '???' : b.name}
                </span>
                <span className="text-[8px] mt-0.5 block" style={{ color: isOwned ? rarity.color : 'rgba(255,255,255,0.2)' }}>
                  {rarity.icon} {rarity.name}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}