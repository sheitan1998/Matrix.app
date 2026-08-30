import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import CasinoToken from "./CasinoToken";
import { casinoPlaceBet } from "@/hooks/useCasinoJackpot";
import { base44 } from "@/api/base44Client";
import { SLOT_THEMES, DEFAULT_THEME, BET_STEPS, pickRandom, formatBet } from "./slotThemes";
import SlotReelGrid from "./SlotReelGrid";
import SlotControlBar from "./SlotControlBar";
import PaytableModal from "./PaytableModal";

// ─── Grid generation helpers ───
function generateRandomGrid(symbols) {
  const grid = [];
  for (let col = 0; col < 5; col++) {
    grid.push([pickRandom(symbols), pickRandom(symbols), pickRandom(symbols)]);
  }
  return grid;
}

function generateWinningGrid(symbols, winSym, winRow, winCount) {
  const grid = [];
  for (let col = 0; col < 5; col++) {
    const reel = [];
    for (let row = 0; row < 3; row++) {
      if (col < winCount && row === winRow) reel.push(winSym);
      else reel.push(pickRandom(symbols));
    }
    grid.push(reel);
  }
  return grid;
}

function hasThreeOfAKind(grid) {
  for (let row = 0; row < 3; row++) {
    if (grid[0][row].s === grid[1][row].s && grid[1][row].s === grid[2][row].s) return true;
  }
  return false;
}

function generateLosingGrid(symbols) {
  let grid, attempts = 0;
  do { grid = generateRandomGrid(symbols); attempts++; }
  while (hasThreeOfAKind(grid) && attempts < 20);
  return grid;
}

function computeWinningCells(winRow, winCount) {
  const cells = [];
  for (let col = 0; col < 5; col++) {
    const reel = [];
    for (let row = 0; row < 3; row++) reel.push(col < winCount && row === winRow);
    cells.push(reel);
  }
  return cells;
}

