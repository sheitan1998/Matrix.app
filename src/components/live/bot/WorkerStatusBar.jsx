import React from "react";
import { Activity, Loader2, Pause, Play, RefreshCw, Send, ShieldCheck, Wifi, WifiOff } from "lucide-react";

const agoLabel = (iso) => {
  if (!iso) return "jamais";
  const minutes = Math.round(Math.max(0, Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `il y a ${hours} h` : `il y a ${Math.round(hours / 24)} j`;
};

export default function WorkerStatusBar({ overview, busy, onPause, onTest }) {
  const online = overview?.online === true;
  const paused = overview?.config?.paused === true;
  const stats = overview?.stats || {};
  const color = paused ? "#f59e0b" : online ? "#22c55e" : "#ef4444";
  const StatusIcon = paused ? Pause : online ? Wifi : WifiOff;
  const moderation = (stats.timeouts || 0) + (stats.deletions || 0);

  return (
    <section className="rounded-2xl p-4" style={{ background: "rgba(18,9,28,0.82)", border: `1px solid ${color}40`, boxShadow: `0 0 22px ${color}14` }}>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
          style={{ background: `${color}1f`, border: `1px solid ${color}55`, color }}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {paused ? "En pause" : online ? "En ligne" : "Hors ligne"}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-white/50 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" /> Dernière synchro : {agoLabel(overview?.lastSync)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTest}
            disabled={busy}
            className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition disabled:opacity-40 tap-sm"
            style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.35)", color: "#d8b4fe" }}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Tester le bot
          </button>

          <button
            type="button"
            onClick={() => onPause(!paused)}
            disabled={busy}
            className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition disabled:opacity-40 tap-sm"
            style={paused
              ? { background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80" }
              : { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.4)", color: "#fbbf24" }}
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {paused ? "Activer le bot" : "Mettre en pause"}
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: Activity, label: "Messages traités", value: stats.messages || 0 },
          { icon: Send, label: "Commandes", value: stats.commands || 0 },
          { icon: ShieldCheck, label: "Modération", value: moderation },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl px-2.5 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[9px] uppercase tracking-wider text-white/35 flex items-center gap-1"><Icon className="w-3 h-3" />{item.label}</p>
              <p className="text-sm font-black text-white font-mono">{item.value}</p>
            </div>
          );
        })}
        <div className="rounded-xl px-2.5 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[9px] uppercase tracking-wider text-white/35">Plateformes</p>
          <p className="text-sm font-black text-white font-mono">{overview?.integrations?.length || 0}</p>
        </div>
      </div>
    </section>
  );
}