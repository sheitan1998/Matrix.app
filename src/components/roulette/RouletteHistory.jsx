import React from 'react';
import { BarChart3 } from 'lucide-react';
import { rouletteColor } from '@/lib/rouletteTable';

const TONES = {
  red: { background: 'linear-gradient(160deg, #c53030, #7f1d1d)', borderColor: '#ef4444' },
  black: { background: 'linear-gradient(160deg, #26262b, #0b0b0e)', borderColor: '#3f3f46' },
  green: { background: 'linear-gradient(160deg, #1b8a36, #0d5c23)', borderColor: '#22c55e' },
};

export default function RouletteHistory({ history, labels }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d0813]/85 p-4">
      <div className="mb-3 flex items-center gap-2 text-white/60">
        <BarChart3 className="h-3.5 w-3.5" />
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]">{labels.history}</p>
      </div>
      {history.length === 0 ? (
        <p className="text-xs text-white/30">—</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {history.map((item, index) => (
            <span
              key={`${item.number}-${item.at}-${index}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-black text-white"
              style={TONES[rouletteColor(item.number)]}
              title={item.gain > 0 ? `+${item.gain}` : '0'}
            >
              {item.number}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}