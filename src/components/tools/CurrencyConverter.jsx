import React, { useEffect, useState } from "react";
import { X, RefreshCw, ArrowLeftRight, TrendingUp } from "lucide-react";

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "CAD", "JPY", "AUD", "CNY", "SEK", "NOK", "PLN", "BRL"];

const FALLBACK = { USD: 1.08, GBP: 0.85, CHF: 0.94, CAD: 1.47, JPY: 168, AUD: 1.64, CNY: 7.82, SEK: 11.3, NOK: 11.6, PLN: 4.3, BRL: 6.1 };

const fmt = (value, currency) => {
  const decimals = currency === "JPY" ? 0 : 2;
  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
};

export default function CurrencyConverter({ onClose }) {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");
  const [rates, setRates] = useState(null);
  const [base, setBase] = useState("EUR");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRates = async (currency) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${currency}`);
      if (!res.ok) throw new Error("Rates unavailable");
      const data = await res.json();
      setRates({ ...data.rates, [currency]: 1 });
      setBase(currency);
      setDate(data.date);
    } catch {
      const local = currency === "EUR" ? FALLBACK : { EUR: null };
      if (currency === "EUR") {
        setRates({ EUR: 1, ...local });
        setBase("EUR");
        setError("Taux hors ligne — valeurs approximatives.");
      } else {
        setError("Impossible de récupérer les taux en direct.");
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadRates("EUR"); }, []);

  const rateFrom = rates?.[from];
  const rateTo = rates?.[to];
  const convert = (value) => {
    if (!rateFrom || !rateTo) return null;
    return (Number(value) || 0) / rateFrom * rateTo;
  };
  const result = convert(amount);
  const unitRate = convert(1);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(34,211,238,0.14)", border: "1px solid rgba(34,211,238,0.4)", boxShadow: "0 0 12px rgba(34,211,238,0.3)" }}>
            <TrendingUp className="h-4 w-4 text-[#22d3ee]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Convertisseur de Devises</h2>
            <p className="text-[10px] text-white/40">{date ? `Taux du ${date}` : "Taux de change"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => loadRates(base)} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }} title="Actualiser">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <p className="mb-2 rounded-lg px-3 py-2 text-[10px] text-amber-300" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>{error}</p>}

      <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(34,211,238,0.2)" }}>
        <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-white/35">Montant</label>
        <div className="flex items-center gap-2">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, "").replace(",", "."))}
            inputMode="decimal"
            className="h-11 flex-1 rounded-xl bg-black/30 px-3 text-lg font-bold text-white outline-none focus:border-[#22d3ee]"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 rounded-xl bg-black/30 px-2 text-sm font-bold text-white outline-none" style={{ border: "1px solid rgba(34,211,238,0.35)" }}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button onClick={swap} className="my-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold text-[#22d3ee] hover:bg-[#22d3ee]/10 tap-sm" style={{ border: "1px dashed rgba(34,211,238,0.35)" }}>
          <ArrowLeftRight className="h-3.5 w-3.5" /> Inverser
        </button>

        <div className="rounded-xl px-3 py-3" style={{ background: "rgba(34,211,238,0.07)", border: "1px solid rgba(34,211,238,0.25)" }}>
          <p className="text-[10px] uppercase tracking-wider text-white/40">Résultat</p>
          <p className="mt-0.5 text-2xl font-black text-white">
            {result === null ? "—" : fmt(result, to)} <span className="text-sm text-[#22d3ee]">{to}</span>
          </p>
          <p className="mt-0.5 text-[10px] text-white/35">
            1 {from} = {unitRate === null ? "—" : fmt(unitRate, to)} {to}
          </p>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <select value={to} onChange={(e) => setTo(e.target.value)} className="h-9 flex-1 rounded-lg bg-black/30 px-2 text-xs font-bold text-white outline-none" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={base} onChange={(e) => loadRates(e.target.value)} className="h-9 flex-1 rounded-lg bg-black/30 px-2 text-xs text-white/60 outline-none" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            {CURRENCIES.map((c) => <option key={c} value={c}>Table en {c}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-white/30">Table des taux ({base})</p>
        <div className="grid grid-cols-2 gap-1.5">
          {CURRENCIES.filter((c) => c !== base).map((c) => (
            <div key={c} className="flex items-center justify-between rounded-lg px-2.5 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-[11px] font-bold text-white/60">{c}</span>
              <span className="text-[11px] font-mono text-white/85">{rates?.[c] ? fmt(rates[c], c) : "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}