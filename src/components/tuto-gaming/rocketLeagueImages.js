function safeColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#334155';
}

function remoteUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return value.startsWith('data:image/') ? value : null;
  }
}

export function generatedRocketImage(label = 'Rocket League', accent = '#334155') {
  const text = String(label).slice(0, 40).replace(/[<>&"']/g, '');
  const color = safeColor(accent);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><radialGradient id="g" cx=".25" cy=".2"><stop stop-color="${color}"/><stop offset="1" stop-color="#0f172a"/></radialGradient></defs><rect width="640" height="360" fill="url(#g)"/><path d="M145 232h350l-38-76-91-34H238l-61 50z" fill="none" stroke="white" stroke-width="16" stroke-linejoin="round" opacity=".8"/><circle cx="225" cy="239" r="34" fill="#0f172a" stroke="white" stroke-width="12"/><circle cx="423" cy="239" r="34" fill="#0f172a" stroke="white" stroke-width="12"/><text x="320" y="312" fill="white" font-family="system-ui,sans-serif" font-size="28" text-anchor="middle">${text}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * @param {{src?: string|string[]|null, sources?: string[], fallbackLabel?: string, accent?: string}} options
 */
export function resolveRocketImageSources({ src, sources, fallbackLabel, accent } = {}) {
  const supplied = [
    ...(Array.isArray(sources) ? sources : []),
    ...(Array.isArray(src) ? src : [src]),
  ].map(remoteUrl).filter(Boolean);
  return [...new Set(supplied), generatedRocketImage(fallbackLabel, accent)];
}
