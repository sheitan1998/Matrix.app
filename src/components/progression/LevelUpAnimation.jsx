import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRank, PRESTIGE_TIERS } from '@/lib/progressionData';

function playLevelUpSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.4);
    });
  } catch (e) {}
}

export default function LevelUpAnimation({ data, onClose }) {
  const rank = getRank(data.level);
  const particles = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({
      id: i,
      angle: (i / 40) * Math.PI * 2 + Math.random() * 0.3,
      distance: 120 + Math.random() * 280,
      size: 3 + Math.random() * 8,
      color: ['#a855f7', '#22c55e', '#3b82f6', '#fbbf24', '#e879f9'][i % 5],
      delay: Math.random() * 0.4,
    })),
    []
  );

  useEffect(() => {
    playLevelUpSound();
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
      >
        {/* Halo glow */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)' }}
          animate={{ scale: [0.8, 1.2, 1], opacity: [0, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Particles */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{ width: p.size, height: p.size, background: p.color, left: '50%', top: '50%', boxShadow: `0 0 10px ${p.color}` }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x: Math.cos(p.angle) * p.distance, y: Math.sin(p.angle) * p.distance, opacity: 0, scale: [0, 1.5, 0] }}
            transition={{ duration: 1.8, delay: p.delay, ease: 'easeOut' }}
          />
        ))}

        {/* Central content */}
        <motion.div
          className="relative z-10 text-center px-8"
          initial={{ scale: 0, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <motion.div
            className="text-5xl mb-2"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: 2 }}
          >🎉</motion.div>

          <motion.h2
            className="text-2xl font-black tracking-wider mb-1"
            style={{ color: '#a855f7', textShadow: '0 0 20px rgba(168,85,247,0.8)' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >NIVEAU SUPÉRIEUR !</motion.h2>

          <motion.div
            className="text-7xl font-black my-3"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #3b82f6, #22c55e)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.6))',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >{data.level}</motion.div>

          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
            style={{ background: `${rank.color}20`, border: `1px solid ${rank.color}40` }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-lg">{rank.icon}</span>
            <span className="text-sm font-bold" style={{ color: rank.color }}>{rank.name}</span>
          </motion.div>

          {data.prestige > 0 && (
            <motion.div className="mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <span className="text-sm font-bold" style={{ color: '#fbbf24' }}>
                {PRESTIGE_TIERS.find(t => t.tier === data.prestige)?.icon} Prestige {['','I','II','III','IV','V','VI','VII','VIII','IX','X'][data.prestige]}
              </span>
            </motion.div>
          )}

          {data.rewards?.length > 0 && (
            <motion.div
              className="mt-2 space-y-1"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs text-white/40 uppercase tracking-wider">Récompense débloquée</p>
              {data.rewards.map((r, i) => (
                <div key={i} className="flex items-center gap-2 justify-center">
                  <span className="text-xl">{r.icon}</span>
                  <span className="text-sm font-semibold text-white">{r.name}</span>
                </div>
              ))}
            </motion.div>
          )}

          <motion.p
            className="text-[10px] text-white/30 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >Cliquez pour fermer</motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}