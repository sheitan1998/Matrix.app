import React from 'react';
import { Trophy } from 'lucide-react';
import CasinoToken from '@/components/casino/CasinoToken';
import { formatCoins } from '@/lib/rouletteTable';

export default function RouletteWallet({ balance, lastGain, labels, language }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <div
        className="rounded-2xl border px-3 py-2.5"
        style={{ borderColor: 'rgba(230,192,105,0.42)', background: 'linear-gradient(150deg, rgba(230,192,105,0.14), rgba(20,10,8,0.7))' }}
      >
        <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/70">
          <CasinoToken size={14} />
          {labels.balance}
        </p>
        <p className="mt-1 flex items-baseline gap-1 font-mono text-base font-black text-amber-100 sm:text-lg">
          {formatCoins(balance, language)}
          <span className="text-[9px] font-bold tracking-widest text-amber-300/60">jetons</span>
        </p>
      </div>

      <div
        className="rounded-2xl border px-3 py-2.5"
        style={{ borderColor: 'rgba(168,85,247,0.35)', background: 'linear-gradient(150deg, rgba(168,85,247,0.16), rgba(14,8,20,0.7))' }}
      >
        <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-purple-200/70">
          <Trophy className="h-3 w-3" />
          {labels.lastWin}
        </p>
        <p className="mt-1 flex items-baseline gap-1 font-mono text-base font-black text-white sm:text-lg">
          {lastGain > 0 ? `+${formatCoins(lastGain, language)}` : '—'}
          {lastGain > 0 && <span className="text-[9px] font-bold tracking-widest text-purple-300/60">jetons</span>}
        </p>
      </div>
    </div>
  );
}