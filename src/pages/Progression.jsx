import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Crown, Shield } from 'lucide-react';
import { useProgression } from '@/context/ProgressionContext';
import XPBar from '@/components/progression/XPBar';
import ProgressionOverview from '@/components/progression/ProgressionOverview';
import BadgesGrid from '@/components/progression/BadgesGrid';
import AchievementsList from '@/components/progression/AchievementsList';
import MissionsBoard from '@/components/progression/MissionsBoard';
import ProgressionShop from '@/components/progression/ProgressionShop';
import ProgressionLeaderboards from '@/components/progression/ProgressionLeaderboards';

const TABS = [
  { id: 'overview',    label: 'Vue d\'ensemble', icon: '📊' },
  { id: 'badges',      label: 'Badges',          icon: '🎖' },
  { id: 'achievements',label: 'Succès',          icon: '🏆' },
  { id: 'missions',    label: 'Missions',        icon: '📋' },
  { id: 'shop',        label: 'Boutique',        icon: '🛒' },
  { id: 'leaderboards',label: 'Classements',     icon: '📈' },
];

export default function Progression() {
  const nav = useNavigate();
  const { progress, prestigeInfo, prestige } = useProgression();
  const [tab, setTab] = useState('overview');

  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-9 h-9 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const canPrestige = progress.level >= 100 && (!progress.prestige || progress.prestige < 10);

  return (
    <div className="min-h-screen relative" style={{ background: '#050505' }}>
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(168,85,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => nav(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span style={{ color: '#a855f7' }}>⚡</span> Progression
              {prestigeInfo && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${prestigeInfo.color}20`, color: prestigeInfo.color }}>{prestigeInfo.name}</span>}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 h-9 rounded-xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
            <Coins className="w-4 h-4" style={{ color: '#fbbf24' }} />
            <span className="text-sm font-black" style={{ color: '#fbbf24' }}>{(progress.coins || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-4">
          <XPBar />
        </div>

        {/* Prestige button */}
        {canPrestige && (
          <button onClick={prestige} className="w-full mb-4 p-3 rounded-xl flex items-center gap-3 transition hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(168,85,247,0.3)' }}>
            <Crown className="w-5 h-5" style={{ color: '#fbbf24' }} />
            <div className="flex-1 text-left">
              <div className="text-sm font-bold text-white">Passer en Prestige {(progress.prestige || 0) + 1}</div>
              <div className="text-[10px] text-white/40">Réinitialise votre niveau pour des récompenses exclusives</div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>Activer</span>
          </button>
        )}

        {/* Tab navigation */}
        <div className="flex gap-1 p-1 rounded-xl mb-4 overflow-x-auto no-scrollbar" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${tab === t.id ? 'text-white' : 'text-white/40'}`}
              style={tab === t.id ? { background: 'rgba(168,85,247,0.15)' } : {}}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}>
            {tab === 'overview' && <ProgressionOverview />}
            {tab === 'badges' && <BadgesGrid />}
            {tab === 'achievements' && <AchievementsList />}
            {tab === 'missions' && <MissionsBoard />}
            {tab === 'shop' && <ProgressionShop />}
            {tab === 'leaderboards' && <ProgressionLeaderboards />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}