// ─── Main component ───
export default function SlotsGame({ balance, setBalance, themeId, onWin }) {
  const theme = SLOT_THEMES[themeId] || SLOT_THEMES[DEFAULT_THEME];
  const [customSymbols, setCustomSymbols] = useState(null);
  const SYMBOLS = customSymbols || theme.symbols;

  const [spinning, setSpinning] = useState(false);
  const [autoSpinning, setAutoSpinning] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const [showPaytable, setShowPaytable] = useState(false);
  const autoRef = useRef(null);
  const balanceRef = useRef(balance);
  const autoSpinningRef = useRef(false);

  const [finalGrid, setFinalGrid] = useState(() => generateRandomGrid(SYMBOLS));
  const [result, setResult] = useState(null);
  const [bet, setBet] = useState(500);
  const [lastWin, setLastWin] = useState(0);
  const [winningCells, setWinningCells] = useState(null);
  const [gridConfig, setGridConfig] = useState(null);

  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { autoSpinningRef.current = autoSpinning; }, [autoSpinning]);

  // ─── Right-click / download prevention (global on page) ───
  useEffect(() => {
    const preventContext = (e) => e.preventDefault();
    const preventDrag = (e) => e.preventDefault();
    document.addEventListener("contextmenu", preventContext);
    document.addEventListener("dragstart", preventDrag);
    return () => {
      document.removeEventListener("contextmenu", preventContext);
      document.removeEventListener("dragstart", preventDrag);
    };
  }, []);

  // Regenerate grid when theme changes
  useEffect(() => {
    setFinalGrid(generateRandomGrid(SYMBOLS));
  }, [themeId]);

  // Fetch grid config from admin (realtime sync)
  useEffect(() => {
    if (!themeId) return;
    const fetchConfig = () => {
      base44.entities.SlotThemeConfig.filter({ theme_key: themeId })
        .then(records => {
          if (records && records.length > 0) setGridConfig(records[0]);
          else setGridConfig(null);
        })
        .catch(() => setGridConfig(null));
    };
    fetchConfig();
    const unsub = base44.entities.SlotThemeConfig.subscribe(() => fetchConfig());
    return () => { if (unsub) unsub(); };
  }, [themeId]);

  // Fetch custom symbols from admin (realtime sync)
  useEffect(() => {
    if (!themeId) return;
    const fetchSymbols = () => {
      base44.entities.SlotSymbol.filter({ theme_key: themeId })
        .then(records => {
          if (records && records.length > 0) {
            const mapped = records.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(r => ({
              s: r.symbol,
              image_url: r.image_url,
              label: r.label,
              color: r.color,
              glow: r.glow,
              mult: r.mult,
              rare: r.rare,
              isWild: r.is_wild,
              isText: r.is_text,
            }));
            setCustomSymbols(mapped);
          } else {
            setCustomSymbols(null);
          }
        })
        .catch(() => setCustomSymbols(null));
    };
    fetchSymbols();
    const unsub = base44.entities.SlotSymbol.subscribe(() => fetchSymbols());
    return () => { if (unsub) unsub(); };
  }, [themeId]);

  useEffect(() => {
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, []);

  const stopAutoSpin = () => {
    setAutoSpinning(false);
    if (autoRef.current) { clearTimeout(autoRef.current); autoRef.current = null; }
  };

  const doSpin = async () => {
    const currentBalance = balanceRef.current;
    if (bet > currentBalance || bet <= 0) { stopAutoSpin(); toast.error("Solde insuffisant"); return; }

    setSpinning(true);
    setResult(null);
    setWinningCells(null);
    setBalance(b => b - bet);

    let serverResult;
    try {
      serverResult = await casinoPlaceBet("slots", bet, null, themeId);
    } catch {
      setSpinning(false);
      setBalance(b => b + bet);
      toast.error("Erreur de connexion");
      stopAutoSpin();
      return;
    }
    if (serverResult.error) {
      setSpinning(false);
      setBalance(b => b + bet);
      toast.error(serverResult.error);
      stopAutoSpin();
      return;
    }

    let grid, winCells = null;
    if (serverResult.win) {
      const winSym = SYMBOLS.find(s => s.s === serverResult.slotsSymbol) || SYMBOLS[0];
      const winRow = Math.floor(Math.random() * 3);
      const winCount = Math.min(5, 3 + Math.floor(Math.random() * 3));
      grid = generateWinningGrid(SYMBOLS, winSym, winRow, winCount);
      winCells = computeWinningCells(winRow, winCount);
    } else {
      grid = generateLosingGrid(SYMBOLS);
    }
    setFinalGrid(grid);

    const winAmount = serverResult.payout || 0;
    const jpHit = serverResult.jackpot;
    const mult = serverResult.multiplier || 0;

    setTimeout(() => setSpinning(false), 1500);

    setTimeout(() => {
      setBalance(serverResult.newBalance);
      balanceRef.current = serverResult.newBalance;
      setLastWin(winAmount);
      setWinningCells(winCells);

      const netGain = winAmount - bet;
      setResult({ gain: netGain, mult, win: winAmount > 0, jackpot: jpHit });

      if (winAmount > 0) {
        if (onWin) onWin({ amount: winAmount, multiplier: mult, isJackpot: jpHit });
      }

      if (autoSpinningRef.current && serverResult.newBalance - bet >= 0) {
        setAutoCount(c => c + 1);
        autoRef.current = setTimeout(() => doSpin(), 800);
      } else if (autoSpinningRef.current) {
        stopAutoSpin();
      }
    }, 2500);
  };

  const spin = () => { if (!autoSpinning) doSpin(); };

  const toggleAutoSpin = () => {
    if (autoSpinning) { stopAutoSpin(); return; }
    if (bet > balance) { toast.error("Solde insuffisant"); return; }
    setAutoSpinning(true);
    setAutoCount(0);
    doSpin();
  };

  const changeBet = (newBet) => {
    if (spinning || autoSpinning) return;
    setBet(Math.max(100, Math.min(1000000, newBet)));
  };

  return (
    <div className="relative select-none" style={{ minHeight: "calc(100vh - 56px)" }}>
      {/* ─── Full-page background image ─── */}
      <img
        src={gridConfig?.bg_image || theme.bgImage}
        alt=""
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.3)" }} />

      {/* ─── Content overlay ─── */}
      <div className="relative z-10 flex flex-col" style={{ minHeight: "calc(100vh - 56px)" }}>
        {/* Header bar: Credits / Theme / Bet */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: theme.controlBg, borderBottom: `1px solid ${theme.frameAccent}40`, backdropFilter: "blur(8px)" }}
        >
          {/* Credits (left) */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${theme.frameAccent}20`, border: `1px solid ${theme.frameAccent}50` }}>
              <span className="text-sm">⭐</span>
            </div>
            <div>
              <p className="text-[8px] font-bold text-white/50 uppercase tracking-wider">Crédits</p>
              <div className="flex items-center gap-1">
                <CasinoToken size={14} />
                <span className="text-sm font-mono font-black" style={{ color: theme.frameAccent }}>{formatBet(balance)}</span>
              </div>
            </div>
          </div>

          {/* Theme name (center) */}
          <div className="text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-base">{theme.emoji}</span>
              <span className="text-sm font-black tracking-wider" style={{ color: theme.frameAccent, textShadow: `0 0 10px ${theme.frameAccent}40` }}>
                {theme.name}
              </span>
            </div>
          </div>

          {/* Bet (right) */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[8px] font-bold text-white/50 uppercase tracking-wider">Mise</p>
              <div className="flex items-center gap-1 justify-end">
                <CasinoToken size={14} />
                <span className="text-sm font-mono font-black text-white">{formatBet(bet)}</span>
              </div>
            </div>
            <button
              onClick={() => setShowPaytable(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm transition hover:scale-105"
              style={{ background: `${theme.frameAccent}20`, border: `1px solid ${theme.frameAccent}50` }}
            >
              ?
            </button>
          </div>
        </div>

        {/* ─── Reel grid integrated into background ─── */}
        <div className="flex-1 relative">
          <SlotReelGrid
            spinning={spinning}
            finalGrid={finalGrid}
            showResult={result?.win && !spinning}
            theme={theme}
            winningCells={winningCells}
            gridConfig={gridConfig}
            symbols={SYMBOLS}
          />
        </div>

        {/* ─── Control buttons (individually positioned) ─── */}
        <SlotControlBar
          balance={balance}
          bet={bet}
          lastWin={lastWin}
          spinning={spinning}
          autoSpinning={autoSpinning}
          autoCount={autoCount}
          onSpin={spin}
          onToggleAuto={toggleAutoSpin}
          onBetChange={changeBet}
          onPaytable={() => setShowPaytable(true)}
          theme={theme}
          buttonStyles={gridConfig?.button_styles}
        />
      </div>

      {/* Paytable modal */}
      <PaytableModal show={showPaytable} theme={theme} onClose={() => setShowPaytable(false)} />
    </div>
  );
}