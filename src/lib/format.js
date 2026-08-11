export function formatViews(n) {
  if (!n) return "0";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  if (diff < 2629800) return `il y a ${Math.floor(diff / 604800)} sem`;
  if (diff < 31557600) return `il y a ${Math.floor(diff / 2629800)} mois`;
  return `il y a ${Math.floor(diff / 31557600)} an`;
}

export function formatTrix(n) {
  if (!n) return "0";
  return n.toLocaleString("fr-FR");
}

export function stripPseudoTag(name) {
  if (!name) return "";
  return String(name).replace(/#\d+$/, "").trim();
}