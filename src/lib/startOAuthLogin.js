import { base44 } from "@/api/base44Client";

export async function startOAuthLogin(providerName) {
  const provider = typeof providerName === "string" ? providerName.trim().toLowerCase() : "";

  if (!provider) {
    throw new Error("OAuth provider is required.");
  }

  // Use the SDK's built-in loginWithProvider for both web and Tauri desktop.
  // This handles the entire OAuth flow including session creation and token
  // exchange with the Base44 platform. A full-page redirect works reliably
  // in the Tauri webview — no popups or child windows needed.
  const returnUrl = window.location.pathname + window.location.search;
  sessionStorage.setItem("oauth_return_to", returnUrl);
  await base44.auth.loginWithProvider(provider, returnUrl);
}