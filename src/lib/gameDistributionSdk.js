export function buildGameEmbedUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes("gamedistribution.com")) {
      url.searchParams.set("gd_sdk_referrer_url", window.location.origin);
      url.searchParams.set("gd_sdk_mp_site_name", "MATRIX");
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

export function ensureGameDistributionSdk(rawUrl) {
  if (!rawUrl || !rawUrl.includes("gamedistribution.com")) return;
  if (document.getElementById("gd-sdk")) return;
  const script = document.createElement("script");
  script.id = "gd-sdk";
  script.src = "https://html5.gamedistribution.com/api/v1/0/gd-sdk.js";
  script.async = true;
  document.body.appendChild(script);
}