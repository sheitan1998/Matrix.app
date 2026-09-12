import { toast } from "sonner";

let hasCheckedForUpdates = false;
let isInstallingUpdate = false;

function isTauriDesktop() {
  return typeof window !== "undefined" && typeof window.__TAURI__ !== "undefined";
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Une erreur inconnue est survenue pendant la mise à jour.";
}

export async function checkForDesktopUpdates() {
  if (import.meta.env.DEV || !isTauriDesktop() || hasCheckedForUpdates) {
    return;
  }

  hasCheckedForUpdates = true;

  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check();

    if (!update) {
      return;
    }

    toast.info(`Mise à jour Matrix ${update.version} disponible`, {
      description:
        update.body ||
        "Une nouvelle version est prête à être téléchargée et installée.",
      duration: 20000,
      action: {
        label: "Installer",
        onClick: async () => {
          if (isInstallingUpdate) {
            return;
          }

          isInstallingUpdate = true;
          toast.info("Téléchargement de la mise à jour Matrix...");
          toast.success(
            "La mise à jour va s'installer. Matrix redémarrera automatiquement."
          );

          try {
            await update.downloadAndInstall(undefined, {
              restartAfterInstall: true,
            });
          } catch (error) {
            toast.error("La mise à jour n'a pas pu être installée.", {
              description: getErrorMessage(error),
            });
          } finally {
            isInstallingUpdate = false;
          }
        },
      },
    });
  } catch (error) {
    console.error("Failed to check for Matrix desktop updates:", error);
  }
}
