import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { DEFAULT_SOUND_ID, getPreset, playReminderLoop, stopReminderLoop } from "@/lib/reminderSounds";

const DEFAULT_FREQUENCY_MIN = 120;
const CHECK_INTERVAL_MS = 30 * 1000;

// Déclenche la sonnerie de rappel de vote selon les réglages de l'utilisateur.
// Rien ne se joue si le rappel est désactivé (muet) ou si l'onglet est masqué.
export default function ServerReminderRunner() {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) { setSettings(null); return; }
    const read = (u) => setSettings({
      enabled: u?.server_reminder_enabled === true,
      sound: getPreset(u?.server_reminder_sound || DEFAULT_SOUND_ID).id,
      duration: Number(u?.server_reminder_duration) || 5,
      frequency: Number(u?.server_reminder_frequency) || DEFAULT_FREQUENCY_MIN,
    });
    read(user);
    const refresh = () => base44.auth.me().then(read).catch(() => {});
    window.addEventListener("matrix-settings-updated", refresh);
    return () => window.removeEventListener("matrix-settings-updated", refresh);
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!settings?.enabled || !user?.email) { stopReminderLoop(); return; }
    const storageKey = `matrix_vote_reminder_${user.email}`;
    const intervalMs = settings.frequency * 60 * 1000;
    if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, String(Date.now()));

    const tick = () => {
      if (document.visibilityState === "hidden") return;
      const last = Number(localStorage.getItem(storageKey)) || 0;
      if (Date.now() - last < intervalMs) return;
      localStorage.setItem(storageKey, String(Date.now()));
      playReminderLoop(settings.sound, settings.duration);
      toast("C'est l'heure de voter pour ton serveur préféré !", {
        icon: <Bell className="w-4 h-4 text-purple-400" />,
        onDismiss: stopReminderLoop,
      });
    };
    const timer = setInterval(tick, CHECK_INTERVAL_MS);
    return () => { clearInterval(timer); stopReminderLoop(); };
  }, [settings, user?.email]);

  return null;
}
