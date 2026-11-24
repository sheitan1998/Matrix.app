import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { DEFAULT_SOUND_ID, getPreset, playReminderLoop, stopReminderLoop } from "@/lib/reminderSounds";
import {
  MAX_TIMEOUT_MS,
  clearSchedule,
  normalizeDuration,
  normalizeFrequency,
  readSchedule,
  reminderStorageKey,
  resolveSchedule,
  writeSchedule,
} from "@/lib/reminderSchedule";

const readSettings = (u) => ({
  enabled: u?.server_reminder_enabled === true,
  sound: getPreset(u?.server_reminder_sound || DEFAULT_SOUND_ID).id,
  duration: normalizeDuration(u?.server_reminder_duration),
  frequency: normalizeFrequency(u?.server_reminder_frequency),
});

const sameSettings = (a, b) =>
  a && b && a.enabled === b.enabled && a.sound === b.sound && a.duration === b.duration && a.frequency === b.frequency;

// Rappel de vote : un seul minuteur, calé sur un horodatage absolu persistant (nextAt).
// Monté une seule fois (NotificationContext). Ne sonne que si le rappel est activé.
export default function ServerReminderRunner() {
  const { user, isAuthenticated } = useAuth();
  const email = isAuthenticated ? user?.email : null;
  const [settings, setSettings] = useState(null);
  const playbackRef = useRef({ sound: DEFAULT_SOUND_ID, duration: 5 });

  // L'état ne change que si une valeur change réellement (évite de relancer le minuteur à chaque rendu).
  useEffect(() => {
    if (!email) { setSettings(null); return undefined; }
    const apply = (u) => {
      const next = readSettings(u);
      setSettings((prev) => (sameSettings(prev, next) ? prev : next));
    };
    apply(user);
    const refresh = () => base44.auth.me().then(apply).catch(() => {});
    window.addEventListener("matrix-settings-updated", refresh);
    return () => window.removeEventListener("matrix-settings-updated", refresh);
  }, [email, user]);

  // Son et durée lus au déclenchement : les modifier ne replanifie pas le rappel.
  const sound = settings?.sound;
  const duration = settings?.duration;
  useEffect(() => {
    if (sound) playbackRef.current = { sound, duration };
  }, [sound, duration]);

  const enabled = Boolean(email && settings?.enabled);
  const frequency = settings?.frequency;

  // Désactivation / déconnexion : arrêt immédiat du son et oubli du planning.
  useEffect(() => {
    if (enabled) return;
    stopReminderLoop();
    if (email && settings) clearSchedule(email);
  }, [enabled, email, settings]);

  useEffect(() => () => stopReminderLoop(), []);

  useEffect(() => {
    if (!enabled) return undefined;
    let timer = null;
    let disposed = false;

    const clear = () => { if (timer) clearTimeout(timer); timer = null; };

    const fire = () => {
      const current = playbackRef.current;
      playReminderLoop(current.sound, current.duration);
      toast("C'est l'heure de voter pour ton serveur préféré !", {
        icon: <Bell className="w-4 h-4 text-purple-400" />,
        onDismiss: stopReminderLoop,
      });
    };

    const schedule = () => {
      if (disposed) return;
      clear();
      const now = Date.now();
      let current = resolveSchedule(email, frequency, now);
      if (now >= current.nextAt) {
        // Onglet masqué : on attend son retour ; le rappel reste dû pendant la tolérance.
        if (document.visibilityState === "hidden") return;
        // Verrou inter-onglets : le premier onglet qui avance nextAt gagne.
        const latest = readSchedule(email);
        if (!latest || latest.nextAt > now) { schedule(); return; }
        current = { nextAt: now + frequency * 60 * 1000, frequency };
        writeSchedule(email, current);
        fire();
      }
      timer = setTimeout(schedule, Math.min(Math.max(current.nextAt - Date.now(), 0), MAX_TIMEOUT_MS));
    };

    const onVisible = () => { if (document.visibilityState === "visible") schedule(); };
    const onStorage = (e) => { if (e.key === reminderStorageKey(email)) schedule(); };

    schedule();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("storage", onStorage);
    return () => {
      disposed = true;
      clear();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("storage", onStorage);
    };
  }, [enabled, email, frequency]);

  return null;
}
