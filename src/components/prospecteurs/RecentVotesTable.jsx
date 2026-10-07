import React from "react";

const SOURCE_LABELS = {
  auto: { label: "AUTO", color: "#a855f7" },
  boost: { label: "BOOST", color: "#fbbf24" },
  authenticated: { label: "COMPTE", color: "#22c55e" },
  guest: { label: "INVITÉ", color: "#6b7280" },
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" })} ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function RecentVotesTable({ votes, dimmed }) {
  return (
    <div
      className={`rounded-lg overflow-hidden transition-opacity ${dimmed ? "opacity-50" : ""}`}
      style={{ border: "1px solid rgba(138,79,255,0.15)", background: "rgba(0,0,0,0.2)", backdropFilter: "blur(6px)" }}
    >
      <table className="w-full text-[10px]">
        <thead>
          <tr style={{ background: "rgba(138,79,255,0.08)" }}>
            <th className="text-left py-1.5 px-2 font-bold text-white/50 uppercase tracking-wider">Pseudo</th>
            <th className="text-left py-1.5 px-2 font-bold text-white/50 uppercase tracking-wider">Source</th>
            <th className="text-right py-1.5 px-2 font-bold text-white/50 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody>
          {votes.map((v) => {
            const src = SOURCE_LABELS[v.source] || SOURCE_LABELS.guest;
            return (
              <tr key={v.id} className="border-t" style={{ borderColor: "rgba(138,79,255,0.1)" }}>
                <td className="py-1.5 px-2 text-white/80 font-medium truncate max-w-[140px]">{v.voter_pseudo || "Anonyme"}</td>
                <td className="py-1.5 px-2">
                  <span className="inline-block px-1.5 py-0.5 rounded font-bold text-[8px]" style={{ background: `${src.color}15`, color: src.color }}>
                    {src.label}
                  </span>
                </td>
                <td className="py-1.5 px-2 text-right text-white/40 font-mono whitespace-nowrap">{formatDate(v.last_voted_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}