import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Crown, Zap } from 'lucide-react';
import { useProgression } from '@/context/ProgressionContext';
import XPBar from '@/components/progression/XPBar';
import ProgressionOverview from '@/components/progression/ProgressionOverview';
import AchievementsList from '@/components/progression/AchievementsList';
import MissionsBoard from '@/components/progression/MissionsBoard';
import ProgressionLeaderboards from '@/components/progression/ProgressionLeaderboards';
import XPBoosterShop from '@/components/progression/XPBoosterShop';
import TrixWalletBar from '@/components/TrixWalletBar';

const TABS = [
  { id: 'overview',     label: "Vue d'ensemble" },
  { id: 'achievements', label: 'Succès' },
  { id: 'missions',     label: 'Missions' },
  { id: 'xp-shop',      label: 'Boutique XP' },
  { id: 'leaderboards', label: 'Classements' },
];

export default function Progression() {
  const nav = useNavigate();
  const progression = useProgression();
  const [tab, setTab] = useState('overview');

  if (!progression || !progression.progress) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0c' }}>
        <div className="w-9 h-9 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const { progress, prestigeInfo, prestige } = progression;

  const canPrestige = progress.level >= 100 && (!progress.prestige || progress.prestige < 10);

  return (
    <div className="min-h-screen relative" style={{ background: '#0a0a0c' }}>
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => nav(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: '#ff9f1c' }} />
              Progression
              {prestigeInfo && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${prestigeInfo.color}20`, color: prestigeInfo.color }}>{prestigeInfo.name}</span>}
            </h1>
          </div>
          <TrixWalletBar />
        </div>

        {/* Level / XP panel */}
        <div className="mb-4">
          <XPBar />
        </div>

        {/* Prestige button */}
        {canPrestige && (
          <button onClick={prestige} className="w-full mb-4 p-3 rounded-xl flex items-center gap-3 transition hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(168,85,247,0.3)' }}>
            <Crown className="w-5 h-5" style={{ color: '#ff9f1c' }} />
            <div className="flex-1 text-left">
              <div className="text-sm font-bold text-white">Passer en Prestige {(progress.prestige || 0) + 1}</div>
              <div className="text-[10px] text-white/40">Réinitialise votre niveau pour des récompenses exclusives</div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(255,159,28,0.15)', color: '#ff9f1c' }}>Activer</span>
          </button>
        )}

        {/* Tab navigation — underline style */}
        <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar border-b border-white/5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative px-3 py-2.5 text-xs font-bold whitespace-nowrap transition ${tab === t.id ? 'text-white' : 'text-white/40 hover:text-white/60'}`}>
              {t.label}
              {tab === t.id && <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: '#6c47ff' }} />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}>
            {tab === 'overview' && <ProgressionOverview />}
            {tab === 'achievements' && <AchievementsList />}
            {tab === 'missions' && <MissionsBoard />}
            {tab === 'xp-shop' && <XPBoosterShop />}
            {tab === 'leaderboards' && <ProgressionLeaderboards />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}