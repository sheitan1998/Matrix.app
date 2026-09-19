import { getTauriInvoke } from "@/lib/tauriInvoke";

/**
 * Vérifie les mises à jour disponibles
 * @returns {Promise<{available: boolean, current_version?: string, latest_version?: string, body?: string, date?: string}>}
 */
export async function checkForUpdates() {
  const invoke = await getTauriInvoke();
  if (!invoke) return { available: false };
  const result = await invoke("check_for_updates");
  return result;
}

/**
 * Télécharge et installe la mise à jour, puis redémarre l'application
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function installUpdate() {
  const invoke = await getTauriInvoke();
  if (!invoke) return { success: false, message: "Not in desktop app" };
  const result = await invoke("install_update");
  return result;
}

/**
 * Récupère la version actuelle de l'application
 * @returns {Promise<string>} Version actuelle (ex: "1.0.4")
 */
export async function getCurrentVersion() {
  const invoke = await getTauriInvoke();
  if (!invoke) return "web";
  const version = await invoke("get_current_version");
  return version;
}

/**
 * Initialise un contrôle automatique des mises à jour
 * @param {Function} onUpdateFound - Callback appelé quand une mise à jour est disponible
 * @param {number} intervalMs - Intervalle en millisecondes (défaut: 1 heure)
 * @returns {Function} Fonction pour arrêter le contrôle automatique
 */
export function setupAutoUpdateCheck(onUpdateFound, intervalMs = 60 * 60 * 1000) {
  // Première vérification immédiate
  checkForUpdates()
    .then((result) => {
      if (result.available) {
        onUpdateFound(result);
      }
    })
    .catch((error) => console.error("Auto-check initial échoué:", error));

  // Puis vérifier régulièrement
  const intervalId = setInterval(() => {
    checkForUpdates()
      .then((result) => {
        if (result.available) {
          onUpdateFound(result);
        }
      })
      .catch((error) => console.error("Auto-check échoué:", error));
  }, intervalMs);

  // Retourner une fonction pour arrêter le check
  return () => clearInterval(intervalId);
}