fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new().app_manifest(
            tauri_build::AppManifest::new().commands(&[
                "open_auth_window",
                "handle_oauth_callback",
                "check_for_updates",
                "install_update",
                "get_current_version",
            ]),
        ),
    )
    .expect("failed to run tauri build")
}