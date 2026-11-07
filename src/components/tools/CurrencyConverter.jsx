import React, { useCallback, useEffect, useMemo, useState } from "react";
import { X, RefreshCw, ArrowLeftRight, TrendingUp, Radio, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";

const POPULAR = ["EUR", "USD", "GBP", "CHF", "CAD", "JPY", "AUD", "CNY", "SEK", "NOK", "PLN", "BRL", "MAD", "INR"];

const currencyName = (code) => {
  try {
    return new Intl.DisplayNames(["fr"], { type: "currency" }).of(code) || code;
  } catch {
    return code;
  }
};

const fmt = (value, code) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const decimals = abs === 0 ? 2 : abs < 0.01 ? 6 : abs < 1 ? 4 : abs < 1000 ? 2 : 0;
  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
};

const timeAgo = (date) => {
  if (!date) return "—";
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 5) return "à l'instant";
  if (seconds < 60) return `il y a ${seconds} s`;
  const minutes = Math.round(seconds / 60);
  return `il y a ${minutes} min`;
};

export default function CurrencyConverter({ onClose }) {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");
  const [rates, setRates] = useState(null);
  const [meta, setMeta] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async (base = "EUR", silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("currencyRates", { base });
      const data = res?.data;
      if (!data?.rates) throw new Error(data?.error || "Taux indisponibles");
      setRates(data.rates);
      setMeta(data);
      setUpdatedAt(new Date());
    } catch {
      setError("Taux en direct indisponibles. Vérifiez votre connexion puis actualisez.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load("EUR"); }, [load]);

  useEffect(() => {
    const id = setInterval(() => load("EUR", true), 60000);
    return () => clearInterval(id);
  }, [load]);

  const codes = useMemo(() => {
    const list = Object.keys(rates || {}).filter((c) => c !== "EUR").sort();
    return ["EUR", ...list];
  }, [rates]);

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    const all = codes.filter((c) => c !== from);
    if (!q) return all;
    return all.filter((c) => c.includes(q) || currencyName(c).toUpperCase().includes(q));
  }, [codes, search, from]);

  const rateFrom = rates?.[from];
  const rateTo = rates?.[to];
  const unitRate = rateFrom && rateTo ? rateTo / rateFrom : null;
  const result = unitRate === null ? null : (Number(amount) || 0) * unitRate;
  const inverse = unitRate ? 1 / unitRate : null;

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
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black text-white">Convertisseur de Devises</h2>
              {meta?.live && (
                <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-black text-green-300" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)" }}>
                  <Radio className="h-2 w-2 animate-pulse" /> LIVE
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/40">
              {meta ? `${meta.source} · ${timeAgo(updatedAt)}` : loading ? "Connexion au marché…" : "Taux de change"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => load("EUR", true)} disabled={refreshing} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }} title="Actualiser">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing || loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <p className="text-[10px] text-red-300">{error}</p>
          <button onClick={() => load("EUR")} className="shrink-0 rounded-md px-2 py-1 text-[9px] font-bold text-red-200" style={{ background: "rgba(239,68,68,0.2)" }}>Réessayer</button>
        </div>
      )}

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
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 w-24 rounded-xl bg-black/30 px-2 text-sm font-bold text-white outline-none" style={{ border: "1px solid rgba(34,211,238,0.35)" }}>
            {codes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button onClick={swap} className="my-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold text-[#22d3ee] hover:bg-[#22d3ee]/10 tap-sm" style={{ border: "1px dashed rgba(34,211,238,0.35)" }}>
          <ArrowLeftRight className="h-3.5 w-3.5" /> Inverser
        </button>

        <div className="rounded-xl px-3 py-3" style={{ background: "rgba(34,211,238,0.07)", border: "1px solid rgba(34,211,238,0.25)" }}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-white/40">{currencyName(to)}</p>
              <p className="mt-0.5 truncate text-2xl font-black text-white">
                {loading && !rates ? "…" : fmt(result, to)} <span className="text-sm text-[#22d3ee]">{to}</span>
              </p>
              <p className="mt-0.5 text-[10px] text-white/35">
                1 {from} = {unitRate === null ? "—" : fmt(unitRate, to)} {to}
              </p>
              <p className="text-[10px] text-white/25">
                1 {to} = {inverse === null ? "—" : fmt(inverse, from)} {from}
              </p>
            </div>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-20 shrink-0 rounded-lg bg-black/30 px-1 text-xs font-bold text-white outline-none" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
              {codes.filter((c) => c !== from).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Toutes les devises (${Math.max(0, codes.length - 1)})`}
            className="h-8 w-full rounded-lg bg-black/25 pl-8 pr-2 text-[11px] text-white outline-none focus:border-[#22d3ee]"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </div>
        <span className="shrink-0 text-[9px] uppercase tracking-wider text-white/25">base {meta?.base || "EUR"}</span>
      </div>

      <div className="mt-2 min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        {loading && !rates ? (
          <div className="grid grid-cols-2 gap-1.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-white/30">Aucune devise ne correspond.</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((c) => {
              const value = rates[c] && rates[from] ? rates[c] / rates[from] : null;
              return (
                <button
                  key={c}
                  onClick={() => setTo(c)}
                  className="flex items-center justify-between rounded-lg px-2.5 py-2 text-left transition"
                  style={{
                    background: c === to ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${c === to ? "rgba(34,211,238,0.4)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold text-white/75">{c}</span>
                    <span className="block truncate text-[8px] text-white/25">{currencyName(c)}</span>
                  </span>
                  <span className="ml-1 shrink-0 font-mono text-[10px] text-white/80">{value === null ? "—" : fmt(value, c)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-2 text-center text-[8px] text-white/20">
        {meta?.live ? "Taux du marché actualisés toutes les 60 secondes" : meta ? "Taux de référence" : "Source de taux en direct"} · 1 {from} = {unitRate === null ? "—" : fmt(unitRate, to)} {to}
      </p>
    </div>
  );
}