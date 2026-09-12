use tauri::{
    webview::{PermissionKind, PermissionResponse},
    Emitter, Manager, WebviewUrl, WebviewWindowBuilder,
};
use url::Url;

const OAUTH_CALLBACK_EVENT: &str = "oauth-callback";
const OAUTH_WINDOW_LABEL: &str = "oauth-auth-window";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .on_permission_request(|_, kind| match kind {
            PermissionKind::Camera | PermissionKind::Microphone => PermissionResponse::Allow,
            _ => PermissionResponse::Default,
        })
        .invoke_handler(tauri::generate_handler![open_auth_window, handle_oauth_callback])
        .run(tauri::generate_context!())
        .expect("error while running Matrix");
}

/// Ouvre l'URL d'authentification OAuth dans une fenêtre Tauri dédiée
#[tauri::command]
async fn open_auth_window(app: tauri::AppHandle, url: String) -> Result<String, String> {
    let auth_url = Url::parse(&url).map_err(|e| format!("Invalid OAuth URL: {e}"))?;

    if let Some(existing_window) = app.get_webview_window(OAUTH_WINDOW_LABEL) {
        let _ = existing_window.close();
    }

    let app_handle = app.clone();
    WebviewWindowBuilder::new(&app, OAUTH_WINDOW_LABEL, WebviewUrl::External(auth_url))
        .title("Connexion Matrix")
        .inner_size(520.0, 720.0)
        .resizable(true)
        .focused(true)
        .center()
        .on_navigation(move |requested_url| {
            if is_oauth_callback_url(&requested_url) {
                let _ = app_handle.emit(OAUTH_CALLBACK_EVENT, requested_url.to_string());
                if let Some(window) = app_handle.get_webview_window(OAUTH_WINDOW_LABEL) {
                    let _ = window.close();
                }
                false
            } else {
                true
            }
        })
        .build()
        .map_err(|e| format!("Failed to open OAuth window: {e}"))?;

    println!("OAuth window opened: {}", url);
    Ok("OAuth window opened successfully".to_string())
}

/// Traite le callback OAuth après l'authentification
#[tauri::command]
async fn handle_oauth_callback(code: String, state: String) -> Result<bool, String> {
    println!("OAuth callback received - Code: {}, State: {}", code, state);
    Ok(true)
}

fn is_oauth_callback_url(url: &Url) -> bool {
    if url.path() == "/oauth/callback" {
        return true;
    }

    url.fragment()
        .map(|fragment| {
            fragment == "/oauth/callback"
                || fragment.starts_with("/oauth/callback?")
                || fragment == "oauth/callback"
                || fragment.starts_with("oauth/callback?")
        })
        .unwrap_or(false)
}
