import React from 'react';
import { cn } from '@/lib/utils';
import { NUMBER_COLUMNS, cellTone, formatCoins, rouletteColor } from '@/lib/rouletteTable';

function BetCell({ betKey, label, bets, onBet, disabled, className, style, amountLabel }) {
  const amount = bets[betKey] || 0;
  return (
    <button
      type="button"
      onClick={() => onBet(betKey)}
      disabled={disabled}
      className={cn(
        'relative flex min-h-10 items-center justify-center rounded-md border text-xs font-bold text-white transition',
        'hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300',
        disabled && 'cursor-not-allowed opacity-60',
        amount > 0 && 'ring-2 ring-amber-300 ring-offset-1 ring-offset-[#0b0710]',
        className,
      )}
      style={style}
    >
      <span className={amountLabel ? 'text-[10px] leading-tight' : ''}>{label}</span>
      {amount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 rounded-full border border-amber-200/70 bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-black shadow">
          {amount >= 1000 ? `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k` : amount}
        </span>
      )}
    </button>
  );
}

export default function RouletteBetGrid({ bets, onBet, onClear, disabled, labels, language }) {
  const outside = [
    { key: 'low', label: labels.low },
    { key: 'even', label: labels.even },
    { key: 'red', label: '◆', style: { background: 'linear-gradient(160deg, #c53030, #7f1d1d)', borderColor: '#ef4444' }, aria: labels.red },
    { key: 'black', label: '◆', style: { background: 'linear-gradient(160deg, #26262b, #0b0b0e)', borderColor: '#3f3f46' }, aria: labels.black },
    { key: 'odd', label: labels.odd },
    { key: 'high', label: labels.high },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d0813]/80 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {/* Zero column */}
          <BetCell
            betKey="n:0"
            label="0"
            bets={bets}
            onBet={onBet}
            disabled={disabled}
            className="w-10 shrink-0 sm:w-12"
            style={cellTone(0)}
          />

          {/* Numbers */}
          <div className="grid flex-1 grid-cols-12 gap-1">
            {NUMBER_COLUMNS.map((column, columnIndex) =>
              column.map((number, rowIndex) => (
                <BetCell
                  key={number}
                  betKey={`n:${number}`}
                  label={String(number)}
                  bets={bets}
                  onBet={onBet}
                  disabled={disabled}
                  style={{
                    ...cellTone(number),
                    gridColumn: columnIndex + 1,
                    gridRow: rowIndex + 1,
                  }}
                  className="!min-h-9 !rounded-[5px] !text-[11px]"
                />
              )),
            )}
          </div>

          {/* 2:1 columns */}
          <div className="grid w-9 shrink-0 grid-rows-3 gap-1 sm:w-11">
            {['col3', 'col2', 'col1'].map((key) => (
              <BetCell
                key={key}
                betKey={key}
                label="2:1"
                bets={bets}
                onBet={onBet}
                disabled={disabled}
                className="!min-h-9 !text-[10px]"
                style={{ background: 'linear-gradient(160deg, #1d1826, #100b18)', borderColor: 'rgba(230,192,105,0.35)' }}
              />
            ))}
          </div>
        </div>

        {/* Dozens */}
        <div className="ml-12 grid grid-cols-3 gap-1 sm:ml-14">
          {['dozen1', 'dozen2', 'dozen3'].map((key) => (
            <BetCell
              key={key}
              betKey={key}
              label={labels[key]}
              amountLabel
              bets={bets}
              onBet={onBet}
              disabled={disabled}
              className="!min-h-9 border-white/15"
              style={{ background: 'linear-gradient(160deg, #1d1826, #100b18)' }}
            />
          ))}
        </div>

        {/* Even money bets */}
        <div className="ml-12 grid grid-cols-6 gap-1 sm:ml-14">
          {outside.map((bet) => (
            <BetCell
              key={bet.key}
              betKey={bet.key}
              label={bet.label}
              aria-label={bet.aria}
              amountLabel
              bets={bets}
              onBet={onBet}
              disabled={disabled}
              className="!min-h-9 border-white/15"
              style={bet.style || { background: 'linear-gradient(160deg, #1d1826, #100b18)' }}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
        <p className="text-[11px] text-white/45">
          {labels.total} :{' '}
          <span className="font-bold text-amber-300">
            {formatCoins(Object.values(bets).reduce((sum, value) => sum + value, 0), language)} TRIX
          </span>
        </p>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled || Object.keys(bets).length === 0}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/70 transition hover:border-white/25 hover:text-white disabled:opacity-30"
        >
          {labels.clear}
        </button>
      </div>
    </section>
  );
}