/**
 * Appends a cache-busting query parameter to an image URL
 * based on the config record's updated_date.
 * Ensures the browser always fetches the latest image
 * when admin updates the configuration.
 */
export function bustImageCache(url, updatedAt) {
  if (!url || !/^https?:\/\//i.test(url)) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(updatedAt || 'init')}`;
}