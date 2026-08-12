import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Search, Ban, MicOff, Mic, CheckCircle2, Coins, Zap, X, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminUserList({ users, onRefresh }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(null);
  const [trixInput, setTrixInput] = useState({});
  const [boostInput, setBoostInput] = useState({});
  const [muteReason, setMuteReason] = useState("");
  const [banReason, setBanReason] = useState("");

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.pseudo?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMute = async (u) => {
    setLoading(`mute_${u.id}`);
    try {
      await base44.entities.User.update(u.id, {
        is_muted: !u.is_muted,
        mute_reason: !u.is_muted ? (muteReason || "Non spécifié") : "",
        muted_until: null,
      });
      toast.success(!u.is_muted ? "Utilisateur muté" : "Utilisateur démuté");
      onRefresh();
    } catch { toast.error("Erreur"); }
    setLoading(null);
  };

  const toggleBan = async (u) => {
    setLoading(`ban_${u.id}`);
    try {
      await base44.entities.User.update(u.id, {
        is_banned: !u.is_banned,
        ban_reason: !u.is_banned ? (banReason || "Non spécifié") : "",
        banned_until: null,
      });
      toast.success(!u.is_banned ? "Utilisateur banni" : "Utilisateur débanni");
      onRefresh();
    } catch { toast.error("Erreur"); }
    setLoading(null);
  };

  const addTokens = async (u, type) => {
    const amount = type === "trix" ? parseInt(trixInput[u.id] || "0") : parseInt(boostInput[u.id] || "0");
    if (!amount || amount === 0) { toast.error("Entrez un montant"); return; }
    setLoading(`token_${u.id}`);
    try {
      if (type === "trix") {
        const newBalance = (u.trix_balance || 0) + amount;
        await base44.entities.User.update(u.id, { trix_balance: newBalance });
        await base44.entities.TrixTransaction.create({
          user_email: u.email,
          type: "admin_grant",
          amount,
          description: `Ajout admin: ${amount} Trix`,
        });
      } else {
        const newBoosts = (u.flash_boosts || 0) + amount;
        await base44.entities.User.update(u.id, { flash_boosts: newBoosts });
      }
      toast.success(`${amount > 0 ? "+" : ""}${amount} ${type === "trix" ? "Trix" : "Flash Boosts"}`);
      onRefresh();
    } catch { toast.error("Erreur"); }
    setLoading(null);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
      <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-white">Utilisateurs ({filtered.length})</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par email, pseudo, nom..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
        {filtered.map(u => (
          <div key={u.id} className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: u.is_banned ? "2px solid #ef4444" : u.is_muted ? "2px solid #f59e0b" : "1px solid rgba(255,255,255,0.1)" }}>
                {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-secondary text-white">{u.full_name?.[0]?.toUpperCase() || "U"}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white truncate">{u.pseudo || u.full_name || "Sans nom"}{u.pseudo_tag ? `#${u.pseudo_tag}` : ""}</p>
                  {u.role === "admin" && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc" }}>ADMIN</span>}
                  {u.is_banned && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}>BANNI</span>}
                  {u.is_muted && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: "rgba(245,158,11,0.2)", color: "#fbbf24" }}>MUTÉ</span>}
                </div>
                <p className="text-[10px] text-white/40 truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono shrink-0">
                <Coins className="w-3 h-3" style={{ color: "#f59e0b" }} />{u.trix_balance || 0}
                <Zap className="w-3 h-3 ml-1" style={{ color: "#a855f7" }} />{u.flash_boosts || 0}
              </div>
              <button onClick={() => setExpanded(expanded === u.id ? null : u.id)} className="w-7 h-7 rounded-lg flex items-center justify-center transition" style={{ background: "rgba(255,255,255,0.05)" }}>
                {expanded === u.id ? <ChevronUp className="w-3.5 h-3.5 text-white/50" /> : <ChevronDown className="w-3.5 h-3.5 text-white/50" />}
              </button>
            </div>

            {expanded === u.id && (
              <div className="px-3 pb-4 space-y-3">
                {/* Actions: Mute / Ban */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleMute(u)}
                    disabled={loading === `mute_${u.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-40"
                    style={{ background: u.is_muted ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", color: u.is_muted ? "#4ade80" : "#fbbf24", border: `1px solid ${u.is_muted ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}` }}
                  >
                    {u.is_muted ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                    {u.is_muted ? "Démuter" : "Muter"}
                  </button>
                  <button
                    onClick={() => toggleBan(u)}
                    disabled={loading === `ban_${u.id}` || u.role === "admin"}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-40"
                    style={{ background: u.is_banned ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: u.is_banned ? "#4ade80" : "#f87171", border: `1px solid ${u.is_banned ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}
                  >
                    {u.is_banned ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                    {u.is_banned ? "Débannir" : "Bannir"}
                  </button>
                </div>

                {/* Reason inputs */}
                {!u.is_muted && (
                  <input
                    value={muteReason}
                    onChange={e => setMuteReason(e.target.value)}
                    placeholder="Raison du mute (optionnel)"
                    className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder:text-white/30 outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,158,11,0.2)" }}
                  />
                )}
                {!u.is_banned && (
                  <input
                    value={banReason}
                    onChange={e => setBanReason(e.target.value)}
                    placeholder="Raison du ban (optionnel)"
                    className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder:text-white/30 outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(239,68,68,0.2)" }}
                  />
                )}

                {/* Add tokens */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
                    <p className="text-[10px] font-bold text-white/50 mb-1.5 flex items-center gap-1"><Coins className="w-3 h-3" style={{ color: "#f59e0b" }} /> Trix</p>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={trixInput[u.id] || ""}
                        onChange={e => setTrixInput(s => ({ ...s, [u.id]: e.target.value }))}
                        placeholder="± montant"
                        className="flex-1 w-full px-2 py-1.5 rounded-lg text-xs text-white placeholder:text-white/30 outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                      />
                      <button
                        onClick={() => addTokens(u, "trix")}
                        disabled={loading === `token_${u.id}`}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-80 disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
                      >
                        {loading === `token_${u.id}` ? "..." : "OK"}
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl" style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)" }}>
                    <p className="text-[10px] font-bold text-white/50 mb-1.5 flex items-center gap-1"><Zap className="w-3 h-3" style={{ color: "#a855f7" }} /> Boosts</p>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={boostInput[u.id] || ""}
                        onChange={e => setBoostInput(s => ({ ...s, [u.id]: e.target.value }))}
                        placeholder="± montant"
                        className="flex-1 w-full px-2 py-1.5 rounded-lg text-xs text-white placeholder:text-white/30 outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                      />
                      <button
                        onClick={() => addTokens(u, "boost")}
                        disabled={loading === `token_${u.id}`}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-80 disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
                      >
                        {loading === `token_${u.id}` ? "..." : "OK"}
                      </button>
                    </div>
                  </div>
                </div>

                {(u.mute_reason || u.ban_reason) && (
                  <div className="text-[10px] text-white/40 space-y-0.5">
                    {u.mute_reason && <p>🔇 Raison du mute: {u.mute_reason}</p>}
                    {u.ban_reason && <p>🚫 Raison du ban: {u.ban_reason}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-white/30">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}