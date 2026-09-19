export async function getTauriInvoke() {
  if (typeof window === "undefined") return null;

  if (typeof window.__TAURI_INTERNALS__?.invoke === "function") {
    return (cmd, args) => window.__TAURI_INTERNALS__.invoke(cmd, args);
  }

  if (typeof window.__TAURI__?.core?.invoke === "function") {
    return (cmd, args) => window.__TAURI__.core.invoke(cmd, args);
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    if (typeof invoke === "function") return invoke;
  } catch {
    return null;
  }

  return null;
}
