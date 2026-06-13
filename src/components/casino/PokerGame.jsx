import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Plus, LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ---- CARD UTILS ----
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
function makeDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ rank: r, suit: s });
  return d.sort(() => Math.random() - 0.5);
}
function isRed(suit) { return suit === "♥" || suit === "♦"; }

function Card({ card, hidden, small }) {
  if (!card) return null;
  const sz = small ? "w-10 h-14 text-xs" : "w-14 h-20 text-sm";
  if (hidden) return (
    <div className={cn("rounded-lg border-2 border-blue-600 bg-gradient-to-br from-blue-800 to-blue-950 flex items-center justify-center", sz)}>
      <span className="text-blue-400 text-lg">🂠</span>
    </div>
  );
  return (
    <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ duration: 0.3 }}
      className={cn("rounded-lg border bg-white flex flex-col items-center justify-between p-1 font-black select-none", sz,
        isRed(card.suit) ? "text-red-600 border-red-200" : "text-gray-900 border-gray-200")}>
      <span className="self-start leading-none">{card.rank}</span>
      <span className="text-lg leading-none">{card.suit}</span>
      <span className="self-end leading-none rotate-180">{card.rank}</span>
    </motion.div>
  );
}

// ---- TABLE LIST ----
function TableList({ user, balance, onJoinTable }) {
  const [creating, setCreating] = useState(false);
  const [newBuyIn, setNewBuyIn] = useState(500);
  const qc = useQueryClient();

  const { data: tables = [] } = useQuery({
    queryKey: ["poker-tables"],
    queryFn: () => base44.entities.ServerMessage.filter({ server_id: "poker_tables", channel_id: "lobby" }, "-created_date", 20),
    refetchInterval: 3000,
  });

  const createTable = async () => {
    if (balance < newBuyIn) { toast.error("Solde insuffisant"); return; }
    const tableId = Date.now().toString();
    await base44.entities.ServerMessage.create({
      server_id: "poker_tables",
      channel_id: "lobby",
      author_email: user.email,
      author_name: user.full_name || user.email.split("@")[0],
      content: JSON.stringify({ tableId, buyIn: newBuyIn, players: [], status: "waiting", hostName: user.full_name || user.email.split("@")[0] }),
      type: "system",
      file_url: tableId,
    });
    toast.success("Table créée !");
    qc.invalidateQueries({ queryKey: ["poker-tables"] });
    onJoinTable({ tableId, buyIn: newBuyIn, isHost: true });
    setCreating(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-black text-white text-lg" style={{ fontFamily: "'Arial Black', sans-serif" }}>🃏 TABLES POKER</p>
        <button onClick={() => setCreating(!creating)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs"
          style={{ background: "linear-gradient(135deg, #44cc00, #229900)", color: "#fff" }}>
          <Plus className="w-3.5 h-3.5" /> Créer une table
        </button>
      </div>

      {creating && (
        <div className="p-4 rounded-2xl border space-y-3" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>
          <p className="text-sm font-bold text-white">Nouvelle table — Mise d'entrée</p>
          <div className="flex gap-2 flex-wrap">
            {[200, 500, 1000, 2000].map(v => (
              <button key={v} onClick={() => setNewBuyIn(v)}
                className="px-3 py-1.5 rounded-xl text-xs font-black transition"
                style={{
                  background: newBuyIn === v ? "linear-gradient(135deg, #6644ff, #4422cc)" : "rgba(255,255,255,0.06)",
                  color: newBuyIn === v ? "#fff" : "#666",
                  border: `1px solid ${newBuyIn === v ? "#8866ff" : "rgba(255,255,255,0.08)"}`
                }}>
                {v} 🪙
              </button>
            ))}
          </div>
          <button onClick={createTable}
            className="w-full py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #ffd700, #ff8800)", color: "#000" }}>
            Créer ({newBuyIn} 🪙 buy-in)
          </button>
        </div>
      )}

      <div className="space-y-2">
        {tables.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-4xl mb-2">🃏</p>
            <p className="font-bold">Aucune table active</p>
            <p className="text-xs mt-1">Crée une table pour commencer !</p>
          </div>
        )}
        {tables.map((t) => {
          let info = {};
          try { info = JSON.parse(t.content); } catch {}
          return (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl border"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: "linear-gradient(135deg, #2a1050, #4a20a0)" }}>
                🃏
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white">Table de {info.hostName || "?"}</p>
                <p className="text-xs text-muted-foreground">Buy-in : {info.buyIn || 500} 🪙 · {info.status === "playing" ? "🔴 En cours" : "🟢 Attente"}</p>
              </div>
              <button
                onClick={() => onJoinTable({ tableId: info.tableId || t.id, buyIn: info.buyIn || 500, isHost: false, tableRecordId: t.id })}
                disabled={info.status === "playing"}
                className="px-3 py-1.5 rounded-xl text-xs font-black disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #6644ff, #4422cc)", color: "#fff" }}>
                <Users className="w-3 h-3 inline mr-1" />Rejoindre
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- POKER TABLE ----
const HAND_RANKINGS = ["Carte haute","Paire","Double paire","Brelan","Quinte","Couleur","Full","Carré","Quinte flush","Quinte flush royale"];

function evaluateHand(cards) {
  if (cards.length < 5) return "En attente...";
  const ranks = cards.map(c => RANKS.indexOf(c.rank));
  const suits = cards.map(c => c.suit);
  const rankCounts = {};
  ranks.forEach(r => { rankCounts[r] = (rankCounts[r] || 0) + 1; });
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = suits.every(s => s === suits[0]);
  const sortedRanks = [...new Set(ranks)].sort((a, b) => a - b);
  const isStraight = sortedRanks.length === 5 && sortedRanks[4] - sortedRanks[0] === 4;
  if (isFlush && isStraight && sortedRanks[4] === 12) return HAND_RANKINGS[9];
  if (isFlush && isStraight) return HAND_RANKINGS[8];
  if (counts[0] === 4) return HAND_RANKINGS[7];
  if (counts[0] === 3 && counts[1] === 2) return HAND_RANKINGS[6];
  if (isFlush) return HAND_RANKINGS[5];
  if (isStraight) return HAND_RANKINGS[4];
  if (counts[0] === 3) return HAND_RANKINGS[3];
  if (counts[0] === 2 && counts[1] === 2) return HAND_RANKINGS[2];
  if (counts[0] === 2) return HAND_RANKINGS[1];
  return HAND_RANKINGS[0];
}

function PokerTable({ user, balance, setBalance, tableInfo, onLeave, addTransaction }) {
  const [gameState, setGameState] = useState(null); // null = waiting
  const [myHand, setMyHand] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  const [pot, setPot] = useState(0);
  const [phase, setPhase] = useState("waiting"); // waiting, preflop, flop, turn, river, showdown
  const [players, setPlayers] = useState([{ email: user.email, name: user.full_name || user.email.split("@")[0], chips: tableInfo.buyIn, folded: false }]);
  const [myBet, setMyBet] = useState(0);
  const [betInput, setBetInput] = useState(tableInfo.buyIn > 200 ? 50 : 20);
  const [result, setResult] = useState("");
  const deckRef = useRef(makeDeck());

  const qc = useQueryClient();

  // Poll for table state via ServerMessages
  const { data: tableMessages = [] } = useQuery({
    queryKey: ["poker-game", tableInfo.tableId],
    queryFn: () => base44.entities.ServerMessage.filter(
      { server_id: "poker_game_" + tableInfo.tableId, channel_id: "game" },
      "-created_date",
      50
    ),
    refetchInterval: 2000,
  });

  const broadcast = async (type, data) => {
    await base44.entities.ServerMessage.create({
      server_id: "poker_game_" + tableInfo.tableId,
      channel_id: "game",
      author_email: user.email,
      author_name: user.full_name || user.email.split("@")[0],
      content: JSON.stringify({ type, ...data }),
      type: "system",
    });
    qc.invalidateQueries({ queryKey: ["poker-game", tableInfo.tableId] });
  };

  // Process incoming messages
  useEffect(() => {
    if (tableMessages.length === 0) return;
    const latest = tableMessages[0];
    try {
      const msg = JSON.parse(latest.content);
      if (msg.type === "join" && msg.email !== user.email) {
        setPlayers(prev => {
          if (prev.find(p => p.email === msg.email)) return prev;
          return [...prev, { email: msg.email, name: msg.name, chips: tableInfo.buyIn, folded: false }];
        });
      }
      if (msg.type === "deal" && msg.targetEmail === user.email) {
        setMyHand(msg.hand);
        setCommunityCards([]);
        setPhase("preflop");
        setResult("");
        setPot(0);
        setMyBet(0);
      }
      if (msg.type === "community") {
        setCommunityCards(msg.cards);
        setPhase(msg.phase);
      }
      if (msg.type === "fold" && msg.email !== user.email) {
        setPlayers(prev => prev.map(p => p.email === msg.email ? { ...p, folded: true } : p));
        toast.info(`${msg.name} s'est couché`);
      }
    } catch {}
  }, [tableMessages.length]);

  const joinTable = async () => {
    if (balance < tableInfo.buyIn) { toast.error("Solde insuffisant"); return; }
    setBalance(b => b - tableInfo.buyIn);
    await broadcast("join", { email: user.email, name: user.full_name || user.email.split("@")[0] });
    toast.success(`Rejoint la table (${tableInfo.buyIn} 🪙)`);
  };

  const startGame = async () => {
    if (players.length < 2) { toast.error("Il faut au moins 2 joueurs"); return; }
    deckRef.current = makeDeck();
    for (const p of players) {
      const hand = [deckRef.current.pop(), deckRef.current.pop()];
      if (p.email === user.email) {
        setMyHand(hand);
      }
      await broadcast("deal", { targetEmail: p.email, hand });
    }
    setPhase("preflop");
    setPot(players.length * 50);
    setResult("");
    setCommunityCards([]);
  };

  const dealCommunity = async () => {
    let cards = [...communityCards];
    let nextPhase = phase;
    if (phase === "preflop") { cards = [deckRef.current.pop(), deckRef.current.pop(), deckRef.current.pop()]; nextPhase = "flop"; }
    else if (phase === "flop") { cards = [...communityCards, deckRef.current.pop()]; nextPhase = "turn"; }
    else if (phase === "turn") { cards = [...communityCards, deckRef.current.pop()]; nextPhase = "river"; }
    else if (phase === "river") { nextPhase = "showdown"; }
    setCommunityCards(cards);
    setPhase(nextPhase);
    await broadcast("community", { cards, phase: nextPhase });
  };

  const fold = async () => {
    await broadcast("fold", { email: user.email, name: user.full_name || "Toi" });
    setPlayers(prev => prev.map(p => p.email === user.email ? { ...p, folded: true } : p));
    setPhase("waiting");
    toast.info("Vous vous êtes couché");
  };

  const callBet = () => {
    const amount = Math.min(betInput, balance);
    setBalance(b => b - amount);
    setMyBet(b => b + amount);
    setPot(p => p + amount);
    toast.success(`Mise : +${amount} 🪙`);
  };

  const showdown = () => {
    const myFullHand = [...myHand, ...communityCards].slice(0, 7);
    const handRank = evaluateHand(myFullHand.slice(0, 5));
    const winAmount = Math.round(pot * 0.9);
    setBalance(b => b + winAmount);
    if (addTransaction) addTransaction("casino_win", winAmount, `Poker: +${winAmount}`, "casino");
    setResult(`Votre main : ${handRank} — Vous gagnez ${winAmount} 🪙 !`);
    setPhase("waiting");
    setPot(0);
    setMyBet(0);
    setMyHand([]);
    setCommunityCards([]);
  };

  const isHost = tableInfo.isHost;
  const activePlayers = players.filter(p => !p.folded);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onLeave} className="text-white/60 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="font-black text-white">Table de Poker</p>
        <span className="ml-auto text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(255,215,0,0.15)", color: "#ffd700" }}>
          Pot : {pot} 🪙
        </span>
      </div>

      {/* Community cards */}
      <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #0a2010, #0d3015)", border: "2px solid #2a6030" }}>
        <p className="text-[10px] font-black text-green-400 uppercase mb-3">Cartes communes</p>
        <div className="flex gap-2 justify-center min-h-[80px] items-center">
          {communityCards.length === 0 ? (
            <p className="text-muted-foreground text-xs">En attente du flop...</p>
          ) : communityCards.map((c, i) => <Card key={i} card={c} />)}
        </div>
      </div>

      {/* My hand */}
      {myHand.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ background: "rgba(100,68,255,0.1)", border: "1px solid rgba(100,68,255,0.3)" }}>
          <p className="text-[10px] font-black text-purple-400 uppercase mb-3">Votre main</p>
          <div className="flex gap-2 justify-center">
            {myHand.map((c, i) => <Card key={i} card={c} />)}
          </div>
          {communityCards.length > 0 && (
            <p className="text-center text-xs text-purple-300 mt-2 font-bold">
              {evaluateHand([...myHand, ...communityCards].slice(0, 5))}
            </p>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="p-3 rounded-2xl text-center font-black text-white"
          style={{ background: "linear-gradient(135deg, #ffd700, #ff8800)", color: "#000" }}>
          {result}
        </div>
      )}

      {/* Players */}
      <div className="space-y-1">
        <p className="text-[10px] font-black text-muted-foreground uppercase">Joueurs ({players.length})</p>
        {players.map((p, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-secondary shrink-0">
              {(p.name || "?")[0]}
            </div>
            <span className="text-sm text-white font-semibold flex-1">{p.name}</span>
            {p.folded && <span className="text-xs text-red-400">Couché</span>}
            {p.email === user.email && <span className="text-[10px] text-purple-400">Vous</span>}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {phase === "waiting" && !players.find(p => p.email === user.email) && (
          <button onClick={joinTable} className="w-full py-3 rounded-2xl font-black text-sm"
            style={{ background: "linear-gradient(135deg, #6644ff, #4422cc)", color: "#fff" }}>
            Rejoindre la table ({tableInfo.buyIn} 🪙)
          </button>
        )}

        {phase === "waiting" && isHost && players.length >= 1 && (
          <button onClick={startGame} className="w-full py-3 rounded-2xl font-black text-sm"
            style={{ background: "linear-gradient(135deg, #44cc00, #229900)", color: "#fff" }}>
            {players.length < 2 ? "Attente de joueurs..." : "Distribuer les cartes"}
          </button>
        )}

        {(phase === "preflop" || phase === "flop" || phase === "turn" || phase === "river") && (
          <div className="space-y-2">
            {isHost && (
              <button onClick={dealCommunity} className="w-full py-2.5 rounded-2xl font-black text-sm"
                style={{ background: "linear-gradient(135deg, #ffd700, #ff8800)", color: "#000" }}>
                {phase === "preflop" ? "Révéler le Flop" : phase === "flop" ? "Révéler le Turn" : phase === "turn" ? "Révéler la River" : "Showdown"}
              </button>
            )}
            <div className="flex gap-2">
              <div className="flex gap-1.5">
                {[20, 50, 100].map(v => (
                  <button key={v} onClick={() => setBetInput(v)}
                    className="px-2 py-1.5 rounded-xl text-xs font-black"
                    style={{ background: betInput === v ? "#6644ff" : "rgba(255,255,255,0.08)", color: betInput === v ? "#fff" : "#666" }}>
                    {v}
                  </button>
                ))}
              </div>
              <button onClick={callBet} className="flex-1 py-2 rounded-xl font-black text-xs"
                style={{ background: "linear-gradient(135deg, #44cc00, #229900)", color: "#fff" }}>
                Suivre ({betInput} 🪙)
              </button>
              <button onClick={fold} className="px-3 py-2 rounded-xl font-black text-xs bg-red-500/20 text-red-400">
                Se coucher
              </button>
            </div>
          </div>
        )}

        {phase === "river" && isHost && (
          <button onClick={showdown} className="w-full py-2.5 rounded-2xl font-black text-sm"
            style={{ background: "linear-gradient(135deg, #ff00ff, #aa00ff)", color: "#fff" }}>
            Showdown → Révéler les mains
          </button>
        )}
      </div>
    </div>
  );
}

// ---- MAIN COMPONENT ----
export default function PokerGame({ balance, setBalance, addTransaction }) {
  const [user, setUser] = useState(null);
  const [activeTable, setActiveTable] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  if (!user) return <div className="text-center py-10 text-muted-foreground">Chargement...</div>;

  if (activeTable) {
    return (
      <PokerTable
        user={user}
        balance={balance}
        setBalance={setBalance}
        tableInfo={activeTable}
        addTransaction={addTransaction}
        onLeave={() => setActiveTable(null)}
      />
    );
  }

  return <TableList user={user} balance={balance} onJoinTable={setActiveTable} />;
}