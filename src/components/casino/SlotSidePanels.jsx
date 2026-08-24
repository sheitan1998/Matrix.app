import React, { useState, useEffect } from "react";
import { ChevronsLeft, Plus, Clock } from "lucide-react";

const LEFT_PLAYERS = [
{ name: "Cute Puma", emoji: "🦁", balance: "872.6B", color: "#ff6b6b" },
{ name: "HaDoWoN", emoji: "🐉", balance: "1.2T", color: "#4ecdc4" }];


const RIGHT_PLAYERS = [
{ name: "Kat Meow", emoji: "🐱", balance: "122.8M", color: "#f9ca24" },
{ name: "Large Bull", emoji: "🐂", balance: "47.49T", color: "#a55eea" }];


function PlayerAvatar({ player, theme }) {
  return (
    <div
      className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl"
      style={{ background: theme.sideBg, border: `1px solid ${theme.sideBorderColor}` }}>
      
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
        style={{ background: player.color + "30" }}>
        
        {player.emoji}
      </div>
      <p className="text-[8px] font-bold text-white text-center leading-tight max-w-[60px] truncate">
        {player.name}
      </p>
      <p className="text-[8px] font-mono font-bold" style={{ color: theme.jackpotColor }}>
        {player.balance}
      </p>
    </div>);

}

function SpecialOffer() {
  const [time, setTime] = useState({ h: 17, m: 2 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m } = prev;
        if (m > 0) m--;else
        if (h > 0) {h--;m = 59;}
        return { h, m };
      });
    }, 60000);
    return () => clearInterval(t);
  }, []);

  return null;
















}

export default function SlotSidePanels({ side, theme }) {
  if (side === "left") {
    return (
      <div className="hidden lg:flex flex-col gap-2 w-20 shrink-0">
        




        
        {LEFT_PLAYERS.map((p) =>
        <PlayerAvatar key={p.name} player={p} theme={theme} />
        )}
      </div>);

  }

  return (
    <div className="hidden lg:flex flex-col gap-2 w-20 shrink-0">
      <SpecialOffer />
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
        style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${theme.sideBorderColor}` }}>
        
        <Plus className="w-5 h-5 text-white/60" />
      </button>
      {RIGHT_PLAYERS.map((p) =>
      <PlayerAvatar key={p.name} player={p} theme={theme} />
      )}
    </div>);

}