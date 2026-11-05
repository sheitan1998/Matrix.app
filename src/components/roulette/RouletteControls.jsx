import React from 'react';
import { Minus, Plus, RotateCw } from 'lucide-react';
import { formatCoins } from '@/lib/rouletteTable';

const QUICK_CHIPS = [50, 100, 250, 500];

function ChipButton({ value, active, disabled, onClick, language }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[11px] font-black transition disabled:opacity-40 ${
        active ? 'scale-105 ring-2 ring-amber-200 ring-offset-2 ring-offset-[#0d0813]' : 'hover:scale-105'
      }`}
      style={{
        background: 'radial-gradient(circle at 32% 26%, #ffe9a8, #d9a63c 58%, #8a5b12)',
        borderColor: '#f7dfa0',
        color: '#2a1607',
        boxShadow: active ? '0 0 18px rgba(245,196,81,0.55)' : '0 6px 14px rgba(0,0,0,0.45)',
      }}
      title={`${formatCoins(value, language)} TRIX`}
    >
      <span className="pointer-events-none absolute inset-1 rounded-full border border-dashed border-[#7a4d0c]/50" />
      {formatCoins(value, language)}
    </button>
  );
}

export default function RouletteControls({
  chip,
  onChangeChip,
  onSpin,
  spinning,
  canSpin,
  totalStake = 0,
  labels,
  language,
}) {
  const adjust = (delta) => onChangeChip(Math.max(10, (Number(chip) || 0) + delta));

  return (
    <section
      className="flex flex-col gap-4 rounded-3xl border p-4 lg:flex-row lg:items-center"
      style={{
        borderColor: 'rgba(139,92,246,0.32)',
        background: 'linear-gradient(150deg, rgba(24,12,32,0.94), rgba(10,5,16,0.97))',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 50px rgba(0,0,0,0.55)',
      }}
    >
      <div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{labels.bet}</p>

        <div className="flex flex-wrap items-center gap-2.5">
          {QUICK_CHIPS.map((value) => (
            <ChipButton
              key={value}
              value={value}
              language={language}
              active={Number(chip) === value}
              disabled={spinning}
              onClick={() => onChangeChip(value)}
            />
          ))}

          <div className="ml-1 flex items-center overflow-hidden rounded-xl border border-purple-500/30 bg-black/40">
            <button
              type="button"
              onClick={() => adjust(-50)}
              disabled={spinning}
              aria-label="Diminuer la mise"
              className="flex h-11 w-10 items-center justify-center text-white/70 transition hover:bg-white/5 disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={10}
              step={10}
              value={chip}
              disabled={spinning}
              onChange={(event) => onChangeChip(Math.max(0, Number(event.target.value) || 0))}
              className="w-[86px] bg-transparent text-center font-mono text-base font-black text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              aria-label={labels.bet}
            />
            <button
              type="button"
              onClick={() => adjust(50)}
              disabled={spinning}
              aria-label="Augmenter la mise"
              className="flex h-11 w-10 items-center justify-center text-white/70 transition hover:bg-white/5 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:ml-auto">
        <div className="rounded-xl border border-amber-300/25 bg-amber-400/[0.07] px-4 py-2">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/60">{labels.total}</p>
          <p className="font-mono text-sm font-black text-amber-100">
            {formatCoins(totalStake, language)} <span className="text-[9px] tracking-widest text-amber-300/60">TRIX</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onSpin}
          disabled={spinning || !canSpin}
          className="flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-black uppercase tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #6d28d9 55%, #4c1d95)',
            border: '1px solid rgba(245,196,81,0.45)',
            boxShadow: '0 0 22px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <RotateCw className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
          {spinning ? labels.spinning : labels.spin}
        </button>
      </div>
    </section>
  );
}