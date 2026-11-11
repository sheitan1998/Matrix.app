import React, { useEffect, useState } from "react";
import { Bot, Hash, Twitch, Youtube } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import useBotIntegrations from "@/hooks/useBotIntegrations";
import WorkerEndpoints from "@/components/live/bot/WorkerEndpoints";
import TwitchBotTab from "@/components/live/bot/TwitchBotTab";
import YouTubeBotTab from "@/components/live/bot/YouTubeBotTab";
import DiscordBotTab from "@/components/live/bot/DiscordBotTab";

const TABS = [
  { key: "twitch", label: "Twitch", icon: Twitch, color: "#a855f7" },
  { key: "youtube", label: "YouTube", icon: Youtube, color: "#ef4444" },
  { key: "discord", label: "Discord", icon: Hash, color: "#818cf8" },
];

export default function BotSettings() {
  const { integrations, loading, reload } = useBotIntegrations();
  const [tab, setTab] = useState("twitch");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
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

  const byPlatform = (platform) => integrations.find((item) => item.platform === platform) || null;

  const call = async (payload) => {
    const res = await base44.functions.invoke("botConfig", payload);
    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  };

  const toggleEnabled = async (integration, enabled) => {
    if (enabled && !window.confirm("Le bot peut supprimer des messages et exclure des spectateurs sur cette chaîne. Activer ?")) return;
    setBusy(true);
    try {
      await call({ action: "setEnabled", id: integration.id, enabled });
      await reload();
      toast.success(enabled ? "Bot activé" : "Bot désactivé");
    } catch {
      toast.error("Impossible de changer l'état du bot.");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async (integration) => {
    if (!window.confirm("Déconnecter cette chaîne ? Les jetons d'accès seront supprimés.")) return;
    setBusy(true);
    try {
      await call({ action: "disconnect", id: integration.id });
      await reload();
      toast.success("Chaîne déconnectée");
    } catch {
      toast.error("Déconnexion impossible.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (integration) => {
    if (!window.confirm("Supprimer définitivement cette intégration et ses réglages ?")) return;
    setBusy(true);
    try {
      await call({ action: "remove", id: integration.id });
      await reload();
      toast.success("Intégration supprimée");
    } catch {
      toast.error("Suppression impossible.");
    } finally {
      setBusy(false);
    }
  };

  const save = async (integration, settings) => {
    setSaving(true);
    try {
      await call({ action: "saveSettings", id: integration.id, patch: settings });
      await reload();
      toast.success("Réglages enregistrés, le worker les applique sous 30 secondes");
    } catch {
      toast.error("Enregistrement impossible.");
    } finally {
      setSaving(false);
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

  const createDiscord = async (payload) => {
    setBusy(true);
    try {
      await call({ action: "createDiscord", ...payload });
      await reload();
      toast.success("Serveur Discord enregistré");
    } catch {
      toast.error("Enregistrement impossible. Vérifie le nom du serveur.");
    } finally {
      setBusy(false);
    }
  };

  const common = { busy, saving, onConnect: connect, onRemove: remove };
  const twitch = byPlatform("twitch");
  const youtube = byPlatform("youtube");
  const discord = byPlatform("discord");

  return (
    <div className="min-h-screen" style={{ background: "transparent" }}>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
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
                {...common}
                onEnable={(enabled) => toggleEnabled(twitch, enabled)}
                onDisconnect={() => disconnect(twitch)}
                onSave={(settings) => save(twitch, settings)}
              />
            )}
            {tab === "youtube" && (
              <YouTubeBotTab
                integration={youtube}
                {...common}
                onEnable={(enabled) => toggleEnabled(youtube, enabled)}
                onDisconnect={() => disconnect(youtube)}
                onSave={(settings) => save(youtube, settings)}
                onOpenTwitch={() => setTab("twitch")}
              />
            )}
            {tab === "discord" && (
              <DiscordBotTab
                integration={discord}
                busy={busy}
                saving={saving}
                onRemove={() => remove(discord)}
                onSave={(settings) => save(discord, settings)}
                onCreate={createDiscord}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}