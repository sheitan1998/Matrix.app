import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import { pickRandom } from "./slotThemes";
import WinLineOverlay from "./WinLineOverlay";
import { normalizeAppAssetUrl } from "@/lib/urlUtils";

export const DEFAULT_GRID_CONFIG = {
  grid_width: 70,
  grid_height: 45,
  grid_gap: 4,
  grid_pos_x: 50,
  grid_pos_y: 50,
  symbol_size: 28,
  bg_image: "",
  control_pos_x: 50,
  control_pos_y: 0,
  control_scale: 100,
  button_gap: 8,
  spin_pos_x: 85,
  spin_pos_y: 92,
  spin_scale: 100,
};

const SymbolCell = memo(function SymbolCell({ sym, isWinning, symbolSize }) {
  const cellStyle = useMemo(() => ({
    filter: isWinning ? `drop-shadow(0 0 8px ${sym.glow}) drop-shadow(0 0 16px ${sym.glow})` : "none",
    transform: isWinning ? "scale(1.12)" : "scale(1)",
  }), [isWinning, sym.glow]);

  const imgStyle = useMemo(() => ({
    maxWidth: `${symbolSize * 1.5}px`,
    maxHeight: `${symbolSize * 1.5}px`,
  }), [symbolSize]);

  const textStyle = useMemo(() => ({
    fontSize: `${symbolSize}px`,
    color: sym.color,
    textShadow: isWinning
      ? `0 0 8px ${sym.glow}, 0 0 16px ${sym.glow}`
      : `0 0 3px ${sym.glow}`,
    fontFamily: "'Arial Black', sans-serif",
  }), [symbolSize, sym.color, sym.glow, isWinning]);

  return (
    <div
      className="flex items-center justify-center transition-all duration-300 w-full h-full"
      style={cellStyle}
    >
      {sym.image_url ? (
        <img
          src={normalizeAppAssetUrl(sym.image_url)}
          alt={sym.label || sym.s}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="object-contain"
          style={imgStyle}
        />
      ) : sym.isText ? (
        <span className="font-black leading-none" style={textStyle}>
          {sym.s}
        </span>
      ) : (
        <span style={{ fontSize: `${symbolSize}px` }}>{sym.s}</span>
      )}
    </div>
  );
});

const ReelColumn = memo(function ReelColumn({ spinning, finalSymbols, stopDelay, showResult, symbols, theme, columnIndex, winningCells, symbolSize, gridGap }) {
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

  const colStyle = useMemo(() => ({ gap: `${gridGap}px` }), [gridGap]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={colStyle}>
      {displaySyms.map((sym, rowIdx) => {
        const isWinning = stopped && showResult && winningCells?.[columnIndex]?.[rowIdx];
        return (
          <div
            key={rowIdx}
            className="flex items-center justify-center flex-1 rounded-lg transition-all duration-300"
            style={{
              background: isWinning ? `${sym.glow}15` : "transparent",
              border: isWinning ? `1px solid ${sym.glow}50` : "1px solid transparent",
            }}
          >
            <SymbolCell sym={sym} isWinning={isWinning} symbolSize={symbolSize} />
          </div>
        );
      })}
    </div>
  );
});

function SlotReelGrid({ spinning, finalGrid, showResult, theme, winningCells, gridConfig, symbols }) {
  const SYMBOLS = useMemo(() => symbols || theme.symbols, [symbols, theme.symbols]);
  const config = useMemo(() => gridConfig || DEFAULT_GRID_CONFIG, [gridConfig]);

  const gridStyle = useMemo(() => ({
    left: `${config.grid_pos_x}%`,
    top: `${config.grid_pos_y}%`,
    transform: "translate(-50%, -50%)",
    width: `${config.grid_width}%`,
    height: `${config.grid_height}%`,
  }), [config.grid_pos_x, config.grid_pos_y, config.grid_width, config.grid_height]);

  return (
    <div className="absolute inset-0">
      {/* Grille positionnee selon la config admin */}
      <div
        className="absolute"
        style={gridStyle}
      >
        <div className="relative w-full h-full">
          {/* Rouleaux */}
          <div className="flex w-full h-full" style={{ gap: `${config.grid_gap}px` }}>
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
                symbolSize={config.symbol_size}
                gridGap={config.grid_gap}
              />
            ))}
          </div>

          {/* Tracage lumineux des gains */}
          <WinLineOverlay
            winningCells={winningCells}
            showResult={showResult}
            spinning={spinning}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(SlotReelGrid);