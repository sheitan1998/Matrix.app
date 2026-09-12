#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_updater::Builder::new().build())?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            open_auth_window,
            handle_oauth_callback
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
