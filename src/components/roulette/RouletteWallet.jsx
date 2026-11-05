import React from 'react';
import { Trophy } from 'lucide-react';
import CasinoToken from '@/components/casino/CasinoToken';
import { formatCoins } from '@/lib/rouletteTable';

export default function RouletteWallet({ balance, lastGain, labels, language }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-4 px-2">
      <div>
        <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/60">
          <CasinoToken size={14} />
          {labels.balance}
        </p>
        <p className="mt-1 flex items-baseline gap-1 font-mono text-base font-black text-amber-100 sm:text-lg">
          {formatCoins(balance, language)}
          <span className="text-[9px] font-bold tracking-widest text-amber-300/50">jetons</span>
        </p>
      </div>

      <div className="text-right">
        <p className="flex items-center justify-end gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-purple-200/60">
          <Trophy className="h-3 w-3" />
          {labels.lastWin}
        </p>
        <p className="mt-1 flex items-baseline justify-end gap-1 font-mono text-base font-black text-white sm:text-lg">
          {lastGain > 0 ? `+${formatCoins(lastGain, language)}` : '—'}
          {lastGain > 0 && <span className="text-[9px] font-bold tracking-widest text-purple-300/50">jetons</span>}
        </p>
      </div>
    </div>
  );
}