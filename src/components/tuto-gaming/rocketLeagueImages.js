function remoteUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

/**
 * The backend only returns image hosts explicitly allowed by
 * ROCKET_LEAGUE_IMAGE_HOSTS. The client still rejects non-HTTPS values.
 *
 * @param {{src?: string|string[]|null, sources?: string[]}} options
 */
export function resolveRocketImageSources({ src, sources } = {}) {
  const supplied = [
    ...(Array.isArray(sources) ? sources : []),
    ...(Array.isArray(src) ? src : [src]),
  ].map(remoteUrl).filter(Boolean);
  return [...new Set(supplied)].slice(0, 3);
}

export function rocketFallbackColors(label = '', accent = '') {
  if (/^#[0-9a-f]{6}$/i.test(accent)) {
    return { primary: accent, secondary: '#7c3aed' };
  }
  const value = [...String(label)].reduce((hash, character) => (
    ((hash << 5) - hash + character.charCodeAt(0)) | 0
  ), 0);
  const hue = Math.abs(value) % 360;
  return {
    primary: `hsl(${hue} 78% 52%)`,
    secondary: `hsl(${(hue + 54) % 360} 72% 45%)`,
  };
}
