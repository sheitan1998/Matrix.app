// Global PWA install prompt capture — runs immediately on import
import { base44 } from "@/api/base44Client";

let _deferredPrompt = null;
let _listeners = [];
let _installed = false;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  _deferredPrompt = e;
  _listeners.forEach((fn) => fn(e));
});

window.addEventListener("appinstalled", () => {
  _deferredPrompt = null;
  _installed = true;
  trackInstallation();
  _listeners.forEach((fn) => fn(null, true));
});

export function getDeferredPrompt() {
  return _deferredPrompt;
}

export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function onPWAChange(fn) {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((f) => f !== fn);
  };
}

// Track installation by calling the pwaInstall backend function
export function trackInstallation() {
  if (_installed) return;
  _installed = true;
  base44.functions
    .invoke("pwaInstall", {})
    .catch(() => {});
}