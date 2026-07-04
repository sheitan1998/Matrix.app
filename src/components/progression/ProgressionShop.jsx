import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProgression } from '@/context/ProgressionContext';
import { SHOP_ITEMS, SHOP_CATEGORIES, RARITIES } from '@/lib/progressionData';
import { Coins, Check, Lock } from 'lucide-react';

export default function ProgressionShop() {
  const { progress, buyItem, equipItem } = useProgression();
  const [category, setCategory] = useState('frames');
  if (!progress) return null;

  const owned = progress.unlocked_rewards || [];
  const equipped = progress.equipped || {};
  const items = SHOP_ITEMS.filter(i => i.category === category);

  return (
    <div className="space-y-4">
      {/* Balance */}
      <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
        <span className="text-sm font-bold text-white/60">Solde</span>
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4" style={{ color: '#fbbf24' }} />
          <span className="text-lg font-black" style={{ color: '#fbbf24' }}>{(progress.coins || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {SHOP_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${category === c.id ? 'text-white' : 'text-white/40'}`}
            style={category === c.id ? { background: 'rgba(168,85,247,0.15)' } : { background: 'rgba(255,255,255,0.03)' }}>
            <span>{c.icon}</span>{c.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item, i) => {
          const isOwned = owned.includes(`shop_${item.id}`);
          const isEquipped = equipped[item.category] === item.id;
          const canAfford = progress.coins >= item.price;
          const rarity = RARITIES[item.rarity];

          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl p-3 flex flex-col items-center text-center"
              style={{
                background: isOwned ? `${rarity.color}08` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isEquipped ? rarity.color : 'rgba(255,255,255,0.06)'}`,
                boxShadow: isEquipped ? `0 0 15px ${rarity.color}30` : 'none',
              }}>
              <span className="text-3xl mb-1" style={rarity.glow ? { filter: `drop-shadow(0 0 6px ${rarity.color})` } : {}}>{item.icon}</span>
              <span className="text-xs font-bold text-white mb-0.5">{item.name}</span>
              <span className="text-[8px] mb-2" style={{ color: rarity.color }}>{rarity.icon} {rarity.name}</span>

              {isEquipped ? (
                <div className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg w-full justify-center" style={{ background: `${rarity.color}15`, color: rarity.color }}>
                  <Check className="w-3 h-3" />Équipé
                </div>
              ) : isOwned ? (
                <button onClick={() => equipItem(item.category, item.id)}
                  className="w-full py-1.5 rounded-lg text-[10px] font-bold text-white transition hover:opacity-80"
                  style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                  Équiper
                </button>
              ) : (
                <button onClick={() => buyItem(item.id)} disabled={!canAfford}
                  className="w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition disabled:opacity-40"
                  style={{ background: canAfford ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'rgba(255,255,255,0.05)', color: canAfford ? '#000' : 'rgba(255,255,255,0.3)' }}>
                  {canAfford ? <><Coins className="w-3 h-3" />{item.price.toLocaleString()}</> : <><Lock className="w-3 h-3" />{item.price.toLocaleString()}</>}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}