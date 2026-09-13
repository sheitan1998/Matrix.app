import { invoke } from "@tauri-apps/api/core";

function ensureTauri() {
  if (typeof window === "undefined" || typeof window.__TAURI__ === "undefined") {
    throw new Error("Updater is only available in the desktop app.");
  }
}

export async function checkForUpdates() {
  ensureTauri();
  return invoke("check_for_updates");
}

export async function installUpdate() {
  ensureTauri();
  return invoke("install_update");
}

export async function getCurrentVersion() {
  ensureTauri();
  return invoke("get_current_version");
}
