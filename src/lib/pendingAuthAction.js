const KEY = "pending_auth_action";

export function setPendingAuthAction(action) {
  try { sessionStorage.setItem(KEY, JSON.stringify({ action, path: window.location.pathname })); } catch { /* stockage indisponible */ }
}

export function clearPendingAuthAction() {
  try { sessionStorage.removeItem(KEY); } catch { /* stockage indisponible */ }
}

/** Retourne l'action mémorisée pour cette page (et la supprime), sinon null. */
export function consumePendingAuthAction() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const { action, path } = JSON.parse(raw);
    if (path !== window.location.pathname) return null;
    sessionStorage.removeItem(KEY);
    return action || null;
  } catch {
    return null;
  }
}
