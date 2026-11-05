import React from 'react';
import { Minus, Plus, RotateCw } from 'lucide-react';
import { formatCoins } from '@/lib/rouletteTable';

const QUICK_CHIPS = [50, 100, 250, 500];

export default function RouletteControls({
  chip,
  onChangeChip,
  onSpin,
  spinning,
  canSpin,
  labels,
  language,
}) {
  const adjust = (delta) => onChangeChip(Math.max(10, (Number(chip) || 0) + delta));

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d0813]/85 p-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{labels.bet}</p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center overflow-hidden rounded-xl border border-purple-500/30 bg-black/40">
          <button
            type="button"
            onClick={() => adjust(-50)}
            disabled={spinning}
            aria-label="Diminuer la mise"
            className="flex h-11 w-11 items-center justify-center text-white/70 transition hover:bg-white/5 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="flex min-w-[120px] items-center justify-center gap-2 px-3">
            <span className="text-base">🪙</span>
            <input
              type="number"
              min={10}
              step={10}
              value={chip}
              disabled={spinning}
              onChange={(event) => onChangeChip(Math.max(0, Number(event.target.value) || 0))}
              className="w-full bg-transparent text-center font-mono text-lg font-black text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              aria-label={labels.bet}
            />
          </div>
          <button
            type="button"
            onClick={() => adjust(50)}
            disabled={spinning}
            aria-label="Augmenter la mise"
            className="flex h-11 w-11 items-center justify-center text-white/70 transition hover:bg-white/5 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_CHIPS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onChangeChip(value)}
              disabled={spinning}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition disabled:opacity-40 ${
                Number(chip) === value
                  ? 'border-amber-300/70 bg-amber-400/15 text-amber-200'
                  : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white'
              }`}
            >
              {formatCoins(value, language)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onSpin}
          disabled={spinning || !canSpin}
          className="ml-auto flex h-12 min-w-[190px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-black uppercase tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #6d28d9 55%, #4c1d95)',
            boxShadow: '0 0 22px rgba(168,85,247,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <RotateCw className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
          {spinning ? labels.spinning : labels.spin}
        </button>
      </div>
    </section>
  );
}