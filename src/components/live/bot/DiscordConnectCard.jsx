import React from "react";
import { Copy, ExternalLink, Hash, Loader2, LogOut, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { BotLabel } from "./botUi";

export default function DiscordConnectCard({
  config,
  busy,
  refreshing,
  redirectUri,
  onConnectUser,
  onDisconnectUser,
  onInvite,
  onRefreshGuilds,
  onSelectGuild,
}) {
  const user = config?.discord?.user || {};
  const guilds = config?.discord?.guilds || [];
  const selected = config?.discord?.guildId || "";
  const adminGuilds = guilds.filter((guild) => guild.admin !== false);
  const usables = adminGuilds.filter((guild) => guild.bot_present);

  const copyRedirect = () => {
    navigator.clipboard.writeText(redirectUri);
    toast.success("URL de redirection copiée");
  };

  return (
    <section className="rounded-2xl p-5" style={{ background: "rgba(18,9,28,0.8)", border: "1px solid rgba(88,101,242,0.45)", boxShadow: "0 0 24px rgba(88,101,242,0.12)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(88,101,242,0.18)", border: "1px solid rgba(88,101,242,0.5)" }}>
          <Hash className="w-5 h-5" style={{ color: "#818cf8" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-black text-white">Connecter Discord</h2>
          <p className="text-[11px] text-white/40">Connecte ton compte Discord, puis choisis un serveur où tu es administrateur.</p>
        </div>
      </div>

      {user.connected ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(88,101,242,0.1)", border: "1px solid rgba(88,101,242,0.35)" }}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(88,101,242,0.3)" }}>
              <UserRound className="w-4 h-4" style={{ color: "#c7d2fe" }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.name || "Compte Discord"}</p>
            <p className="text-[10px] text-white/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {adminGuilds.length} serveur(s) administrateur
            </p>
          </div>
          <button
            type="button"
            onClick={onDisconnectUser}
            disabled={busy}
            className="h-8 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition disabled:opacity-40 tap-sm"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
          >
            <LogOut className="w-3 h-3" /> Déconnecter
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onConnectUser}
            disabled={busy}
            className="w-full h-10 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 transition disabled:opacity-40 tap-sm"
            style={{ background: "linear-gradient(135deg, #5865f2, #4338ca)" }}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserRound className="w-4 h-4" />}
            Connecter mon compte Discord
          </button>
          <button
            type="button"
            onClick={copyRedirect}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] text-white/40 hover:text-white/70 transition text-left tap-sm"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Copy className="w-3 h-3 shrink-0" />
            <span className="truncate">URL de redirection : {redirectUri}</span>
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button
          type="button"
          onClick={() => onInvite("")}
          disabled={busy}
          className="h-9 px-3 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5 transition disabled:opacity-40 tap-sm"
          style={{ background: "rgba(88,101,242,0.16)", border: "1px solid rgba(88,101,242,0.45)", color: "#c7d2fe" }}
        >
          <ExternalLink className="w-3.5 h-3.5" /> Inviter le bot Matrix
        </button>
        <button
          type="button"
          onClick={onRefreshGuilds}
          disabled={refreshing || !user.connected}
          className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition disabled:opacity-40 tap-sm"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Actualiser mes serveurs
        </button>
      </div>

      {user.connected && (
        <div className="mt-4">
          <BotLabel>Serveur Discord cible</BotLabel>
          {adminGuilds.length === 0 ? (
            <p className="text-[11px] text-white/40 rounded-xl px-3 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Aucun serveur où tu es propriétaire ou administrateur. Crée un serveur ou demande les droits, puis actualise.
            </p>
          ) : (
            <div className="space-y-1.5">
              {adminGuilds.map((guild) => {
                const active = guild.id === selected;
                const blocked = guild.bot_present !== true;
                return (
                  <div
                    key={guild.id}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
                    style={active
                      ? { background: "rgba(88,101,242,0.18)", border: "1px solid rgba(88,101,242,0.6)" }
                      : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", opacity: blocked ? 0.55 : 1 }}
                  >
                    <button
                      type="button"
                      onClick={() => !blocked && onSelectGuild(guild.id)}
                      disabled={blocked || busy}
                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left disabled:cursor-default tap-sm"
                    >
                      {guild.icon ? (
                        <img src={guild.icon} alt={guild.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(88,101,242,0.2)" }}>
                          <Hash className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
                        </div>
                      )}
                      <span className="text-xs font-bold text-white truncate flex-1">{guild.name}</span>
                      {!blocked && guild.member_count > 0 && (
                        <span className="text-[10px] text-white/40 shrink-0">{guild.member_count}</span>
                      )}
                    </button>
                    {blocked && (
                      <button
                        type="button"
                        onClick={() => onInvite(guild.id)}
                        className="h-7 px-2 rounded-lg text-[10px] font-bold shrink-0 tap-sm"
                        style={{ background: "rgba(88,101,242,0.25)", border: "1px solid rgba(88,101,242,0.5)", color: "#c7d2fe" }}
                      >
                        Inviter le bot
                      </button>
                    )}
                    {active && !blocked && <span className="text-[9px] font-black uppercase tracking-wider shrink-0" style={{ color: "#a5b4fc" }}>actif</span>}
                  </div>
                );
              })}
            </div>
          )}
          {usables.length > 0 && (
            <p className="text-[10px] text-white/30 mt-2">
              {usables.length} serveur(s) prêt(s) · les autres ont besoin de l'invitation du bot.
            </p>
          )}
        </div>
      )}
    </section>
  );
}