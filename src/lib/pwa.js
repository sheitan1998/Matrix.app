// Global PWA install prompt capture — runs immediately on import
let _deferredPrompt = null;
let _listeners = [];

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  _deferredPrompt = e;
  _listeners.forEach((fn) => fn(e));
});

window.addEventListener("appinstalled", () => {
  _deferredPrompt = null;
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