// Pièces jointes Matrix AI — règles côté interface (le serveur revérifie tout de son côté).

export const MAX_ATTACHMENTS = 4;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif']);
const TEXT_EXT = new Set([
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'jsonl', 'xml', 'yaml', 'yml', 'toml', 'ini', 'log', 'html', 'htm',
  'css', 'scss', 'js', 'mjs', 'jsx', 'ts', 'tsx', 'py', 'java', 'kt', 'c', 'h', 'cpp', 'cs', 'go', 'rs', 'rb',
  'php', 'sql', 'sh', 'ps1', 'bat', 'lua', 'swift', 'vue', 'svelte',
]);

export const ACCEPT_ATTRIBUTE = [
  'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf',
  ...[...TEXT_EXT].map((ext) => `.${ext}`),
].join(',');

export function fileExtension(name) {
  const clean = String(name || '').toLowerCase();
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1) : '';
}

export function classifyFile(name, mime) {
  const ext = fileExtension(name);
  const type = String(mime || '').toLowerCase();
  if (IMAGE_EXT.has(ext) && (!type || type.startsWith('image/'))) return 'image';
  if (ext === 'pdf' && (!type || type === 'application/pdf')) return 'pdf';
  if (TEXT_EXT.has(ext) && (!type || type.startsWith('text/') || /json|xml|javascript|yaml|octet-stream|x-/.test(type))) {
    return 'text';
  }
  return null;
}

/** Contrôle côté client avant envoi : renvoie un message d'erreur ou null. */
export function checkFileBeforeUpload(file) {
  if (!classifyFile(file.name, file.type)) {
    return 'Format non pris en charge (images, PDF, texte, code ou données uniquement).';
  }
  if (file.size <= 0) return 'Le fichier est vide.';
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return `Fichier trop volumineux (${Math.round(MAX_ATTACHMENT_BYTES / 1024 / 1024)} Mo maximum).`;
  }
  return null;
}