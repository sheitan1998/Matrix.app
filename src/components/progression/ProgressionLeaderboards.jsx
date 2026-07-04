import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { LEADERBOARD_TYPES, getRank } from '@/lib/progressionData';
import { useProgression } from '@/context/ProgressionContext';

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj) || 0;
}

export default function ProgressionLeaderboards() {
  const { progress } = useProgression();
  const [type, setType] = useState('level');
  const [period, setPeriod] = useState('all');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const records = await base44.entities.UserProgress.list('-updated_date', 100);
        const lbType = LEADERBOARD_TYPES.find(t => t.id === type);
        // Filter by period based on updated_date
        let filtered = records;
        if (period !== 'all') {
          const now = Date.now();
          const ms = period === 'week' ? 604800000 : period === 'month' ? 2592000000 : 31536000000;
          filtered = records.filter(r => {
            const d = new Date(r.updated_date || r.created_date).getTime();
            return now - d < ms;
          });
        }
        // Sort by the field
        filtered = [...filtered].sort((a, b) => getNestedValue(b, lbType.field) - getNestedValue(a, lbType.field));
        setEntries(filtered.slice(0, 50));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [type, period]);

  const myEmail = progress?.user_email;

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex gap-1.5 flex-wrap">
        {LEADERBOARD_TYPES.map(t => (
          <button key={t.id} onClick={() => setType(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${type === t.id ? 'text-white' : 'text-white/40'}`}
            style={type === t.id ? { background: 'rgba(168,85,247,0.15)' } : { background: 'rgba(255,255,255,0.03)' }}>
            <span>{t.icon}</span>{t.name}
          </button>
        ))}
      </div>

      {/* Period selector */}
      <div className="flex gap-1.5">
        {[
          { id: 'week', label: 'Semaine' },
          { id: 'month', label: 'Mois' },
          { id: 'year', label: 'Année' },
          { id: 'all', label: 'Tout' },
        ].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${period === p.id ? 'text-white' : 'text-white/40'}`}
            style={period === p.id ? { background: 'rgba(59,130,246,0.15)' } : { background: 'rgba(255,255,255,0.03)' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-1.5">
        {loading && <p className="text-xs text-white/30 text-center py-8">Chargement...</p>}
        {!loading && entries.length === 0 && <p className="text-xs text-white/30 text-center py-8">Aucune donnée</p>}
        {entries.map((entry, i) => {
          const isMe = entry.user_email === myEmail;
          const lbType = LEADERBOARD_TYPES.find(t => t.id === type);
          const value = getNestedValue(entry, lbType.field);
          const rank = getRank(entry.level || 1);
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;

          return (
            <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{
                background: isMe ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isMe ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.04)'}`,
              }}>
              <div className="w-8 text-center shrink-0">
                {medal ? <span className="text-lg">{medal}</span> : <span className="text-xs font-bold text-white/40">{i + 1}</span>}
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ background: `${rank.color}20`, border: `1px solid ${rank.color}30`, color: rank.color }}>
                {rank.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-bold truncate ${isMe ? 'text-white' : 'text-white/70'}`}>
                  {entry.user_email?.split('@')[0] || 'Anonyme'} {isMe && '(Vous)'}
                </div>
                <div className="text-[9px] text-white/30">Niv. {entry.level || 1} · {rank.name}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-black" style={{ color: '#fbbf24' }}>{Number(value).toLocaleString()}</div>
                <div className="text-[8px] text-white/30 uppercase">{lbType.id === 'level' ? 'niveau' : lbType.id === 'coins' ? 'pièces' : 'pts'}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}