import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Ticket, Coins, Gift, RefreshCw, ShoppingCart, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import ScratchCard from "@/components/nexus/ScratchCard";

const TICKET_PRICE = 10000;

export default function NexusGames() {
  const [balance, setBalance] = useState(0);
  const [freeTicketAvailable, setFreeTicketAvailable] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState(0);
  const [nextResetTime, setNextResetTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [scratchResult, setScratchResult] = useState(null);
  const [scratchKey, setScratchKey] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [gameTitle, setGameTitle] = useState('Tickets à Gratter');

  useEffect(() => {
    base44.entities.CasinoGameConfig.filter({ game_key: 'scratch' })
      .then(records => { if (records[0]?.title) setGameTitle(records[0].title); })
      .catch(() => {});
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("scratchTicket", { action: "getTicketStatus" });
      const data = res?.data || res;
      setBalance(data.balance || 0);
      setFreeTicketAvailable(data.freeTicketAvailable || false);
      setPurchasedTickets(data.purchasedTickets || 0);
      setNextResetTime(data.nextResetTime);
    } catch (e) {
      toast.error("Erreur lors du chargement des tickets");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleBuyTicket = async () => {
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("scratchTicket", { action: "buyTicket" });
      const data = res?.data || res;
      if (data.error) {
        toast.error(data.error);
      } else {
        setBalance(data.balance);
        setPurchasedTickets(data.purchasedTickets);
        toast.success("Ticket acheté !");
      }
    } catch (e) {
      toast.error("Erreur lors de l'achat");
    }
    setActionLoading(false);
  };

  const handleScratch = async (ticketType) => {
    if (scratchResult && !revealed) return; // en cours de grattage
    setActionLoading(true);
    setRevealed(false);
    try {
      const res = await base44.functions.invoke("scratchTicket", { action: "scratch", ticketType });
      const data = res?.data || res;
      if (data.error) {
        toast.error(data.error);
        setActionLoading(false);
        return;
      }
      setScratchResult(data.result);
      setScratchKey(k => k + 1);
      setBalance(data.balance);
      setFreeTicketAvailable(data.freeTicketAvailable);
      setPurchasedTickets(data.purchasedTickets);
    } catch (e) {
      toast.error("Erreur lors du grattage");
    }
    setActionLoading(false);
  };

  const handleRevealed = useCallback(() => {
    setRevealed(true);
    if (scratchResult) {
      if (scratchResult.type === "lose") {
        toast.error("Perdu ! Réessayez demain.");
      } else if (scratchResult.type === "relance") {
        toast.success("🎯 Relance ! Vous avez un nouveau ticket gratuit.");
      } else {
        toast.success(`Gagné : ${scratchResult.label} !`);
      }
    }
  }, [scratchResult]);

  const formatResetCountdown = () => {
    if (!nextResetTime) return "15h00";
    const diff = new Date(nextResetTime).getTime() - Date.now();
    if (diff <= 0) return "Disponible";
    const h = Math.floor(diff / (60 * 60 * 1000));
    const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return `${h}h ${m}m`;
  };

  const canScratch = freeTicketAvailable || purchasedTickets > 0;
  const isScratching = scratchResult && !revealed;

  return (
    <div className="min-h-screen" style={{ background: "#0a050f" }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(168,85,247,0.06), transparent 60%)" }} />

      <div className="relative z-10 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <a href="/casino" className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </a>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h1 className="text-2xl font-black text-white">{gameTitle}</h1>
          </div>
        </div>

        {/* Balance + Tickets summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl text-center" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
            <Coins className="w-5 h-5 mx-auto mb-1" style={{ color: "#f59e0b" }} />
            <p className="text-lg font-black text-white font-mono">{balance.toLocaleString("fr-FR")}</p>
            <p className="text-[9px] text-white/40 uppercase tracking-wide">Jetons</p>
          </div>
          <div className="p-4 rounded-2xl text-center" style={{ background: "rgba(15,10,25,0.6)", border: freeTicketAvailable ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.06)" }}>
            <Gift className="w-5 h-5 mx-auto mb-1" style={{ color: freeTicketAvailable ? "#22c55e" : "#6b7280" }} />
            <p className="text-lg font-black" style={{ color: freeTicketAvailable ? "#22c55e" : "#6b7280" }}>{freeTicketAvailable ? "✓" : "✗"}</p>
            <p className="text-[9px] text-white/40 uppercase tracking-wide">Ticket Quotidien</p>
          </div>
          <div className="p-4 rounded-2xl text-center" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
            <Ticket className="w-5 h-5 mx-auto mb-1" style={{ color: "#a855f7" }} />
            <p className="text-lg font-black text-white">{purchasedTickets}</p>
            <p className="text-[9px] text-white/40 uppercase tracking-wide">Tickets Achetés</p>
          </div>
        </div>

        {/* Daily reset info */}
        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl" style={{ background: "rgba(15,10,25,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />
          <p className="text-xs text-white/50">
            {freeTicketAvailable
              ? "Ticket gratuit disponible ! Grattez-le avant qu'il ne soit perdu."
              : `Prochain ticket gratuit dans ${formatResetCountdown()} (réarmement à 15h00)`}
          </p>
        </div>

        {/* Scratch card area */}
        <div className="p-6 rounded-2xl mb-4" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-white/10 rounded-full animate-spin" style={{ borderTopColor: "#a855f7" }} />
            </div>
          ) : isScratching ? (
            <div>
              <p className="text-center text-sm text-white/60 mb-4">Grattez la carte pour révéler votre gain !</p>
              <ScratchCard
                key={scratchKey}
                result={scratchResult}
                onRevealed={handleRevealed}
              />
            </div>
          ) : scratchResult && revealed ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">
                {scratchResult.type === "lose" ? "😢" : scratchResult.amount >= 1000000 ? "💎" : "💰"}
              </div>
              <p className="text-xl font-black mb-1" style={{ color: scratchResult.type === "lose" ? "#ef4444" : "#22c55e" }}>
                {scratchResult.label}
              </p>
              {scratchResult.desc && <p className="text-sm text-white/50 mb-4">{scratchResult.desc}</p>}
              <button
                onClick={() => { setScratchResult(null); setRevealed(false); }}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 tap-sm"
                style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
              >
                <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" /> Nouveau ticket
              </button>
            </div>
          ) : canScratch ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🎟️</div>
              <p className="text-sm text-white/60 mb-4">Sélectionnez un ticket à gratter :</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {freeTicketAvailable && (
                  <button
                    onClick={() => handleScratch("free")}
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90 tap-sm flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                  >
                    <Gift className="w-4 h-4" /> Ticket gratuit quotidien
                  </button>
                )}
                {purchasedTickets > 0 && (
                  <button
                    onClick={() => handleScratch("purchased")}
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90 tap-sm flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
                  >
                    <Ticket className="w-4 h-4" /> Gratter un ticket acheté ({purchasedTickets})
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3 opacity-50">🎫</div>
              <p className="text-sm text-white/40 mb-4">Aucun ticket disponible.</p>
              <p className="text-xs text-white/30">Achetez un ticket ci-dessous ou attendez le prochain ticket gratuit à 15h00.</p>
            </div>
          )}
        </div>

        {/* Buy ticket */}
        <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
            <ShoppingCart className="w-5 h-5" style={{ color: "#a855f7" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Acheter un ticket</p>
            <p className="text-xs text-white/40">Coût : {TICKET_PRICE.toLocaleString("fr-FR")} jetons Nexus Games</p>
          </div>
          <button
            onClick={handleBuyTicket}
            disabled={actionLoading || balance < TICKET_PRICE}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-30 tap-sm shrink-0"
            style={{ background: balance >= TICKET_PRICE ? "linear-gradient(135deg, #a855f7, #6d28d9)" : "rgba(255,255,255,0.05)" }}
          >
            {balance < TICKET_PRICE ? "Solde insuffisant" : "Acheter"}
          </button>
        </div>

        {/* Rewards table */}
        <div className="mt-6 p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-xs font-bold text-white/60 mb-3">Récompenses possibles (30% de chances de gain) :</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { icon: "🎯", label: "Relance", desc: "Ticket gratuit" },
              { icon: "💰", label: "10 000", desc: "jetons" },
              { icon: "💰", label: "50 000", desc: "jetons" },
              { icon: "💰", label: "100 000", desc: "jetons" },
              { icon: "💎", label: "1 000 000", desc: "jetons" },
              { icon: "😢", label: "Perdu", desc: "70% de chances" },
            ].map((r, i) => (
              <div key={i} className="p-2 rounded-lg text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="text-lg">{r.icon}</div>
                <p className="text-[10px] font-bold text-white/70">{r.label}</p>
                <p className="text-[8px] text-white/30">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}