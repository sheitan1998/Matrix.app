import React, { useEffect, useState } from "react";
import { Bot, Hash, Twitch, Youtube } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import useBotIntegrations from "@/hooks/useBotIntegrations";
import useBotOverview from "@/hooks/useBotOverview";
import WorkerEndpoints from "@/components/live/bot/WorkerEndpoints";
import WorkerStatusBar from "@/components/live/bot/WorkerStatusBar";
import TwitchBotTab from "@/components/live/bot/TwitchBotTab";
import YouTubeBotTab from "@/components/live/bot/YouTubeBotTab";
import DiscordBotTab from "@/components/live/bot/DiscordBotTab";
import { discordErrorMessage } from "@/lib/discordErrors";

const TABS = [
  { key: "twitch", label: "Twitch", icon: Twitch, color: "#a855f7" },
  { key: "youtube", label: "YouTube", icon: Youtube, color: "#ef4444" },
  { key: "discord", label: "Discord", icon: Hash, color: "#818cf8" },
];

export default function BotSettings() {
  const { user } = useAuth();
  const { integrations, config, loading, reload } = useBotIntegrations();
  const { overview, reloadOverview } = useBotOverview();
  const [tab, setTab] = useState("twitch");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshingGuilds, setRefreshingGuilds] = useState(false);
  const [refreshingId, setRefreshingId] = useState("");
  const [publishingKey, setPublishingKey] = useState("");
  const redirectUri = `${window.location.origin}/live-bot`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code) {
      setTab("discord");
      window.history.replaceState({}, "", "/live-bot");
      (async () => {
        setBusy(true);
        try {
          const res = await base44.functions.invoke("discordOAuth", { action: "callback", code, state, redirectUri });
          if (res.data?.error) throw new Error(res.data.error);
          await Promise.all([reload(), reloadOverview()]);
          const name = res.data?.user?.name ? ` (${res.data.user.name})` : "";
          toast.success(`Compte Discord connecté${name} · ${res.data?.guilds?.length || 0} serveur(s) administrateur`);
        } catch (error) {
          toast.error(discordErrorMessage(error?.response?.data?.error || error?.message));
        } finally {
          setBusy(false);
        }
      })();
      return;
    }

    const connected = params.get("connected");
    const error = params.get("error");
    if (connected) {
      setTab(connected);
      toast.success(`Chaîne ${connected} connectée. Le worker prend le relais dans quelques secondes.`);
      window.history.replaceState({}, "", "/live-bot");
    } else if (error) {
      toast.error(`Connexion impossible : ${error.replace(/_/g, " ")}`);
      window.history.replaceState({}, "", "/live-bot");
    }
  }, []);

  if (user && user.role !== "admin") return <Navigate to="/" replace />;

  const byPlatform = (platform) => integrations.find((item) => item.platform === platform) || null;

  const call = async (payload) => {
    const res = await base44.functions.invoke("botConfig", payload);
    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  };

  const refreshAll = async () => {
    await Promise.all([reload(), reloadOverview()]);
  };

  const togglePause = async (paused) => {
    setBusy(true);
    try {
      await call({ action: "setPaused", paused });
      await refreshAll();
      toast.success(paused ? "Bot mis en pause sur toutes les plateformes" : "Bot activé, le worker relance les connexions");
    } catch {
      toast.error("Impossible de changer l'état du bot.");
    } finally {
      setBusy(false);
    }
  };

  const testBot = async () => {
    setBusy(true);
    try {
      const res = await call({ action: "test" });
      await refreshAll();
      if (res.count > 0) toast.success(`Message de test demandé sur ${res.count} plateforme(s)`);
      else toast.error("Aucune plateforme active : connecte Twitch ou YouTube d'abord.");
    } catch {
      toast.error("Test impossible pour le moment.");
    } finally {
      setBusy(false);
    }
  };

  const save = async (integration, settings) => {
    if (!integration) return;
    setSaving(true);
    try {
      await call({ action: "saveSettings", id: integration.id, patch: settings });
      await refreshAll();
      toast.success("Configuration enregistrée — le worker l'applique sous 30 secondes");
    } catch {
      toast.error("Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const disconnect = async (integration) => {
    if (!integration || !window.confirm("Déconnecter cette chaîne ? Les jetons d'accès seront supprimés.")) return;
    setBusy(true);
    try {
      await call({ action: "disconnect", id: integration.id });
      await refreshAll();
      toast.success("Chaîne déconnectée");
    } catch {
      toast.error("Déconnexion impossible.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (integration) => {
    if (!integration || !window.confirm("Supprimer définitivement cette intégration et ses réglages ?")) return;
    setBusy(true);
    try {
      await call({ action: "remove", id: integration.id });
      await refreshAll();
      toast.success("Intégration supprimée");
    } catch {
      toast.error("Suppression impossible.");
    } finally {
      setBusy(false);
    }
  };

  const connect = async (payload) => {
    setBusy(true);
    try {
      const res = await base44.functions.invoke("botOAuth", payload);
      if (!res.data?.url) throw new Error(res.data?.error || "oauth_unavailable");
      window.location.href = res.data.url;
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Connexion impossible";
      toast.error(`Connexion impossible : ${message}`);
      setBusy(false);
    }
  };

  const refreshLive = async (integration) => {
    if (!integration) return;
    setRefreshingId(integration.id);
    try {
      const res = await call({ action: "refreshLive", id: integration.id });
      await refreshAll();
      toast.success(res.live ? `Live détecté${res.title ? ` : ${res.title}` : ""}` : "Aucun live en cours détecté");
    } catch (error) {
      toast.error(`Détection impossible : ${error.message}`);
    } finally {
      setRefreshingId("");
    }
  };

  const callDiscord = async (payload, retry = true) => {
    try {
      const res = await base44.functions.invoke("botDiscord", payload);
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    } catch (error) {
      const code = error?.response?.data?.error || error?.message;
      if (retry && code === "user_token_expired") {
        await base44.functions.invoke("discordOAuth", { action: "refresh" });
        return callDiscord(payload, false);
      }
      throw error;
    }
  };

  const callDiscordOAuth = async (payload) => {
    const res = await base44.functions.invoke("discordOAuth", payload);
    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  };

  const discordFailure = (error) => error?.response?.data?.error || error?.message || "discord_error";

  const connectDiscordUser = async () => {
    setBusy(true);
    try {
      const res = await callDiscordOAuth({ action: "authUrl", redirectUri });
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      throw new Error("discord_oauth_non_configure");
    } catch (error) {
      toast.error(discordErrorMessage(discordFailure(error)));
      setBusy(false);
    }
  };

  const disconnectDiscordUser = async () => {
    if (!window.confirm("Déconnecter ton compte Discord ? Les serveurs administrateur ne seront plus listés.")) return;
    setBusy(true);
    try {
      await callDiscordOAuth({ action: "disconnectUser" });
      await refreshAll();
      toast.success("Compte Discord déconnecté");
    } catch (error) {
      toast.error(discordErrorMessage(discordFailure(error)));
    } finally {
      setBusy(false);
    }
  };

  const inviteDiscord = async (guildId) => {
    setBusy(true);
    try {
      const res = await callDiscord({ action: "invite", guildId });
      if (res.url) window.open(res.url, "_blank", "noopener,noreferrer");
      toast.success(guildId ? "Invitation du bot ouverte pour ce serveur" : "Lien d'invitation Discord ouvert");
    } catch (error) {
      toast.error(discordErrorMessage(discordFailure(error)));
    } finally {
      setBusy(false);
    }
  };

  const refreshGuilds = async () => {
    setRefreshingGuilds(true);
    try {
      const res = await callDiscord({ action: "servers" });
      await refreshAll();
      toast.success(`${res.guilds?.length || 0} serveur(s) administrateur`);
    } catch (error) {
      toast.error(discordErrorMessage(discordFailure(error)));
    } finally {
      setRefreshingGuilds(false);
    }
  };

  const selectGuild = async (guildId) => {
    setBusy(true);
    try {
      await call({ action: "selectDiscordServer", guildId });
      await refreshAll();
      toast.success("Serveur Discord associé au bot");
    } catch (error) {
      toast.error(discordErrorMessage(discordFailure(error)));
    } finally {
      setBusy(false);
    }
  };

  const publishPanel = async (panelKey, panel) => {
    const integration = byPlatform("discord");
    if (!integration?.channel_id) {
      toast.error("Choisis d'abord un serveur Discord.");
      return;
    }
    setPublishingKey(panelKey);
    try {
      await callDiscord({ action: "publishPanel", guildId: integration.channel_id, panelKey, panel });
      await refreshAll();
      toast.success("Panneau publié sur Discord");
    } catch (error) {
      toast.error(discordErrorMessage(discordFailure(error)), {
        description: "Vérifie que le bot a « Voir le salon », « Envoyer des messages » et « Intégrer des liens » dans ce salon.",
      });
    } finally {
      setPublishingKey("");
    }
  };

  const twitch = byPlatform("twitch");
  const youtube = byPlatform("youtube");
  const discord = byPlatform("discord");

  return (
    <div className="min-h-screen" style={{ background: "transparent" }}>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
        <header className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(168,85,247,0.16)", border: "1px solid rgba(168,85,247,0.4)", boxShadow: "0 0 20px rgba(168,85,247,0.25)" }}
          >
            <Bot className="w-5 h-5" style={{ color: "#c084fc" }} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Matrix Live · Bot</h1>
            <p className="text-[11px] text-white/40">
              Configure ton bot Twitch, YouTube et Discord. Les réglages sont lus par le worker en continu.
            </p>
          </div>
        </header>

        <WorkerStatusBar overview={overview} busy={busy} onPause={togglePause} onTest={testBot} />

        <WorkerEndpoints />

        <div className="flex items-center gap-1.5 p-1 rounded-2xl overflow-x-auto no-scrollbar" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.18)" }}>
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            const integration = byPlatform(item.key);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className="flex-1 min-w-[110px] h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition tap-sm"
                style={active
                  ? { background: `linear-gradient(135deg, ${item.color}, #6d28d9)`, color: "#fff", boxShadow: `0 0 16px ${item.color}40` }
                  : { color: "rgba(255,255,255,0.5)" }}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {integration?.is_live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-live-pulse" />}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 rounded-2xl animate-pulse" style={{ background: "rgba(168,85,247,0.06)" }} />
            ))}
          </div>
        ) : (
          <>
            {tab === "twitch" && (
              <TwitchBotTab
                integration={twitch}
                busy={busy}
                saving={saving}
                onConnect={connect}
                onDisconnect={() => disconnect(twitch)}
                onRemove={() => remove(twitch)}
                onSave={(settings) => save(twitch, settings)}
              />
            )}
            {tab === "youtube" && (
              <YouTubeBotTab
                integration={youtube}
                busy={busy}
                saving={saving}
                onConnect={connect}
                onDisconnect={() => disconnect(youtube)}
                onRemove={() => remove(youtube)}
                onSave={(settings) => save(youtube, settings)}
                onRefreshLive={() => refreshLive(youtube)}
                refreshing={refreshingId === youtube?.id}
              />
            )}
            {tab === "discord" && (
              <DiscordBotTab
                integration={discord}
                config={config}
                busy={busy}
                saving={saving}
                refreshingGuilds={refreshingGuilds}
                publishingKey={publishingKey}
                redirectUri={redirectUri}
                onSave={(settings) => save(discord, settings)}
                onRemove={() => remove(discord)}
                onInvite={inviteDiscord}
                onRefreshGuilds={refreshGuilds}
                onSelectGuild={selectGuild}
                onConnectUser={connectDiscordUser}
                onDisconnectUser={disconnectDiscordUser}
                onPublish={publishPanel}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}