import React, { useState } from "react";
import { ExternalLink, Hash, Loader2, RefreshCw, Users } from "lucide-react";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

export default function DiscordConnectCard({ config, busy, refreshing, onInvite, onRefreshGuilds, onSelectGuild, onCreate }) {
  const [name, setName] = useState("");
  const [serverId, setServerId] = useState("");
  const guilds = config?.discord?.guilds || [];
  const selected = config?.discord?.guildId || "";

  return (
    <section className="rounded-2xl p-5" style={{ background: "rgba(18,9,28,0.8)", border: "1px solid rgba(88,101,242,0.45)", boxShadow: "0 0 24px rgba(88,101,242,0.12)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(88,101,242,0.18)", border: "1px solid rgba(88,101,242,0.5)" }}>
          <Hash className="w-5 h-5" style={{ color: "#818cf8" }} />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">Connecter Discord</h2>
          <p className="text-[11px] text-white/40">Invite le bot Matrix, puis choisis le serveur cible.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onInvite}
          disabled={busy}
          className="h-10 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 transition disabled:opacity-40 tap-sm"
          style={{ background: "linear-gradient(135deg, #5865f2, #4338ca)" }}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          Inviter le bot Matrix
        </button>
        <button
          type="button"
          onClick={onRefreshGuilds}
          disabled={refreshing}
          className="h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-40 tap-sm"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Actualiser mes serveurs
        </button>
      </div>

      {guilds.length > 0 && (
        <div className="mt-4">
          <BotLabel>Serveur Discord cible</BotLabel>
          <div className="space-y-1.5">
            {guilds.map((guild) => {
              const active = guild.id === selected;
              return (
                <button
                  key={guild.id}
                  type="button"
                  onClick={() => onSelectGuild(guild.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition tap-sm"
                  style={active
                    ? { background: "rgba(88,101,242,0.18)", border: "1px solid rgba(88,101,242,0.6)" }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {guild.icon ? (
                    <img src={guild.icon} alt={guild.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(88,101,242,0.2)" }}>
                      <Hash className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
                    </div>
                  )}
                  <span className="text-xs font-bold text-white truncate flex-1">{guild.name}</span>
                  <span className="text-[10px] text-white/40 flex items-center gap-1 shrink-0">
                    <Users className="w-3 h-3" />{guild.member_count || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[10px] text-white/30">Bot Discord non configuré ? Associe ton serveur manuellement.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom du serveur" className={fieldClass} style={fieldStyle} />
          <input value={serverId} onChange={(event) => setServerId(event.target.value)} placeholder="ID du serveur (facultatif)" className={fieldClass} style={fieldStyle} />
        </div>
        <button
          type="button"
          disabled={busy || name.trim().length < 2}
          onClick={() => onCreate({ channel_name: name, channel_id: serverId })}
          className="h-10 px-4 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition disabled:opacity-40 tap-sm"
          style={{ background: "linear-gradient(135deg, #5865f2, #4338ca)" }}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
          Associer ce serveur
        </button>
      </div>
    </section>
  );
}