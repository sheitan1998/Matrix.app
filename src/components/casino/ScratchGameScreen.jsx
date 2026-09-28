import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Ticket, Coins, Gift, RefreshCw, ShoppingCart, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ScratchCard from "@/components/nexus/ScratchCard";
import { formatBet } from "@/components/casino/slotThemes";
import CasinoToken from "@/components/casino/CasinoToken";

const TICKET_PRICE = 10000;

/**
 * Écran du mini-jeu "Tickets à Gratter" intégré au Casino.
 * Synchronise le solde avec le Casino via les props balance/setBalance.
 */
export default function ScratchGameScreen({ balance, setBalance, onBack }) {
  const [freeTicketAvailable, setFreeTicketAvailable] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState(0);
  const [nextResetTime, setNextResetTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [scratchResult, setScratchResult] = useState(null);
  const [scratchKey, setScratchKey] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("scratchTicket", { action: "getTicketStatus" });
      const data = res?.data || res;
      setFreeTicketAvailable(data.freeTicketAvailable || false);
      setPurchasedTickets(data.purchasedTickets || 0);
      setNextResetTime(data.nextResetTime);
      if (data.balance !== undefined) setBalance(data.balance);
    } catch {
      toast.error("Erreur lors du chargement des tickets");
    }
    setLoading(false);
  }, [setBalance]);

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
    } catch {
      toast.error("Erreur lors de l'achat");
    }
    setActionLoading(false);
  };

  const handleScratch = async (ticketType) => {
    if (scratchResult && !revealed) return;
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
    } catch {
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 py-8">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5" style={{ color: "#a855f7" }} />
        <h2 className="text-xl font-black text-white">Tickets à Gratter</h2>
      </div>

      {/* Balance + Tickets summary */}
      <div className="grid grid-cols-3 gap-3 mb-5 w-full max-w-md">
        <div className="p-3 rounded-xl text-center" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(197,160,89,0.15)" }}>
          <div className="flex items-center justify-center mb-1"><CasinoToken size={18} /></div>
          <p className="text-sm font-black font-mono" style={{ color: "#C5A059" }}>{formatBet(balance)}</p>
          <p className="text-[8px] text-white/40 uppercase tracking-wide">Jetons</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: "rgba(15,10,25,0.6)", border: freeTicketAvailable ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.06)" }}>
          <Gift className="w-4 h-4 mx-auto mb-1" style={{ color: freeTicketAvailable ? "#22c55e" : "#6b7280" }} />
          <p className="text-sm font-black" style={{ color: freeTicketAvailable ? "#22c55e" : "#6b7280" }}>{freeTicketAvailable ? "✓" : "✗"}</p>
          <p className="text-[8px] text-white/40 uppercase tracking-wide">Ticket Quotidien</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <Ticket className="w-4 h-4 mx-auto mb-1" style={{ color: "#a855f7" }} />
          <p className="text-sm font-black text-white">{purchasedTickets}</p>
          <p className="text-[8px] text-white/40 uppercase tracking-wide">Tickets Achetés</p>
        </div>
      </div>

      {/* Daily reset info */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl w-full max-w-md" style={{ background: "rgba(15,10,25,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <Clock className="w-3 h-3 text-white/40 shrink-0" />
        <p className="text-[11px] text-white/50">
          {freeTicketAvailable
            ? "Ticket gratuit disponible ! Grattez-le avant qu'il ne soit perdu."
            : `Prochain ticket gratuit dans ${formatResetCountdown()} (réarmement à 15h00)`}
        </p>
      </div>

      {/* Scratch card area */}
      <div className="p-5 rounded-2xl mb-4 w-full max-w-md" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
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
          <div className="text-center py-6">
            <div className="text-5xl mb-3">
              {scratchResult.type === "lose" ? "😢" : scratchResult.amount >= 1000000 ? "💎" : "💰"}
            </div>
            <p className="text-lg font-black mb-1" style={{ color: scratchResult.type === "lose" ? "#ef4444" : "#22c55e" }}>
              {scratchResult.label}
            </p>
            {scratchResult.desc && <p className="text-sm text-white/50 mb-4">{scratchResult.desc}</p>}
            <button
              onClick={() => { setScratchResult(null); setRevealed(false); }}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90 tap-sm"
              style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
            >
              <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" /> Nouveau ticket
            </button>
          </div>
        ) : canScratch ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">🎟️</div>
            <p className="text-sm text-white/60 mb-4">Sélectionnez un ticket à gratter :</p>
            <div className="flex flex-col gap-3 justify-center">
              {freeTicketAvailable && (
                <button
                  onClick={() => handleScratch("free")}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 tap-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                >
                  <Gift className="w-4 h-4" /> Ticket gratuit quotidien
                </button>
              )}
              {purchasedTickets > 0 && (
                <button
                  onClick={() => handleScratch("purchased")}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 tap-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
                >
                  <Ticket className="w-4 h-4" /> Gratter un ticket acheté ({purchasedTickets})
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-5xl mb-3 opacity-50">🎫</div>
            <p className="text-sm text-white/40 mb-3">Aucun ticket disponible.</p>
            <p className="text-xs text-white/30">Achetez un ticket ci-dessous ou attendez le prochain ticket gratuit à 15h00.</p>
          </div>
        )}
      </div>

      {/* Buy ticket */}
      <div className="p-3 rounded-xl flex items-center gap-3 w-full max-w-md" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
          <ShoppingCart className="w-4 h-4" style={{ color: "#a855f7" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">Acheter un ticket</p>
          <p className="text-[11px] text-white/40">Coût : {TICKET_PRICE.toLocaleString("fr-FR")} jetons</p>
        </div>
        <button
          onClick={handleBuyTicket}
          disabled={actionLoading || balance < TICKET_PRICE}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-30 tap-sm shrink-0"
          style={{ background: balance >= TICKET_PRICE ? "linear-gradient(135deg, #a855f7, #6d28d9)" : "rgba(255,255,255,0.05)" }}
        >
          {balance < TICKET_PRICE ? "Solde insuffisant" : "Acheter"}
        </button>
      </div>

      {/* Rewards table */}
      <div className="mt-5 p-3 rounded-xl w-full max-w-md" style={{ background: "rgba(15,10,25,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[11px] font-bold text-white/60 mb-2">Récompenses (30% de chances de gain) :</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {[
            { icon: "🎯", label: "Relance" },
            { icon: "💰", label: "10K" },
            { icon: "💰", label: "50K" },
            { icon: "💰", label: "100K" },
            { icon: "💎", label: "1M" },
            { icon: "😢", label: "Perdu" },
          ].map((r, i) => (
            <div key={i} className="p-1.5 rounded-lg text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="text-sm">{r.icon}</div>
              <p className="text-[8px] font-bold text-white/70">{r.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}