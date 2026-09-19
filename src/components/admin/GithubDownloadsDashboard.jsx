import React, { useState, useEffect, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Download, RefreshCw, TrendingUp, Package, AlertCircle, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CHART_COLORS = ["#a855f7", "#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#84cc16"];

function formatNumber(n) {
  if (n === 0) return "0";
  if (n < 1000) return n.toString();
  if (n < 1000000) return (n / 1000).toFixed(1) + "K";
  return (n / 1000000).toFixed(1) + "M";
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function GithubDownloadsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await base44.functions.invoke("githubReleases", {});
      setData(resp?.data || resp);
    } catch (err) {
      setError(err?.message || "Impossible de récupérer les données GitHub.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="w-5 h-5 animate-spin text-white/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 p-6 text-center" style={{ background: "rgba(239,68,68,0.05)" }}>
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-400" />
        <p className="text-sm text-red-300">{error}</p>
        <button onClick={loadData} className="mt-3 px-4 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "#a855f7" }}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) return null;

  const chartData = (data.versions || [])
    .filter((v) => v.download_count > 0)
    .sort((a, b) => b.download_count - a.download_count)
    .slice(0, 10)
    .map((v) => ({ name: v.tag, downloads: v.download_count }));

  // Find latest version and its primary download asset (setup.exe)
  const latestVersion = (data.versions || []).find((v) => v.tag === data.latest_version);
  const latestAsset = latestVersion?.assets?.find((a) => a.name?.endsWith("-setup.exe") || a.name?.endsWith(".exe")) || latestVersion?.assets?.[0] || null;

  return (
    <div className="space-y-4">
      {/* Header + refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-black text-white uppercase">Téléchargements Desktop</h2>
        </div>
        <button onClick={loadData} className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:opacity-80 tap-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <RefreshCw className="w-3.5 h-3.5 text-white/50" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <Download className="w-4 h-4 mb-1.5 text-purple-400" />
          <p className="text-[10px] text-white/40 uppercase">Total</p>
          <p className="text-xl font-black text-white">{formatNumber(data.total_downloads)}</p>
        </div>
        <div className="p-3 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <Package className="w-4 h-4 mb-1.5 text-blue-400" />
          <p className="text-[10px] text-white/40 uppercase">Versions</p>
          <p className="text-xl font-black text-white">{data.release_count}</p>
        </div>
        <div className="p-3 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <TrendingUp className="w-4 h-4 mb-1.5 text-emerald-400" />
          <p className="text-[10px] text-white/40 uppercase">Dernière version</p>
          <p className="text-sm font-black text-white truncate">{data.latest_version || "—"}</p>
        </div>
        <div className="p-3 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(245,158,11,0.15)" }}>
          <Package className="w-4 h-4 mb-1.5 text-amber-400" />
          <p className="text-[10px] text-white/40 uppercase">Publiée le</p>
          <p className="text-sm font-black text-white">{formatDate(data.latest_published_at)}</p>
        </div>
      </div>

      {/* Latest version download */}
      {latestAsset && (
        <div className="rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3" style={{ background: "rgba(168,85,247,0.06)", borderColor: "rgba(168,85,247,0.25)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
            <Download className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/40 uppercase">Dernière version — {data.latest_version}</p>
            <p className="text-sm font-bold text-white truncate">{latestAsset.name}</p>
            <p className="text-[10px] text-white/40">{formatSize(latestAsset.size)} · {formatDate(latestVersion.published_at)}</p>
          </div>
          <a
            href={latestAsset.download_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm shrink-0"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger
          </a>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(15,10,25,0.6)" }}>
          <h3 className="text-xs font-bold text-white/60 uppercase mb-3">Téléchargements par version (Top 10)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} angle={-25} textAnchor="end" height={50} interval={0} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} tickFormatter={formatNumber} />
              <Tooltip
                cursor={{ fill: "rgba(168,85,247,0.08)" }}
                contentStyle={{ background: "rgba(15,10,25,0.95)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "0.75rem", fontSize: "12px" }}
                labelStyle={{ color: "#fff", fontWeight: 700 }}
                formatter={(value) => [formatNumber(value) + " téléchargements", ""]}
              />
              <Bar dataKey="downloads" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(15,10,25,0.6)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-white/40 uppercase border-b border-white/10">
                <th className="px-3 py-2.5 font-bold">Version</th>
                <th className="px-3 py-2.5 font-bold">Date</th>
                <th className="px-3 py-2.5 font-bold">Asset</th>
                <th className="px-3 py-2.5 font-bold text-right">Téléchargements</th>
              </tr>
            </thead>
            <tbody>
              {(data.versions || []).filter((v) => !v.draft).map((version) => (
                <React.Fragment key={version.tag}>
                  <tr className="border-b border-white/5" style={{ background: "rgba(168,85,247,0.04)" }}>
                    <td className="px-3 py-2 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        {version.tag}
                        {version.prerelease && <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold text-amber-300" style={{ background: "rgba(245,158,11,0.15)" }}>PRE</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-white/50">{formatDate(version.published_at)}</td>
                    <td className="px-3 py-2 text-white/40 italic">— Total version —</td>
                    <td className="px-3 py-2 text-right font-black text-purple-300">{formatNumber(version.download_count)}</td>
                  </tr>
                  {version.assets.map((asset) => (
                    <tr key={asset.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-3 py-1.5"></td>
                      <td className="px-3 py-1.5"></td>
                      <td className="px-3 py-1.5 truncate max-w-[200px]">
                        <a href={asset.download_url} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 inline-flex items-center gap-1 transition">
                          {asset.name}
                          <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                        </a>
                      </td>
                      <td className="px-3 py-1.5 text-right text-white/60">{formatNumber(asset.download_count)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}