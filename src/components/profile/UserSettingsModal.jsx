import React, { useState, useEffect, useRef } from "react";
import { LANGUAGES, changeLanguage, getPreferredLanguage } from '@/lib/languagePreference';
import { createPortal } from "react-dom";
import { base44 } from "@/api/base44Client";
import {
  X, Bell, Gift, UserPlus, MessageSquare, Loader2,
  Globe, Clock, Shield, Check, Headphones, Gamepad2,
} from "lucide-react";
import AudioSettingsPanel from "@/components/profile/AudioSettingsPanel";
import GamePicker from "@/components/profile/GamePicker";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COMMON_TIMEZONES = [
  "UTC",
  "Europe/Paris",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Brussels",
  "Europe/Amsterdam",
  "Europe/Lisbon",
  "Europe/Zurich",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const TABS = [
  { id: "notifications", label: "Notifications", icon: Bell, color: "#3b82f6" },
  { id: "privacy", label: "Confidentialité", icon: Shield, color: "#22c55e" },
  { id: "preferences", label: "Préférences", icon: Globe, color: "#a855f7" },
  { id: "audio", label: "Audio", icon: Headphones, color: "#22d3ee" },
  { id: "activity", label: "Activité", icon: Gamepad2, color: "#f59e0b" },
];

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "w-11 h-6 rounded-full transition shrink-0 relative tap-sm",
        checked ? "bg-green-500" : "bg-white/20",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <div className={cn(
        "w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5",
        checked ? "translate-x-5" : "translate-x-0.5"
      )} />
    </button>
  );
}

