import React, { useState, useEffect, useRef } from "react";
import { pickRandom } from "./slotThemes";

function SymbolCell({ sym, isWinning }) {
  return (
    <div
      className="flex items-center justify-center transition-all duration-300 w-full h-full"
      style={{
        filter: isWinning ? `drop-shadow(0 0 6px ${sym.glow}) drop-shadow(0 0 12px ${sym.glow})` : "none",
        transform: isWinning ? "scale(1.08)" : "scale(1)",
      }}
    >
      {sym.isText ? (
        <span
          className="font-black leading-none"
          style={{
            fontSize: sym.s.length > 3 ? "12px" : sym.s.length > 1 ? "16px" : "20px",
            color: sym.color,
            textShadow: isWinning
              ? `0 0 6px ${sym.glow}, 0 0 12px ${sym.glow}`
              : `0 0 3px ${sym.glow}`,
            fontFamily: "'Arial Black', sans-serif",
          }}
        >
          {sym.s}
        </span>
      ) : (
        <span style={{ fontSize: "24px" }}>{sym.s}</span>
      )}
    </div>
  );
}

function ReelColumn({ spinning, finalSymbols, stopDelay, showResult, symbols, theme, columnIndex, winningCells }) {
  const [displaySyms, setDisplaySyms] = useState(finalSymbols);
  const [stopped, setStopped] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (spinning) {
      setStopped(false);
      intervalRef.current = setInterval(() => {
        setDisplaySyms([pickRandom(symbols), pickRandom(symbols), pickRandom(symbols)]);
      }, 70);
    } else {
      clearInterval(intervalRef.current);
      timeoutRef.current = setTimeout(() => {
        setDisplaySyms(finalSymbols);
        setStopped(true);
      }, stopDelay);
    }
    return () => { clearInterval(intervalRef.current); clearTimeout(timeoutRef.current); };
  }, [spinning, finalSymbols, stopDelay]);

  return (
    <div className="flex flex-col overflow-hidden" style={{ background: theme.reelBg }}>
      {displaySyms.map((sym, rowIdx) => {
        const isWinning = stopped && showResult && winningCells?.[columnIndex]?.[rowIdx];
        return (
          <div
            key={rowIdx}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
            style={{
              borderBottom: rowIdx < 2 ? `1px solid ${theme.frameAccent}10` : "none",
              background: isWinning ? `${sym.glow}10` : "transparent",
            }}
          >
            <SymbolCell sym={sym} isWinning={isWinning} />
          </div>
        );
      })}
    </div>
  );
}

function LineMarker({ count, color }) {
  return (
    <div className="flex items-center justify-center px-0.5" style={{ minWidth: "16px" }}>
      <span
        className="text-[8px] font-black whitespace-nowrap"
        style={{ color, writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        {count} LIGNES
      </span>
    </div>
  );
}

export default function SlotReelGrid({ spinning, finalGrid, showResult, theme, winningCells }) {
  const SYMBOLS = theme.symbols;
  const [lightPhase, setLightPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLightPhase(p => (p + 1) % 10), 180);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: theme.frameBg,
        border: `2px solid ${theme.frameBorderColor}`,
        boxShadow: theme.frameShadow,
      }}
    >
      {/* Column decorations (Greek theme) */}
      {theme.hasColumns && (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
            style={{ background: `linear-gradient(180deg, ${theme.frameAccent}, ${theme.frameAccent}80, ${theme.frameAccent})` }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1.5 rounded-r-2xl"
            style={{ background: `linear-gradient(180deg, ${theme.frameAccent}, ${theme.frameAccent}80, ${theme.frameAccent})` }}
          />
        </>
      )}

      {/* Top neon lights */}
      <div className="flex justify-center gap-0.5 px-2 py-1.5 relative z-10">
        {Array.from({ length: 15 }).map((_, i) => {
          const active = i % 5 === lightPhase % 5;
          return (
            <div
              key={i}
              className="rounded-full transition-all duration-100"
              style={{
                width: "6px",
                height: "6px",
                background: active ? theme.frameAccent : "rgba(255,255,255,0.08)",
                boxShadow: active ? `0 0 6px ${theme.frameAccent}, 0 0 12px ${theme.frameAccent}` : "none",
              }}
            />
          );
        })}
      </div>

      {/* Reel area with line markers */}
      <div className="flex items-stretch px-2 pb-1">
        <LineMarker count={theme.paylines} color={theme.paylineColor} />
        <div
          className="flex gap-0.5 rounded-xl overflow-hidden flex-1"
          style={{
            background: theme.reelBg,
            border: `1px solid ${theme.reelBorderColor}`,
            boxShadow: theme.reelShadow,
          }}
        >
          {finalGrid.map((reel, colIdx) => (
            <ReelColumn
              key={colIdx}
              spinning={spinning}
              finalSymbols={reel}
              stopDelay={colIdx * 200}
              showResult={showResult}
              symbols={SYMBOLS}
              theme={theme}
              columnIndex={colIdx}
              winningCells={winningCells}
            />
          ))}
        </div>
        <LineMarker count={theme.paylines} color={theme.paylineColor} />
      </div>

      {/* Message bar */}
      <div
        className="text-center py-1.5 px-3"
        style={{ background: theme.messageBg, borderTop: `1px solid ${theme.frameAccent}20` }}
      >
        <p className="text-[10px] font-medium" style={{ color: theme.messageColor }}>
          Partie sur {theme.paylines} lignes. Bonne chance !
        </p>
      </div>

      {/* Bottom neon lights */}
      <div className="flex justify-center gap-0.5 px-2 py-1.5">
        {Array.from({ length: 15 }).map((_, i) => {
          const active = i % 5 === (lightPhase + 3) % 5;
          return (
            <div
              key={i}
              className="rounded-full transition-all duration-100"
              style={{
                width: "6px",
                height: "6px",
                background: active ? theme.frameAccent : "rgba(255,255,255,0.07)",
                boxShadow: active ? `0 0 6px ${theme.frameAccent}, 0 0 12px ${theme.frameAccent}` : "none",
              }}
            />
          );
        })}
      </div>

      {/* Golden dots (adventure/cyber themes) */}
      {theme.hasDots && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`dot-t-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: theme.frameAccent,
                boxShadow: `0 0 4px ${theme.frameAccent}`,
                top: "3px",
                left: `${15 + i * 14}%`,
              }}
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`dot-b-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: theme.frameAccent,
                boxShadow: `0 0 4px ${theme.frameAccent}`,
                bottom: "3px",
                left: `${15 + i * 14}%`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}