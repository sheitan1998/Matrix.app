use tauri_plugin_updater::UpdaterExt;
use time::format_description::well_known::Rfc3339;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            open_auth_window,
            handle_oauth_callback,
            check_for_updates,
            install_update,
            get_current_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running Matrix");
}

/// Ouvre l'URL d'authentification OAuth dans le navigateur par défaut
#[tauri::command]
async fn open_auth_window(url: String) -> Result<String, String> {
    match open::that(&url) {
        Ok(()) => {
            println!("OAuth window opened: {}", url);
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
    println!("OAuth callback received - Code: {}, State: {}", code, state);
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
            let date = update
                .date
                .map(|date| date.format(&Rfc3339))
                .transpose()
                .map_err(|e| {
                    format!("Erreur lors du formatage de la date de mise à jour: {}", e)
                })?;

            Ok(serde_json::json!({
                "available": true,
                "current_version": current_version,
                "latest_version": latest_version,
                "body": update.body,
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
