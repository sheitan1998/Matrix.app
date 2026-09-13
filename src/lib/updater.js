import { invoke } from "@tauri-apps/api/core";

/**
 * Vérifie les mises à jour disponibles
 * @returns {Promise<{available: boolean, current_version?: string, latest_version?: string, body?: string, date?: string}>}
 */
export async function checkForUpdates() {
  try {
    const result = await invoke("check_for_updates");
    return result;
  } catch (error) {
    console.error("Erreur lors de la vérification des mises à jour:", error);
    throw new Error(`Impossible de vérifier les mises à jour: ${error}`);
  }
}

/**
 * Télécharge et installe la mise à jour, puis redémarre l'application
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function installUpdate() {
  try {
    const result = await invoke("install_update");
    return result;
  } catch (error) {
    console.error("Erreur lors de l'installation de la mise à jour:", error);
    throw new Error(`Impossible d'installer la mise à jour: ${error}`);
  }
}

/**
 * Récupère la version actuelle de l'application
 * @returns {Promise<string>} Version actuelle (ex: "1.0.3")
 */
export async function getCurrentVersion() {
  try {
    const version = await invoke("get_current_version");
    return version;
  } catch (error) {
    console.error("Erreur lors de la récupération de la version:", error);
    throw new Error(`Impossible de récupérer la version: ${error}`);
  }
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