function SettingRow({ icon: Icon, color, title, desc, children }) {
  return (
    <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "15" }}>
        <Icon className="w-4 h-4" style={{ color: color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function ChoicePills({ options, value, onChange, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-2 ml-12">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          disabled={disabled}
          className={cn(
            "px-3 py-2.5 rounded-xl text-xs font-bold transition",
            value === opt.value ? "text-white" : "text-white/40 hover:text-white/60"
          )}
          style={value === opt.value
            ? { background: "rgba(168,85,247,0.2)", border: "1px solid #a855f7" }
            : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function UserSettingsModal({ open, onClose, user }) {
  const [activeTab, setActiveTab] = useState("notifications");
  const [settings, setSettings] = useState({
    notif_messages: true,
    notif_free_rewards: true,
    allow_friend_requests: true,
    dm_privacy: "everyone",
    interface_language: "fr",
    timezone: "UTC",
    show_game_activity: true,
    manual_game: "",
  });
  const [savingKey, setSavingKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllTimezones, setShowAllTimezones] = useState(false);
  const settingsRef = useRef(settings);

  const updateSetting = async (key, value) => {
    if (savingKey || settingsRef.current[key] === value) return;
    const previous = settingsRef.current;
    const next = { ...previous, [key]: value };
    settingsRef.current = next;
    setSettings(next);
    setSavingKey(key);
    try {
      await base44.auth.updateMe({ [key]: value });
      if (key === 'interface_language') changeLanguage(value);
      if (key === 'notif_messages') localStorage.setItem('matrix_notif_messages', String(value));
      window.dispatchEvent(new Event('matrix-settings-updated'));
      toast.success('Paramètre mis à jour');
    } catch {
      settingsRef.current = previous;
      setSettings(previous);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSavingKey(null);
    }
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    base44.auth.me().then(current => {
      if (cancelled) return;
      const next = {
        notif_messages: current.notif_messages !== false,
        notif_free_rewards: current.notif_free_rewards !== false,
        allow_friend_requests: current.allow_friend_requests !== false,
        dm_privacy: current.dm_privacy || 'everyone',
        interface_language: current.interface_language || getPreferredLanguage(),
        timezone: current.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        show_game_activity: current.show_game_activity !== false,
        manual_game: current.manual_game || '',
      };
      settingsRef.current = next;
      setSettings(next);
      localStorage.setItem('matrix_notif_messages', String(next.notif_messages));
    }).catch(() => { if (!cancelled) toast.error('Impossible de charger les paramètres'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const allTimezones = showAllTimezones
    ? Intl.supportedValuesOf?.("timeZone") || COMMON_TIMEZONES
    : COMMON_TIMEZONES;
  const timezones = allTimezones.includes(settings.timezone) ? allTimezones : [settings.timezone, ...allTimezones];

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: "#18191c", border: "1px solid rgba(168,85,247,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)" }}>
              <Bell className="w-4 h-4" style={{ color: "#a855f7" }} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Paramètres</h2>
              <p className="text-[10px] text-white/40">Gérez vos préférences</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {savingKey && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition relative",
                  active ? "text-white" : "text-white/40 hover:text-white/60"
                )}
              >
                <TabIcon className="w-3.5 h-3.5" style={{ color: active ? tab.color : undefined }} />
                {tab.label}
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ background: tab.color }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-3">
          {loading && <p className="text-xs text-white/50">Chargement des paramètres…</p>}

          {/* ===== NOTIFICATIONS TAB ===== */}
          {activeTab === "notifications" && (
            <>
              <SettingRow
                icon={Bell}
                color="#3b82f6"
                title="Notifications de messages"
                desc="Recevoir des alertes quand vous recevez un nouveau message privé ou dans un serveur."
              >
                <Toggle
                  checked={settings.notif_messages}
                  onChange={(v) => updateSetting("notif_messages", v)}
                  disabled={loading || !!savingKey || savingKey === "notif_messages"}
                />
              </SettingRow>

              <SettingRow
                icon={Gift}
                color="#fbbf24"
                title="Rappels de récompenses gratuites"
                desc="Autoriser les rappels de récompenses gratuites lorsqu'ils sont disponibles."
              >
                <Toggle
                  checked={settings.notif_free_rewards}
                  onChange={(v) => updateSetting("notif_free_rewards", v)}
                  disabled={loading || !!savingKey || savingKey === "notif_free_rewards"}
                />
              </SettingRow>
            </>
          )}

          {/* ===== PRIVACY & SOCIAL TAB ===== */}
          {activeTab === "privacy" && (
            <>
              <SettingRow
                icon={UserPlus}
                color="#22c55e"
                title="Demandes d'amis"
                desc="Autoriser les autres utilisateurs à vous ajouter en tant qu'ami. Si désactivé, votre profil n'apparaîtra pas dans les résultats de recherche d'amis."
              >
                <Toggle
                  checked={settings.allow_friend_requests}
                  onChange={(v) => updateSetting("allow_friend_requests", v)}
                  disabled={loading || !!savingKey || savingKey === "allow_friend_requests"}
                />
              </SettingRow>

              <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
                    <MessageSquare className="w-4 h-4" style={{ color: "#a855f7" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">Réception des messages</p>
                    <p className="text-xs text-white/40 mt-0.5">Choisissez qui peut vous envoyer des messages privés.</p>
                  </div>
                </div>
                <ChoicePills
                  options={[
                    { value: "everyone", label: "Tout le monde" },
                    { value: "friends", label: "Amis uniquement" },
                  ]}
                  value={settings.dm_privacy}
                  disabled={loading || !!savingKey}
                  onChange={(v) => updateSetting("dm_privacy", v)}
                />
              </div>
            </>
          )}

          {/* ===== AUDIO TAB ===== */}
          {activeTab === "audio" && (
            <AudioSettingsPanel />
          )}

          {/* ===== ACTIVITY TAB ===== */}
          {activeTab === "activity" && (
            <>
              <SettingRow
                icon={Gamepad2}
                color="#f59e0b"
                title="Afficher mon activité de jeu"
                desc="Partagez en temps réel le jeu auquel vous jouez (détection automatique ou manuelle) avec les membres de vos serveurs et sur votre profil."
              >
                <Toggle
                  checked={settings.show_game_activity}
                  onChange={(v) => updateSetting("show_game_activity", v)}
                  disabled={loading || !!savingKey}
                />
              </SettingRow>

              <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.15)" }}>
                    <Gamepad2 className="w-4 h-4" style={{ color: "#f59e0b" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">Jeu en cours</p>
                    <p className="text-xs text-white/40 mt-0.5">Définissez manuellement le jeu auquel vous jouez. Ce champ surcharge la détection automatique. Laissez vide pour utiliser la détection automatique.</p>
                  </div>
                </div>
                <div className="ml-12">
                  <GamePicker
                    value={settings.manual_game}
                    onChange={(val) => {
                      setSettings(prev => ({ ...prev, manual_game: val }));
                      updateSetting("manual_game", val.trim());
                    }}
                    disabled={!settings.show_game_activity || loading || !!savingKey}
                  />
                </div>
                {!settings.show_game_activity && (
                  <p className="ml-12 mt-2 text-[10px] text-white/30">Activez « Afficher mon activité de jeu » pour configurer un jeu manuel.</p>
                )}
              </div>
            </>
          )}

          {/* ===== PREFERENCES TAB ===== */}
          {activeTab === "preferences" && (
            <>
              <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
                    <Globe className="w-4 h-4" style={{ color: "#a855f7" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">Langue de l'interface</p>
                    <p className="text-xs text-white/40 mt-0.5">Choisissez la langue d'affichage de MATRIX.</p>
                  </div>
                </div>
                <div className="ml-12 grid grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => updateSetting("interface_language", lang.code)}
                      disabled={loading || !!savingKey}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition",
                        settings.interface_language === lang.code ? "text-white" : "text-white/40 hover:text-white/60"
                      )}
                      style={settings.interface_language === lang.code
                        ? { background: "rgba(168,85,247,0.2)", border: "1px solid #a855f7" }
                        : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <span>{lang.flag}</span>
                      <span className="truncate">{lang.label}</span>
                      {settings.interface_language === lang.code && (
                        <Check className="w-3 h-3 ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                    <Clock className="w-4 h-4" style={{ color: "#3b82f6" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">Fuseau horaire</p>
                    <p className="text-xs text-white/40 mt-0.5">Définit l'heure utilisée pour les rappels de récompenses et l'affichage des horodatages.</p>
                  </div>
                </div>
                <div className="ml-12">
                  <select
                    value={settings.timezone}
                    disabled={loading || !!savingKey}
                    onChange={(e) => updateSetting("timezone", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.3)" }}
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz} style={{ background: "#18191c", color: "#fff" }}>{tz}</option>
                    ))}
                  </select>
                  {!showAllTimezones && (
                    <button
                      onClick={() => setShowAllTimezones(true)}
                      className="mt-2 text-[10px] text-white/40 hover:text-white/60 transition"
                    >
                      Voir tous les fuseaux horaires ({Intl.supportedValuesOf?.("timeZone")?.length || 400}+)
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-80 tap-sm"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
          >
            Terminé
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}