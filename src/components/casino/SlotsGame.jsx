import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import WinEffect from "./WinEffect";
import CasinoWinEffect from "./CasinoWinEffect";
import CasinoToken from "./CasinoToken";
import { casinoPlaceBet } from "@/hooks/useCasinoJackpot";
import { SLOT_THEMES, DEFAULT_THEME, pickRandom, formatBet } from "./slotThemes";
import SlotReelGrid from "./SlotReelGrid";
import SlotControlBar from "./SlotControlBar";
import SlotSidePanels from "./SlotSidePanels";

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
      if (col < winCount && row === winRow) {
        reel.push(winSym);
      } else {
        reel.push(pickRandom(symbols));
      }
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
  let grid;
  let attempts = 0;
  do {
    grid = generateRandomGrid(symbols);
    attempts++;
  } while (hasThreeOfAKind(grid) && attempts < 20);
  return grid;
}

function computeWinningCells(winRow, winCount) {
  const cells = [];
  for (let col = 0; col < 5; col++) {
    const reel = [];
    for (let row = 0; row < 3; row++) {
      reel.push(col < winCount && row === winRow);
    }
    cells.push(reel);
  }
  return cells;
}

// ─── Main component ───
export default function SlotsGame({ balance, setBalance, accentColor, themeId, onWin }) {
  const theme = SLOT_THEMES[themeId] || SLOT_THEMES[DEFAULT_THEME];
  const SYMBOLS = theme.symbols;

  const [spinning, setSpinning] = useState(false);
  const [autoSpinning, setAutoSpinning] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const autoRef = useRef(null);
  const balanceRef = useRef(balance);
  const autoSpinningRef = useRef(false);

  const [finalGrid, setFinalGrid] = useState(() => generateRandomGrid(SYMBOLS));
  const [result, setResult] = useState(null);
  const [bet, setBet] = useState(500);
  const [lastWin, setLastWin] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [winData, setWinData] = useState(null);
  const [winningCells, setWinningCells] = useState(null);

  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { autoSpinningRef.current = autoSpinning; }, [autoSpinning]);

  // Regenerate grid when theme changes
  useEffect(() => {
    setFinalGrid(generateRandomGrid(SYMBOLS));
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
    if (bet > currentBalance || bet <= 0) { stopAutoSpin(); return; }

    setSpinning(true);
    setResult(null);
    setWinningCells(null);
    setBalance(b => b - bet);

    let serverResult;
    try {
      serverResult = await casinoPlaceBet("slots", bet);
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

    // Generate grid based on server result
    let grid;
    let winCells = null;
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

    // Stop reels after 1.5s
    setTimeout(() => setSpinning(false), 1500);

    // Show result after 2.5s (all reels have stopped)
    setTimeout(() => {
      setBalance(serverResult.newBalance);
      balanceRef.current = serverResult.newBalance;
      setLastWin(winAmount);
      setWinningCells(winCells);

      const netGain = winAmount - bet;
      setResult({ gain: netGain, mult, win: winAmount > 0, jackpot: jpHit });

      if (winAmount > 0) {
        setWinData({ amount: winAmount, multiplier: mult, isJackpot: jpHit });
        setShowWin(true);
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

  return (
    <div className="space-y-2 select-none">
      <CasinoWinEffect
        show={showWin}
        amount={winData?.amount}
        multiplier={winData?.multiplier}
        isJackpot={winData?.isJackpot}
        onDone={() => setShowWin(false)}
      />
      <WinEffect
        show={showWin}
        amount={winData?.amount}
        multiplier={winData?.multiplier}
        isJackpot={winData?.isJackpot}
        onDone={() => setShowWin(false)}
      />

      {/* Main game area: side panels + reel grid */}
      <div className="flex items-stretch gap-2 justify-center">
        <SlotSidePanels side="left" theme={theme} />
        <SlotReelGrid
          spinning={spinning}
          finalGrid={finalGrid}
          showResult={result?.win && !spinning}
          theme={theme}
          winningCells={winningCells}
        />
        <SlotSidePanels side="right" theme={theme} />
      </div>

      {/* Control bar */}
      <SlotControlBar
        balance={balance}
        bet={bet}
        lastWin={lastWin}
        spinning={spinning}
        autoSpinning={autoSpinning}
        autoCount={autoCount}
        onSpin={spin}
        onToggleAuto={toggleAutoSpin}
        onBetChange={setBet}
        theme={theme}
      />
    </div>
  );
}