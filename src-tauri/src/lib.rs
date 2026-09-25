use tauri::Manager;
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_updater::UpdaterExt;

const OAUTH_DEEP_LINK_SCHEME: &str = "matrix";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            #[cfg(desktop)]
            setup_oauth_deep_link(app);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            open_auth_window,
            handle_oauth_callback,
            check_for_updates,
            install_update,
            get_current_version,
            detect_running_games
        ])
        .run(tauri::generate_context!())
        .expect("error while running Matrix");
}

#[cfg(desktop)]
fn setup_oauth_deep_link(app: &mut tauri::App) {
    let app_handle = app.handle().clone();

    app.deep_link().on_open_url(move |event| {
        for url in event.urls() {
            forward_oauth_deep_link(&app_handle, url.as_str());
        }
    });

    if let Err(error) = app.deep_link().register_all() {
        eprintln!("Unable to register deep-link schemes: {}", error);
    }

    if let Ok(Some(urls)) = app.deep_link().get_current() {
        for url in urls {
            forward_oauth_deep_link(app.handle(), url.as_str());
        }
    }
}

#[cfg(desktop)]
fn forward_oauth_deep_link(app: &tauri::AppHandle, raw_url: &str) {
    let Some(callback_route) = parse_oauth_callback_route(raw_url) else {
        return;
    };

    let Some(main_window) = app.get_webview_window("main") else {
        return;
    };

    if let Ok(serialized_route) = serde_json::to_string(&callback_route) {
        let script = format!("window.location.replace({serialized_route});");
        if let Err(error) = main_window.eval(&script) {
            eprintln!("Unable to forward OAuth deep link to frontend: {}", error);
        }
    }
}

fn parse_oauth_callback_route(raw_url: &str) -> Option<String> {
    let deep_link_prefix = format!("{OAUTH_DEEP_LINK_SCHEME}://");
    let url_without_scheme = raw_url.strip_prefix(&deep_link_prefix)?;

    let (before_fragment, fragment) = match url_without_scheme.split_once('#') {
        Some((value, fragment)) => (value, Some(fragment)),
        None => (url_without_scheme, None),
    };
    let (path_candidate, query) = match before_fragment.split_once('?') {
        Some((path, query)) => (path, Some(query)),
        None => (before_fragment, None),
    };

    let normalized_path = if path_candidate.starts_with('/') {
        path_candidate.to_string()
    } else {
        format!("/{path_candidate}")
    };

    if normalized_path != "/oauth/callback" {
        return None;
    }

    let mut route = normalized_path;
    if let Some(query) = query {
        route.push('?');
        route.push_str(query);
    }
    if let Some(fragment) = fragment {
        route.push('#');
        route.push_str(fragment);
    }

    Some(route)
}

/// Ouvre l'URL d'authentification OAuth dans le navigateur par défaut
#[tauri::command]
async fn open_auth_window(url: String) -> Result<String, String> {
    match open::that(&url) {
        Ok(()) => {
            println!("OAuth browser window opened successfully");
            Ok("OAuth window opened successfully".to_string())
        }
        Err(e) => {
            eprintln!("Failed to open OAuth URL: {}", e);
            Err(format!("Failed to open OAuth URL: {}", e))
        }
    }
}

/// Traite le callback OAuth après l'authentification
#[tauri::command]
async fn handle_oauth_callback(code: String, state: String) -> Result<bool, String> {
    if code.trim().is_empty() {
        return Err("OAuth callback missing authorization code".to_string());
    }
    if state.trim().is_empty() {
        return Err("OAuth callback missing state".to_string());
    }
    println!("OAuth callback received and validated");
    Ok(true)
}

/// Vérifie les mises à jour disponibles
#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let updater = app
        .updater()
        .map_err(|e| format!("Erreur lors de l'initialisation de l'updater: {}", e))?;

    match updater.check().await {
        Ok(Some(update)) => {
            let current_version = update.current_version.clone();
            let latest_version = update.version.clone();
            let body = update.body.clone();
            let date = update.date.map(|date| date.to_string());

            Ok(serde_json::json!({
                "available": true,
                "current_version": current_version,
                "latest_version": latest_version,
                "body": body,
                "date": date,
            }))
        }
        Ok(None) => Ok(serde_json::json!({
            "available": false,
            "current_version": app.package_info().version.to_string(),
        })),
        Err(e) => Err(format!(
            "Erreur lors de la vérification des mises à jour: {}",
            e
        )),
    }
}

/// Télécharge et installe la mise à jour
#[tauri::command]
async fn install_update(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let updater = app
        .updater()
        .map_err(|e| format!("Erreur lors de l'initialisation de l'updater: {}", e))?;

    match updater.check().await {
        Ok(Some(update)) => {
            let latest_version = update.version.clone();
            println!(
                "Téléchargement de la mise à jour vers la version: {}",
                latest_version
            );

            match update.download_and_install(|_, _| {}, || {}).await {
                Ok(_) => {
                    println!("Mise à jour téléchargée et installée avec succès");
                    Ok(serde_json::json!({
                        "success": true,
                        "message": "Mise à jour installée. Redémarrage en cours...",
                    }))
                }
                Err(e) => Err(format!("Erreur lors de l'installation: {}", e)),
            }
        }
        Ok(None) => Ok(serde_json::json!({
            "success": false,
            "message": "Aucune mise à jour disponible",
        })),
        Err(e) => Err(format!("Erreur lors de la vérification: {}", e)),
    }
}

/// Récupère la version actuelle de l'application
#[tauri::command]
fn get_current_version(app: tauri::AppHandle) -> Result<String, String> {
    Ok(app.package_info().version.to_string())
}

/// Détecte les jeux en cours d'exécution à partir d'une liste de noms de processus.
/// Retourne les noms de processus correspondants trouvés parmi ceux en cours.
#[tauri::command]
fn detect_running_games(process_names: Vec<String>) -> Result<Vec<String>, String> {
    use sysinfo::{ProcessRefreshKind, RefreshKind, System};

    let mut system = System::new();
    system.refresh_processes_specifics(
        RefreshKind::everything().with_processes(ProcessRefreshKind::everything()),
    );

    // Build a lowercase set of target process names (without .exe extension)
    let targets: std::collections::HashSet<String> = process_names
        .iter()
        .map(|name| name.to_lowercase().replace(".exe", ""))
        .collect();

    let mut found: Vec<String> = Vec::new();

    for (_, process) in system.processes() {
        let proc_name = process
            .name()
            .to_string_lossy()
            .to_lowercase()
            .replace(".exe", "");

        if targets.contains(&proc_name) && !found.contains(&proc_name) {
            found.push(proc_name);
        }
    }

    Ok(found)
}