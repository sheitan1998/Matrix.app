export function canonicalUrl(path, location = globalThis.location) {
  const origin = location?.origin || "";
  return new URL(path, origin || "https://matrix-app.fr").href;
}

export async function copyText(value, documentRef = globalThis.document, navigatorRef = globalThis.navigator) {
  if (navigatorRef?.clipboard?.writeText) {
    await navigatorRef.clipboard.writeText(value);
    return;
  }

  if (!documentRef?.body || typeof documentRef.execCommand !== "function") {
    throw new Error("Clipboard unavailable");
  }
  const input = documentRef.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  documentRef.body.appendChild(input);
  input.select();
  try {
    if (!documentRef.execCommand("copy")) throw new Error("Copy rejected");
  } finally {
    input.remove();
  }
}

export async function shareOrCopy({ title, text, url }, navigatorRef = globalThis.navigator, documentRef = globalThis.document) {
  if (navigatorRef?.share) {
    try {
      await navigatorRef.share({ title, text, url });
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") throw error;
    }
  }
  await copyText(url, documentRef, navigatorRef);
  return "copied";
}
